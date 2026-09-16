/**
 * The app's brand mark — a Vita screen in landscape with a LiveArea wave
 * through it. `variant="full"` (an orb at the shoulder, light frame/wave on
 * a transparent ground) sits directly on the dark landing-page canvas;
 * `variant="compact"` (no orb, dark-ink strokes) sits inside the small
 * cyan→cobalt squircle used everywhere else the mark appears at icon size.
 */
export function AppMark({
  variant = 'compact'
}: {
  variant?: 'full' | 'compact'
}): React.JSX.Element {
  if (variant === 'full') {
    return (
      <svg
        viewBox="0 0 48 48"
        width="100%"
        height="100%"
        fill="none"
        aria-hidden="true"
        style={{ filter: 'drop-shadow(0 0 8px rgba(0,210,255,.45))' }}
      >
        <rect x="3" y="11" width="42" height="26" rx="9" stroke="#F8F9FA" strokeWidth="2.8" />
        <path
          d="M7 30c4.5 0 6-7 11-7s6.5 7 11 7 5.5-4 8-4"
          stroke="#00D2FF"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="18" r="2.6" fill="#00D2FF" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" aria-hidden="true">
      <rect x="3" y="11" width="42" height="26" rx="9" stroke="#03121e" strokeWidth="3.4" />
      <path
        d="M7 30c4.5 0 6-7 11-7s6.5 7 11 7 5.5-4 8-4"
        stroke="#03121e"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
