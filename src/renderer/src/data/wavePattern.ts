/**
 * Preview-only stand-ins for the 31 firmware-baked wave patterns
 * (`PageColorSettings.waveType`, 0-30 — see colorSettings.ts). The legacy
 * tool ships a reference chart at `ThemeBUILDER/assets/waves.png` showing
 * all 31 options side by side: every tile draws the exact same soft
 * diagonal swoosh shape — the only thing that changes between indices is
 * the tint color. There are not 31 distinct pattern *designs*.
 *
 * `WAVE_TILE_COLORS` below is a per-index base color read directly off that
 * reference chart (each tile's own top-left corner, away from its digit) —
 * not a computed/arbitrary palette. Extracting it by pixel-sampling script
 * turned out to be unreliable (the chart is a hand-assembled image whose
 * rows aren't consistently left-aligned to the same x origin, so a fixed
 * grid offset drifts into the wrong tile a few columns in); the values here
 * were read visually off each row instead, cross-checked against the
 * samples that did land correctly. They're close approximations of each
 * tile's dominant color, not pixel-exact — the chart itself is a gradient
 * per tile, so "the" color is a judgment call regardless. No reference art
 * ships with this project (`resourcePaths.ts`), so `wavePatternBackground`
 * is a single fixed swoosh shape reused for every index — never a
 * different geometric "family" per index.
 */
export const WAVE_PATTERN_COUNT = 31

const WAVE_TILE_COLORS: readonly string[] = [
  '#1050e0', // 0
  '#dbe4f7', // 1
  '#fb6a4a', // 2
  '#cf1228', // 3
  '#0090b8', // 4
  '#3d0020', // 5
  '#4060f5', // 6
  '#a8c8f0', // 7
  '#081a40', // 8
  '#f52aa0', // 9
  '#f0cc20', // 10
  '#000000', // 11
  '#4a20b8', // 12
  '#10188c', // 13
  '#f5952a', // 14
  '#f0a08c', // 15
  '#1ecca0', // 16
  '#12c8e0', // 17
  '#1a0040', // 18
  '#d8b8bb', // 19
  '#4a4038', // 20
  '#9020c8', // 21
  '#e82090', // 22
  '#e8e2e2', // 23
  '#dcb0e6', // 24
  '#3aa020', // 25
  '#10b8d8', // 26
  '#b8c020', // 27
  '#5a7050', // 28
  '#7292a0', // 29
  '#606c80' // 30
]

/** The base tint for a wave index, read off the real reference chart — same shape, different color. */
export function waveTileColor(index: number): string {
  return WAVE_TILE_COLORS[((index % WAVE_PATTERN_COUNT) + WAVE_PATTERN_COUNT) % WAVE_PATTERN_COUNT]
}

/** The one shared swoosh shape every wave index draws, tinted by `waveTileColor`. */
export function wavePatternBackground(): string {
  return [
    'linear-gradient(200deg, transparent 0%, transparent 50%, rgba(255,255,255,.22) 58%, rgba(255,255,255,.32) 66%, transparent 76%)',
    'linear-gradient(20deg, transparent 0%, transparent 62%, rgba(255,255,255,.12) 70%, transparent 80%)'
  ].join(', ')
}
