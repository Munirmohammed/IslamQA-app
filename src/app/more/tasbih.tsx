import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useId, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { ArabicText } from '@/components/arabic-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DHIKR_PHRASES, TASBIH_TARGETS, getDhikrPhrase } from '@/lib/tasbih-data';
import { type BeadColor, useTasbihStore } from '@/stores/tasbih-store';

// Each bead color's lit (highlight -> mid -> shadow) gradient stops and its
// dim/unlit equivalent -- real glossy-sphere illustrations (react-native-svg
// radial gradients), not the flat dot grid this screen used before, matching
// the approved design's bead-string artwork exactly.
const BEAD_PALETTES: Record<BeadColor, { lit: [string, string, string]; dim: [string, string, string] }> = {
  green: { lit: ['#6CF0B4', '#17E08A', '#0A8A57'], dim: ['#2E5B50', '#184038', '#0C2621'] },
  rose: { lit: ['#F6B8C4', '#E06B85', '#8C3447'], dim: ['#5B3238', '#3A1F24', '#1F0F12'] },
  turquoise: { lit: ['#9FE3EC', '#3FADC4', '#1D5F72'], dim: ['#2A4850', '#1A2E33', '#0D171A'] },
  amethyst: { lit: ['#C9ACF5', '#8B5FD6', '#4B2E82'], dim: ['#3E3250', '#272035', '#14101C'] },
  pearl: { lit: ['#FDFBF6', '#E7E1D3', '#AFA790'], dim: ['#4A4840', '#302E29', '#191815'] },
  onyx: { lit: ['#5A5A60', '#2A2A2E', '#111113'], dim: ['#232326', '#161618', '#0A0A0B'] },
};

const BEAD_COLOR_ORDER: BeadColor[] = ['green', 'rose', 'turquoise', 'amethyst', 'pearl', 'onyx'];

function Bead({ size, lit, stops, imam }: { size: number; lit: boolean; stops: [string, string, string]; imam?: boolean }) {
  // useId() includes colons (e.g. ":r0:"), which aren't safe inside an SVG
  // url(#id) reference on every renderer -- stripped down to the
  // alphanumeric id SVG actually expects.
  const id = `bead-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id={id} cx="35%" cy="30%" r="75%">
          <Stop offset="0%" stopColor={stops[0]} />
          <Stop offset="55%" stopColor={stops[1]} />
          <Stop offset="100%" stopColor={stops[2]} />
        </RadialGradient>
      </Defs>
      <Circle cx="12" cy="12" r={imam ? 11.5 : 11} fill={`url(#${id})`} opacity={lit || imam ? 1 : 0.9} />
    </Svg>
  );
}

/** A real illustrated bead string -- glossy spheres draped in a gentle arc
 * (a parabola of per-bead vertical offsets, same shape a physical misbaha
 * hangs in), with a larger gold "imam" bead marking the end, replacing the
 * plain dot-grid this screen used before. Filled/lit beads show progress
 * through the current loop. */
function BeadString({ count, target, color }: { count: number; target: number; color: BeadColor }) {
  const palette = BEAD_PALETTES[color];
  // 13 beads on screen regardless of the real target -- an illustration of
  // progress, not a literal one-bead-per-count string (a target of 100
  // would make individual beads illegibly small); position within the 13
  // scales proportionally to count/target.
  const BEAD_COUNT = 13;
  const litBeads = Math.round((count / Math.max(1, target)) * BEAD_COUNT);
  const DROOP = [0, 12, 21, 29, 34, 37, 38, 37, 34, 29, 21, 12, 0];

  return (
    <View style={styles.beadStringRow}>
      {DROOP.map((offset, i) => (
        <View key={i} style={{ transform: [{ translateY: offset * 0.7 }] }}>
          <Bead size={19} lit={i < litBeads} stops={i < litBeads ? palette.lit : palette.dim} />
        </View>
      ))}
      <View style={{ transform: [{ translateY: -4 }] }}>
        <Bead size={25} lit stops={['#F6D996', '#E3B869', '#9C7536']} imam />
      </View>
    </View>
  );
}

/** A simple line illustration of hands raised in dua, matching the
 * approved design's "Start a dhikr" card artwork -- a real, if modest,
 * drawn illustration (react-native-svg paths), not a stock photo this app
 * has no license for. */
