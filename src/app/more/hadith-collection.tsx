import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useHadithPage } from '@/features/hadith/api';

import type { Hadith } from '@/features/hadith/types';

const PAGE_SIZE = 20;

export default function HadithCollectionScreen() {
  const params = useLocalSearchParams<{ slug: string; name: string }>();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useHadithPage(params.slug, page, PAGE_SIZE);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: params.name }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          {isLoading && (
            <>
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} height={100} borderRadius={Spacing.three} />
              ))}
            </>
          )}

          {error && (
            <EmptyState icon="cloud-offline-outline" message="Couldn't load this collection." />
          )}

          {data &&
            data.hadiths.map((hadith) => <HadithCard key={hadith.hadithnumber} hadith={hadith} />)}

          {data && (
            <View style={styles.pager}>
              <Pressable
                disabled={page <= 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                style={styles.pagerButton}>
                {({ pressed }) => (
                  <ThemedView
                    type="backgroundElement"
                    style={[styles.pagerButtonInner, (pressed || page <= 1) && styles.pagerDisabled]}>
                    <ThemedText type="smallBold">← Prev</ThemedText>
                  </ThemedView>
                )}
              </Pressable>

              <ThemedText type="small" themeColor="textSecondary">
                Page {page} of {totalPages}
              </ThemedText>

              <Pressable
                disabled={page >= totalPages}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={styles.pagerButton}>
                {({ pressed }) => (
                  <ThemedView
                    type="backgroundElement"
                    style={[
                      styles.pagerButtonInner,
                      (pressed || page >= totalPages) && styles.pagerDisabled,
                    ]}>
                    <ThemedText type="smallBold">Next →</ThemedText>
                  </ThemedView>
                )}
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function HadithCard({ hadith }: { hadith: Hadith }) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        #{hadith.hadithnumber}
      </ThemedText>
      <ThemedText>{hadith.text}</ThemedText>
      {hadith.grades.length > 0 && (
        <ThemedText type="small" themeColor="primary">
          {hadith.grades.map((g) => `${g.name}: ${g.grade}`).join(' · ')}
        </ThemedText>
      )}
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
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
  },
  pagerButton: {
    flexShrink: 0,
  },
  pagerButtonInner: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  pagerDisabled: {
    opacity: 0.4,
  },
});
