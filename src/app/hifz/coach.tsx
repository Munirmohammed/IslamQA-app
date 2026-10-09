import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArabicText } from '@/components/arabic-text';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSurahs } from '@/features/quran/api';
import { useMyMistakePatterns } from '@/features/recitation/api';
import { useTheme } from '@/hooks/use-theme';

import type { MistakesByType, SurahMistakeBreakdown } from '@/features/recitation/types';

const MISTAKE_TYPE_LABELS: Record<keyof MistakesByType, string> = {
  incorrect: 'Mispronounced',
  missed: 'Skipped',
  extra: 'Added extra words',
};

export default function TajweedCoachScreen() {
  const { data, isLoading, error } = useMyMistakePatterns();
  const { data: surahs } = useSurahs();

  const surahNames = new Map(surahs?.map((s) => [s.surah_number, s.surah_name_en]));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isLoading && <Skeleton height={140} borderRadius={Spacing.three} />}

          {error && (
            <EmptyState icon="alert-circle-outline" message="Couldn't load your mistake history." />
          )}

          {data && data.total_sessions === 0 && (
            <EmptyState
              icon="mic-outline"
              message="No recitation checks yet -- use Tasmeea or Practice to get your first personalized Tajweed report."
            />
          )}

          {data && data.total_sessions > 0 && (
            <View style={styles.content}>
              <ThemedView type="backgroundElement" style={styles.summaryCard}>
                <ThemedText type="title" style={styles.summaryNumber}>
                  {Math.round((data.correct_rate ?? 0) * 100)}%
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  correct across {data.total_sessions} recitation check
                  {data.total_sessions === 1 ? '' : 's'}
                </ThemedText>
              </ThemedView>

              <View style={styles.section}>
                <ThemedText type="smallBold">Mistake types</ThemedText>
                <MistakeTypeBars mistakesByType={data.mistakes_by_type} />
              </View>

              {data.top_mistaken_words.length > 0 && (
                <View style={styles.section}>
                  <ThemedText type="smallBold">Words to drill</ThemedText>
                  {data.top_mistaken_words.map((w) => (
                    <View key={w.word} style={styles.wordRow}>
                      <ArabicText style={styles.wordText}>{w.word}</ArabicText>
                      <ThemedText type="small" themeColor="textSecondary">
                        missed {w.count}×
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <ThemedText type="smallBold">Surahs that need more practice</ThemedText>
                {data.surah_breakdown.map((row) => (
                  <SurahRow
                    key={row.surah_number}
                    row={row}
                    name={surahNames.get(row.surah_number) ?? `Surah ${row.surah_number}`}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function MistakeTypeBars({ mistakesByType }: { mistakesByType: MistakesByType }) {
  const theme = useTheme();
  const total = mistakesByType.incorrect + mistakesByType.missed + mistakesByType.extra;

  if (total === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        No word-level mistakes recorded -- every check so far has been perfect.
      </ThemedText>
    );
  }

  return (
    <>
      {(Object.keys(MISTAKE_TYPE_LABELS) as (keyof MistakesByType)[]).map((key) => {
        const count = mistakesByType[key];
        const fraction = count / total;
        return (
          <View key={key} style={styles.typeRow}>
            <View style={styles.typeHeader}>
              <ThemedText type="small">{MISTAKE_TYPE_LABELS[key]}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {count}
              </ThemedText>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.backgroundElement }]}>
              <View
                style={[styles.barFill, { width: `${fraction * 100}%`, backgroundColor: theme.primary }]}
              />
            </View>
          </View>
        );
      })}
    </>
  );
}

function SurahRow({ row, name }: { row: SurahMistakeBreakdown; name: string }) {
  const theme = useTheme();
  return (
    <View style={styles.surahRow}>
      <View style={styles.leafHeader}>
        <ThemedText type="small">{name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {Math.round(row.correct_rate * 100)}% · {row.session_count} check
          {row.session_count === 1 ? '' : 's'}
        </ThemedText>
      </View>
      <View style={[styles.barTrack, { backgroundColor: theme.backgroundElement }]}>
        <View
          style={[
            styles.barFill,
            { width: `${row.correct_rate * 100}%`, backgroundColor: theme.primary },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  content: {
    gap: Spacing.five,
  },
  summaryCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.one,
  },
  summaryNumber: {
    fontSize: 40,
    lineHeight: 44,
  },
  section: {
    gap: Spacing.three,
  },
  typeRow: {
    gap: Spacing.half,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 22,
  },
  surahRow: {
    gap: Spacing.half,
  },
  leafHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
