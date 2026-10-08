import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArabicText } from '@/components/arabic-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDueCards, useReviewCard } from '@/features/memorization/api';

import type { DueCard } from '@/features/memorization/types';

// Standard SM-2 scale (0-5) collapsed to the four grades Anki-style
// reviewers use in practice -- <3 fails the card (resets its interval),
// >=3 advances it; see srs_service.grade_review for the exact semantics.
const GRADES: { label: string; quality: number }[] = [
  { label: 'Again', quality: 1 },
  { label: 'Hard', quality: 3 },
  { label: 'Good', quality: 4 },
  { label: 'Easy', quality: 5 },
];

export default function HifzReviewScreen() {
  const { data: dueCards, isLoading, error } = useDueCards();
  const review = useReviewCard();

  const currentCard: DueCard | undefined = dueCards?.[0];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {isLoading && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Loading your review queue…
          </ThemedText>
        )}

        {error && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Couldn&apos;t load your review queue.
          </ThemedText>
        )}

        {dueCards && dueCards.length === 0 && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            All caught up -- nothing due for review right now. Add an ayah to your
            memorization plan from the Read tab.
          </ThemedText>
        )}

        {currentCard && (
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

            <View style={styles.gradeRow}>
              {GRADES.map((grade) => (
                <GradeButton
                  key={grade.label}
                  label={grade.label}
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
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function GradeButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={styles.gradeButtonWrapper}>
      {({ pressed }) => (
        <ThemedView
          type="backgroundElement"
          style={[styles.gradeButton, { opacity: disabled || pressed ? 0.6 : 1 }]}>
          <ThemedText type="smallBold" themeColor={label === 'Again' ? 'text' : 'primary'}>
            {label}
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
  message: {
    textAlign: 'center',
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  counter: {
    textAlign: 'center',
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    gap: Spacing.three,
    alignItems: 'center',
  },
  ayahText: {
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
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
