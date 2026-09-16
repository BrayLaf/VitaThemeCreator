/**
 * Editor panel for the 10 home-screen page backgrounds.
 * Spec: main 960×512 + thumbnail 360×192, both forced-stretch by default, or
 * crop-to-fill via `ImageCropper` (report §2; IMAGE_SPECS.pageBackgroundMain
 * / pageBackgroundThumbnail; `CroppableImageSlot`). Per-page wave pattern,
 * font color, and font-shadow live here too (§5 <m_bgParam>).
 *
 * Also hosts the page-indicator dots (basePage.png/curPage.png, 22×22,
 * `PageIndicatorImageSlot`) — a single global pair shared by all 10 pages,
 * not per-page state, but grouped here since it's the same LiveArea concept.
 * See the DECISION note in imageSlots.ts: the original tool never exposed
 * these as customizable.
 *
 * `selectedPage` is lifted to EditorShell so the live preview's page-dot
 * row and this panel always point at the same page.
 */
import { IMAGE_SPECS, type PageIndex } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { FileDropzone } from '../common/FileDropzone'
import { ColorSwatchRow } from '../common/ColorSwatchRow'
import { ImageCropper } from '../common/ImageCropper'
import { FitModeToggle } from '../common/FitModeToggle'
import { PAGE_TEXT_PRESETS } from '../../data/colorPresets'
import { WAVE_PATTERN_COUNT, waveTileColor, wavePatternBackground } from '../../data/wavePattern'

const PAGE_INDICES: PageIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const WAVE_QUICK_PICKS = Array.from({ length: WAVE_PATTERN_COUNT }, (_, i) => i)

export function PageBackgroundsPanel({
  selectedPage,
  onSelectPage
}: {
  selectedPage: PageIndex
  onSelectPage: (page: PageIndex) => void
}): React.JSX.Element {
  const { project, setPageColors, setPageImage, setPageIndicatorImage } = useThemeProject()
  const page = project.pages[selectedPage - 1]
  const mainSpec = IMAGE_SPECS.pageBackgroundMain.dimensions
  const thumbSpec = IMAGE_SPECS.pageBackgroundThumbnail.dimensions
  const indicatorSpec = IMAGE_SPECS.pageIndicator.dimensions

  const applyToAllPages = (): void => {
    for (const index of PAGE_INDICES) {
      if (index === selectedPage) continue
      setPageColors(index, { ...page.colors })
    }
  }

  return (
    <section className="panel">
      <h2>Pages</h2>
      <p className="panel-description">
        Each of the 10 home pages carries its own background, wave pattern and text color. The
        background image is optional — the wave pattern is what the Vita itself draws behind the
        page (and during page-swipe transitions) when no image is set, not a layer on top of one.
      </p>

      <div className="panel-eyebrow">PAGE INDICATOR (ALL PAGES)</div>
      <p className="panel-description">
        The dot strip shown on the LiveArea marking which of the 10 pages is selected. Optional —
        leave either empty to keep the default dot.
      </p>
      <div className="two-col">
        <FileDropzone
          label="Unselected page"
          hint={`${indicatorSpec.width}×${indicatorSpec.height} · png/jpg`}
          kind="image"
          compact
          value={project.pageIndicator.basePage.sourcePath}
          onChange={(sourcePath) => setPageIndicatorImage('basePage', sourcePath)}
        />
        <FileDropzone
          label="Current page"
          hint={`${indicatorSpec.width}×${indicatorSpec.height} · png/jpg`}
          kind="image"
          compact
          value={project.pageIndicator.curPage.sourcePath}
          onChange={(sourcePath) => setPageIndicatorImage('curPage', sourcePath)}
        />
      </div>

      <div className="panel-divider" />

      <div className="panel-eyebrow">PAGE</div>
      <div className="chip-grid chip-grid-5">
        {PAGE_INDICES.map((n) => (
          <button
            key={n}
            type="button"
            className={n === selectedPage ? 'chip chip-mono chip-active' : 'chip chip-mono'}
            onClick={() => onSelectPage(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="panel-eyebrow">BACKGROUND (OPTIONAL)</div>
      <FileDropzone
        label=""
        hint={`page ${selectedPage} · ${mainSpec.width}×${mainSpec.height} · leave empty to use the wave pattern`}
        kind="image"
        value={page.images.main.sourcePath}
        onChange={(sourcePath) => setPageImage(selectedPage, 'main', { sourcePath })}
      />
      {page.images.main.sourcePath && (
        <>
          <FitModeToggle
            value={page.images.main.fitMode}
            onChange={(fitMode) => setPageImage(selectedPage, 'main', { fitMode })}
          />
          {page.images.main.fitMode === 'crop' && (
            <ImageCropper
              key={`${selectedPage}-${page.images.main.sourcePath}`}
              sourcePath={page.images.main.sourcePath}
              crop={page.images.main.crop}
              onChange={(crop) => setPageImage(selectedPage, 'main', { crop })}
              frameWidth={mainSpec.width}
              frameHeight={mainSpec.height}
            />
          )}
        </>
      )}
      <FileDropzone
        label={`Page picker thumbnail — ${thumbSpec.width}×${thumbSpec.height}`}
        kind="image"
        compact
        value={page.images.thumbnail.sourcePath}
        onChange={(sourcePath) => setPageImage(selectedPage, 'thumbnail', { sourcePath })}
      />
      {page.images.thumbnail.sourcePath && (
        <>
          <FitModeToggle
            value={page.images.thumbnail.fitMode}
            onChange={(fitMode) => setPageImage(selectedPage, 'thumbnail', { fitMode })}
          />
          {page.images.thumbnail.fitMode === 'crop' && (
            <ImageCropper
              key={`${selectedPage}-${page.images.thumbnail.sourcePath}`}
              sourcePath={page.images.thumbnail.sourcePath}
              crop={page.images.thumbnail.crop}
              onChange={(crop) => setPageImage(selectedPage, 'thumbnail', { crop })}
              frameWidth={thumbSpec.width}
              frameHeight={thumbSpec.height}
            />
          )}
        </>
      )}

      <div className="panel-eyebrow">WAVE PATTERN</div>
      <div className="chip-grid chip-grid-8">
        {WAVE_QUICK_PICKS.map((i) => (
          <button
            key={i}
            type="button"
            className={
              i === page.colors.waveType ? 'wave-swatch wave-swatch-active' : 'wave-swatch'
            }
            onClick={() => setPageColors(selectedPage, { waveType: i })}
            title={`Wave pattern ${i}`}
          >
            <div
              className="wave-swatch-fill"
              style={{
                backgroundColor: waveTileColor(i),
                backgroundImage: wavePatternBackground()
              }}
            />
            <span>{i}</span>
          </button>
        ))}
      </div>

      <ColorSwatchRow
        label="Page text color"
        value={page.colors.fontColor}
        presets={PAGE_TEXT_PRESETS}
        onChange={(fontColor) => setPageColors(selectedPage, { fontColor })}
      />
      <label className="field field-inline">
        <span className="field-label">Text shadow</span>
        <input
          type="checkbox"
          checked={page.colors.fontShadow}
          onChange={(e) => setPageColors(selectedPage, { fontShadow: e.target.checked })}
        />
      </label>

      <button type="button" className="hint-button" onClick={applyToAllPages}>
        Copy this page&apos;s colors &amp; wave to all 10 pages →
      </button>
    </section>
  )
}
