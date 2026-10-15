import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArabicText } from '@/components/arabic-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DHIKR_PHRASES, TASBIH_TARGETS, getDhikrPhrase } from '@/lib/tasbih-data';
import { useTasbihStore } from '@/stores/tasbih-store';

const BEAD_SIZE = 16;

/** A plain grid of small circles standing in for Muslim Pro's actual
 * illustrated curved string of beads (see the reference screenshot this
 * screen was built from) -- an honest, buildable equivalent rather than a
 * fabricated bead illustration this app has no art assets for. Filled
 * beads (0..count-1) show progress through the current loop; the rest
 * stay outlined. */
function BeadGrid({ count, target }: { count: number; target: number }) {
  const theme = useTheme();
  const beads = useMemo(() => Array.from({ length: target }, (_, i) => i), [target]);

  return (
    <View style={styles.beadGrid}>
      {beads.map((i) => (
        <View
          key={i}
          style={[
            styles.bead,
            {
              backgroundColor: i < count ? theme.primary : 'transparent',
              borderColor: i < count ? theme.primary : theme.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

function DhikrPickerModal({
  visible,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const theme = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <ThemedView style={styles.modalSheet}>
            <ThemedText type="smallBold" style={styles.modalTitle}>
              Select a Dhikr
            </ThemedText>
            <ScrollView contentContainerStyle={styles.modalList}>
              {DHIKR_PHRASES.map((phrase) => (
                <Pressable
                  key={phrase.id}
                  onPress={() => {
                    onSelect(phrase.id);
                    onClose();
                  }}>
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.modalRow,
                        { borderColor: theme.border },
                        pressed && { backgroundColor: theme.backgroundSelected },
                      ]}>
                      <View style={styles.modalRowText}>
                        <ArabicText size="badge" style={styles.modalArabic}>
                          {phrase.arabic}
                        </ArabicText>
                        <ThemedText type="smallBold">{phrase.transliteration}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {phrase.translation}
                        </ThemedText>
                      </View>
                      {phrase.id === selectedId && (
                        <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                      )}
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Muslim Pro's real Tasbih screen (reference screenshot: title + Loop
 * subtitle, a big "NN / target" counter, a curved bead illustration, a
 * "Start Dhikr / Select a Dhikr" card, and a bottom row of bead-material
 * swatches) built against this app's own standard theme rather than that
 * screenshot's lighter background -- every *other* screen captured in the
 * same research round (Home, Prayers, Qibla, Quran, Duas) is this app's
 * usual dark teal, so the one light Tasbih capture reads as that phone's
 * system/app appearance having been toggled for that single shot, not as
 * Muslim Pro deliberately skinning just this one screen differently from
 * the rest of its own app. Staying on the shared theme keeps Tasbih
 * visually consistent with Qalam's identity instead of introducing a
 * one-off light screen.
 *
 * The bead-color/material swatch row from the screenshot is deliberately
 * left out -- a cosmetic skin picker, not the actual counting mechanic
 * this screen exists to deliver. The curved illustrated bead string is
 * likewise simplified to BeadGrid above. The header's reset icon is real
 * (clears count + loop); the speaker icon is wired to this screen's real
 * tactile feedback -- haptics -- rather than silently doing nothing, since
 * there's no bundled tap-click sound asset in this app to back a literal
 * mute toggle (the same "don't fake it" call azkar-category.tsx makes for
 * its own missing Audio tab). */
export default function TasbihScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);

  const dhikrId = useTasbihStore((s) => s.dhikrId);
  const target = useTasbihStore((s) => s.target);
  const count = useTasbihStore((s) => s.count);
  const loopCount = useTasbihStore((s) => s.loopCount);
  const hapticsEnabled = useTasbihStore((s) => s.hapticsEnabled);
  const increment = useTasbihStore((s) => s.increment);
  const reset = useTasbihStore((s) => s.reset);
  const setDhikr = useTasbihStore((s) => s.setDhikr);
  const setTarget = useTasbihStore((s) => s.setTarget);
  const toggleHaptics = useTasbihStore((s) => s.toggleHaptics);

  const dhikr = getDhikrPhrase(dhikrId);
  const completingLoop = count + 1 >= target;

  const handleTap = () => {
    if (hapticsEnabled) {
      // A slightly heavier bump on the tap that closes a loop -- real,
      // perceptible feedback for "you just finished a round" rather than
      // an identical click every time.
      Haptics.impactAsync(
        completingLoop ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
      ).catch(() => {
        // Haptics aren't available on web/some devices -- counting still
        // works without them, nothing to recover from.
      });
    }
    increment();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Tasbih
          </ThemedText>
          <View style={styles.headerIcons}>
            <Pressable onPress={reset} hitSlop={8} style={styles.headerButton}>
              <Ionicons name="refresh-outline" size={22} color={theme.text} />
            </Pressable>
            <Pressable onPress={toggleHaptics} hitSlop={8} style={styles.headerButton}>
              <Ionicons
                name={hapticsEnabled ? 'volume-high-outline' : 'volume-mute-outline'}
                size={22}
                color={theme.text}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.loopLabel}>
            Loop {loopCount + 1}
          </ThemedText>

          <Pressable onPress={handleTap} style={styles.counterArea}>
            <ThemedText type="title" themeColor="primary" style={styles.counterNumber}>
              {String(count).padStart(2, '0')}
            </ThemedText>
            <ThemedText themeColor="textSecondary">/ {target}</ThemedText>
          </Pressable>

          <Pressable onPress={handleTap}>
            <BeadGrid count={count} target={target} />
          </Pressable>

          <View style={styles.targetRow}>
            {TASBIH_TARGETS.map((t) => (
              <Pressable key={t} onPress={() => setTarget(t)} hitSlop={4}>
                <View
                  style={[
                    styles.targetChip,
                    { borderColor: t === target ? theme.primary : theme.border },
                    t === target && { backgroundColor: theme.primaryMuted },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    themeColor={t === target ? 'primary' : 'textSecondary'}>
                    {t}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </View>

          <ThemedView type="backgroundElement" style={styles.dhikrCard}>
            <ArabicText size="badge" style={styles.dhikrArabic}>
              {dhikr.arabic}
            </ArabicText>
            <ThemedText type="smallBold">{dhikr.transliteration}</ThemedText>
            <ThemedText themeColor="textSecondary">{dhikr.translation}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.dhikrReference}>
              {dhikr.reference}
            </ThemedText>

            <Pressable onPress={() => setPickerOpen(true)}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.selectButton,
                    { backgroundColor: theme.primary },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText type="smallBold" style={styles.selectButtonLabel}>
                    Select a Dhikr
                  </ThemedText>
                </View>
              )}
            </Pressable>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>

      <DhikrPickerModal
        visible={pickerOpen}
        selectedId={dhikrId}
        onSelect={setDhikr}
        onClose={() => setPickerOpen(false)}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.two,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
    alignItems: 'center',
  },
  loopLabel: {
    marginTop: Spacing.two,
  },
  counterArea: {
    alignItems: 'center',
    gap: Spacing.half,
    paddingVertical: Spacing.three,
  },
  counterNumber: {
    fontSize: 72,
    lineHeight: 80,
  },
  beadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
    maxWidth: 320,
  },
  bead: {
    width: BEAD_SIZE,
    height: BEAD_SIZE,
    borderRadius: BEAD_SIZE / 2,
    borderWidth: 2,
  },
  targetRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  targetChip: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.four,
  },
  dhikrCard: {
    width: '100%',
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.one,
    alignItems: 'flex-start',
  },
  dhikrArabic: {
    alignSelf: 'stretch',
  },
  dhikrReference: {
    fontStyle: 'italic',
    marginBottom: Spacing.two,
  },
  selectButton: {
    marginTop: Spacing.two,
    alignSelf: 'stretch',
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  selectButtonLabel: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.8,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    maxHeight: '70%',
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: {
    textAlign: 'center',
  },
  modalList: {
    gap: Spacing.two,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalRowText: {
    flex: 1,
    gap: 2,
  },
  modalArabic: {
    alignSelf: 'stretch',
  },
});
