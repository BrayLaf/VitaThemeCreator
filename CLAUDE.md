# CLAUDE.md

Guidance for working in this repo. See `README.md` for what the app does and
how to run it.

## Grounding rule

This app reimplements a legacy tool (`../ThemeBUILDER`, a Windows PySimpleGUI
app) — [AntHJ/ThemeBUILDER](https://github.com/AntHJ/ThemeBUILDER) upstream.
Full credit to AntHJ: this codebase exists on top of their reverse-engineering
of the Vita theme format, not independent research, and that origin belongs
in the README's intro, not just here. A second sibling repo,
`../Sony-ThemeTool` — [LiEnby/Sony-ThemeTool](https://github.com/LiEnby/Sony-ThemeTool),
a decompile of Sony's own official ThemeTool — is the other ground-truth
source in this codebase: `audioConversion.ts`'s `.at9` header validation is
a byte-exact port of its `BgmChecker.cs`/`At9FileHeader.cs`/`RiffChunk.cs`/
`FormatChunk.cs`/`At9Chunk.cs`. Credit to LiEnby for that decompile too.
Every domain-logic decision — image dimensions, fit/crop behavior, the
`theme.xml` schema, icon slot names, audio encode parameters, packaging
layout — must trace back to `../ThemeBUILDER/DOMAIN_LOGIC_ANALYSIS.md` (or,
for anything the report didn't cover, direct inspection of `Theme.py`/
`Icon.py`, `../Sony-ThemeTool`'s decompiled sources, or a real theme folder
produced by the legacy tool). Don't invent plausible-sounding behavior for
anything Vita-specific — check the report, check the source, or ask.
Genuinely open questions get a `DECISION (date):` doc comment recording what
was chosen and why, not a silent guess.

When the report's own citations are ambiguous (e.g. coordinate math in
`Theme.py`'s PySimpleGUI `draw_*` calls, where axis/anchor semantics aren't
fully certain), a **real exported theme folder** from the legacy tool is
stronger evidence than re-deriving from source coordinates. If the user
hands you one, diff its output files (`theme.xml`, `preview_*.png`, the
per-slot PNGs) against what this app produces before touching any code.

## Architecture

- `src/shared/types/` — the `ThemeProject` data model and the generated
  `ThemeManifest` (`theme.xml`) shape. This is the source of truth; main and
  renderer both import from here, never redeclare shapes locally.
- `src/shared/ipc.ts` — the renderer↔main contract: one `ThemeBuilderApi`
  method per main-process module function, plus `IPC_CHANNELS` keyed off
  that same interface so channel names can't drift from the contract.
  Changing a main-process module's signature means updating this file, then
  `src/preload/index.ts`, then `src/main/ipc.ts`'s handler registration —
  all three must move together.
- `src/main/modules/` — the actual conversion/build logic (`imageConversion`,
  `audioConversion`, `iconGeneration`, `manifestGeneration`, `packaging`,
  `projectPersistence`). Each function's doc comment cites the report
  section/line numbers it's grounded in.
- `src/main/resourcePaths.ts` — resolves `resources/themebuilder-assets/`
  (icon glyph/background art, masks, the default audio track, bundled
  `at9tool.exe`) via `app.getAppPath()` in dev or `process.resourcesPath` in
  a packaged build. Never hardcode a path into these assets elsewhere. Also
  exports the `DEFAULT_*_PATH` fallbacks (lockscreen, notification icons,
  page background) — see "No missing-asset export failures" below.
  `initAssetsRoot(app)` (called from `index.ts`) sets the root. The module
  imports Electron as a type only, so the image worker can load it.
- `src/main/imageWorker/` — every `sharp`-backed function
  (`imageConversion`, `iconGeneration`), exposed with its normal signature.
  **Main-process callers import these from `imageWorker`, never from the
  modules directly.** On Linux they run in a forked `ELECTRON_RUN_AS_NODE`
  child process, because sharp's libvips GLib clashes with Electron's and
  crashes the main process (electron/electron#46323). Any new sharp function
  goes in `imageOps.ts`'s table. Neither module can import Electron at
  runtime. Set `VITA_THEME_IMAGE_WORKER=1` to test the worker path on macOS.
- `src/main/index.ts` registers a privileged `themefile://` protocol
  (`protocol.handle`) that every renderer `<img>`/`background-image` loading
  a real filesystem path goes through via `toFileUrl()`
  (`renderer/src/lib/uiHelpers.ts`) — **never** point one at a plain
  `file://` URL. Plain `file://` is silently blocked by Chromium in dev,
  where the renderer is served over `http://localhost` (electron-vite's
  HMR), not `file://` — it only works by accident in a packaged build. The
  real path travels in a query param (`themefile://local/?p=<encoded>`), not
  the URL path — Chromium's parser for a privileged "standard" custom scheme
  treats the first path segment as an authority/host (and lowercases it),
  so a literal path there doesn't round-trip.
- `src/renderer/src/lib/themebuilderAssets.ts` — lets the renderer preview
  the *real* bundled icon glyph-overlay/background-swatch PNGs the same way
  `compositeSystemIcon` composites them at build time (via
  `resolveThemebuilderAssetPath` + `toFileUrl`), instead of an approximated
  color/glyph stand-in. One IPC round trip, cached for the session
  (`useThemebuilderAssetsRoot`) — see `components/common/IconTile.tsx`.
- `src/renderer/src/components/preview/` — the live device preview
  (`LockscreenPreview.tsx`, `HomePreview.tsx`), sharing one
  `StatusBarOverlay.tsx` for the top status-bar strip (wifi/home/battery/
  notification icons) both screens draw so they can't drift apart. Every
  visual choice here should be traceable to either the domain report or a
  real exported theme folder — see the module-level doc comments for the
  specific citations (`StatusBarOverlay.tsx`'s own icon layout is grounded in
  a real device screenshot and exported `preview_page.png`, not the report,
  since `Theme.py`'s own preview widget only fakes this cluster as a single
  text string).
- `src/renderer/src/App.tsx` — routes between four top-level screens
  (`LandingPage`, `EditorShell`, `IconSetCreatorPage`, `ManageThemesPage`),
  all sharing one `ThemeProjectProvider`. The app boots to `LandingPage`, not
  straight into a blank project — "Create theme" is what calls
  `createEmptyThemeProject()` now, not app startup. Every screen gets a "←
  Library" button back to the landing page (`TopBar.tsx`'s `onHome` prop is
  the editor's).
- `src/main/modules/themeLibrary.ts` — read-only bookkeeping over the
  `Created Themes/` build-output directory (`listCreatedThemes`,
  `deleteCreatedTheme`) backing `ManageThemesPage.tsx`. Derives each
  summary's metadata by reading the build folder's own `project.json` back
  out via `projectPersistence.ts`'s `loadThemeProject` — no separate on-disk
  index. Returns **absolute** paths (`path.resolve`, not `path.join`) even
  though `buildRootDir` itself is usually the relative literal `'Created
  Themes'` — a relative path breaks `pathToFileURL` when the renderer loads
  a summary's thumbnail through `themefile://`.
- `src/renderer/src/components/common/ImageCropper.tsx` — interactive
  drag-to-pan/scroll-to-zoom cover-fit crop editor for a fixed-dimension
  image frame. Notification icons always use it (120×110, with a live guide
  overlay from ThemeBUILDER's own `LAnotemsk.png` showing what the Vita's
  info-bar badge actually reveals); the lockscreen and page-background slots
  get it as an opt-in `FitModeToggle.tsx` alternative to the original tool's
  forced-stretch default (`CroppableImageSlot`, `shared/types/imageSlots.ts`).
  The crop math (`coverLayoutPx`, `renderer/src/lib/imageCrop.ts`) is shared
  verbatim by three consumers so they never drift: this editor, the read-only
  live-preview counterpart `CroppedImageLayer.tsx`, and the export-time
  `writeCoverFitCropPng` (`main/modules/imageConversion.ts`).
- `src/renderer/src/components/IconSetCreatorPage.tsx` — a standalone
  17-icon builder reachable from the landing page without opening a theme
  project. Shares `IconGenerationChoice` state and UI
  (`components/common/IconChoiceEditor.tsx`, factored out of
  `SystemIconsPanel.tsx`) with the theme editor's icon panel, but keeps its
  own local `IconSetSelection` rather than touching `ThemeProjectProvider`,
  and writes to a separate `Icon Sets/<SetName>/` output dir via the
  existing `generateIconSet` (already wired end-to-end in `iconGeneration.ts`
  before this UI existed).

## No missing-asset export failures

Every optional image slot (lockscreen, notification icons, a page's
background/thumbnail, the package-thumbnail collage tiles) must have a real
fallback — `buildThemeFolder` should never throw just because the user
hasn't touched a slot yet. Two different fallback shapes, depending on
what's actually true of the *original* tool:

- **Reproduces real original behavior**: the notification icons default to
  `Theme.py`'s own bundled `LAnoteno_def.png`/`LAnotenew_def.png` — leaving
  them untouched in the original ships those exact PNGs as
  `notices.png`/`notice.png` (`Theme.py:2646-2650`). Page backgrounds are
  optional too — no image means the Vita firmware draws the page's
  `m_waveType` wave pattern instead, so `bgN.png` is simply not generated
  (see `wavePattern.ts`'s doc comment for the "same shape, different color"
  correction this went through). `generateManifest` (`manifestGeneration.ts`)
  matches this on the `theme.xml` side too: a page with no background gets
  no `<m_thumbnailFilePath>`/`<m_imageFilePath>` elements at all, rather
  than pointing at a `bgN.png` that doesn't exist — see the
  `ManifestBackgroundParam` DECISION note for why this deliberately does
  *not* match the original (Theme.py always writes both regardless, a latent
  bug real third-party theme validators flag as an error).
- **A deliberate improvement over the original**: the lockscreen image and
  the icon-set's default swatch/glyph-style choice have *no* working
  fallback in `Theme.py` (it would itself export a broken theme) — these use
  a bundled ThemeBUILDER default asset (`defaultLS.png`) or Icon.py's own
  real first-run default values (`glyphStyle: 'White'`,
  background swatch `'None.'` — Icon.py:89,106) instead of failing. The
  page-indicator dots (`basePage.png`/`curPage.png`, `PageIndicatorImageSlot`
  in `imageSlots.ts`) are a variant of this: `Theme.py` always ships a
  working pair (its own bundled `assets/preview/default/{base,curs}.png`,
  copied verbatim) but exposes no UI to customize them at all, so this app
  adds one — falling back to that same bundled pair when the user leaves
  either slot unset, reproducing the original's always-shipped-something
  behavior rather than introducing a new failure mode.

When adding a new image/asset slot, ask which of these shapes applies —
don't add a `requireSourcePath`-style hard failure for something that could
default instead. `requireSourcePath` (`packaging.ts`) should only gate a
slot with a genuinely deliberate user choice and no sensible default (e.g. a
custom package-thumbnail image, or either VitaShell preview screenshot's
`custom-image` mode — see `PreviewImageSlot`, `imageSlots.ts`: choosing that
mode *is* the deliberate choice, so a missing image there is a real user
error, not a case to silently default around).

## Known corrections against the domain report

The report/`Theme.py` aren't infallible — when independent evidence (a real
third-party PS Vita theme validator, or an internal contradiction in
`Theme.py` itself) shows the report's citation was wrong, this codebase
follows the evidence, not the report, and records why with a `DECISION`
comment at the corrected value:

- **Notification icon size**: `notices.png`/`notice.png` are 120×110, not
  40×37. The report's citation (`Theme.py:1283-1291`) is real but is the
  tool's own small in-app preview-widget pipeline; the actual shipped-asset
  path (`Theme.py:1063`, taken when a user sets a custom icon) scales to
  `-max-height 120` — see the `IMAGE_SPECS.notificationIcon` DECISION
  comment in `imageSlots.ts`. `mask_not.png` is only bundled at 40×37, so
  `convertNotificationIcon` (`imageConversion.ts`) upscales it 3× at
  composite time rather than needing a second bundled asset.
- **`theme.xml` background-file references**: see the bullet just above.

If you find another report citation that a real exported theme or an
external validator contradicts, follow the same pattern — don't silently
revert to the report's number.

## Commands

```bash
npm run typecheck   # tsc --noEmit, main+preload config then renderer config
npm run lint          # eslint --cache .
npm run build          # typecheck + electron-vite build (no packaging)
npm run dev             # electron-vite dev, HMR renderer
```

Always run `typecheck` + `lint` + `build` after a change before considering
it done — all three are fast and catch real issues (path-alias drift,
cross-process type mismatches).

## Releases

Only Linux ships binaries, because macOS and Windows need paid signing
certificates. Pushing a `v*` tag runs `.github/workflows/release-linux.yml`,
which builds the AppImage and `.deb` on Ubuntu and attaches them to that tag's
release. Each one is uploaded twice: under its versioned filename, and again
with the version stripped out (`vita-theme-creator-x86_64.AppImage`), so
`/releases/latest/download/<stable name>` stays a working download link for
the portfolio site's download button. Keep both uploads when changing that
step — dropping the stable-named copy silently breaks those links.

Don't cross-build Linux from macOS: `sharp` and `ffmpeg-static` install
binaries for the host platform, so the result would ship macOS binaries. To
test locally, build inside a `node:22` Docker container.

Packaged builds change their working directory to
`~/Documents/Vita Theme Creator/` (`index.ts`), so the relative `Created
Themes`/`Exported`/`Icon Sets` roots land there.

## Verifying a running app

**Screenshots via macOS `screencapture` don't work in this environment** (no
Screen Recording permission on the terminal process). Two working
alternatives, both established this session:

