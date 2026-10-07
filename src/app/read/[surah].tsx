import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AyahCard } from '@/components/ayah-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSurah } from '@/features/quran/api';

export default function SurahDetailScreen() {
  const { surah: surahParam } = useLocalSearchParams<{ surah: string }>();
  const surahNumber = Number(surahParam);
  const { data: surah, isLoading, error } = useSurah(surahNumber);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: surah?.surah_name_en ?? '' }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {isLoading && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Loading surah…
          </ThemedText>
        )}

        {error && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Couldn't load this surah.
          </ThemedText>
        )}

        {surah && (
          <FlashList
            data={surah.ayahs}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => <AyahCard ayah={item} />}
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
