import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useReciterStore } from '@/stores/reciter-store';

import { useAyahAudioUrl } from './api';
import { DEFAULT_RECITER_ID } from './constants';

interface AyahListenButtonProps {
  surah: number;
  ayah: number;
}

/** Per-ayah "Listen" control, styled to match AyahCard's other small
 * text-link actions (Explain, Tajweed, ...). Uses whichever reciter is
 * currently selected via SurahAudioBar's picker (or the default), so the
 * choice stays consistent across a surah without its own picker UI. */
export function AyahListenButton({ surah, ayah }: AyahListenButtonProps) {
  const theme = useTheme();
  const reciterId = useReciterStore((s) => s.reciterId) ?? DEFAULT_RECITER_ID;
  const { data: audio, isFetching } = useAyahAudioUrl(reciterId, surah, ayah);

  const player = useAudioPlayer(audio?.url ?? null);
  const status = useAudioPlayerStatus(player);

  return (
    <Pressable onPress={() => (status.playing ? player.pause() : player.play())} hitSlop={8}>
      {({ pressed }) => (
        <View style={[styles.row, (pressed || isFetching) && styles.pressed]}>
          <Ionicons name={status.playing ? 'pause' : 'play'} size={14} color={theme.primary} />
          <ThemedText type="small" themeColor="primary">
            Listen
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pressed: {
    opacity: 0.6,
  },
});
