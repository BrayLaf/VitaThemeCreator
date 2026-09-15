/**
 * Editor panel for the 10 home-screen page backgrounds.
 * Spec: main 960×512 + thumbnail 360×192, both forced stretch (report §2;
 * IMAGE_SPECS.pageBackgroundMain / pageBackgroundThumbnail). Per-page wave
 * pattern, font color, and font-shadow live here too (§5 <m_bgParam>).
 */
import { useState } from 'react'
import { IMAGE_SPECS, type PageIndex } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { FilePathField } from '../common/FilePathField'
import { HexColorField } from '../common/HexColorField'

const PAGE_INDICES: PageIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function PageBackgroundsPanel(): React.JSX.Element {
  const [selectedPage, setSelectedPage] = useState<PageIndex>(1)
  const { project, setPageColors, setPageImage } = useThemeProject()
  const page = project.pages[selectedPage - 1]
  const mainSpec = IMAGE_SPECS.pageBackgroundMain.dimensions
  const thumbSpec = IMAGE_SPECS.pageBackgroundThumbnail.dimensions

  return (
    <section className="panel">
      <h2>Page Backgrounds</h2>
      <p className="panel-description">
        10 fixed home-screen pages, each with its own art and colors.
      </p>

      <div className="page-tabs">
        {PAGE_INDICES.map((index) => (
          <button
            key={index}
            type="button"
            className={index === selectedPage ? 'page-tab page-tab-active' : 'page-tab'}
            onClick={() => setSelectedPage(index)}
          >
            {index}
          </button>
        ))}
      </div>

      <div className="panel-subsection">
        <h3>Images</h3>
        <FilePathField
          label={`Background (page ${selectedPage}) — ${mainSpec.width}×${mainSpec.height}`}
          value={page.images.main.sourcePath}
          onChange={(sourcePath) => setPageImage(selectedPage, 'main', { sourcePath })}
        />
        <FilePathField
          label={`Thumbnail (page ${selectedPage}) — ${thumbSpec.width}×${thumbSpec.height}`}
          value={page.images.thumbnail.sourcePath}
          onChange={(sourcePath) => setPageImage(selectedPage, 'thumbnail', { sourcePath })}
        />
      </div>

      <div className="panel-subsection">
        <h3>Colors &amp; wave</h3>
        <HexColorField
          label="Page text color"
          value={page.colors.fontColor}
          onChange={(fontColor) => setPageColors(selectedPage, { fontColor })}
        />
        <label className="field field-inline">
          <span className="field-label">Wave pattern (0-30)</span>
          <input
            type="number"
            min={0}
            max={30}
            value={page.colors.waveType}
            onChange={(e) => setPageColors(selectedPage, { waveType: Number(e.target.value) })}
          />
        </label>
        <label className="field field-inline">
          <span className="field-label">Text shadow</span>
          <input
            type="checkbox"
            checked={page.colors.fontShadow}
            onChange={(e) => setPageColors(selectedPage, { fontShadow: e.target.checked })}
          />
        </label>
      </div>
    </section>
  )
}