function DuaHandsIllustration() {
  return (
    <Svg width={64} height={64} viewBox="0 0 100 100">
      <Path
        d="M30 72c-4-10-3-24 4-32 3-4 4-10 2-15-1-3 1-6 4-5 4 1 6 6 5 11"
        fill="none"
        stroke="#E3B869"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M70 72c4-10 3-24-4-32-3-4-4-10-2-15 1-3-1-6-4-5-4 1-6 6-5 11"
        fill="none"
        stroke="#E3B869"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Circle cx="50" cy="40" r="4" fill="#17E08A" />
      <Circle cx="38" cy="48" r="3" fill="#17E08A" opacity={0.8} />
      <Circle cx="62" cy="48" r="3" fill="#17E08A" opacity={0.8} />
      <Path
        d="M30 72c6 8 14 13 20 13s14-5 20-13"
        fill="none"
        stroke="#E3B869"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BeadSwatches({ selected, onSelect }: { selected: BeadColor; onSelect: (c: BeadColor) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.swatchRow}>
      {BEAD_COLOR_ORDER.map((c) => (
        <Pressable key={c} onPress={() => onSelect(c)} hitSlop={4}>
          <View
            style={[
              styles.swatch,
              c === selected && { borderColor: theme.primary, borderWidth: 2 },
            ]}>
            <Bead size={38} lit stops={BEAD_PALETTES[c].lit} />
          </View>
        </Pressable>
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

/** Rebuilt against the full-app design canvas the user approved before any
 * implementation (every screen's colors/layout signed off up front): a
 * real illustrated bead string (glossy SVG spheres draped in an arc, see
 * BeadString above) with a selectable bead-color swatch row, a dhikr
 * display card, and a separate "Start a dhikr" card with a drawn dua-hands
 * illustration. The bead color choice is real and persisted
 * (tasbih-store's beadColor), not just decorative. The header's reset icon
 * is real (clears count + loop); the speaker icon is wired to this
 * screen's real tactile feedback -- haptics -- rather than silently doing
 * nothing, since there's no bundled tap-click sound asset in this app to
 * back a literal mute toggle (the same "don't fake it" call
 * azkar-category.tsx makes for its own missing Audio tab). */
export default function TasbihScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);

  const dhikrId = useTasbihStore((s) => s.dhikrId);
  const target = useTasbihStore((s) => s.target);
  const count = useTasbihStore((s) => s.count);
  const loopCount = useTasbihStore((s) => s.loopCount);
  const hapticsEnabled = useTasbihStore((s) => s.hapticsEnabled);
  const beadColor = useTasbihStore((s) => s.beadColor);
  const increment = useTasbihStore((s) => s.increment);
  const reset = useTasbihStore((s) => s.reset);
  const setDhikr = useTasbihStore((s) => s.setDhikr);
  const setTarget = useTasbihStore((s) => s.setTarget);
  const toggleHaptics = useTasbihStore((s) => s.toggleHaptics);
  const setBeadColor = useTasbihStore((s) => s.setBeadColor);

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
            <BeadString count={count} target={target} color={beadColor} />
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
            <ThemedText type="small" themeColor="textFaint" style={styles.dhikrReference}>
              {dhikr.reference}
            </ThemedText>
          </ThemedView>

          <LinearGradient
            colors={[theme.backgroundElement, theme.gradientBannerEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startDhikrCard}>
            <View style={styles.startDhikrText}>
              <ThemedText type="smallBold">Start a dhikr</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.startDhikrSubtitle}>
                Don&rsquo;t just count &mdash; make every tasbih mean something.
              </ThemedText>
              <Pressable onPress={() => setPickerOpen(true)}>
                {({ pressed }) => (
                  <View style={[styles.selectButton, { backgroundColor: theme.primary }, pressed && styles.pressed]}>
                    <ThemedText type="smallBold" style={styles.selectButtonLabel}>
                      Select a Dhikr
                    </ThemedText>
                  </View>
                )}
              </Pressable>
            </View>
            <DuaHandsIllustration />
          </LinearGradient>

          <ThemedText type="smallBold" style={styles.swatchLabel}>
            Bead Style
          </ThemedText>
          <BeadSwatches selected={beadColor} onSelect={setBeadColor} />
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
  beadStringRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
  },
  startDhikrCard: {
    width: '100%',
    borderRadius: Radius.card,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  startDhikrText: {
    flex: 1,
    gap: Spacing.one,
  },
  startDhikrSubtitle: {
    marginBottom: Spacing.one,
  },
  swatchLabel: {
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  swatch: {
    borderRadius: 24,
    padding: 2,
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
