/**
 * Audio track conversion — produces the single `bgm.at9` shipped in every
 * theme package.
 *
 * Report ref: §3. Input branches: `.at9` (validated then copied through),
 * `.wav` (direct ATRAC9 encode), `.mp3` (transcode to WAV via
 * `fluent-ffmpeg`/`ffmpeg-static` first, then ATRAC9 encode), or the bundled
 * default track (copied through). Encode parameters are fixed: 144 kbps,
 * whole-file loop region.
 *
 * DECISION (2026-09-14, see `AudioEncodeStrategy` in shared/types/audio.ts):
 * bundle the same `at9tool.exe` Sony SDK binary the original tool ships and
 * shell out to it for WAV/MP3 encoding, same as the original. `at9tool.exe`
 * is a Windows PE binary (confirmed via `file`) — on macOS/Linux it's
 * invoked through Wine if available, otherwise `convertAudioTrack` throws a
 * clear, actionable error rather than silently failing. This mirrors the
 * original tool's own Windows-only nature; it is not a new limitation this
 * port introduces.
 *
 * The `.at9` passthrough branch ports the header-validation logic byte-exact
 * from Sony's own official ThemeTool (decompiled in the sibling
 * `Sony-ThemeTool` repo: `BgmChecker.cs`, `At9FileHeader.cs`, `RiffChunk.cs`,
 * `FormatChunk.cs`, `At9Chunk.cs`) — confirms RIFF/WAVE structure, the
 * ATRAC9 subformat GUID, 48kHz/144kbps/2ch, and valid loop metadata. Field
 * offsets below were hand-derived from those `[StructLayout]` declarations
 * (RiffChunk: Pack=4/12B, FormatChunk: Pack=4/8B, At9Chunk: Pack=2/132B —
 * all fields pack tightly with no inserted padding at those pack sizes).
 */
