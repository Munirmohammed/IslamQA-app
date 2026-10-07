import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MistakeHighlightedText } from '@/components/mistake-highlighted-text';
import { RecordButton } from '@/components/record-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useRecitationCheck } from '@/features/recitation/api';

/**
 * Two modes, one screen:
 * - No params: "Tasmeea" -- recite any fragment, the backend transcribes
 *   and searches for the matching ayah (Phase 1's voice search, composed
 *   server-side by /recitation/check when surah/ayah are omitted).
 * - `?surah=&ayah=` (e.g. from an AyahCard's mic button): practice that
 *   specific ayah, checked directly against it.
 */
export default function PracticeScreen() {
  const params = useLocalSearchParams<{ surah?: string; ayah?: string }>();
  const presetSurah = params.surah ? Number(params.surah) : undefined;
  const presetAyah = params.ayah ? Number(params.ayah) : undefined;

  const check = useRecitationCheck();

  const handleRecorded = (uri: string) => {
    check.mutate({ audioUri: uri, surah: presetSurah, ayah: presetAyah });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          {presetSurah && presetAyah ? `Ayah ${presetSurah}:${presetAyah}` : 'Tasmeea'}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {presetSurah && presetAyah
            ? "Recite this ayah and we'll check it."
            : "Recite any part of the Quran and we'll find it for you."}
        </ThemedText>

        <View style={styles.recordArea}>
          <RecordButton onRecorded={handleRecorded} disabled={check.isPending} />
        </View>

        {check.isPending && (
          <ThemedText themeColor="textSecondary" style={styles.centered}>
            Checking your recitation…
          </ThemedText>
        )}

        {check.isError && (
          <ThemedText style={[styles.centered, styles.error]}>{check.error.message}</ThemedText>
        )}

        {check.data && (
          <ScrollView style={styles.resultScroll} contentContainerStyle={styles.resultContent}>
            <ThemedView type="backgroundElement" style={styles.resultCard}>
              <ThemedText type="smallBold">
                {check.data.surah_name_en} {check.data.surah_number}:{check.data.ayah_number}
                {check.data.is_correct ? '  ✓ Correct' : ''}
              </ThemedText>

              <MistakeHighlightedText
                textUthmani={check.data.text_uthmani}
                mistakes={check.data.mistakes}
              />

              <ThemedText themeColor="textSecondary">{check.data.translation_en}</ThemedText>

              <ThemedText type="small" themeColor="textSecondary">
                We heard: &ldquo;{check.data.transcript}&rdquo;
              </ThemedText>
            </ThemedView>
          </ScrollView>
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: BottomTabInset + Spacing.three,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  recordArea: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
  },
  centered: {
    textAlign: 'center',
  },
  error: {
    color: '#C0392B',
  },
  resultScroll: {
    flex: 1,
  },
  resultContent: {
    paddingBottom: Spacing.four,
  },
  resultCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
