import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useRequestLocation } from '@/hooks/use-request-location';
import { useTheme } from '@/hooks/use-theme';
import { WORLD_CITIES } from '@/lib/world-cities';
import { useLocationStore } from '@/stores/location-store';

/** Shared by the Prayer Times and Qibla screens: once a location is set
 * (GPS or a manually picked city), shows a compact summary with a
 * "Change" action; until then, shows the full picker (GPS request +
 * fallback city list) so declining location permission never dead-ends
 * either feature.
 *
 * `variant="chip"` (Prayers screen only) renders the already-set summary
 * as a small rounded pill (flag/pin + short label, no separate "Change"
 * text -- the whole chip is the tap target) instead of the default
 * full-width row, matching the real Muslim Pro app's location chip
 * confirmed via a real device screenshot. Qibla keeps the default variant
 * unchanged since that screen was never part of this pass. */
export function LocationPicker({ variant = 'default' }: { variant?: 'default' | 'chip' }) {
  const theme = useTheme();
  const latitude = useLocationStore((s) => s.latitude);
  const source = useLocationStore((s) => s.source);
  const label = useLocationStore((s) => s.label);
  const flag = useLocationStore((s) => s.flag);
  const setLocation = useLocationStore((s) => s.setLocation);
  const { request, isRequesting, error } = useRequestLocation();
  const [expanded, setExpanded] = useState(false);
  const [showCities, setShowCities] = useState(false);

  if (latitude !== null && !expanded) {
    if (variant === 'chip') {
      // Manual city label is "City, Country" (see the setLocation call
      // below) -- only the city name fits a chip this narrow, so take the
      // part before the comma rather than showing the full string.
      const chipLabel = source === 'gps' ? 'Current location' : (label?.split(',')[0] ?? label);
      return (
        <Pressable onPress={() => setExpanded(true)}>
          {({ pressed }) => (
            <View style={[styles.chip, { backgroundColor: theme.backgroundSelected }, pressed && styles.pressed]}>
              {flag ? (
                <ThemedText type="small">{flag}</ThemedText>
              ) : (
                <Ionicons name="location" size={13} color={theme.textSecondary} />
              )}
              <ThemedText type="small" numberOfLines={1}>
                {chipLabel}
              </ThemedText>
            </View>
          )}
        </Pressable>
      );
    }

    return (
      <Pressable onPress={() => setExpanded(true)}>
        {({ pressed }) => (
          <View style={[styles.summaryRow, pressed && styles.pressed]}>
            <View style={styles.summaryLabel}>
              <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                {source === 'gps' ? 'Using your current location' : label}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="primary">
              Change
            </ThemedText>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText themeColor="textSecondary" style={styles.message}>
        Set your location to compute accurate prayer times and qibla direction.
      </ThemedText>

      <Pressable
        onPress={async () => {
          if (await request()) setExpanded(false);
        }}
        disabled={isRequesting}>
        {({ pressed }) => (
          <ThemedView
            type="primaryMuted"
            style={[styles.button, (pressed || isRequesting) && styles.pressed]}>
            <ThemedText type="smallBold" themeColor="primary">
              {isRequesting ? 'Getting location…' : 'Use my location'}
            </ThemedText>
          </ThemedView>
        )}
      </Pressable>

      {error && (
        <ThemedText type="small" themeColor="error" style={styles.errorText}>
          {error}
        </ThemedText>
      )}

      <Pressable onPress={() => setShowCities((v) => !v)}>
        <ThemedText type="small" themeColor="primary">
          {showCities ? 'Hide city list' : 'Or pick a city'}
        </ThemedText>
      </Pressable>

      {showCities && (
        <ScrollView style={styles.cityList} contentContainerStyle={styles.cityListContent} nestedScrollEnabled>
          {WORLD_CITIES.map((city) => (
            <Pressable
              key={city.name}
              onPress={() => {
                setLocation(
                  city.latitude,
                  city.longitude,
                  'manual',
                  `${city.name}, ${city.country}`,
                  city.flag
                );
                setShowCities(false);
                setExpanded(false);
              }}>
              {({ pressed }) => (
                <ThemedView type="backgroundElement" style={[styles.cityRow, pressed && styles.pressed]}>
                  <ThemedText type="small">{city.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {city.country}
                  </ThemedText>
                </ThemedView>
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  message: {
    textAlign: 'center',
  },
  button: {
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  errorText: {
    textAlign: 'center',
  },
  cityList: {
    maxHeight: 300,
  },
  cityListContent: {
    gap: Spacing.two,
  },
  cityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  summaryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
