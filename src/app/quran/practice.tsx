import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MistakeHighlightedText } from '@/components/mistake-highlighted-text';
import { RecordButton } from '@/components/record-button';
import { ShareAyahButton } from '@/components/share-ayah-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useLogProgress } from '@/features/gamification/api';
import { useRecitationCheck } from '@/features/recitation/api';
import { useSurah } from '@/features/quran/api';
import { useTheme } from '@/hooks/use-theme';

/**
 * Two modes, one screen:
 * - No params: "Tasmeea" -- recite any fragment, the backend transcribes
 *   and searches for the matching ayah (Phase 1's voice search, composed
 *   server-side by /recitation/check when surah/ayah are omitted).
 * - `?surah=&ayah=` (e.g. from an AyahCard's mic button): practice that
 *   specific ayah, checked directly against it.
 */
export default function PracticeScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ surah?: string; ayah?: string; surahNameEn?: string }>();
  const presetSurah = params.surah ? Number(params.surah) : undefined;
  const presetAyah = params.ayah ? Number(params.ayah) : undefined;
  const presetSurahName = params.surahNameEn;

  const check = useRecitationCheck();
  const logProgress = useLogProgress();

  // Hands-free session: tap to record each ayah (true silence-based
  // auto-advance would need voice-activity detection, a research-grade
  // problem this doesn't attempt -- see HANDOFF's own stance on not
  // faking hard things), but everything else is automated and read aloud
  // via TTS, so a reciter's eyes never have to leave the mushaf page.
  const [sessionActive, setSessionActive] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(presetAyah);
  const { data: surah } = useSurah(sessionActive ? presetSurah : undefined);

  const handleRecorded = (uri: string) => {
    const ayahToCheck = sessionActive ? currentAyah : presetAyah;
    check.mutate({ audioUri: uri, surah: presetSurah, ayah: ayahToCheck });
  };

  const startSession = () => {
    setCurrentAyah(presetAyah);
    setSessionActive(true);
    check.reset();
  };

  const endSession = () => {
    setSessionActive(false);
    Speech.stop();
    check.reset();
  };

  // A reciter not looking at the screen still gets auto-advance after a
  // generous idle delay; one actually watching can tap "Try again" or
  // "Next ayah" instead of being railroaded by a fixed timer. Either
  // button calls check.reset()/setCurrentAyah, which changes check.data
  // and naturally cancels the pending timer via this effect's own cleanup.
  const IDLE_ADVANCE_MS = 8000;

  const tryAgain = () => {
    check.reset();
  };

  const advanceToNext = () => {
    const ayahCount = surah?.ayahs.length;
    const next = (currentAyah ?? 0) + 1;
    if (ayahCount !== undefined && next > ayahCount) {
      Speech.speak('Surah complete.', { language: 'en-US' });
      setSessionActive(false);
      return;
    }
    setCurrentAyah(next);
    check.reset();
  };

  // Speak the result, then idle-advance to the next ayah if the reciter
  // doesn't interact -- the one part of "hands-free" this can deliver for
  // real without eyes on the screen.
  useEffect(() => {
    if (!sessionActive || !check.data) return;

    const utterance = check.data.is_correct
      ? 'Correct.'
      : `${check.data.mistakes.length} mistake${check.data.mistakes.length === 1 ? '' : 's'}.`;
    Speech.speak(utterance, { language: 'en-US' });

    const timer = setTimeout(advanceToNext, IDLE_ADVANCE_MS);
    return () => clearTimeout(timer);
    // advanceToNext (and what it closes over) intentionally excluded: this
    // effect should only re-fire when a NEW check result arrives, not when
    // the ayah counter it itself advances changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check.data, sessionActive]);

  // Hasanat/streak are awarded for reciting an ayah at all, same as the
  // real hadith-based "10 hasanat per letter" reward -- not gated on
  // is_correct, which only affects what's shown on screen, not the credit.
  // The ref guards against re-firing if this same result re-renders (e.g.
  // a parent re-render), since `check.data` is a stable reference once set.
  const loggedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!check.data) return;
    const resultKey = `${check.data.key}:${check.data.transcript}`;
    if (loggedForRef.current === resultKey) return;
    loggedForRef.current = resultKey;
    logProgress.mutate({
      surah: check.data.surah_number,
      ayah_from: check.data.ayah_number,
      ayah_to: check.data.ayah_number,
    });
  }, [check.data, logProgress]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">
          {sessionActive
            ? `${presetSurahName ?? 'Surah ' + presetSurah} ${presetSurah}:${currentAyah}`
            : presetSurah && presetAyah
              ? `${presetSurahName ?? 'Surah ' + presetSurah} ${presetSurah}:${presetAyah}`
              : 'Tasmeea'}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {sessionActive
            ? 'Hands-free session -- recite, then tap again when done. Results are read aloud.'
            : presetSurah && presetAyah
              ? "Recite this ayah and we'll check it."
              : "Recite any part of the Quran and we'll find it for you."}
        </ThemedText>

        {presetSurah && presetAyah && !sessionActive && (
          <Pressable onPress={startSession}>
            {({ pressed }) => (
              <ThemedText type="small" themeColor="primary" style={{ opacity: pressed ? 0.6 : 1 }}>
                Start hands-free session from here →
              </ThemedText>
            )}
          </Pressable>
        )}

        {sessionActive && (
          <Pressable onPress={endSession}>
            {({ pressed }) => (
              <ThemedText type="small" themeColor="primary" style={{ opacity: pressed ? 0.6 : 1 }}>
                End session
              </ThemedText>
            )}
          </Pressable>
        )}

        <View style={styles.recordArea}>
          <RecordButton onRecorded={handleRecorded} disabled={check.isPending} />
        </View>

        {check.isPending && (
          <ThemedText themeColor="textSecondary" style={styles.centered}>
            Checking your recitation…
          </ThemedText>
        )}

        {check.isError && (
          <ThemedText themeColor="error" style={styles.centered}>
            {check.error.message}
          </ThemedText>
        )}

        {check.data && (
          <ScrollView style={styles.resultScroll} contentContainerStyle={styles.resultContent}>
            <ThemedView type="backgroundElement" style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <ThemedText type="smallBold">
                  {check.data.surah_name_en} {check.data.surah_number}:{check.data.ayah_number}
                </ThemedText>
                {check.data.is_correct && (
                  <View style={styles.resultCorrectBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                    <ThemedText type="small" themeColor="primary">
                      Correct
                    </ThemedText>
                  </View>
                )}
              </View>

              <MistakeHighlightedText
                textUthmani={check.data.text_uthmani}
                mistakes={check.data.mistakes}
              />

              <ThemedText themeColor="textSecondary">{check.data.translation_en}</ThemedText>

              <ThemedText type="small" themeColor="textSecondary">
                We heard: &ldquo;{check.data.transcript}&rdquo;
              </ThemedText>

              <ShareAyahButton
                textUthmani={check.data.text_uthmani}
                translationEn={check.data.translation_en}
                surahNameEn={check.data.surah_name_en}
                surahNumber={check.data.surah_number}
                ayahNumber={check.data.ayah_number}
              />

              {sessionActive && (
                <View style={styles.sessionActions}>
                  <Pressable onPress={tryAgain} style={styles.sessionActionButton}>
                    {({ pressed }) => (
                      <ThemedView style={[styles.sessionButton, pressed && styles.sessionButtonPressed]}>
                        <ThemedText type="smallBold">Try again</ThemedText>
                      </ThemedView>
                    )}
                  </Pressable>
                  <Pressable onPress={advanceToNext} style={styles.sessionActionButton}>
                    {({ pressed }) => (
                      <ThemedView
                        type="primaryMuted"
                        style={[styles.sessionButton, pressed && styles.sessionButtonPressed]}>
                        <ThemedText type="smallBold" themeColor="primary">
                          Next ayah →
                        </ThemedText>
                      </ThemedView>
                    )}
                  </Pressable>
                </View>
              )}
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
  recordArea: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
  },
  centered: {
    textAlign: 'center',
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCorrectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  sessionActionButton: {
    flex: 1,
  },
  sessionButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  sessionButtonPressed: {
    opacity: 0.7,
  },
});
