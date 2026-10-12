import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useReciterStore } from '@/stores/reciter-store';

import {
  useDownloadSurahAudio,
  useIsSurahAudioDownloaded,
  useReciters,
  useRemoveDownloadedSurahAudio,
  useSurahAudioUrl,
} from './api';
import { DEFAULT_RECITER_ID } from './constants';
import { RangeRepeat } from './range-repeat';
import { ReciterRow } from './reciter-row';
import { SpeedControl } from './speed-control';

interface SurahAudioBarProps {
  surahNumber: number;
  totalAyahs: number;
}

/** A full-width bar flush with the bottom edge -- Muslim Pro's real audio-
 * control shape (confirmed from its own Play Store screenshots), not
 * Quran.com's floating capsule pill this app used in an earlier phase.
 * Tapping the reciter-name area expands a panel above the bar with the
 * reciter picker, speed control, and A/B repeat drill mode; the
 * play/pause button and download badge stay on the bar itself so the
 * core action never needs the panel open. */
export function SurahAudioBar({ surahNumber, totalAyahs }: SurahAudioBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const storedReciterId = useReciterStore((s) => s.reciterId);
  const storedReciterName = useReciterStore((s) => s.reciterName);
  const setReciter = useReciterStore((s) => s.setReciter);
  const [expanded, setExpanded] = useState(false);
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
    <View style={styles.floatingContainer} pointerEvents="box-none">
      {expanded && (
        <ThemedView type="backgroundElement" style={styles.panel}>
          <ThemedText type="smallBold">Reciter</ThemedText>
          <Pressable onPress={() => setShowPicker((v) => !v)} hitSlop={8}>
            <ThemedText type="small" themeColor="primary">
              {reciterName} · {showPicker ? 'Hide list' : 'Change'}
            </ThemedText>
          </Pressable>
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

          <SpeedControl speed={speed} onChange={setSpeed} />

          <RangeRepeat surahNumber={surahNumber} totalAyahs={totalAyahs} reciterId={reciterId} />
        </ThemedView>
      )}

      <ThemedView
        type="backgroundElement"
        style={[styles.bar, { paddingBottom: Spacing.three + insets.bottom }]}>
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
                size={18}
                color={status.playing ? theme.recitationHighlight : theme.primary}
              />
            </ThemedView>
          )}
        </Pressable>

        <Pressable style={styles.barLabel} onPress={() => setExpanded((v) => !v)} hitSlop={4}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {isLoading ? 'Loading…' : isError ? 'Unavailable' : reciterName}
          </ThemedText>
          <Ionicons
            name={expanded ? 'chevron-down' : 'chevron-up'}
            size={14}
            color={theme.textSecondary}
          />
        </Pressable>

        <Pressable onPress={() => setExpanded(true)} hitSlop={8}>
          <ThemedText type="small" themeColor="textSecondary">
            {speed}x
          </ThemedText>
        </Pressable>

        <DownloadAudioBadge surahNumber={surahNumber} reciterId={reciterId} />
      </ThemedView>
    </View>
  );
}

interface DownloadAudioBadgeProps {
  surahNumber: number;
  reciterId: number;
}

/** Downloads this reciter's full-surah audio file for offline playback --
 * the same ⬇/✓ badge convention SurahListItem already uses for offline
 * text packs. A player pointed at the (now-local) file keeps working with
 * no further changes: useSurahAudioUrl checks for a downloaded copy
 * before ever touching the network. */
function DownloadAudioBadge({ surahNumber, reciterId }: DownloadAudioBadgeProps) {
  const theme = useTheme();
  const isDownloaded = useIsSurahAudioDownloaded(reciterId, surahNumber);
  const download = useDownloadSurahAudio();
  const remove = useRemoveDownloadedSurahAudio();

  if (download.isPending) {
    return <ActivityIndicator size="small" color={theme.textSecondary} style={styles.downloadBadge} />;
  }

  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        if (isDownloaded) {
          remove.mutate({ surah: surahNumber, reciterId });
        } else {
          download.mutate({ surah: surahNumber, reciterId });
        }
      }}
      style={styles.downloadBadge}>
      <Ionicons
        name={isDownloaded ? 'checkmark-circle' : 'download-outline'}
        size={18}
        color={isDownloaded ? theme.primary : theme.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  panel: {
    width: '100%',
    maxWidth: MaxContentWidth,
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  barLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pickerList: {
    maxHeight: 220,
  },
  pickerListContent: {
    gap: Spacing.two,
  },
  downloadBadge: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
