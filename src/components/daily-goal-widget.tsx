import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useHistory, useStreak } from '@/features/gamification/api';
import { useTheme } from '@/hooks/use-theme';
import { useDailyGoalsStore } from '@/stores/daily-goals-store';

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/** Home's "Daily Consistency Tracker" -- ported from a Google AI Studio
 * prototype the user compared this app against. That version stored
 * everything (streak, goals, 7-day history) in localStorage with
 * hardcoded demo numbers; this one is wired to the real backend
 * (useStreak/useHistory, src/features/gamification/api.ts) for streak and
 * today's real verses-read count, and to a real automatic count of SM-2
 * reviews (useDailyGoalsStore, incremented from useReviewCard's onSuccess)
 * for Hifz -- not a manual self-report button like the original. Only the
 * daily *targets* are a local preference (there's nothing for a backend
 * to own there). */
export function DailyGoalWidget() {
  const theme = useTheme();
  const { data: streak } = useStreak();
  const { data: history } = useHistory(7);
  const readingGoalAyahs = useDailyGoalsStore((s) => s.readingGoalAyahs);
  const hifzGoalCards = useDailyGoalsStore((s) => s.hifzGoalCards);
  const hifzReviewedToday = useDailyGoalsStore((s) => s.hifzReviewedToday);
  const setTargets = useDailyGoalsStore((s) => s.setTargets);

  const [editing, setEditing] = useState(false);
  const [tempReading, setTempReading] = useState(String(readingGoalAyahs));
  const [tempHifz, setTempHifz] = useState(String(hifzGoalCards));

  const todayEntry = history?.days.find((d) => d.date === todayKey());
  const readingDone = todayEntry?.verses_read ?? 0;

  const readingTarget = Math.max(1, readingGoalAyahs);
  const hifzTarget = Math.max(1, hifzGoalCards);
  const readingPct = Math.min(100, Math.round((readingDone / readingTarget) * 100));
  const hifzPct = Math.min(100, Math.round((hifzReviewedToday / hifzTarget) * 100));
  const totalPct = Math.round((readingPct + hifzPct) / 2);
  const isReadingComplete = readingDone >= readingTarget;
  const isHifzComplete = hifzReviewedToday >= hifzTarget;
  const isAllComplete = isReadingComplete && isHifzComplete;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const isToday = dateStr === todayKey();
    const entry = history?.days.find((h) => h.date === dateStr);
    const achieved = isToday ? isAllComplete : (entry?.verses_read ?? 0) >= readingTarget;
    return { dateStr, isToday, achieved, weekday: WEEKDAY_LETTERS[d.getDay()] };
  });

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: theme.primaryMuted }]}>
            <Ionicons name="sparkles" size={16} color={theme.primary} />
          </View>
          <View style={styles.headerTextCol}>
            <View style={styles.titleRow}>
              <ThemedText type="smallBold">Daily Consistency Tracker</ThemedText>
              <View style={[styles.pctPill, { backgroundColor: theme.primaryMuted }]}>
                <ThemedText type="small" themeColor="primary" style={styles.pctText}>
                  {totalPct}% Today
                </ThemedText>
              </View>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              Build your steadfast habit of recitation and memorization
            </ThemedText>
          </View>
        </View>

        <Pressable
          onPress={() => {
            setTempReading(String(readingTarget));
            setTempHifz(String(hifzTarget));
            setEditing(true);
          }}
          hitSlop={8}
          style={[styles.settingsButton, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Ionicons name="options-outline" size={16} color={theme.textSecondary} />
        </Pressable>
      </View>

      {isAllComplete && (
        <View style={[styles.celebrateBanner, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
          <View style={[styles.trophyBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="trophy" size={16} color={theme.backgroundElement} />
          </View>
          <View style={styles.celebrateText}>
            <ThemedText type="smallBold">Alhamdulillah! Both goals achieved 🎉</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Consistency is beloved to Allah.
            </ThemedText>
          </View>
        </View>
      )}

      <View style={styles.goalsGrid}>
        <View style={[styles.goalCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={styles.goalHeader}>
            <View style={styles.goalTitleRow}>
              <Ionicons name="book-outline" size={15} color={theme.primary} />
              <ThemedText type="small" style={styles.goalTitle}>
                Quran Reading Goal
              </ThemedText>
              {isReadingComplete && <Ionicons name="checkmark-circle" size={14} color={theme.primary} />}
            </View>
            <ThemedText type="small">
              <ThemedText type="smallBold">{readingDone}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {' '}
                / {readingTarget} Ayahs
              </ThemedText>
            </ThemedText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { width: `${readingPct}%`, backgroundColor: theme.primary }]} />
          </View>
          <Pressable onPress={() => router.push('/quran')} hitSlop={6}>
            <View style={[styles.ctaButton, { backgroundColor: theme.primary }]}>
              <ThemedText type="small" themeColor="background" style={styles.ctaText}>
                Read Mushaf
              </ThemedText>
            </View>
          </Pressable>
        </View>

        <View style={[styles.goalCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={styles.goalHeader}>
            <View style={styles.goalTitleRow}>
              <Ionicons name="leaf-outline" size={15} color={theme.accent} />
              <ThemedText type="small" style={styles.goalTitle}>
                Hifz Memorization Goal
              </ThemedText>
              {isHifzComplete && <Ionicons name="checkmark-circle" size={14} color={theme.primary} />}
            </View>
            <ThemedText type="small">
              <ThemedText type="smallBold">{hifzReviewedToday}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {' '}
                / {hifzTarget} Cards
              </ThemedText>
            </ThemedText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { width: `${hifzPct}%`, backgroundColor: theme.accent }]} />
          </View>
          <Pressable onPress={() => router.push('/hifz')} hitSlop={6}>
            <View style={[styles.ctaButton, { backgroundColor: theme.accent }]}>
              <ThemedText type="small" themeColor="background" style={styles.ctaText}>
                Review Hifz Hub
              </ThemedText>
            </View>
          </Pressable>
        </View>
      </View>

      <View style={[styles.historyRow, { borderTopColor: theme.border }]}>
        <ThemedText type="small" themeColor="textSecondary">
          7-day habit:
        </ThemedText>
        <View style={styles.historyChips}>
          {last7.map((day) => (
            <View
              key={day.dateStr}
              style={[
                styles.historyChip,
                day.achieved
                  ? { backgroundColor: theme.primary }
                  : day.isToday
                    ? { borderWidth: 1.5, borderColor: theme.primary }
                    : { backgroundColor: theme.background, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border },
              ]}>
              <ThemedText
                type="small"
                themeColor={day.achieved ? 'background' : day.isToday ? 'text' : 'textSecondary'}
                style={styles.historyChipText}>
                {day.weekday}
              </ThemedText>
            </View>
          ))}
        </View>
        {streak && streak.current_streak > 0 && (
          <View style={styles.streakInline}>
            <Ionicons name="flame" size={12} color={theme.accent} />
            <ThemedText type="small" themeColor="textSecondary">
              {streak.current_streak}d streak
            </ThemedText>
          </View>
        )}
      </View>

      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}>
        <View style={styles.modalBackdrop}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <ThemedText type="smallBold">Adjust daily targets</ThemedText>
              <Pressable onPress={() => setEditing(false)} hitSlop={10}>
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalField}>
              <ThemedText type="small" themeColor="textSecondary">
                Daily Quran reading target (ayahs)
              </ThemedText>
              <TextInput
                keyboardType="number-pad"
                value={tempReading}
                onChangeText={setTempReading}
                style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              />
            </View>

            <View style={styles.modalField}>
              <ThemedText type="small" themeColor="textSecondary">
                Daily Hifz review target (cards)
              </ThemedText>
              <TextInput
                keyboardType="number-pad"
                value={tempHifz}
                onChangeText={setTempHifz}
                style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              />
            </View>

            <Pressable
              onPress={() => {
                const reading = Math.max(1, parseInt(tempReading, 10) || 1);
                const hifz = Math.max(1, parseInt(tempHifz, 10) || 1);
                setTargets(reading, hifz);
                setEditing(false);
              }}>
              <View style={[styles.saveButton, { backgroundColor: theme.primary }]}>
                <ThemedText type="smallBold" themeColor="background">
                  Save targets
                </ThemedText>
              </View>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: Spacing.two,
    flex: 1,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  pctPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '700',
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  celebrateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.card,
    borderWidth: 1,
  },
  trophyBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrateText: {
    flex: 1,
    gap: 2,
  },
  goalsGrid: {
    gap: Spacing.three,
  },
  goalCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  goalTitle: {
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  ctaButton: {
    borderRadius: Radius.card,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  ctaText: {
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  historyChips: {
    flexDirection: 'row',
    gap: 4,
  },
  historyChip: {
    width: 22,
    height: 22,
    borderRadius: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalField: {
    gap: Spacing.one,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  saveButton: {
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
