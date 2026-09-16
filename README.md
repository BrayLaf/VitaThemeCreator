# Vita Theme Creator

A desktop app (Electron + React + TypeScript) for building custom home-screen
themes for the PlayStation Vita — a modern, cross-platform reimplementation of
the community tool [ThemeBUILDER](https://github.com/AntHJ/ThemeBUILDER) by
[AntHJ](https://github.com/AntHJ), which was Windows-only and built on
PySimpleGUI/Tkinter. This app exists because of ThemeBUILDER: its domain
logic (image dimensions, the `theme.xml` schema, icon slots, audio encode
parameters, packaging layout) is the entire foundation this codebase is
built on top of — full credit to AntHJ for the original tool and for
reverse-engineering the Vita theme format in the first place.

Every piece of domain logic here (image dimensions, the `theme.xml` manifest
schema, ATRAC9 audio encoding, icon generation, packaging) is grounded in a
reverse-engineering pass over the original tool's source, written up at
[`../ThemeBUILDER/DOMAIN_LOGIC_ANALYSIS.md`](../ThemeBUILDER/DOMAIN_LOGIC_ANALYSIS.md).
See that report for the "why" behind anything that looks unusual — and see
[`CLAUDE.md`](./CLAUDE.md) for the engineering conventions this codebase follows.

Also credited: [LiEnby/Sony-ThemeTool](https://github.com/LiEnby/Sony-ThemeTool),
a decompile of Sony's own official ThemeTool. It's the second load-bearing
source this app is grounded in — the `.at9` header validation in
`audioConversion.ts` (`convertAudioTrack`'s passthrough branch) is ported
byte-exact from its `BgmChecker.cs`/`At9FileHeader.cs`/`RiffChunk.cs`/
`FormatChunk.cs`/`At9Chunk.cs`.

## What it does

- Opens to a landing page with four destinations: **Create theme**, **Load /
  edit theme** (open an existing project file), **Create icon set** (a
  standalone 17-icon builder, independent of any theme), and **Manage
  created themes** (list, edit, delete, or re-export every theme you've
  built from `Created Themes/`).
- Edits a theme project (lockscreen, 10 home-screen pages, 17 system icons,
  clock/notification/status-bar colors, background music, package metadata)
  through native file pickers — no manual path-typing.
- Renders a live, Vita-accurate preview of the lockscreen and the currently
  selected home page as you edit, corrected against real exported
  ThemeBUILDER output (not guessed from generic phone-UI conventions) — the
  wave-pattern page backgrounds, the lockscreen's page-lip preview overlay,
  and the system icons all render from the legacy tool's own bundled art,
  not an approximation.
- Every image slot can be either stretched to fit (the original tool's only
  option) or cropped, via an interactive drag-to-pan/scroll-to-zoom cover-fit
  editor (`ImageCropper`) whose crop math is shared exactly between the
  editor, the live preview (`CroppedImageLayer`), and the export pipeline —
  what you see while adjusting a crop is exactly what ships.
- Builds and exports a real, installable theme package: converted/masked
  PNGs at every required size, a generated `theme.xml`, composited system
  icons, an ATRAC9 `bgm.at9`, and a zipped `.zip` matching the community
  themes repository's expected layout. The export success notice shows the
  zip's path as a link — click it to reveal the file in Finder/Explorer.

## Project status

Scaffolding, the full domain-logic port (image/audio/icon conversion,
manifest generation, packaging), an initial UI/preview design pass, the
landing page / theme library / standalone icon-set creator, and a
crop/zoom image editor for every optional image slot are done. Native
ATRAC9 encoding (WAV/MP3 → `.at9`) requires the bundled Windows
`at9tool.exe`, run directly on Windows or through Wine elsewhere — see
`src/main/modules/audioConversion.ts` for the full explanation. `.at9`
passthrough and the bundled default track work on every platform.

A theme built and validated against a real third-party PS Vita theme
validator surfaced two domain-logic corrections against the original
report: notification icons ship at 120×110, not 40×37, and `theme.xml`
omits a page's background-file references entirely when no image is set
(rather than pointing at a `bgN.png` that's never generated) — see
CLAUDE.md's "Known corrections against the domain report" for the evidence
trail. The same validation pass also caught two implementation bugs (not
report mismatches): `theme.xml` was serializing one `<m_bgParam>` per page
instead of one holding all ten `<BackgroundParam>` siblings, corrupting
page backgrounds on-device, and notification icons were being alpha-masked
onto a transparent canvas with a mask file that has no alpha channel — both
fixed.

Every optional image slot (lockscreen, notification icons, a page's
background, the package thumbnail's collage tiles) has a real fallback
sourced from ThemeBUILDER's own bundled defaults — see
`src/main/resourcePaths.ts`'s `DEFAULT_*_PATH` exports — so **Build & Export
never fails just because an optional slot was left untouched**; a genuine
failure (a corrupt source image, `.at9` encoding needing Wine) now surfaces
as a clear in-app error banner instead of a console-only stack trace.

## Project Setup

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Verify

```bash
npm run typecheck   # tsc, main+preload and renderer configs
npm run lint         # eslint --cache
npm run build         # typecheck + electron-vite build (no packaging)
```

### Package a distributable

```bash
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux
```

## Project layout

```
src/
  shared/types/    the ThemeProject data model + theme.xml manifest shape — the source of truth
  shared/ipc.ts    the renderer <-> main IPC contract (one method per main-process module)
  main/modules/     the actual conversion/build logic (image, audio, icons, manifest, packaging,
                    persistence, plus themeLibrary.ts's read-only Created Themes/ bookkeeping
                    for the "Manage created themes" library view)
  main/resourcePaths.ts   resolves resources/themebuilder-assets/ in both dev and packaged builds,
                          including the bundled DEFAULT_*_PATH fallbacks for optional image slots
  main/index.ts     also registers the themefile:// protocol every real-file <img> in the
                    renderer loads through — plain file:// is blocked in dev, where the
                    renderer is served over http:// (electron-vite's HMR), not file://
  preload/          exposes shared/ipc.ts's contract on window.api
  renderer/src/
    App.tsx                routes between LandingPage, EditorShell, IconSetCreatorPage,
                            and ManageThemesPage — the app boots to LandingPage, not a blank project
    components/LandingPage.tsx, IconSetCreatorPage.tsx, ManageThemesPage.tsx
    components/panels/    one editor panel per theme aspect
    components/preview/   the live Vita-accurate device preview
    components/common/IconTile.tsx   renders one system-icon tile from the real bundled
                                      background-swatch + glyph-overlay art
    components/common/IconChoiceEditor.tsx   the glyph-style + background controls for one
                                              icon slot, shared by SystemIconsPanel and
                                              IconSetCreatorPage
    components/common/ImageCropper.tsx   interactive drag-to-pan/scroll-to-zoom cover-fit
                                          crop editor, used by notification icons (always
                                          cropped) and opt-in for the lockscreen/page
                                          backgrounds ("Crop to fill" via FitModeToggle.tsx)
    components/common/CroppedImageLayer.tsx   read-only live-preview counterpart to
                                               ImageCropper, sharing its exact crop math
                                               (lib/imageCrop.ts) with the export pipeline
    lib/themebuilderAssets.ts   resolves resources/themebuilder-assets/ paths for the
                                renderer (one IPC round trip, cached) + builds themefile:// URLs
    state/                 ThemeProject React context + update actions
resources/themebuilder-assets/   icon glyph/background art, masks, default audio track,
                                  at9tool.exe, and default fallback images (lockscreen,
                                  notification icons, page background) — ported from the legacy tool
```

`Created Themes/`, `Exported/`, and `Icon Sets/` (the app's own default
build/export/icon-set output directories) are gitignored — never commit
theme output.
