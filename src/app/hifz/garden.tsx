import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { HifzGarden } from '@/components/hifz-garden';
import { Skeleton } from '@/components/skeleton';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMemorizationProgress } from '@/features/memorization/api';

export default function HifzGardenScreen() {
  const { data, isLoading, error } = useMemorizationProgress();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isLoading && <Skeleton height={200} borderRadius={Spacing.three} />}

          {error && <EmptyState icon="alert-circle-outline" message="Couldn't load your progress." />}

          {data && data.surahs.length === 0 && (
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
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
});
