import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArabicText } from '@/components/arabic-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSimilarAyahs } from '@/features/memorization/api';

import type { SimilarAyahsResponse } from '@/features/memorization/types';

interface QuizOption {
  key: string;
  surahNumber: number;
  ayahNumber: number;
  textUthmani: string;
  isCorrect: boolean;
}

function buildOptions(
  data: SimilarAyahsResponse,
  surah: number,
  ayah: number,
  textUthmani: string
): QuizOption[] | null {
  if (data.similar.length === 0) return null;
  const distractor = data.similar[Math.floor(Math.random() * data.similar.length)];
  const correct: QuizOption = {
    key: `${surah}:${ayah}`,
    surahNumber: surah,
    ayahNumber: ayah,
    textUthmani,
    isCorrect: true,
  };
  const wrong: QuizOption = {
    key: distractor.key,
    surahNumber: distractor.surah_number,
    ayahNumber: distractor.ayah_number,
    textUthmani: distractor.text_uthmani,
    isCorrect: false,
  };
  return Math.random() < 0.5 ? [correct, wrong] : [wrong, correct];
}

/**
 * Mutashabihat drill: "which of these two ayahs is actually X:Y" -- reuses
 * Phase 1's voice-search engine as a similarity index via the backend's
 * `/memorization/similar` endpoint (the source ayah's own text as the
 * query), no separate confusable-verse data needed. The source ayah's own
 * text/translation are passed in as route params from AyahCard rather than
 * re-fetched -- the caller already has them on screen.
 */
export default function MutashabihatQuizScreen() {
  const params = useLocalSearchParams<{
    surah: string;
    ayah: string;
    surahNameEn: string;
    textUthmani: string;
  }>();
  const surah = Number(params.surah);
  const ayah = Number(params.ayah);

  const { data, isLoading, error } = useSimilarAyahs(surah, ayah, 5);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ThemedText type="smallBold" style={styles.prompt}>
          Which of these is really {params.surahNameEn} {surah}:{ayah}?
        </ThemedText>

        {isLoading && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Finding a confusable ayah…
          </ThemedText>
        )}

        {error && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Couldn&apos;t load a quiz for this ayah.
          </ThemedText>
        )}

        {data && (
          <QuizBody data={data} surah={surah} ayah={ayah} textUthmani={params.textUthmani} />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

/**
 * Split out from the parent so the random shuffle can live in a lazy
 * `useState` initializer -- the one place React's purity rules allow a
 * one-time impure computation (it runs exactly once, at mount, never
 * again on re-render), unlike a `useMemo` (React Compiler assumes memoized
 * values are pure) or an effect (shouldn't synchronously derive state).
 * Mounting this component fresh each time `data` arrives is exactly the
 * "shuffle once per new question" behavior this needs.
 */
function QuizBody({
  data,
  surah,
  ayah,
  textUthmani,
}: {
  data: SimilarAyahsResponse;
  surah: number;
  ayah: number;
  textUthmani: string;
}) {
  const [options] = useState<QuizOption[] | null>(() => buildOptions(data, surah, ayah, textUthmani));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  if (options === null) {
    return (
      <ThemedText themeColor="textSecondary" style={styles.message}>
        No similar-sounding ayah found to quiz against this one.
      </ThemedText>
    );
  }

  return (
    <>
      <View style={styles.options}>
        {options.map((option) => {
          const isSelected = selectedKey === option.key;
          const showResult = selectedKey !== null;
          return (
            <Pressable
              key={option.key}
              disabled={showResult}
              onPress={() => setSelectedKey(option.key)}>
              <ThemedView
                type="backgroundElement"
                style={[
                  styles.optionCard,
                  showResult && option.isCorrect && styles.correctCard,
                  showResult && isSelected && !option.isCorrect && styles.wrongCard,
                ]}>
                <ArabicText style={styles.optionText}>{option.textUthmani}</ArabicText>
                {showResult && (
                  <ThemedText type="small" themeColor="textSecondary">
                    {option.surahNumber}:{option.ayahNumber}
                  </ThemedText>
                )}
              </ThemedView>
            </Pressable>
          );
        })}
      </View>

      {selectedKey && (
        <Pressable onPress={() => router.back()}>
          {({ pressed }) => (
            <ThemedView type="primaryMuted" style={[styles.doneButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold" themeColor="primary">
                Done
              </ThemedText>
            </ThemedView>
          )}
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  prompt: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  options: {
    gap: Spacing.three,
  },
  optionCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  correctCard: {
    borderColor: '#2E8B57',
  },
  wrongCard: {
    borderColor: '#C0392B',
  },
  optionText: {
    textAlign: 'center',
  },
  doneButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
