/**
 * Editor panel for the 10 home-screen page backgrounds.
 * Spec: main 960×512 + thumbnail 360×192, both forced stretch (report §2;
 * IMAGE_SPECS.pageBackgroundMain / pageBackgroundThumbnail). Per-page wave
 * pattern, font color, and font-shadow live here too (§5 <m_bgParam>).
 *
 * `selectedPage` is lifted to EditorShell so the live preview's page-dot
 * row and this panel always point at the same page.
 */
import { IMAGE_SPECS, type PageIndex } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { FileDropzone } from '../common/FileDropzone'
import { ColorSwatchRow } from '../common/ColorSwatchRow'
import { PAGE_TEXT_PRESETS } from '../../data/colorPresets'
import { WAVE_PATTERN_COUNT, wavePatternBackground } from '../../data/wavePattern'

const PAGE_INDICES: PageIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const WAVE_QUICK_PICKS = Array.from({ length: WAVE_PATTERN_COUNT }, (_, i) => i)

export function PageBackgroundsPanel({
  selectedPage,
  onSelectPage
}: {
  selectedPage: PageIndex
  onSelectPage: (page: PageIndex) => void
}): React.JSX.Element {
  const { project, setPageColors, setPageImage } = useThemeProject()
  const page = project.pages[selectedPage - 1]
  const mainSpec = IMAGE_SPECS.pageBackgroundMain.dimensions
  const thumbSpec = IMAGE_SPECS.pageBackgroundThumbnail.dimensions

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
        Each of the 10 home pages carries its own background, wave pattern and text color.
      </p>

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

      <div className="panel-eyebrow">BACKGROUND</div>
      <FileDropzone
        label=""
        hint={`page ${selectedPage} · ${mainSpec.width}×${mainSpec.height}`}
        kind="image"
        value={page.images.main.sourcePath}
        onChange={(sourcePath) => setPageImage(selectedPage, 'main', { sourcePath })}
      />
      <FileDropzone
        label={`Page picker thumbnail — ${thumbSpec.width}×${thumbSpec.height}`}
        kind="image"
        compact
        value={page.images.thumbnail.sourcePath}
        onChange={(sourcePath) => setPageImage(selectedPage, 'thumbnail', { sourcePath })}
      />

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
              style={{ backgroundImage: wavePatternBackground(i, 'rgba(255,255,255,.6)') }}
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