import { execFile } from 'child_process'
import { copyFile, mkdtemp, open, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { promisify } from 'util'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStaticPath from 'ffmpeg-static'
import { ATRAC9_ENCODE_PARAMS, type AudioSourceConfig } from '@shared/types'
import { AT9TOOL_PATH, DEFAULT_AUDIO_TRACK_PATH } from '../resourcePaths'

const execFileAsync = promisify(execFile)

if (ffmpegStaticPath) {
  ffmpeg.setFfmpegPath(ffmpegStaticPath)
}

// --- .at9 header validation (byte-exact port of BgmChecker.bgmFileCheck) ---

const AT9_HEADER_SIZE = 152

const RIFF_ID = 0x46464952 // 'RIFF'
const WAVE_TYPE = 0x45564157 // 'WAVE'
const FMT_ID = 0x20746d66 // 'fmt '
const FORMAT_TAG_EXTENSIBLE = 0xfffe
const FACT_ID = 0x74636166 // 'fact'
const SMPL_ID = 0x6c706d73 // 'smpl'
// ATRAC9 subformat GUID components (At9Chunk.subFormat, BgmChecker.cs:54-66).
const SUBFORMAT_DATA1 = 1205945042
const SUBFORMAT_DATA2 = 14010
const SUBFORMAT_DATA3 = 19853
const SUBFORMAT_DATA4 = 7819247650676538504n

/**
 * Byte-exact port of `BgmChecker.bgmFileCheck` — validates that a file is a
 * well-formed Vita `.at9` as produced by `at9tool.exe`: fixed RIFF/WAVE/fmt
 * chunk ids, the WAVE_FORMAT_EXTENSIBLE tag, 2 channels, 48kHz, 144kbps
 * (18000 bytes/sec), the ATRAC9 subformat GUID, a `fact` chunk, and a valid
 * `smpl` loop region. Returns false (never throws) for anything malformed or
 * too short, matching the original's try/catch-and-return-false behavior.
 */
export async function validateAt9Header(filePath: string): Promise<boolean> {
  const handle = await open(filePath, 'r')
  try {
    const buffer = Buffer.alloc(AT9_HEADER_SIZE)
    const { bytesRead } = await handle.read(buffer, 0, AT9_HEADER_SIZE, 0)
    if (bytesRead < AT9_HEADER_SIZE) return false

    if (buffer.readUInt32LE(0) !== RIFF_ID) return false
    if (buffer.readUInt32LE(8) !== WAVE_TYPE) return false
    if (buffer.readUInt32LE(12) !== FMT_ID) return false
    if (buffer.readUInt16LE(20) !== FORMAT_TAG_EXTENSIBLE) return false
    if (buffer.readUInt16LE(22) !== 2) return false
    if (buffer.readUInt32LE(24) !== 48000) return false
    if (buffer.readUInt32LE(28) !== 18000) return false
    if (buffer.readUInt16LE(34) !== 0) return false
    if (buffer.readUInt16LE(36) !== 34) return false
    if (buffer.readUInt32LE(44) !== SUBFORMAT_DATA1) return false
    if (buffer.readUInt16LE(48) !== SUBFORMAT_DATA2) return false
    if (buffer.readUInt16LE(50) !== SUBFORMAT_DATA3) return false
    if (buffer.readBigUInt64LE(52) !== SUBFORMAT_DATA4) return false
    if (buffer.readUInt32LE(72) !== FACT_ID) return false
    if (buffer.readUInt32LE(92) !== SMPL_ID) return false
    if (buffer.readUInt32LE(96) < 52) return false
    if (buffer.readUInt32LE(128) === 0) return false
    const loopStart = buffer.readInt32LE(144)
    const loopEnd = buffer.readInt32LE(148)
    if (loopStart > loopEnd) return false

    return true
  } catch {
    return false
  } finally {
    await handle.close()
  }
}

// --- at9tool.exe invocation ---

/**
 * Shells out to the bundled `at9tool.exe`. Windows runs it directly; other
 * platforms try Wine (same binary, no native macOS/Linux ATRAC9 encoder
 * exists — see report Open Questions #1). Throws a clear, actionable error
 * rather than a raw ENOENT when Wine isn't installed.
 */
async function runAt9Tool(args: string[]): Promise<void> {
  const toolPath = AT9TOOL_PATH()
  const useWine = process.platform !== 'win32'
  const command = useWine ? 'wine' : toolPath
  const commandArgs = useWine ? [toolPath, ...args] : args

  try {
    await execFileAsync(command, commandArgs)
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (useWine && err.code === 'ENOENT') {
      throw new Error(
        'ATRAC9 encoding requires Wine on macOS/Linux to run the bundled Windows-only ' +
          'at9tool.exe SDK binary (no native ATRAC9 encoder exists on any platform). ' +
          'Install Wine (e.g. `brew install --cask wine-stable`) or run this app on Windows.'
      )
    }
    throw new Error(`at9tool.exe failed: ${err.message}`)
  }
}

async function encodeWavToAt9(wavPath: string, outputPath: string): Promise<void> {
  await runAt9Tool([
    '-e',
    '-br',
    String(ATRAC9_ENCODE_PARAMS.bitrateKbps),
    '-wholeloop',
    wavPath,
    outputPath
  ])
}

function convertMp3ToWav(mp3Path: string, wavPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(mp3Path)
      .noVideo()
      .output(wavPath)
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err))
      .run()
  })
}

/**
 * Produces `bgm.at9` at the given output path from the given source config.
 * Report ref: §3 table (all four rows); Theme.py:2671-2696.
 */
export async function convertAudioTrack(
  config: AudioSourceConfig,
  outputPath: string
): Promise<string> {
  switch (config.kind) {
    case 'default-bundled':
      await copyFile(DEFAULT_AUDIO_TRACK_PATH(), outputPath)
      return outputPath

    case 'at9-passthrough': {
      if (!config.sourcePath)
        throw new Error('convertAudioTrack: at9-passthrough requires sourcePath')
      const valid = await validateAt9Header(config.sourcePath)
      if (!valid) {
        throw new Error(
          `${config.sourcePath} is not a well-formed Vita .at9 file (failed header validation — ` +
            'expected 48kHz/144kbps/2ch ATRAC9 with a valid loop region)'
        )
      }
      await copyFile(config.sourcePath, outputPath)
      return outputPath
    }

    case 'wav': {
      if (!config.sourcePath) throw new Error('convertAudioTrack: wav requires sourcePath')
      await encodeWavToAt9(config.sourcePath, outputPath)
      return outputPath
    }

    case 'mp3': {
      if (!config.sourcePath) throw new Error('convertAudioTrack: mp3 requires sourcePath')
      const tempDir = await mkdtemp(join(tmpdir(), 'vita-theme-audio-'))
      const tempWavPath = join(tempDir, 'converted.wav')
      try {
        await convertMp3ToWav(config.sourcePath, tempWavPath)
        await encodeWavToAt9(tempWavPath, outputPath)
      } finally {
        await rm(tempDir, { recursive: true, force: true })
      }
      return outputPath
    }
  }
}
