/**
 * Editor panel for the notification bubble icons ("no notice" / "new
 * notice"). Spec: scaled to max-height 37px, aspect preserved, then masked
 * to a 40×37 pill (report §2; IMAGE_SPECS.notificationIcon).
 */
import { IMAGE_SPECS } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { FilePathField } from '../common/FilePathField'

export function NotificationIconsPanel(): React.JSX.Element {
  const { project, setNotificationIcon } = useThemeProject()
  const { maxHeight, maskDimensions } = IMAGE_SPECS.notificationIcon

  return (
    <section className="panel">
      <h2>Notification Bubble Icons</h2>
      <p className="panel-description">
        Max height {maxHeight}px, aspect preserved, masked to {maskDimensions.width}×
        {maskDimensions.height}.
      </p>
      <FilePathField
        label="No-notice icon"
        value={project.notificationIcons.noNotice.sourcePath}
        onChange={(sourcePath) => setNotificationIcon('noNotice', { sourcePath })}
      />
      <FilePathField
        label="New-notice icon"
        value={project.notificationIcons.newNotice.sourcePath}
        onChange={(sourcePath) => setNotificationIcon('newNotice', { sourcePath })}
      />
    </section>
  )
}
