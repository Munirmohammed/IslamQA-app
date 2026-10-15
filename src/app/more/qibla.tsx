import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, ClipPath, Defs, Line, Pattern, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { LocationPicker } from '@/components/location-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDistanceToKaabaKm, getQiblaBearing } from '@/lib/prayer-times';
import { useLocationStore } from '@/stores/location-store';

const DIAL_SIZE = 268;
const RING_WIDTH = 14;
const DISC_RADIUS = DIAL_SIZE / 2 - RING_WIDTH;
const NEEDLE_LENGTH = DISC_RADIUS * 2 - 24;
const NEEDLE_WIDTH = 15;
const KAABA_BADGE_SIZE = 34;
const ALIGNMENT_THRESHOLD_DEG = 10;
const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);
const CARDINALS: { label: string; deg: number }[] = [
  { label: 'N', deg: 0 },
  { label: 'E', deg: 90 },
  { label: 'S', deg: 180 },
  { label: 'W', deg: 270 },
];

/** Pixel-sampled (Pillow, not eyeballed) off the real Qibla screenshot
 * (`27.png`, taken directly from a phone running Muslim Pro) -- the
 * needle is a thin bicolor sliver, not a solid arrow: its half pointing
 * at the bearing reads ~rgb(217,99,115), its tail ~rgb(231,161,170). The
 * dial's own white ring and the Kaaba badge's ring measured the same
 * red/pink family (~rgb(204,110,131)), so the badge reuses NEEDLE_RED
 * rather than inventing a second near-identical token. These are fixed
 * "indicator chrome" colors -- they don't change with the skin color or
 * the app's light/dark theme, same as the white ring itself. */
const NEEDLE_RED = '#D96373';
const NEEDLE_PINK = '#E7A1AA';
const RING_WHITE = '#FFFFFF';
const TICK_DARK = 'rgba(20, 24, 22, 0.55)';

/** Muslim Pro's real Qibla screen (ground-truth screenshot, not a
 * marketing image) shows a row of small circular compass-face previews
 * -- plain colored dials, not wood-grain/brushed-brass photography. An
 * earlier pass deliberately avoided faking those textures; now that
 * there's a real reference, that call holds up for the same reason: the
 * previews in the actual screenshot are flat/simple too, just a colored
 * disc, a thin needle, and a tick -- genuinely buildable, not a
 * simplification of something more detailed. What changed here is the
 * swatch itself: previously a flat filled dot, now a tiny real replica
 * of the dial (via MiniDial below) so picking one shows what you're
 * actually choosing, matching Muslim Pro's own small compass-face
 * thumbnails rather than abstract color chips. Colors are medium-dark on
 * purpose (not the pale cream/wood tones in the reference) so the white
 * ticks/needle stay legible on every option without per-skin text-color
 * logic. */
const COMPASS_SKINS: { id: string; label: string; discColor: string | null }[] = [
  { id: 'classic', label: 'Classic', discColor: null },
  { id: 'crimson', label: 'Crimson', discColor: '#B3382E' },
  { id: 'slate', label: 'Slate', discColor: '#44505A' },
  { id: 'amber', label: 'Amber', discColor: '#B8862E' },
  { id: 'sapphire', label: 'Sapphire', discColor: '#2C4F8C' },
];

/** Compass-calibration accuracy, straight from `expo-location`'s own
 * `LocationHeadingObject.accuracy` (confirmed against the versioned SDK
 * 57 docs, not assumed from memory) -- 3/2/1/0, with iOS-documented
 * uncertainty bands of <20°/<35°/<50°/>50°. The reference screenshot's
 * "Good accuracy" chip is this exact field, just not previously
 * surfaced; mapped onto this app's own existing 4-tier mistake-scale
 * tokens (success/mistakeLow/mistakeModerate/error) rather than adding
 * new color tokens for what's semantically the same good->bad scale. */
const ACCURACY_LABELS = ['Needs calibration', 'Low accuracy', 'Fair accuracy', 'Good accuracy'] as const;

/** Shortest-path equivalent of `target`, relative to `current` -- keeps
 * the needle animating the short way around (e.g. 359deg -> 1deg takes a
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

/** Signed shortest angle from `b` to `a`, in (-180, 180] -- positive means
 * `a` is clockwise of `b`. Used only to pick "turn right" vs "turn left"
 * wording; `angularDistance` above (unsigned) still drives alignment. */
function normalizeSigned(deg: number): number {
  return ((deg % 360) + 540) % 360 - 180;
}

/** A tiny static replica of the real dial (disc + ring tick + needle) for
 * the skin-picker row -- see COMPASS_SKINS' comment above for why this
 * replaces the old flat-color swatch. */
