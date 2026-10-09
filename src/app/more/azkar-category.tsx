import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArabicText } from '@/components/arabic-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AZKAR_CATEGORIES, type AzkarItem } from '@/lib/azkar-data';

export default function AzkarCategoryScreen() {
  const params = useLocalSearchParams<{ index: string }>();
  const category = AZKAR_CATEGORIES[Number(params.index)];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: category?.name ?? '' }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          {category?.chapters.map((chapter, chapterIndex) => (
            <View key={chapterIndex} style={styles.chapter}>
              <ThemedText type="smallBold">{chapter.name}</ThemedText>
              {chapter.items.map((item, itemIndex) => (
                <DuaCard key={itemIndex} item={item} />
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function DuaCard({ item }: { item: AzkarItem }) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ArabicText size="ayahCompact">{item.arabic}</ArabicText>
      <ThemedText themeColor="textSecondary">{item.translation}</ThemedText>
      {item.reference && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.reference}>
          {item.reference}
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
    gap: Spacing.five,
  },
  chapter: {
    gap: Spacing.three,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  reference: {
    fontStyle: 'italic',
  },
});
