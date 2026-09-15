/**
 * Editor panel for the home-screen background music. Report §3: four input
 * branches, all producing `bgm.at9` (144kbps, whole-file loop). Real
 * encoding happens in `convertAudioTrack` (main-process stub) — this panel
 * only captures the user's chosen source.
 */
import type { AudioSourceKind } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { FilePathField } from '../common/FilePathField'

const SOURCE_LABELS: Record<AudioSourceKind, string> = {
  'at9-passthrough': 'Existing .at9 file',
  wav: 'WAV file (encoded to ATRAC9)',
  mp3: 'MP3 file (transcoded, then encoded to ATRAC9)',
  'default-bundled': 'Use default bundled track'
}

export function AudioPanel(): React.JSX.Element {
  const { project, setAudio } = useThemeProject()
  const { kind, sourcePath } = project.audio

  return (
    <section className="panel">
      <h2>Audio</h2>
      <p className="panel-description">Produces a single bgm.at9, 144kbps, whole-track loop.</p>

      <label className="field field-inline">
        <span className="field-label">Source</span>
        <select
          value={kind}
          onChange={(e) => setAudio({ kind: e.target.value as AudioSourceKind, sourcePath: null })}
        >
          {(Object.keys(SOURCE_LABELS) as AudioSourceKind[]).map((k) => (
            <option key={k} value={k}>
              {SOURCE_LABELS[k]}
            </option>
          ))}
        </select>
      </label>

      {kind !== 'default-bundled' && (
        <FilePathField
          label="Audio file"
          value={sourcePath}
          onChange={(newPath) => setAudio({ sourcePath: newPath })}
        />
      )}
    </section>
  )
}
