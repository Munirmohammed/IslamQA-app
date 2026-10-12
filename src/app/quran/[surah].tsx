import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AyahCard } from '@/components/ayah-card';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ReadingThemes, Spacing, type ReadingThemeId } from '@/constants/theme';
import { SurahAudioBar } from '@/features/audio/surah-audio-bar';
import { useMarkAyahsRead } from '@/features/khatmah/api';
import { useSurah } from '@/features/quran/api';
import { ReadingThemeOverrideProvider, useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { useReadingThemeStore } from '@/stores/reading-theme-store';

const READING_THEME_IDS: ReadingThemeId[] = ['system', 'original', 'paper', 'calm', 'focus', 'quiet'];

export default function SurahDetailScreen() {
  const { surah: surahParam } = useLocalSearchParams<{ surah: string }>();
  const surahNumber = Number(surahParam);
  const { data: surah, isLoading, error } = useSurah(surahNumber);
  const accessToken = useAuthStore((s) => s.accessToken);
  const markAyahsRead = useMarkAyahsRead();
  const theme = useTheme();
  const readingThemeId = useReadingThemeStore((s) => s.themeId);
  const setReadingThemeId = useReadingThemeStore((s) => s.setThemeId);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const readingTheme = readingThemeId === 'system' ? null : ReadingThemes[readingThemeId];

  // Opening a surah's reading screen counts as reading it, toward khatmah
  // progress -- the same coarse-grained "a concrete action happened" signal
  // the rest of the app uses, not scroll-accurate tracking.
  useEffect(() => {
    if (accessToken && surah && surah.ayahs.length > 0) {
      markAyahsRead.mutate({
        surah: surahNumber,
        ayah_from: surah.ayahs[0].ayah_number,
        ayah_to: surah.ayahs[surah.ayahs.length - 1].ayah_number,
      });
    }
    // markAyahsRead intentionally excluded: it's a stable mutate function,
    // not a value this effect should re-fire on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, surah, surahNumber]);

  return (
    <ThemedView style={[styles.container, readingTheme && { backgroundColor: readingTheme.background }]}>
      <Stack.Screen
        options={{
          title: surah?.surah_name_en ?? '',
          headerRight: () => (
            <Link href={{ pathname: '/quran/quiz', params: { surah: surahNumber } }} asChild>
              <Pressable hitSlop={8}>
                {({ pressed }) => (
                  <ThemedText type="small" themeColor="primary" style={{ opacity: pressed ? 0.6 : 1 }}>
                    Quiz me
                  </ThemedText>
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      {/* An in-flow toggle, not a native headerRight action: this app's web
          tab bar (app-tabs.web.tsx) is an absolutely-positioned floating pill
          that overlaps the same top region as every screen's native header,
          silently swallowing clicks meant for it on web (a pre-existing bug,
          not scoped to fix here) -- an in-flow row is reachable regardless. */}
      <Pressable onPress={() => setShowThemePicker((v) => !v)} style={styles.themeToggleRow} hitSlop={8}>
        <Ionicons name="color-palette-outline" size={16} color={theme.primary} />
        <ThemedText type="small" themeColor="primary">
          Reading theme{readingTheme ? `: ${readingTheme.label}` : ''}
        </ThemedText>
      </Pressable>

      {showThemePicker && (
        <View style={styles.themePickerRow}>
          {READING_THEME_IDS.map((id) => {
            const swatch = id === 'system' ? null : ReadingThemes[id];
            const selected = id === readingThemeId;
            return (
              <Pressable
                key={id}
                onPress={() => {
                  setReadingThemeId(id);
                  setShowThemePicker(false);
                }}
                hitSlop={4}>
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: swatch ? swatch.background : theme.background },
                    { borderColor: selected ? theme.primary : theme.border },
                  ]}>
                  {id === 'system' && <Ionicons name="phone-portrait-outline" size={14} color={theme.text} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {isLoading && (
          <View style={styles.skeletonList}>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} height={100} borderRadius={Spacing.three} />
            ))}
          </View>
        )}

        {error && <EmptyState icon="cloud-offline-outline" message="Couldn't load this surah." />}

        {surah && (
          <>
            <ReadingThemeOverrideProvider value={readingTheme}>
              <FlashList
                data={surah.ayahs}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => <AyahCard ayah={item} surahNameEn={surah.surah_name_en} />}
                contentContainerStyle={[
                  styles.listContent,
                  readingTheme && { backgroundColor: readingTheme.background },
                ]}
                ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
              />
            </ReadingThemeOverrideProvider>
            <SurahAudioBar surahNumber={surahNumber} totalAyahs={surah.ayahs.length} />
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    // Explicit, not relying on React Native's native-only default of
    // `position: relative` -- react-native-web doesn't always carry that
    // default through a third-party SafeAreaView, and the floating audio
    // pill (position: absolute) needs a bounded, viewport-sized ancestor
    // to anchor to, not the full scrollable page height, or its
    // `bottom: ...` offset resolves against the wrong box entirely.
    position: 'relative',
    overflow: 'hidden',
  },
  skeletonList: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    // Extra bottom room so the last ayah cards don't end up hidden behind
    // the floating audio pill, which sits fixed above the safe area.
    paddingBottom: Spacing.six + 16,
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  themePickerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: Spacing.three,
  },
});
