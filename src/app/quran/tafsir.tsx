import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAyahTafsir } from '@/features/tafsir/api';

/**
 * "Explain this ayah" -- a direct Ibn Kathir lookup, not a chatbot. Shown
 * explicitly as a retrieval result (source cited, as plain scholarly text)
 * rather than a conversational answer -- see HANDOFF's F5 note on why this
 * deliberately doesn't route through a generative model.
 */
export default function TafsirScreen() {
  const params = useLocalSearchParams<{ surah: string; ayah: string; surahNameEn: string }>();
  const surah = Number(params.surah);
  const ayah = Number(params.ayah);

  const { data, isLoading, error } = useAyahTafsir(surah, ayah);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sourceLabel}>
            TAFSIR IBN KATHIR (ABRIDGED) · {params.surahNameEn ? `${params.surahNameEn} ` : ''}
            {surah}:{ayah}
            {data && data.ayah_to > data.ayah_from ? `-${data.ayah_to}` : ''}
          </ThemedText>

          {isLoading && <Skeleton height={120} borderRadius={Spacing.three} />}

          {error && (
            <EmptyState icon="alert-circle-outline" message="Couldn't load tafsir for this ayah." />
          )}

          {data &&
            data.text_plain
              .split('\n\n')
              .filter((paragraph) => paragraph.trim().length > 0)
              .map((paragraph, index) => (
                <ThemedText key={index} style={styles.paragraph}>
                  {paragraph.trim()}
                </ThemedText>
              ))}
        </ScrollView>
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
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sourceLabel: {
    letterSpacing: 0.4,
    marginBottom: Spacing.two,
  },
  paragraph: {
    lineHeight: 24,
  },
});
