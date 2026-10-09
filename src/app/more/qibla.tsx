import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationPicker } from '@/components/location-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getQiblaBearing } from '@/lib/prayer-times';
import { useLocationStore } from '@/stores/location-store';

export default function QiblaScreen() {
  const theme = useTheme();
  const latitude = useLocationStore((s) => s.latitude);
  const longitude = useLocationStore((s) => s.longitude);
  const [heading, setHeading] = useState<number | null>(null);

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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Qibla
        </ThemedText>

        <LocationPicker />

        {bearing !== null && (
          <View style={styles.compassArea}>
            <View style={[styles.compassRing, { borderColor: theme.border }]}>
              <View
                style={[
                  styles.needle,
                  { backgroundColor: theme.primary, transform: [{ rotate: `${needleRotation}deg` }] },
                ]}
              />
            </View>
            <ThemedText type="smallBold" style={styles.bearingText}>
              {Math.round(bearing)}° from true north
            </ThemedText>
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
  bearingText: {
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
});
