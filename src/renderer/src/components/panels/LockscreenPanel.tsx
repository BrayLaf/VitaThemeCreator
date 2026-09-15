/**
 * Editor panel for the lockscreen: background image (960×512, forced
 * stretch — IMAGE_SPECS.lockscreen) and the notification bubble shown on
 * top of it (§5 <StartScreenProperty> colors + the noNotice/newNotice icon
 * images, §2 IMAGE_SPECS.notificationIcon).
 */
import { IMAGE_SPECS } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { FileDropzone } from '../common/FileDropzone'
import { ColorSwatchRow } from '../common/ColorSwatchRow'
import { NOTIFICATION_BOX_PRESETS, NOTIFICATION_TEXT_PRESETS } from '../../data/colorPresets'

export function LockscreenPanel(): React.JSX.Element {
  const { project, setLockscreenImage, setNotificationIcon, setNotificationColors } =
    useThemeProject()
  const { width, height } = IMAGE_SPECS.lockscreen.dimensions
  const { maxHeight, maskDimensions } = IMAGE_SPECS.notificationIcon

  return (
    <section className="panel">
      <h2>Lockscreen</h2>
      <p className="panel-description">
        The screen shown before unlock. Background is cropped to {width} × {height}.
      </p>

      <div className="panel-eyebrow">BACKGROUND</div>
      <FileDropzone
        label=""
        hint={`lockscreen bg · ${width}×${height} · png/jpg`}
        kind="image"
        value={project.lockscreenImage.sourcePath}
        onChange={(sourcePath) => setLockscreenImage({ sourcePath })}
      />

      <div className="panel-divider" />

      <div className="panel-eyebrow">NOTIFICATION BUBBLE</div>
      <div className="two-col">
        <FileDropzone
          label="No-notice icon"
          hint={`max ${maxHeight}px tall · masked to ${maskDimensions.width}×${maskDimensions.height}`}
          kind="image"
          compact
          value={project.notificationIcons.noNotice.sourcePath}
          onChange={(sourcePath) => setNotificationIcon('noNotice', { sourcePath })}
        />
        <FileDropzone
          label="New-notice icon"
          hint={`max ${maxHeight}px tall · masked to ${maskDimensions.width}×${maskDimensions.height}`}
          kind="image"
          compact
          value={project.notificationIcons.newNotice.sourcePath}
          onChange={(sourcePath) => setNotificationIcon('newNotice', { sourcePath })}
        />
      </div>

      <ColorSwatchRow
        label="Bubble fill"
        value={project.notificationColors.boxColor}
        presets={NOTIFICATION_BOX_PRESETS}
        onChange={(boxColor) => setNotificationColors({ boxColor })}
      />
      <ColorSwatchRow
        label="Text color"
        value={project.notificationColors.textColor}
        presets={NOTIFICATION_TEXT_PRESETS}
        onChange={(textColor) => setNotificationColors({ textColor })}
      />

      <div className="sample-bubble">
        <div
          className="sample-bubble-icon"
          style={{ background: `#${project.notificationColors.boxColor}` }}
        />
        <span style={{ color: `#${project.notificationColors.textColor}` }}>2 new messages</span>
      </div>
    </section>
  )
}
