/**
 * Editor panel for the lockscreen: background image (960×512, forced-stretch
 * by default, or crop-to-fill via `ImageCropper` — IMAGE_SPECS.lockscreen,
 * `CroppableImageSlot`) and the notification bubble shown on top of it (§5
 * <StartScreenProperty> colors + the noNotice/newNotice icon images, §2
 * IMAGE_SPECS.notificationIcon).
 */
import { IMAGE_SPECS } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { FileDropzone } from '../common/FileDropzone'
import { ColorSwatchRow } from '../common/ColorSwatchRow'
import { ImageCropper } from '../common/ImageCropper'
import { FitModeToggle } from '../common/FitModeToggle'
import { NOTIFICATION_BOX_PRESETS, NOTIFICATION_TEXT_PRESETS } from '../../data/colorPresets'
import { notificationGuideMaskUrl, useThemebuilderAssetsRoot } from '../../lib/themebuilderAssets'

export function LockscreenPanel(): React.JSX.Element {
  const { project, setLockscreenImage, setNotificationIcon, setNotificationColors } =
    useThemeProject()
  const { width, height } = IMAGE_SPECS.lockscreen.dimensions
  const { dimensions: notificationFrame } = IMAGE_SPECS.notificationIcon
  const assetsRoot = useThemebuilderAssetsRoot()

  return (
    <section className="panel">
      <h2>Lockscreen</h2>
      <p className="panel-description">
        The screen shown before unlock. Background is {width} × {height}.
      </p>

      <div className="panel-eyebrow">BACKGROUND</div>
      <FileDropzone
        label=""
        hint={`lockscreen bg · ${width}×${height} · png/jpg`}
        kind="image"
        value={project.lockscreenImage.sourcePath}
        onChange={(sourcePath) => setLockscreenImage({ sourcePath })}
      />
      {project.lockscreenImage.sourcePath && (
        <>
          <FitModeToggle
            value={project.lockscreenImage.fitMode}
            onChange={(fitMode) => setLockscreenImage({ fitMode })}
          />
          {project.lockscreenImage.fitMode === 'crop' && (
            <ImageCropper
              key={project.lockscreenImage.sourcePath}
              sourcePath={project.lockscreenImage.sourcePath}
              crop={project.lockscreenImage.crop}
              onChange={(crop) => setLockscreenImage({ crop })}
              frameWidth={width}
              frameHeight={height}
            />
          )}
        </>
      )}

      <div className="panel-divider" />

      <div className="panel-eyebrow">NOTIFICATION BUBBLE</div>
      <p className="panel-description">
        The Vita only reveals a circular window toward the upper right of the{' '}
        {notificationFrame.width}×{notificationFrame.height} frame — drag/zoom below to keep the
        important part of your icon inside it.
      </p>
      <div className="two-col">
        <div>
          <FileDropzone
            label="No-notice icon"
            hint={`${notificationFrame.width}×${notificationFrame.height} · png/jpg`}
            kind="image"
            compact
            value={project.notificationIcons.noNotice.sourcePath}
            onChange={(sourcePath) => setNotificationIcon('noNotice', { sourcePath })}
          />
          {project.notificationIcons.noNotice.sourcePath && (
            <ImageCropper
              key={project.notificationIcons.noNotice.sourcePath}
              sourcePath={project.notificationIcons.noNotice.sourcePath}
              crop={project.notificationIcons.noNotice.crop}
              onChange={(crop) => setNotificationIcon('noNotice', { crop })}
              frameWidth={notificationFrame.width}
              frameHeight={notificationFrame.height}
              guideOverlayUrl={assetsRoot ? notificationGuideMaskUrl(assetsRoot) : undefined}
            />
          )}
        </div>
        <div>
          <FileDropzone
            label="New-notice icon"
            hint={`${notificationFrame.width}×${notificationFrame.height} · png/jpg`}
            kind="image"
            compact
            value={project.notificationIcons.newNotice.sourcePath}
            onChange={(sourcePath) => setNotificationIcon('newNotice', { sourcePath })}
          />
          {project.notificationIcons.newNotice.sourcePath && (
            <ImageCropper
              key={project.notificationIcons.newNotice.sourcePath}
              sourcePath={project.notificationIcons.newNotice.sourcePath}
              crop={project.notificationIcons.newNotice.crop}
              onChange={(crop) => setNotificationIcon('newNotice', { crop })}
              frameWidth={notificationFrame.width}
              frameHeight={notificationFrame.height}
              guideOverlayUrl={assetsRoot ? notificationGuideMaskUrl(assetsRoot) : undefined}
            />
          )}
        </div>
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
