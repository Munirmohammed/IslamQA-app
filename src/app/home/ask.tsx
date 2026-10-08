import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTafsirSearch } from '@/features/tafsir/api';
import { useTheme } from '@/hooks/use-theme';

import type { TafsirSearchResult } from '@/features/tafsir/types';

/**
 * Free-text tafsir search, styled deliberately as retrieval -- not a chat
 * UI -- per HANDOFF's F5 note: this is a documented departure from routing
 * through a generative model (the backend's own older hybrid/simple AI
 * services were found to be built on largely-retired free-tier endpoints
 * with keyword-template fallbacks, not a solid foundation). Every result
 * cites the real Ibn Kathir passage it found; there's no synthesized
 * answer to attribute to anyone else.
 */
export default function AskTheQuranScreen() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const theme = useTheme();

  const { data, isLoading, error } = useTafsirSearch(submittedQuery);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Ask the Quran
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Searches real Ibn Kathir commentary for passages relevant to your question --
            this looks things up, it doesn&apos;t generate an answer.
          </ThemedText>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            placeholder="e.g. What does the Quran say about patience?"
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => setSubmittedQuery(query)}
            returnKeyType="search"
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          />

          <Pressable onPress={() => setSubmittedQuery(query)} disabled={query.trim().length < 2}>
            {({ pressed }) => (
              <ThemedView
                type="primaryMuted"
                style={[styles.searchButton, (pressed || query.trim().length < 2) && styles.ctaPressed]}>
                <ThemedText type="smallBold" themeColor="primary">
                  Search
                </ThemedText>
              </ThemedView>
            )}
          </Pressable>
        </View>

        {isLoading && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Searching…
          </ThemedText>
        )}

        {error && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Couldn&apos;t reach the server.
          </ThemedText>
        )}

        {data && data.results.length === 0 && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            No tafsir passages matched that question -- try different wording.
          </ThemedText>
        )}

        {data && data.results.length > 0 && (
          <FlatList
            data={data.results}
            keyExtractor={(item) => `${item.surah_number}:${item.ayah_from}`}
            renderItem={({ item }) => <ResultCard result={item} />}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function ResultCard({ result }: { result: TafsirSearchResult }) {
  const ayahRef =
    result.ayah_to > result.ayah_from
      ? `${result.surah_number}:${result.ayah_from}-${result.ayah_to}`
      : `${result.surah_number}:${result.ayah_from}`;

  return (
    <Link
      href={{
        pathname: '/read/tafsir',
        params: { surah: result.surah_number, ayah: result.ayah_from, surahNameEn: '' },
      }}
      asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView type="backgroundElement" style={[styles.card, pressed && styles.cardPressed]}>
            <ThemedText type="smallBold" themeColor="primary">
              {ayahRef}
            </ThemedText>
            <ThemedText numberOfLines={4} themeColor="textSecondary">
              {result.text_plain}
            </ThemedText>
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'stretch',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  searchButton: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
  },
  ctaPressed: {
    opacity: 0.6,
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
  separator: {
    height: Spacing.two,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardPressed: {
    opacity: 0.7,
  },
});
