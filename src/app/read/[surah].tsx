import { FlashList } from '@shopify/flash-list';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AyahCard } from '@/components/ayah-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMarkAyahsRead } from '@/features/khatmah/api';
import { useSurah } from '@/features/quran/api';
import { useAuthStore } from '@/stores/auth-store';

export default function SurahDetailScreen() {
  const { surah: surahParam } = useLocalSearchParams<{ surah: string }>();
  const surahNumber = Number(surahParam);
  const { data: surah, isLoading, error } = useSurah(surahNumber);
  const accessToken = useAuthStore((s) => s.accessToken);
  const markAyahsRead = useMarkAyahsRead();

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
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: surah?.surah_name_en ?? '',
          headerRight: () => (
            <Link href={{ pathname: '/read/quiz', params: { surah: surahNumber } }} asChild>
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
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {isLoading && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Loading surah…
          </ThemedText>
        )}

        {error && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Couldn&apos;t load this surah.
          </ThemedText>
        )}

        {surah && (
          <FlashList
            data={surah.ayahs}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => <AyahCard ayah={item} surahNameEn={surah.surah_name_en} />}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          />
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
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  separator: {
    height: Spacing.three,
  },
});
