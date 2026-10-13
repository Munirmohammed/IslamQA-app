import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArabicText } from '@/components/arabic-text';
import { EmptyState } from '@/components/empty-state';
import { FeatureCard } from '@/components/feature-card';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useDueCards, useMemorizationProgress, useReviewCard } from '@/features/memorization/api';
import { useMyMistakePatterns } from '@/features/recitation/api';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';

import type { DueCard } from '@/features/memorization/types';

// Standard SM-2 scale (0-5) collapsed to the four grades Anki-style
// reviewers use in practice -- <3 fails the card (resets its interval),
// >=3 advances it; see srs_service.grade_review for the exact semantics.
// `scaleColor` keys reuse the same error->mistakeModerate->mistakeLow->success
// 4-tier scale the Tajweed Coach already uses for correct-rate (via
// correctRateColor), so a grade's color means the same thing here as it
// does there, instead of inventing a second color language for "good vs bad".
const GRADES: { label: string; quality: number; scaleColor: 'error' | 'mistakeModerate' | 'mistakeLow' | 'success' }[] = [
  { label: 'Again', quality: 1, scaleColor: 'error' },
  { label: 'Hard', quality: 3, scaleColor: 'mistakeModerate' },
  { label: 'Good', quality: 4, scaleColor: 'mistakeLow' },
  { label: 'Easy', quality: 5, scaleColor: 'success' },
];

export default function HifzReviewScreen() {
  const theme = useTheme();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: dueCards, isLoading, error } = useDueCards();
  const review = useReviewCard();
  const { data: progress } = useMemorizationProgress();
  const { data: mistakePatterns } = useMyMistakePatterns();

  const currentCard: DueCard | undefined = dueCards?.[0];

  const gardenDescription =
    progress && progress.surahs.length > 0
      ? `${progress.surahs.length} surah${progress.surahs.length === 1 ? '' : 's'} growing`
      : 'See every surah and juz you memorize';

  const coachDescription =
    mistakePatterns && mistakePatterns.total_sessions > 0
      ? `${Math.round((mistakePatterns.correct_rate ?? 0) * 100)}% correct so far`
      : 'Mistake patterns from your recitation checks';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title">Hifz</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Your memorization plan: add any ayah from the Quran tab, review it here on a
            spaced-repetition schedule, and track it in the Garden and Coach below.
          </ThemedText>

          <View style={styles.section}>
            <ThemedText type="smallBold">Your Hifz toolkit</ThemedText>
            <View style={styles.toolkit}>
              <FeatureCard
                icon="leaf-outline"
                label="Hifz Garden"
                description={gardenDescription}
                href="/hifz/garden"
              />
              <FeatureCard
                icon="school-outline"
                label="Tajweed Coach"
                description={coachDescription}
                href="/hifz/coach"
              />
              <FeatureCard
                icon="mic-outline"
                label="Check Recitation"
                description="Recite an ayah, get instant word-level feedback"
                href="/quran/practice"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <ThemedText type="smallBold">Today&apos;s review</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Ayahs you&apos;ve added to Hifz come back here on a schedule -- grade how well you
                recalled each one and it&apos;ll reappear sooner or later based on your answer.
              </ThemedText>
            </View>

            {!accessToken && (
              <Link href="/more" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <ThemedView type="primaryMuted" style={[styles.cta, pressed && styles.ctaPressed]}>
                      <ThemedText type="smallBold" themeColor="primary">
                        Log in to start your Hifz plan →
                      </ThemedText>
                    </ThemedView>
                  )}
                </Pressable>
              </Link>
            )}

            {accessToken && isLoading && <Skeleton height={120} borderRadius={Spacing.three} />}

            {accessToken && error && (
              <EmptyState icon="alert-circle-outline" message="Couldn't load your review queue." />
            )}

            {accessToken && dueCards && dueCards.length === 0 && (
              <EmptyState
                icon="checkmark-circle-outline"
                message={
                  progress && progress.surahs.length > 0
                    ? "All caught up -- nothing due for review right now. Check back tomorrow, or add more ayahs from any ayah's \"Add to Hifz\" button in the Quran tab."
                    : 'Nothing to review yet. Open any ayah in the Quran tab and tap "Add to Hifz" to start your memorization plan.'
                }
              />
            )}

            {accessToken && currentCard && (
              <>
                <ThemedText type="small" themeColor="textSecondary" style={styles.counter}>
                  {dueCards!.length} card{dueCards!.length === 1 ? '' : 's'} due
                </ThemedText>

                <ThemedView type="backgroundElement" style={styles.card}>
                  <ArabicText style={styles.ayahText}>{currentCard.text_uthmani}</ArabicText>
                  <ThemedText themeColor="textSecondary">{currentCard.translation_en}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {currentCard.surah_number}:{currentCard.ayah_number}
                  </ThemedText>
                </ThemedView>

                <ThemedText type="small" themeColor="textSecondary" style={styles.gradePrompt}>
                  How well did you recall it?
                </ThemedText>

                <View style={styles.gradeRow}>
                  {GRADES.map((grade) => (
                    <GradeButton
                      key={grade.label}
                      label={grade.label}
                      color={theme[grade.scaleColor]}
                      disabled={review.isPending}
                      onPress={() =>
                        review.mutate({
                          surah: currentCard.surah_number,
                          ayah: currentCard.ayah_number,
                          quality: grade.quality,
                        })
                      }
                    />
                  ))}
                </View>
                <ThemedText type="small" themeColor="textSecondary" style={styles.gradeLegend}>
                  Again brings it back tomorrow; Easy pushes it out the furthest.
                </ThemedText>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function GradeButton({
  label,
  color,
  onPress,
  disabled,
}: {
  label: string;
  color: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={styles.gradeButtonWrapper}>
      {({ pressed }) => (
        <View
          style={[
            styles.gradeButton,
            { backgroundColor: withOpacity(color, 0.14), opacity: disabled || pressed ? 0.6 : 1 },
          ]}>
          <ThemedText type="smallBold" style={{ color }}>
            {label}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

function withOpacity(hexColor: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${alpha}`;
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
    paddingTop: Spacing.six,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  subtitle: {
    marginTop: -Spacing.two,
  },
  section: {
    gap: Spacing.three,
  },
  toolkit: {
    gap: Spacing.two,
  },
  reviewHeader: {
    gap: Spacing.one,
  },
  cta: {
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.8,
  },
  counter: {
    textAlign: 'center',
  },
  card: {
    borderRadius: Radius.card,
    padding: Spacing.five,
    gap: Spacing.three,
    alignItems: 'center',
  },
  ayahText: {
    textAlign: 'center',
  },
  gradePrompt: {
    textAlign: 'center',
  },
  gradeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  gradeButtonWrapper: {
    flex: 1,
  },
  gradeButton: {
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  gradeLegend: {
    textAlign: 'center',
  },
});
