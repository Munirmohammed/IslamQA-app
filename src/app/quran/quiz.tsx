import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArabicText } from '@/components/arabic-text';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSimilarAyahs } from '@/features/memorization/api';
import { useRandomAyah } from '@/features/quran/api';

import type { SimilarAyahsResponse } from '@/features/memorization/types';
import type { RandomAyah } from '@/features/quran/types';

interface QuizOption {
  key: string;
  surahNumber: number;
  ayahNumber: number;
  textUthmani: string;
  isCorrect: boolean;
}

function buildOptions(data: SimilarAyahsResponse, question: RandomAyah): QuizOption[] | null {
  if (data.similar.length === 0) return null;
  const distractor = data.similar[Math.floor(Math.random() * data.similar.length)];
  const correct: QuizOption = {
    key: `${question.surah_number}:${question.ayah_number}`,
    surahNumber: question.surah_number,
    ayahNumber: question.ayah_number,
    textUthmani: question.text_uthmani,
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
 * `/memorization/similar` endpoint (the question ayah's own text as the
 * query), no separate confusable-verse data needed.
 *
 * The question ayah is picked server-side at random (`GET
 * /quran/random-ayah`, optionally scoped to `?surah=`) -- NOT the ayah the
 * user was just looking at. An earlier version launched this from a
 * specific ayah's own "Quiz me" button with that same ayah as the answer,
 * which meant the user already knew the answer before the quiz even
 * loaded. Two entry points land here: a surah's reading screen (scoped,
 * `?surah=`) and a standalone "Random Quiz" from Home (unscoped, anywhere
 * in the Quran).
 */
export default function MutashabihatQuizScreen() {
  const params = useLocalSearchParams<{ surah?: string }>();
  const scopeSurah = params.surah ? Number(params.surah) : undefined;

  const randomAyah = useRandomAyah();

  const askNewQuestion = () => randomAyah.mutate(scopeSurah);

  useEffect(() => {
    askNewQuestion();
    // Only ever re-run this on mount -- askNewQuestion / scopeSurah
    // changing identity shouldn't re-fire it; "New question" calls it
    // explicitly instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const question = randomAyah.data;
  const {
    data: similarData,
    isLoading: similarLoading,
    error: similarError,
  } = useSimilarAyahs(question?.surah_number, question?.ayah_number, 5);

  const loading = randomAyah.isPending || (!!question && similarLoading);
  const failed = randomAyah.isError || !!similarError;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: scopeSurah ? 'Surah Quiz' : 'Random Quiz' }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {loading && <Skeleton height={120} borderRadius={Spacing.three} />}

        {failed && (
          <EmptyState icon="alert-circle-outline" message="Couldn't load a quiz question." />
        )}

        {question && similarData && (
          <QuizBody
            key={`${question.surah_number}:${question.ayah_number}`}
            question={question}
            data={similarData}
            onNewQuestion={askNewQuestion}
          />
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
 * The `key` prop on this component (the question's own surah:ayah) forces
 * a fresh mount -- and a fresh shuffle -- every time a new question loads.
 */
function QuizBody({
  question,
  data,
  onNewQuestion,
}: {
  question: RandomAyah;
  data: SimilarAyahsResponse;
  onNewQuestion: () => void;
}) {
  const [options] = useState<QuizOption[] | null>(() => buildOptions(data, question));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  if (options === null) {
    return (
      <>
        <EmptyState
          icon="help-circle-outline"
          message="No similar-sounding ayah found to quiz against this one."
        />
        <NewQuestionButton onPress={onNewQuestion} />
      </>
    );
  }

  return (
    <>
      <ThemedText type="smallBold" style={styles.prompt}>
        Which of these is really {question.surah_name_en} {question.surah_number}:
        {question.ayah_number}?
      </ThemedText>

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
        <View style={styles.resultActions}>
          <NewQuestionButton onPress={onNewQuestion} />
          <Pressable onPress={() => router.back()} style={styles.resultActionButton}>
            {({ pressed }) => (
              <ThemedView style={[styles.doneButton, pressed && styles.pressed]}>
                <ThemedText type="smallBold">Done</ThemedText>
              </ThemedView>
            )}
          </Pressable>
        </View>
      )}
    </>
  );
}

function NewQuestionButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.resultActionButton}>
      {({ pressed }) => (
        <ThemedView type="primaryMuted" style={[styles.doneButton, pressed && styles.pressed]}>
          <ThemedText type="smallBold" themeColor="primary">
            New question
          </ThemedText>
        </ThemedView>
      )}
    </Pressable>
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
  resultActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  resultActionButton: {
    flex: 1,
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
