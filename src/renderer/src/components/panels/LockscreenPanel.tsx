/**
 * Editor panel for the lockscreen image slot.
 * Spec: 960×512, forced stretch (report §2; IMAGE_SPECS.lockscreen).
 */
import { IMAGE_SPECS } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { FilePathField } from '../common/FilePathField'

export function LockscreenPanel(): React.JSX.Element {
  const { project, setLockscreenImage } = useThemeProject()
  const { width, height } = IMAGE_SPECS.lockscreen.dimensions

  return (
    <section className="panel">
      <h2>Lockscreen</h2>
      <p className="panel-description">
        Shown before the theme&apos;s home screen loads. Output {width}×{height}, forced stretch (no
        crop).
      </p>
      <FilePathField
        label="Source image"
        value={project.lockscreenImage.sourcePath}
        onChange={(sourcePath) => setLockscreenImage({ sourcePath })}
      />
    </section>
  )
}
