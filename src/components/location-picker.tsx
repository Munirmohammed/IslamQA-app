import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useRequestLocation } from '@/hooks/use-request-location';
import { WORLD_CITIES } from '@/lib/world-cities';
import { useLocationStore } from '@/stores/location-store';

/** Shared by the Prayer Times and Qibla screens: once a location is set
 * (GPS or a manually picked city), shows a compact summary with a
 * "Change" action; until then, shows the full picker (GPS request +
 * fallback city list) so declining location permission never dead-ends
 * either feature. */
export function LocationPicker() {
  const latitude = useLocationStore((s) => s.latitude);
  const source = useLocationStore((s) => s.source);
  const label = useLocationStore((s) => s.label);
  const setLocation = useLocationStore((s) => s.setLocation);
  const { request, isRequesting, error } = useRequestLocation();
  const [expanded, setExpanded] = useState(false);
  const [showCities, setShowCities] = useState(false);

  if (latitude !== null && !expanded) {
    return (
      <Pressable onPress={() => setExpanded(true)}>
        {({ pressed }) => (
          <View style={[styles.summaryRow, pressed && styles.pressed]}>
            <ThemedText type="small" themeColor="textSecondary">
              📍 {source === 'gps' ? 'Using your current location' : label}
            </ThemedText>
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
        <ThemedText type="small" style={styles.error}>
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
                setLocation(city.latitude, city.longitude, 'manual', `${city.name}, ${city.country}`);
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
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  error: {
    color: '#C0392B',
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
});
