/**
 * Editor panel for the home-screen background music. Report §3: four input
 * branches, all producing `bgm.at9` (144kbps, whole-file loop). Real
 * encoding happens in `convertAudioTrack` (main-process module).
 */
import type { AudioSourceKind } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { FileDropzone } from '../common/FileDropzone'

const SOURCE_LABELS: Record<AudioSourceKind, string> = {
  'default-bundled': 'Bundled default',
  'at9-passthrough': 'Existing .at9',
  wav: 'WAV',
  mp3: 'MP3'
}

export function AudioPanel(): React.JSX.Element {
  const { project, setAudio } = useThemeProject()
  const { kind, sourcePath } = project.audio

  return (
    <section className="panel">
      <h2>Audio</h2>
      <p className="panel-description">
        Optional background music, looped on the home screen. Produces a single bgm.at9, 144kbps,
        whole-track loop.
      </p>

      <div className="panel-eyebrow">SOURCE</div>
      <div className="chip-row">
        {(Object.keys(SOURCE_LABELS) as AudioSourceKind[]).map((k) => (
          <button
            key={k}
            type="button"
            className={kind === k ? 'chip chip-active' : 'chip'}
            onClick={() => setAudio({ kind: k, sourcePath: null })}
          >
            {SOURCE_LABELS[k]}
          </button>
        ))}
      </div>

      {kind === 'default-bundled' ? (
        <p className="panel-description">Uses the bundled default track, no file needed.</p>
      ) : (
        <FileDropzone
          label=""
          hint="mp3/wav/at9 · loops seamlessly"
          kind="audio"
          value={sourcePath}
          onChange={(newPath) => setAudio({ sourcePath: newPath })}
        />
      )}
    </section>
  )
}
