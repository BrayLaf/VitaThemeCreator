/**
 * Audio conversion spec. Grounded in DOMAIN_LOGIC_ANALYSIS.md §3.
 */

/**
 * The four input branches Theme.py supports (Theme.py:2671-2696). All of
 * them ultimately produce a single `bgm.at9` in the exported package.
 */
export type AudioSourceKind = 'at9-passthrough' | 'wav' | 'mp3' | 'default-bundled'

export interface AudioSourceConfig {
  kind: AudioSourceKind
  /** Absolute path to the user-selected source file. Unused for 'default-bundled'. */
  sourcePath: string | null
}

/**
 * ATRAC9 encode parameters, hardcoded in the original tool
 * (Theme.py:2677-2691, at9tool.exe usage strings). Channel count is NOT
 * forced — whatever the source WAV has is what gets encoded.
 */
export const ATRAC9_ENCODE_PARAMS = {
  bitrateKbps: 144,
  wholeLoop: true
} as const

/** Valid input sample rates for the ATRAC9 encoder, per at9tool.exe's usage string. */
export const ATRAC9_VALID_SAMPLE_RATES_HZ = [
  8000, 12000, 16000, 24000, 32000, 44100, 48000
] as const
export type Atrac9ValidSampleRateHz = (typeof ATRAC9_VALID_SAMPLE_RATES_HZ)[number]

/**
 * DECISION (2026-09-14, report §Open Questions #1): bundle the same
 * `at9tool.exe` Sony SDK binary the original tool ships, as a bundled
 * asset, and shell out to it for WAV/MP3 → .at9 encoding — same licensing
 * exposure the original repo already carries. Rationale: no legally-clear
 * open-source ATRAC9 encoder exists (confirmed — FFmpeg has none;
 * LibAtrac9/VGAudio are decode-only), and a public, actively-maintained
 * MIT-licensed tool (ATRACTool-Reloaded, github.com/XyLe-GBP) has openly
 * wrapped the same Sony binaries for years with no visible takedown,
 * suggesting Sony tolerates this pattern in practice.
 *
 * Notably, Sony's own official ThemeTool (see the decompiled
 * `Sony-ThemeTool` repo's `BgmChecker.cs`) does NOT encode at all — it only
 * *validates* a pre-supplied .at9's header (RIFF/WAVE structure, ATRAC9
 * subformat GUID, 48kHz, 144kbps, 2ch, loop metadata). That validation
 * logic is worth porting into `convertAudioTrack()`'s at9-passthrough
 * branch regardless of encode strategy — it's a precise, source-confirmed
 * spec for "is this a well-formed Vita .at9".
 */
export type AudioEncodeStrategy = 'bundled-at9tool'