function MiniDial({ color, selected }: { color: string; selected: boolean }) {
  const theme = useTheme();
  const size = 40;
  const c = size / 2;
  return (
    <Svg width={size} height={size}>
      <Circle cx={c} cy={c} r={c - 2} fill={color} stroke={selected ? theme.primary : RING_WHITE} strokeWidth={selected ? 3 : 2.5} />
      <Line x1={c} y1={5} x2={c} y2={c} stroke={NEEDLE_RED} strokeWidth={3} strokeLinecap="round" />
      <Line x1={c} y1={c} x2={c} y2={size - 5} stroke={NEEDLE_PINK} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

export default function QiblaScreen() {
  const theme = useTheme();
  const router = useRouter();
  const latitude = useLocationStore((s) => s.latitude);
  const longitude = useLocationStore((s) => s.longitude);
  const locationLabel = useLocationStore((s) => s.label);
  const locationSource = useLocationStore((s) => s.source);
  const [heading, setHeading] = useState<number | null>(null);
  const [headingAccuracy, setHeadingAccuracy] = useState<number | null>(null);
  const [skinId, setSkinId] = useState(COMPASS_SKINS[0].id);
  const discColor = COMPASS_SKINS.find((s) => s.id === skinId)?.discColor ?? theme.primary;

  // No web implementation for device heading (no magnetometer access in
  // most browsers via Expo's web shim) -- degrade to the static bearing
  // below instead of a live-rotating needle, same pattern as every other
  // web-unsupported native API in this app (expo-file-system, etc.).
  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;
    Location.watchHeadingAsync((h) => {
      setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading);
      setHeadingAccuracy(h.accuracy);
    })
      .then((sub) => {
        subscription = sub;
      })
      .catch(() => {
        setHeading(null);
        setHeadingAccuracy(null);
      });
    return () => subscription?.remove();
  }, []);

  const bearing = latitude !== null && longitude !== null ? getQiblaBearing(latitude, longitude) : null;
  const needleRotation = bearing !== null && heading !== null ? bearing - heading : bearing;
  const distanceKm =
    latitude !== null && longitude !== null ? getDistanceToKaabaKm(latitude, longitude) : null;
  const isAligned =
    heading !== null && bearing !== null && angularDistance(bearing, heading) <= ALIGNMENT_THRESHOLD_DEG;
  const signedOffset = heading !== null && bearing !== null ? normalizeSigned(bearing - heading) : null;

  const rotation = useSharedValue(needleRotation ?? 0);
  useEffect(() => {
    if (needleRotation === null) return;
    rotation.value = withTiming(shortestRotationTo(rotation.value, needleRotation), { duration: 400 });
    // rotation is a shared value, stable across renders -- only re-run
    // when the target angle itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needleRotation]);

  const animatedNeedleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const accuracyColors = [theme.error, theme.mistakeModerate, theme.mistakeLow, theme.success];
  const accuracyLabel = headingAccuracy !== null ? ACCURACY_LABELS[headingAccuracy] : null;
  const accuracyColor = headingAccuracy !== null ? accuracyColors[headingAccuracy] : theme.textSecondary;

  const offsetDegrees =
    signedOffset !== null ? Math.round(Math.abs(signedOffset)) : bearing !== null ? Math.round(bearing) : null;

  const instructionText = isAligned
    ? 'Facing Qibla'
    : signedOffset === null
      ? null
      : signedOffset > 0
        ? 'Turn to your right'
        : 'Turn to your left';

  const pc = DIAL_SIZE / 2;
  const patternId = 'qibla-geo-pattern';
  const clipId = 'qibla-disc-clip';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerButton}>
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="smallBold" style={styles.headerTitle}>
              Qibla
            </ThemedText>
            <View style={styles.headerButton} />
          </View>

          {latitude === null ? (
            <LocationPicker />
          ) : (
            <>
              <View style={styles.pillRow}>
                <ThemedView type="backgroundElement" style={[styles.pill, styles.pillGrow]}>
                  <Ionicons name="location" size={14} color={theme.primary} />
                  <ThemedText type="smallBold" numberOfLines={1} style={styles.pillText}>
                    {locationSource === 'gps' ? 'Current location' : (locationLabel ?? 'Location').split(',')[0]}
                  </ThemedText>
                </ThemedView>

                {accuracyLabel && (
                  <ThemedView type="backgroundElement" style={styles.pill}>
                    <Ionicons name="checkmark-circle" size={14} color={accuracyColor} />
                    <ThemedText type="smallBold" numberOfLines={1} style={styles.pillText}>
                      {accuracyLabel}
                    </ThemedText>
                  </ThemedView>
                )}

                {offsetDegrees !== null && (
                  <ThemedView type="backgroundElement" style={styles.pill}>
                    <Ionicons name="compass-outline" size={14} color={theme.textSecondary} />
                    <ThemedText type="smallBold" style={styles.pillText}>
                      {offsetDegrees}°
                    </ThemedText>
                  </ThemedView>
                )}
              </View>

              <LocationPicker />

              {bearing !== null && (
                <View style={styles.compassArea}>
                  <View style={[styles.dialWrap, { width: DIAL_SIZE }]}>
                    <View style={styles.kaabaConnector} />
                    <View
                      style={[
                        styles.kaabaBadge,
                        { borderColor: isAligned ? theme.success : NEEDLE_RED },
                      ]}>
                      <Ionicons name="cube" size={16} color="#2B2B2B" />
                    </View>

                    <Svg width={DIAL_SIZE} height={DIAL_SIZE} style={{ marginTop: KAABA_BADGE_SIZE }}>
                      <Defs>
                        <ClipPath id={clipId}>
                          <Circle cx={pc} cy={pc} r={DISC_RADIUS} />
                        </ClipPath>
                        {/* Subtle Islamic geometric watermark -- a tiled
                            interlocking-circle motif (a simplified, honestly
                            buildable stand-in for the real screenshot's
                            faint arabesque pattern, not an attempt to
                            reproduce a specific traditional girih tiling). */}
                        <Pattern id={patternId} x={0} y={0} width={34} height={34} patternUnits="userSpaceOnUse">
                          <Circle cx={8.5} cy={8.5} r={9} stroke="rgba(0,0,0,0.16)" strokeWidth={1} fill="none" />
                          <Circle cx={25.5} cy={8.5} r={9} stroke="rgba(0,0,0,0.16)" strokeWidth={1} fill="none" />
                          <Circle cx={8.5} cy={25.5} r={9} stroke="rgba(0,0,0,0.16)" strokeWidth={1} fill="none" />
                          <Circle cx={25.5} cy={25.5} r={9} stroke="rgba(0,0,0,0.16)" strokeWidth={1} fill="none" />
                        </Pattern>
                      </Defs>

                      {/* Filled disc + ring (solid, not a hairline outline --
                          the reference's compass is a bold vivid-green disc). */}
                      <Circle cx={pc} cy={pc} r={DIAL_SIZE / 2 - RING_WIDTH / 2} fill="none" stroke={RING_WHITE} strokeWidth={RING_WIDTH} />
                      <Circle cx={pc} cy={pc} r={DISC_RADIUS} fill={discColor} />
                      <Rect x={pc - DISC_RADIUS} y={pc - DISC_RADIUS} width={DISC_RADIUS * 2} height={DISC_RADIUS * 2} fill={`url(#${patternId})`} clipPath={`url(#${clipId})`} />

                      {TICKS.map((deg) => {
                        const isMajor = deg % 90 === 0;
                        const angle = ((deg - 90) * Math.PI) / 180;
                        const outerR = DIAL_SIZE / 2 - 1;
                        const innerR = isMajor ? outerR - RING_WIDTH + 2 : outerR - RING_WIDTH * 0.55;
                        const x1 = pc + outerR * Math.cos(angle);
                        const y1 = pc + outerR * Math.sin(angle);
                        const x2 = pc + innerR * Math.cos(angle);
                        const y2 = pc + innerR * Math.sin(angle);
                        return (
                          <Line
                            key={deg}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={TICK_DARK}
                            strokeWidth={isMajor ? 2.5 : 1.5}
                            strokeLinecap="round"
                          />
                        );
                      })}

                      {TICKS.filter((deg) => deg % 90 !== 0).map((deg) => {
                        const angle = ((deg - 90) * Math.PI) / 180;
                        const r = DIAL_SIZE / 2 + 13;
                        const x = pc + r * Math.cos(angle);
                        const y = pc + r * Math.sin(angle);
                        return (
                          <SvgText
                            key={deg}
                            x={x}
                            y={y + 4}
                            fontSize={11}
                            fill={theme.textSecondary}
                            textAnchor="middle">
                            {deg}
                          </SvgText>
                        );
                      })}

                      {CARDINALS.map(({ label, deg }) => {
                        const angle = ((deg - 90) * Math.PI) / 180;
                        const r = DISC_RADIUS - 26;
                        const x = pc + r * Math.cos(angle);
                        const y = pc + r * Math.sin(angle);
                        return (
                          <SvgText
                            key={label}
                            x={x}
                            y={y + 7}
                            fontSize={20}
                            fontWeight="bold"
                            // The real screenshot tints just "N" in the
                            // needle's red -- true-north reference, not a
                            // cardinal like the other three -- and leaves
                            // E/S/W white.
                            fill={label === 'N' ? NEEDLE_RED : RING_WHITE}
                            textAnchor="middle">
                            {label}
                          </SvgText>
                        );
                      })}
                    </Svg>

                    <Animated.View
                      style={[
                        styles.needlePivot,
                        { left: pc - NEEDLE_WIDTH / 2, top: KAABA_BADGE_SIZE + pc - NEEDLE_LENGTH / 2 },
                        animatedNeedleStyle,
                      ]}>
                      <Svg width={NEEDLE_WIDTH} height={NEEDLE_LENGTH}>
                        <Polygon
                          points={`${NEEDLE_WIDTH / 2},0 ${NEEDLE_WIDTH * 0.12},${NEEDLE_LENGTH / 2} ${NEEDLE_WIDTH * 0.88},${NEEDLE_LENGTH / 2}`}
                          fill={isAligned ? theme.success : NEEDLE_RED}
                        />
                        <Polygon
                          points={`${NEEDLE_WIDTH / 2},${NEEDLE_LENGTH} ${NEEDLE_WIDTH * 0.12},${NEEDLE_LENGTH / 2} ${NEEDLE_WIDTH * 0.88},${NEEDLE_LENGTH / 2}`}
                          fill={isAligned ? theme.success : NEEDLE_PINK}
                        />
                      </Svg>
                    </Animated.View>

                    <View style={styles.centerPiece} pointerEvents="none">
                      <View style={[styles.centerDot, { backgroundColor: RING_WHITE }]} />
                    </View>
                  </View>

                  {instructionText && (
                    <ThemedText style={styles.instruction}>{instructionText}</ThemedText>
                  )}

                  {distanceKm !== null && (
                    <ThemedText type="small" themeColor="textSecondary">
                      {Math.round(distanceKm).toLocaleString()} km to the Kaaba
                    </ThemedText>
                  )}

                  {heading === null && (
                    <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
                      Live compass isn&apos;t available on this device/browser -- this is the fixed
                      direction to the Kaaba from your location; orient yourself with a separate
                      compass.
                    </ThemedText>
                  )}

                  {/* The real screenshot's equivalent card here is literally
                      "Try the Tasbih feature / Find solace in dhikr" --
                      pointed at Azkar before Tasbih existed as a real screen
                      in this app; now that it does, this matches both the
                      wording and the destination. */}
                  <Pressable onPress={() => router.push('/more/tasbih')} style={styles.promoPress}>
                    {({ pressed }) => (
                      <ThemedView type="backgroundElement" style={[styles.promoCard, pressed && styles.pressed]}>
                        <View style={[styles.promoIconWrap, { backgroundColor: theme.primaryMuted }]}>
                          <Ionicons name="ellipse-outline" size={20} color={theme.primary} />
                        </View>
                        <View style={styles.promoText}>
                          <ThemedText type="smallBold">Try the Tasbih feature</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            Find solace in dhikr
                          </ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
                      </ThemedView>
                    )}
                  </Pressable>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.skinRow}>
                    {COMPASS_SKINS.map((skin) => (
                      <Pressable key={skin.id} onPress={() => setSkinId(skin.id)} hitSlop={4}>
                        <View style={styles.skinSwatch}>
                          <MiniDial color={skin.discColor ?? theme.primary} selected={skin.id === skinId} />
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
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
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.two + 2,
  },
  pillGrow: {
    flexShrink: 1,
  },
  pillText: {
    maxWidth: 110,
  },
  compassArea: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  dialWrap: {
    height: DIAL_SIZE + KAABA_BADGE_SIZE,
    alignItems: 'center',
  },
  kaabaConnector: {
    position: 'absolute',
    top: KAABA_BADGE_SIZE - 6,
    left: DIAL_SIZE / 2 - 1,
    width: 2,
    height: 14,
    backgroundColor: RING_WHITE,
  },
  kaabaBadge: {
    position: 'absolute',
    top: 0,
    left: DIAL_SIZE / 2 - KAABA_BADGE_SIZE / 2,
    width: KAABA_BADGE_SIZE,
    height: KAABA_BADGE_SIZE,
    borderRadius: KAABA_BADGE_SIZE / 2,
    borderWidth: 2.5,
    backgroundColor: '#F2EADB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  needlePivot: {
    position: 'absolute',
    top: KAABA_BADGE_SIZE,
    width: NEEDLE_WIDTH,
    height: NEEDLE_LENGTH,
  },
  centerPiece: {
    position: 'absolute',
    top: KAABA_BADGE_SIZE + DIAL_SIZE / 2 - 7,
    left: DIAL_SIZE / 2 - 7,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  instruction: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
  promoPress: {
    alignSelf: 'stretch',
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.card,
    padding: Spacing.three,
  },
  promoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoText: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.6,
  },
  skinRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  skinSwatch: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
