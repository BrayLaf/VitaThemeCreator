/**
 * Preview-only stand-ins for the 31 firmware-baked wave patterns
 * (`PageColorSettings.waveType`, 0-30 — see colorSettings.ts). The real
 * patterns are rendered by Vita firmware itself; no reference art ships
 * with this project, so these are procedurally generated CSS approximations
 * purely so the editor has *something* distinct to show per index. They are
 * not meant to visually match the real firmware pattern with that index.
 */
export const WAVE_PATTERN_COUNT = 31

export function wavePatternBackground(index: number, color = 'rgba(255,255,255,.5)'): string {
  const family = ((index % 4) + 4) % 4
  const scale = 10 + (index % 8) * 2
  switch (family) {
    case 0:
      return `repeating-linear-gradient(135deg, ${color} 0 2px, transparent 2px ${scale + 10}px), repeating-linear-gradient(45deg, ${color} 0 1px, transparent 1px ${scale + 16}px)`
    case 1:
      return `repeating-radial-gradient(circle at 18% 130%, ${color} 0 2px, transparent 2px ${scale + 16}px)`
    case 2:
      return `repeating-linear-gradient(90deg, ${color} 0 1px, transparent 1px ${scale + 10}px), repeating-linear-gradient(0deg, ${color} 0 1px, transparent 1px ${scale + 10}px)`
    default:
      return `repeating-linear-gradient(62deg, ${color} 0 3px, transparent 3px ${scale + 12}px)`
  }
}
