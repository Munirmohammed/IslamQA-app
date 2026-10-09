import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationPicker } from '@/components/location-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDistanceToKaabaKm, getQiblaBearing } from '@/lib/prayer-times';
import { useLocationStore } from '@/stores/location-store';

export default function QiblaScreen() {
  const theme = useTheme();
  const latitude = useLocationStore((s) => s.latitude);
  const longitude = useLocationStore((s) => s.longitude);
  const [heading, setHeading] = useState<number | null>(null);
  const [mode, setMode] = useState<'compass' | 'map'>('compass');

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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Qibla
        </ThemedText>

        <LocationPicker />

        {bearing !== null && (
          <View style={styles.compassArea}>
            <View style={styles.modeToggle}>
              <Pressable onPress={() => setMode('compass')} hitSlop={8}>
                <ThemedView
                  type={mode === 'compass' ? 'primaryMuted' : 'backgroundSelected'}
                  style={styles.modeChip}>
                  <ThemedText type="small" themeColor={mode === 'compass' ? 'primary' : 'textSecondary'}>
                    Compass
                  </ThemedText>
                </ThemedView>
              </Pressable>
              <Pressable onPress={() => setMode('map')} hitSlop={8}>
                <ThemedView
                  type={mode === 'map' ? 'primaryMuted' : 'backgroundSelected'}
                  style={styles.modeChip}>
                  <ThemedText type="small" themeColor={mode === 'map' ? 'primary' : 'textSecondary'}>
                    Map
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </View>

            {mode === 'compass' ? (
              <View style={[styles.compassRing, { borderColor: theme.border }]}>
                <View
                  style={[
                    styles.needle,
                    { backgroundColor: theme.primary, transform: [{ rotate: `${needleRotation}deg` }] },
                  ]}
                />
              </View>
            ) : (
              <View style={[styles.mapRing, { borderColor: theme.border }]}>
                <View style={[styles.mapRingInner, { borderColor: theme.border }]} />
                <View
                  style={[
                    styles.bearingLine,
                    { backgroundColor: theme.primary, transform: [{ rotate: `${needleRotation}deg` }] },
                  ]}>
                  <View style={[styles.kaabaMarker, { transform: [{ rotate: `${-(needleRotation ?? 0)}deg` }] }]}>
                    <Ionicons name="cube" size={16} color={theme.primary} />
                  </View>
                </View>
                <View style={[styles.userDot, { backgroundColor: theme.text }]} />
              </View>
            )}

            <ThemedText type="smallBold" style={styles.bearingText}>
              {Math.round(bearing)}° from true north
            </ThemedText>
            {mode === 'map' && distanceKm !== null && (
              <ThemedText themeColor="textSecondary" style={styles.bearingText}>
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
          </View>
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
    gap: Spacing.four,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  compassArea: {
    alignItems: 'center',
    gap: Spacing.four,
    paddingTop: Spacing.five,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  modeChip: {
    borderRadius: Spacing.two,
    paddingVertical: 6,
    paddingHorizontal: Spacing.three,
  },
  compassRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needle: {
    width: 6,
    height: 90,
    borderRadius: 3,
  },
  mapRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    position: 'relative',
  },
  mapRingInner: {
    position: 'absolute',
    top: 40,
    left: 40,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    opacity: 0.5,
  },
  userDot: {
    position: 'absolute',
    top: 105,
    left: 105,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bearingLine: {
    position: 'absolute',
    top: 10,
    left: 108.5,
    width: 3,
    height: 100,
    transformOrigin: 'bottom',
  },
  kaabaMarker: {
    position: 'absolute',
    top: -10,
    left: -8.5,
  },
  bearingText: {
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
});
