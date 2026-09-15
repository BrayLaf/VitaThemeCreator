/**
 * Audio track conversion — produces the single `bgm.at9` shipped in every
 * theme package.
 *
 * Report ref: §3. Input branches: `.at9` (copy through, but validate the
 * header first — see below), `.wav` (direct ATRAC9 encode), `.mp3`
 * (transcode to WAV via `fluent-ffmpeg`/`ffmpeg-static` first, then ATRAC9
 * encode), or the bundled default track (copy through). Encode parameters
 * are fixed: 144 kbps, whole-file loop region.
 *
 * DECISION (2026-09-14, see `AudioEncodeStrategy` in shared/types/audio.ts):
 * bundle the same `at9tool.exe` Sony SDK binary the original tool ships and
 * shell out to it for WAV/MP3 encoding, same as the original.
 *
 * For the `.at9` passthrough branch, port the header-validation logic from
 * Sony's own official ThemeTool (decompiled in the sibling `Sony-ThemeTool`
 * repo's `BgmChecker.cs`): confirms RIFF/WAVE structure, the ATRAC9
 * subformat GUID, 48kHz/144kbps/2ch, and valid loop metadata. That is a
 * precise, source-confirmed spec for "is this a well-formed Vita .at9" and
 * is worth reusing rather than re-deriving.
 *
 * STUB MODULE — no real audio processing yet. All functions throw.
 */
import type { AudioSourceConfig } from '@shared/types'

/**
 * Produces `bgm.at9` at the given output path from the given source config.
 * Report ref: §3 table (all four rows); Theme.py:2671-2696.
 */
export function convertAudioTrack(
  _config: AudioSourceConfig,
  _outputPath: string
): Promise<string> {
  throw new Error('not implemented: convertAudioTrack')
}
