import { AudioQuality, IOSOutputFormat, type RecordingOptions } from 'expo-audio';

/**
 * Records WAV (16-bit PCM) on iOS -- the backend's recitation-check
 * endpoint decodes audio via `soundfile`/libsndfile, which reliably
 * handles WAV/MP3/FLAC/OGG but not compressed container formats like
 * M4A/AAC (expo-audio's own default presets) or WebM. Confirmed during
 * Backend Phase 2: webm/opus specifically do NOT decode.
 *
 * Known gap, not a blocker right now (only iOS is being tested): Android's
 * `AndroidOutputFormat` has no raw-PCM/WAV option at all (its enum is
 * limited to default/3gp/mpeg4/amrnb/amrwb/aac_adts/mpeg2ts/webm), so the
 * Android branch below still records AAC, which the backend can't decode
 * yet. Revisit in the Android-parity phase (F10) -- either add a
 * client-side transcode step or extend the backend's accepted formats.
 */
export const RECITATION_RECORDING_OPTIONS: RecordingOptions = {
  extension: '.wav',
  sampleRate: 16000, // matches the 16kHz Whisper expects -- skips a resample step, though the backend resamples regardless
  numberOfChannels: 1,
  bitRate: 128000,
  android: {
    extension: '.m4a',
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
  },
  ios: {
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.HIGH,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};
