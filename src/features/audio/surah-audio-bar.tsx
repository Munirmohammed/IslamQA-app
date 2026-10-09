import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useReciterStore } from '@/stores/reciter-store';

import { useReciters, useSurahAudioUrl } from './api';
import { DEFAULT_RECITER_ID } from './constants';
import { RangeRepeat } from './range-repeat';
import { ReciterRow } from './reciter-row';
import { SpeedControl } from './speed-control';

interface SurahAudioBarProps {
  surahNumber: number;
  totalAyahs: number;
}

/** A "Play surah" transport control with a reciter picker, reusable
 * across any surah-reading screen. Defaults to Al-Afasy until the user
 * picks a different reciter (see reciter-store.ts); that choice then also
 * applies to every per-ayah Listen button on the same screen. */
export function SurahAudioBar({ surahNumber, totalAyahs }: SurahAudioBarProps) {
  const theme = useTheme();
  const storedReciterId = useReciterStore((s) => s.reciterId);
  const storedReciterName = useReciterStore((s) => s.reciterName);
  const setReciter = useReciterStore((s) => s.setReciter);
  const [showPicker, setShowPicker] = useState(false);

  const reciterId = storedReciterId ?? DEFAULT_RECITER_ID;
  const reciterName = storedReciterName ?? 'Mishari Rashid al-`Afasy';

  const { data: reciters } = useReciters();
  const { data: audio, isLoading, isError } = useSurahAudioUrl(reciterId, surahNumber);

  const player = useAudioPlayer(audio?.url ?? null);
  const status = useAudioPlayerStatus(player);

  const [speed, setSpeed] = useState(1);
  // useAudioPlayer replaces the underlying player whenever its source
  // changes (e.g. the user picks a different reciter), which resets
  // playbackRate to 1 -- re-apply the user's chosen speed to the new
  // instance instead of silently dropping it.
  useEffect(() => {
    player.setPlaybackRate(speed);
  }, [player, speed]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={() => (status.playing ? player.pause() : player.play())}
          disabled={isLoading || isError}
          hitSlop={8}>
          {({ pressed }) => (
            <ThemedView
              type="primaryMuted"
              style={[styles.playButton, (pressed || isLoading || isError) && styles.disabled]}>
              <Ionicons
                name={status.playing ? 'pause' : 'play'}
                size={20}
                color={theme.primary}
              />
            </ThemedView>
          )}
        </Pressable>

        <View style={styles.label}>
          <ThemedText type="smallBold">
            {isLoading ? 'Loading audio…' : isError ? 'Audio unavailable for this surah' : 'Play surah'}
          </ThemedText>
          <Pressable onPress={() => setShowPicker((v) => !v)} hitSlop={8}>
            <ThemedText type="small" themeColor="primary">
              {reciterName} · Change
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <SpeedControl speed={speed} onChange={setSpeed} />

      <RangeRepeat surahNumber={surahNumber} totalAyahs={totalAyahs} reciterId={reciterId} />

      {showPicker && reciters && (
        <ScrollView style={styles.pickerList} contentContainerStyle={styles.pickerListContent}>
          {reciters.map((reciter) => (
            <ReciterRow
              key={reciter.id}
              reciter={reciter}
              selected={reciter.id === reciterId}
              onPress={() => {
                setReciter(reciter.id, reciter.name);
                setShowPicker(false);
              }}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    gap: 2,
  },
  pickerList: {
    maxHeight: 260,
  },
  pickerListContent: {
    gap: Spacing.two,
  },
});
