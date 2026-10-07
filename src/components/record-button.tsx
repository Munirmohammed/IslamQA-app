import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { RECITATION_RECORDING_OPTIONS } from '@/lib/audio-recording-options';
import { useTheme } from '@/hooks/use-theme';

interface RecordButtonProps {
  onRecorded: (uri: string) => void;
  disabled?: boolean;
}

/** Tap to start recording, tap again to stop -- hands the recorded file's
 * uri to `onRecorded` once stopped. Permission is requested lazily, on the
 * first tap, not on screen mount (don't ask before the user has expressed
 * intent to record). */
export function RecordButton({ onRecorded, disabled }: RecordButtonProps) {
  const theme = useTheme();
  const recorder = useAudioRecorder(RECITATION_RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 100);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
  }, []);

  const handlePress = async () => {
    if (recorderState.isRecording) {
      await recorder.stop();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (recorder.uri) onRecorded(recorder.uri);
      return;
    }

    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      setPermissionDenied(true);
      return;
    }

    setPermissionDenied(false);
    await recorder.prepareToRecordAsync();
    recorder.record();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} disabled={disabled}>
        {({ pressed }) => (
          <View
            style={[
              styles.button,
              {
                backgroundColor: recorderState.isRecording ? '#C0392B' : theme.primary,
                opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
              },
            ]}>
            <View
              style={
                recorderState.isRecording
                  ? styles.stopIcon
                  : [styles.micDot, { backgroundColor: '#fff' }]
              }
            />
          </View>
        )}
      </Pressable>

      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {recorderState.isRecording
          ? `Recording… ${recorderState.durationMillis ? Math.floor(recorderState.durationMillis / 1000) : 0}s (tap to stop)`
          : 'Tap to recite'}
      </ThemedText>

      {permissionDenied && (
        <ThemedText type="small" style={styles.error}>
          Microphone permission is required to check your recitation.
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  button: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  stopIcon: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  label: {
    textAlign: 'center',
  },
  error: {
    color: '#C0392B',
    textAlign: 'center',
  },
});
