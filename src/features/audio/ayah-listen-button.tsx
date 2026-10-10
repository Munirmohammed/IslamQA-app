import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useReciterStore } from '@/stores/reciter-store';

import { useAyahAudioUrl } from './api';
import { DEFAULT_RECITER_ID } from './constants';

interface AyahListenButtonProps {
  surah: number;
  ayah: number;
  /** Lets the parent AyahCard highlight itself (Quran.com's "saffron"
   * now-playing tint) while this specific ayah's audio is playing --
   * the player state otherwise lives entirely inside this component. */
  onPlayingChange?: (playing: boolean) => void;
}

/** Per-ayah "Listen" control, styled to match AyahCard's other small
 * text-link actions (Explain, Tajweed, ...). Uses whichever reciter is
 * currently selected via SurahAudioBar's picker (or the default), so the
 * choice stays consistent across a surah without its own picker UI. */
export function AyahListenButton({ surah, ayah, onPlayingChange }: AyahListenButtonProps) {
  const theme = useTheme();
  const reciterId = useReciterStore((s) => s.reciterId) ?? DEFAULT_RECITER_ID;
  const { data: audio, isFetching } = useAyahAudioUrl(reciterId, surah, ayah);

  const player = useAudioPlayer(audio?.url ?? null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    onPlayingChange?.(status.playing);
    // Clear the highlight if this button unmounts mid-playback (e.g. the
    // list scrolls it away) rather than leaving the parent stuck "on".
    return () => onPlayingChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.playing]);

  return (
    <Pressable onPress={() => (status.playing ? player.pause() : player.play())} hitSlop={8}>
      {({ pressed }) => (
        <View style={[styles.row, (pressed || isFetching) && styles.pressed]}>
          <Ionicons
            name={status.playing ? 'pause' : 'play'}
            size={14}
            color={status.playing ? theme.recitationHighlight : theme.primary}
          />
          <ThemedText type="small" themeColor={status.playing ? 'recitationHighlight' : 'primary'}>
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
