/** Small display helpers shared by the editor UI — no domain logic here. */

/** `#7a9dff` or `7a9dff` + alpha -> `rgba(122,157,255,.4)`. */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const n = parseInt(full, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/**
 * An absolute filesystem path -> a `file://` URL an `<img>`/`<audio>` can
 * load. The renderer has no Node `url` module (context isolation, no node
 * integration), so this is done by hand.
 */
export function toFileUrl(path: string): string {
  const normalized = path.replace(/\\/g, '/')
  const withLeadingSlash = normalized.startsWith('/') ? normalized : `/${normalized}`
  return `file://${encodeURI(withLeadingSlash)}`
}

export function basename(path: string): string {
  const normalized = path.replace(/\\/g, '/')
  return normalized.slice(normalized.lastIndexOf('/') + 1)
}

/** A dropped `File`'s real filesystem path — an Electron-specific extension. */
export function droppedFilePath(file: File): string | null {
  return (file as File & { path?: string }).path ?? null
}