1. **CDP screenshot** (`Page.captureScreenshot` over the Chrome DevTools
   Protocol) — works fine, since it's a Chromium-internal compositor
   capture, not a system screen grab. Launch the app with
   `--remote-debugging-port=<port>`, fetch `http://localhost:<port>/json`
   for the page target's `webSocketDebuggerUrl`, connect with Node's
   built-in `WebSocket` (Node 22+), and drive `Runtime.evaluate` /
   `Page.captureScreenshot` directly. No Playwright needed.
2. **Direct IPC calls** — same CDP connection, `Runtime.evaluate` calling
   `window.api.xxx(...)` directly with a hand-built fake `ThemeProject`, to
   exercise the real main-process pipeline end-to-end (build → zip) without
   needing the UI at all. This is the faster path for verifying
   main-process module changes.

**Launch from the project root** (`npx electron . --remote-debugging-port=N`
from `<repo>`), not `npx electron out/main/index.js` directly — the latter
makes `app.getAppPath()` resolve to `out/main` instead of the project root,
breaking `resourcePaths.ts`'s dev-mode asset resolution.

**Kill stray Electron processes before relaunching.** A background
`npx electron ...` from an earlier turn can still be holding the debug port,
so a fresh launch silently fails to bind and you end up talking to stale
code. `pkill -9 -f "VitaThemeCreator/node_modules/electron"` before
relaunching, then confirm via `ps aux` that nothing project-related is left,
including any lingering `npm run dev` session.

## Known platform limitation

ATRAC9 encoding (WAV/MP3 → `.at9`) shells out to the bundled
`at9tool.exe` — a Windows PE binary, since no legal open-source ATRAC9
encoder exists. It runs directly on Windows, through Wine elsewhere, and
throws a clear "install Wine" error if neither is available. This is not a
bug to route around — it mirrors the original tool's own Windows-only
nature. `.at9`-passthrough (validated byte-exact against Sony's own
`BgmChecker.cs`) and the bundled default track both work on every platform
without Wine.

## Git

Only commit when explicitly asked. When asked, follow the attribution
footer from the current session's system reminder, not a copy from an
earlier one.

`Created Themes/` and `Exported/` (the app's default `buildThemeFolder`/
`packageTheme` output directories, `ExportPanel.tsx`) are gitignored —
generated theme output, never source. Don't `git add` anything under them;
if a stray build ends up there, delete it directly rather than committing
it, but always `ls` first — it's also where the user's own manual test
exports land, not just yours.
