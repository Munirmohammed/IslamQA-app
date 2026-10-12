import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationPicker } from '@/components/location-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDistanceToKaabaKm, getQiblaBearing } from '@/lib/prayer-times';
import { useLocationStore } from '@/stores/location-store';

const DIAL_SIZE = 240;
const ARROW_LENGTH = 95;
const ALIGNMENT_THRESHOLD_DEG = 10;
const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);
const CARDINALS: { label: string; deg: number }[] = [
  { label: 'N', deg: 0 },
  { label: 'E', deg: 90 },
  { label: 'S', deg: 180 },
  { label: 'W', deg: 270 },
];

/** Muslim Pro's actual Qibla screen has a row of selectable compass
 * "skins" below the dial (confirmed via its own Play Store screenshots).
 * Theirs are textured/material finishes (wood grain, brushed brass) this
 * doesn't attempt to fake with fabricated graphics -- this reskins the
 * one real, buildable part: the ring/needle color, while ticks and
 * cardinal labels stay theme-colored for legibility. `null` means "use
 * the app's own theme colors" (this app's existing green identity),
 * matching their own default/"Classic" option. */
const COMPASS_SKINS: { id: string; label: string; color: string | null }[] = [
  { id: 'classic', label: 'Classic', color: null },
  { id: 'crimson', label: 'Crimson', color: '#C0392B' },
  { id: 'slate', label: 'Slate', color: '#4A4A4A' },
  { id: 'amber', label: 'Amber', color: '#C9A24B' },
  { id: 'sapphire', label: 'Sapphire', color: '#2E5BA8' },
];

/** Shortest-path equivalent of `target`, relative to `current` -- keeps
 * the arrow animating the short way around (e.g. 359deg -> 1deg takes a
 * 2deg step, not a 358deg spin) instead of snapping to a raw 0-360
 * value every time the device heading updates. */
function shortestRotationTo(current: number, target: number): number {
  const delta = (((target - current) % 360) + 540) % 360 - 180;
  return current + delta;
}

function angularDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export default function QiblaScreen() {
  const theme = useTheme();
  const latitude = useLocationStore((s) => s.latitude);
  const longitude = useLocationStore((s) => s.longitude);
  const [heading, setHeading] = useState<number | null>(null);
  const [skinId, setSkinId] = useState(COMPASS_SKINS[0].id);
  const skinColor = COMPASS_SKINS.find((s) => s.id === skinId)?.color ?? null;

  // No web implementation for device heading (no magnetometer access in
  // most browsers via Expo's web shim) -- degrade to the static bearing
  // below instead of a live-rotating needle, same pattern as every other
  // web-unsupported native API in this app (expo-file-system, etc.).
  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;
    Location.watchHeadingAsync((h) => setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading))
      .then((sub) => {
        subscription = sub;
      })
      .catch(() => setHeading(null));
    return () => subscription?.remove();
  }, []);

  const bearing = latitude !== null && longitude !== null ? getQiblaBearing(latitude, longitude) : null;
  const needleRotation = bearing !== null && heading !== null ? bearing - heading : bearing;
  const distanceKm =
    latitude !== null && longitude !== null ? getDistanceToKaabaKm(latitude, longitude) : null;
  const isAligned =
    heading !== null && bearing !== null && angularDistance(bearing, heading) <= ALIGNMENT_THRESHOLD_DEG;

  const rotation = useSharedValue(needleRotation ?? 0);
  useEffect(() => {
    if (needleRotation === null) return;
    rotation.value = withTiming(shortestRotationTo(rotation.value, needleRotation), { duration: 400 });
    // rotation is a shared value, stable across renders -- only re-run
    // when the target angle itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needleRotation]);

  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Alignment feedback always wins over the cosmetic skin choice -- "you're
  // facing qibla" shouldn't be hidden by whichever ring color is picked.
  const dialColor = isAligned ? theme.success : (skinColor ?? theme.border);
  const arrowColor = isAligned ? theme.success : (skinColor ?? theme.primary);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title">Qibla</ThemedText>

          <LocationPicker />

          {bearing !== null && (
            <View style={styles.compassArea}>
              <View style={[styles.dial, { borderColor: dialColor }]}>
                {TICKS.map((deg) => (
                  <View key={deg} style={styles.tickWrapper}>
                    <View style={[styles.tickWrapperRotate, { transform: [{ rotate: `${deg}deg` }] }]}>
                      <View
                        style={[
                          deg % 90 === 0 ? styles.tickMajor : styles.tickMinor,
                          { backgroundColor: deg % 90 === 0 ? theme.text : theme.textSecondary },
                        ]}
                      />
                    </View>
                  </View>
                ))}

                {CARDINALS.map(({ label, deg }) => (
                  <View
                    key={label}
                    style={[
                      styles.cardinalLabel,
                      deg === 0 && styles.cardinalN,
                      deg === 90 && styles.cardinalE,
                      deg === 180 && styles.cardinalS,
                      deg === 270 && styles.cardinalW,
                    ]}>
                    <ThemedText type="smallBold" themeColor={label === 'N' ? 'primary' : 'textSecondary'}>
                      {label}
                    </ThemedText>
                  </View>
                ))}

                <Animated.View style={[styles.arrowPivot, animatedArrowStyle]}>
                  <View style={[styles.arrowShaft, { backgroundColor: arrowColor }]} />
                  <View style={[styles.arrowHead, { borderBottomColor: arrowColor }]} />
                </Animated.View>

                <View style={styles.centerPiece}>
                  {isAligned ? (
                    <Ionicons name="cube" size={20} color={theme.success} />
                  ) : (
                    <View style={[styles.centerDot, { backgroundColor: theme.textSecondary }]} />
                  )}
                </View>
              </View>

              {isAligned && (
                <ThemedView type="primaryMuted" style={styles.alignedBanner}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  <ThemedText type="smallBold" themeColor="success">
                    Facing Qibla
                  </ThemedText>
                </ThemedView>
              )}

              <View style={styles.readout}>
                <ThemedText type="smallBold" style={styles.readoutText}>
                  {Math.round(bearing)}° from true north
                </ThemedText>
                {distanceKm !== null && (
                  <ThemedText themeColor="textSecondary" style={styles.readoutText}>
                    {Math.round(distanceKm).toLocaleString()} km to the Kaaba
                  </ThemedText>
                )}
              </View>

              {heading === null && (
                <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
                  Live compass isn&apos;t available on this device/browser -- this is the fixed
                  direction to the Kaaba from your location; orient yourself with a separate
                  compass.
                </ThemedText>
              )}

              <View style={styles.skinRow}>
                {COMPASS_SKINS.map((skin) => (
                  <Pressable key={skin.id} onPress={() => setSkinId(skin.id)} hitSlop={4}>
                    <View
                      style={[
                        styles.skinSwatch,
                        { borderColor: skin.id === skinId ? theme.primary : theme.border },
                      ]}>
                      <View
                        style={[
                          styles.skinSwatchFill,
                          { backgroundColor: skin.color ?? theme.primary },
                        ]}
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  compassArea: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.five,
  },
  dial: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    borderWidth: 3,
  },
  tickWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    alignItems: 'center',
  },
  tickWrapperRotate: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    alignItems: 'center',
  },
  tickMajor: {
    width: 3,
    height: 14,
    borderRadius: 1.5,
    marginTop: 8,
  },
  tickMinor: {
    width: 2,
    height: 8,
    borderRadius: 1,
    marginTop: 8,
    opacity: 0.6,
  },
  cardinalLabel: {
    position: 'absolute',
    width: 20,
    alignItems: 'center',
  },
  cardinalN: {
    top: 24,
    left: DIAL_SIZE / 2 - 10,
  },
  cardinalS: {
    bottom: 24,
    left: DIAL_SIZE / 2 - 10,
  },
  cardinalE: {
    right: 20,
    top: DIAL_SIZE / 2 - 10,
  },
  cardinalW: {
    left: 20,
    top: DIAL_SIZE / 2 - 10,
  },
  arrowPivot: {
    position: 'absolute',
    top: DIAL_SIZE / 2 - ARROW_LENGTH,
    left: DIAL_SIZE / 2 - 2,
    width: 4,
    height: ARROW_LENGTH,
    alignItems: 'center',
    transformOrigin: 'bottom',
  },
  arrowShaft: {
    width: 4,
    height: ARROW_LENGTH - 16,
    borderRadius: 2,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  centerPiece: {
    position: 'absolute',
    top: DIAL_SIZE / 2 - 14,
    left: DIAL_SIZE / 2 - 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  alignedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    borderRadius: Radius.card,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  readout: {
    gap: 2,
  },
  readoutText: {
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
  skinRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  skinSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skinSwatchFill: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
