/**
 * The app's whole icon set — the four landing-page action icons (create
 * theme, load/edit theme, create icon set, manage themes) and the six
 * editor-sidebar section icons (lockscreen, pages, system icons, colors &
 * clock, audio, export). Shared geometry: 32×32 viewBox, stroked with
 * `currentColor` so callers set color via CSS (`.landing-card-glyph`,
 * `.section-item-glyph`).
 *
 * The "System Icons" section icon's source path data (a 2×2 grid of rounded
 * squares) arrived with a malformed arc segment in the second square
 * ("a2.5 2.5 0.5A2.5 2.5 0 0 1 19 11.5..." isn't valid path syntax). Rather
 * than guess the missing arc parameters, it's rendered here as four
 * `<rect>`s with rounded corners instead — the same primitive the
 * `CreateIconSetIcon` above already uses validly, just completing the 2×2
 * grid instead of leaving one corner open.
 */
function IconBase({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function CreateThemeIcon(): React.JSX.Element {
  return (
    <IconBase>
      <path d="M27 16.5V22a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h7" />
      <path d="M7.5 21c3 0 4-5 7.5-5s4.5 5 7.5 5" />
      <path d="M24 5.5v7M20.5 9h7" />
    </IconBase>
  )
}

export function LoadEditThemeIcon(): React.JSX.Element {
  return (
    <IconBase>
      <path d="M22 7H8a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h13" />
      <path d="M7.5 21c3 0 4-5 7.5-5s4.5 5 7.5 5" opacity=".55" />
      <path d="M27.2 10.3 18 19.5l-.6 3.6 3.6-.6 9.2-9.2a1.7 1.7 0 0 0 0-2.4l-.6-.6a1.7 1.7 0 0 0-2.4 0Z" />
    </IconBase>
  )
}

export function CreateIconSetIcon(): React.JSX.Element {
  return (
    <IconBase>
      <rect x="5" y="5" width="9.5" height="9.5" rx="3.4" />
      <rect x="17.5" y="5" width="9.5" height="9.5" rx="3.4" />
      <rect x="5" y="17.5" width="9.5" height="9.5" rx="3.4" />
      <path d="M22.2 17.9v8.7M17.9 22.2h8.7" />
    </IconBase>
  )
}

export function ManageThemesIcon(): React.JSX.Element {
  return (
    <IconBase>
      <rect x="4" y="12.5" width="24" height="15" rx="4" />
      <path d="M7 9.5h18M10 6.5h12" opacity=".55" />
      <path d="M7 23c2.6 0 3.5-4.5 6.5-4.5S17.4 23 20 23s3.2-2.6 5-2.6" />
    </IconBase>
  )
}

export function LockscreenSectionIcon(): React.JSX.Element {
  return (
    <IconBase>
      <path d="M5 10a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z" />
      <path d="M8.5 22c2.6 0 3.4-4 6.3-4" opacity=".55" />
      <path d="M13 17.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v2.5a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5Zm1.6-1.5v-1.4a1.4 1.4 0 0 1 2.8 0V16" />
    </IconBase>
  )
}

export function PagesSectionIcon(): React.JSX.Element {
  return (
    <IconBase>
      <path d="M8 9.5h16a3 3 0 0 1 3 3V21a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8.5a3 3 0 0 1 3-3Z" />
      <path d="M9 6.5h14" opacity=".55" />
      <path d="M12 27.5h8" />
    </IconBase>
  )
}

export function SystemIconsSectionIcon(): React.JSX.Element {
  return (
    <IconBase>
      <rect x="5.5" y="6.5" width="7.5" height="7.5" rx="2.5" />
      <rect x="19" y="6.5" width="7.5" height="7.5" rx="2.5" />
      <rect x="5.5" y="18.5" width="7.5" height="7.5" rx="2.5" />
      <rect x="19" y="18.5" width="7.5" height="7.5" rx="2.5" />
    </IconBase>
  )
}

export function ColorsClockSectionIcon(): React.JSX.Element {
  return (
    <IconBase>
      <path d="M16 5.5a10.5 10.5 0 1 1 0 21 10.5 10.5 0 0 1 0-21Z" />
      <path d="M16 5.5a10.5 10.5 0 0 1 0 21Z" opacity=".55" />
      <path d="M16 10.5V16l4 2.6" />
    </IconBase>
  )
}

export function AudioSectionIcon(): React.JSX.Element {
  return (
    <IconBase>
      <path d="M7 14v4M11.5 10.5v11M16 6.5v19M20.5 11.5v9M25 15v2" />
    </IconBase>
  )
}

export function ExportSectionIcon(): React.JSX.Element {
  return (
    <IconBase>
      <path d="M27 19v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-3" />
      <path d="M16 20V6.5M10.5 12 16 6.5 21.5 12" />
    </IconBase>
  )
}
