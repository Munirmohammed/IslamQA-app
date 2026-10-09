import { FlashList } from '@shopify/flash-list';
import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useHadithCollections } from '@/features/hadith/api';

export default function HadithCollectionsScreen() {
  const { data, isLoading, error } = useHadithCollections();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Hadith
        </ThemedText>

        {isLoading && (
          <>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} height={56} borderRadius={Spacing.three} style={styles.skeletonRow} />
            ))}
          </>
        )}

        {error && <EmptyState icon="cloud-offline-outline" message="Couldn't reach the server." />}

        {data && (
          <FlashList
            data={data}
            keyExtractor={(item) => item.slug}
            renderItem={({ item }) => (
              <Link href={{ pathname: '/more/hadith-collection', params: { slug: item.slug, name: item.name } }} asChild>
                <Pressable>
                  {({ pressed }) => (
                    <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.pressed]}>
                      <ThemedText type="smallBold">{item.name}</ThemedText>
                    </ThemedView>
                  )}
                </Pressable>
              </Link>
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          />
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
    paddingTop: Spacing.six,
  },
  title: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  skeletonRow: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  separator: {
    height: Spacing.two,
  },
  row: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
