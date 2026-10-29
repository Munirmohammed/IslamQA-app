import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { HifzGarden } from '@/components/hifz-garden';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMemorizationProgress } from '@/features/memorization/api';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';

export default function HifzGardenScreen() {
  const theme = useTheme();
  const accessToken = useAuthStore((s) => s.accessToken);
  // useMemorizationProgress() is gated on accessToken (enabled: !!accessToken),
  // so data/isLoading/error all stay falsy when logged out -- previously
  // that meant none of the states below ever rendered, leaving a silently
  // blank screen for a logged-out visitor rather than a real prompt.
  const { data, isLoading, error } = useMemorizationProgress();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Ionicons name="chevron-back" size={18} color={theme.text} />
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Hifz Garden
          </ThemedText>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {!accessToken && (
            <EmptyState
              icon="log-in-outline"
              message="Log in from the More tab to grow your Hifz Garden."
            />
          )}

          {accessToken && isLoading && <Skeleton height={200} borderRadius={Spacing.three} />}

          {accessToken && error && <EmptyState icon="alert-circle-outline" message="Couldn't load your progress." />}

          {accessToken && data && data.surahs.length === 0 && (
            <EmptyState
              icon="leaf-outline"
              message="Your garden is empty -- add an ayah to your memorization plan from the Quran tab to plant your first seed."
            />
          )}

          {data && data.surahs.length > 0 && <HifzGarden surahs={data.surahs} juz={data.juz} />}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
});
