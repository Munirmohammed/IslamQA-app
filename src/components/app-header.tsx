import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ArabicText } from '@/components/arabic-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useStreak } from '@/features/gamification/api';
import { useRequestLocation } from '@/hooks/use-request-location';
import { useTheme } from '@/hooks/use-theme';
import { toHijri } from '@/lib/hijri';
import { WORLD_CITIES } from '@/lib/world-cities';
import { useAuthStore } from '@/stores/auth-store';
import { useLocationStore } from '@/stores/location-store';
import { useThemeModeStore } from '@/stores/theme-mode-store';

/** Persistent top app bar, shown at the top of every tab's root screen --
 * ported from a Google AI Studio-generated prototype the user compared
 * this app against (logo/wordmark, city switcher, streak, AMOLED toggle).
 * That prototype was a from-scratch web rewrite with fabricated demo
 * numbers (localStorage, no backend); this version keeps its visual
 * language but wires every number to this app's own real backend --
 * `useStreak()` (src/features/gamification/api.ts), not invented data. */
export function AppHeader() {
  const theme = useTheme();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: streak } = useStreak();
  const toggleDarkMode = useThemeModeStore((s) => s.toggle);
  const isAmoled = theme.background === '#000000';

  const latitude = useLocationStore((s) => s.latitude);
  const locationLabel = useLocationStore((s) => s.label);
  const locationFlag = useLocationStore((s) => s.flag);
  const locationSource = useLocationStore((s) => s.source);
  const setLocation = useLocationStore((s) => s.setLocation);
  const { request, isRequesting } = useRequestLocation();
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const now = new Date();
  const hijri = toHijri(now);
  const cityDisplay =
    latitude === null
      ? 'Set location'
      : locationSource === 'gps'
        ? 'Current location'
        : (locationLabel?.split(',')[0] ?? locationLabel);

  const filteredCities = WORLD_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <ThemedView type="background" style={[styles.header, { borderBottomColor: theme.border }]}>
      <View style={styles.row}>
        <View style={styles.brand}>
          <LinearGradient
            colors={isAmoled ? [theme.backgroundElement, theme.backgroundElement] : [theme.gradientBannerStart, theme.backgroundElement]}
            style={[styles.logo, { borderColor: theme.primaryMuted }]}>
            <ArabicText font="badge" themeColor="primary" style={styles.logoGlyph}>
              ق
            </ArabicText>
          </LinearGradient>
          <View>
            <View style={styles.brandRow}>
              <ThemedText type="smallBold" style={styles.wordmark}>
                Qalam
              </ThemedText>
              <ArabicText font="badge" themeColor="primary" style={styles.wordmarkAr}>
                قلم
              </ArabicText>
              <View style={[styles.tag, { backgroundColor: theme.primaryMuted }]}>
                <ThemedText type="small" themeColor="primary" style={styles.tagText}>
                  {isAmoled ? 'AMOLED' : 'MUSHAF & DEEN'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push('/more/qibla')}
            hitSlop={8}
            style={[styles.iconButton, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Ionicons name="compass-outline" size={16} color={theme.primary} />
          </Pressable>
          <Pressable
            onPress={toggleDarkMode}
            hitSlop={8}
            style={[styles.iconButton, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Ionicons name={isAmoled ? 'sunny-outline' : 'moon-outline'} size={16} color={isAmoled ? theme.success : theme.accent} />
          </Pressable>
        </View>
      </View>

      <View style={styles.row}>
        <Pressable onPress={() => setShowCityModal(true)} style={styles.dateRow} hitSlop={6}>
          <ThemedText type="small" themeColor="textSecondary">
            {hijri.day} {hijri.monthName} {hijri.year} AH
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {' '}
            •{' '}
          </ThemedText>
          <Ionicons name="location" size={12} color={theme.primary} />
          <ThemedText type="small" themeColor="primary">
            {' '}
            {cityDisplay} {locationFlag ?? ''}
          </ThemedText>
        </Pressable>

        {accessToken && streak && streak.current_streak > 0 && (
          <View style={[styles.streakPill, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Ionicons name="flame" size={13} color={theme.accent} />
            <ThemedText type="small" style={styles.streakText}>
              {streak.current_streak}d
            </ThemedText>
          </View>
        )}
      </View>

      <Modal visible={showCityModal} transparent animationType="fade" onRequestClose={() => setShowCityModal(false)}>
        <View style={styles.modalBackdrop}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText type="smallBold">Select your location</ThemedText>
              <Pressable onPress={() => setShowCityModal(false)} hitSlop={10}>
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <Pressable
              onPress={async () => {
                if (await request()) setShowCityModal(false);
              }}
              disabled={isRequesting}>
              {({ pressed }) => (
                <ThemedView type="primaryMuted" style={[styles.useLocationButton, pressed && styles.pressed]}>
                  <ThemedText type="smallBold" themeColor="primary">
                    {isRequesting ? 'Getting location…' : 'Use my location'}
                  </ThemedText>
                </ThemedView>
              )}
            </Pressable>

            <TextInput
              placeholder="Search city or country..."
              placeholderTextColor={theme.textSecondary}
              value={citySearch}
              onChangeText={setCitySearch}
              style={[styles.searchInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            />

            <ScrollView style={styles.cityList}>
              {filteredCities.map((city) => (
                <Pressable
                  key={city.name}
                  onPress={() => {
                    setLocation(city.latitude, city.longitude, 'manual', `${city.name}, ${city.country}`, city.flag);
                    setShowCityModal(false);
                    setCitySearch('');
                  }}>
                  {({ pressed }) => (
                    <View style={[styles.cityRow, pressed && styles.pressed]}>
                      <ThemedText type="small">
                        {city.flag} {city.name}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {city.country}
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoGlyph: {
    fontSize: 20,
    lineHeight: 24,
  },
  wordmark: {
    fontSize: 16,
  },
  wordmarkAr: {
    fontSize: 16,
    lineHeight: 20,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Spacing.one,
  },
  tagText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
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
    maxHeight: '80%',
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  useLocationButton: {
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  cityList: {
    maxHeight: 300,
  },
  cityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
});
