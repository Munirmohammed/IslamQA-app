import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HifzGarden } from '@/components/hifz-garden';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMemorizationProgress } from '@/features/memorization/api';

export default function HifzGardenScreen() {
  const { data, isLoading, error } = useMemorizationProgress();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isLoading && (
            <ThemedText themeColor="textSecondary" style={styles.message}>
              Growing your garden…
            </ThemedText>
          )}

          {error && (
            <ThemedText themeColor="textSecondary" style={styles.message}>
              Couldn&apos;t load your progress.
            </ThemedText>
          )}

          {data && data.surahs.length === 0 && (
            <ThemedText themeColor="textSecondary" style={styles.message}>
              Your garden is empty -- add an ayah to your memorization plan from the Read
              tab to plant your first seed.
            </ThemedText>
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
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
});
