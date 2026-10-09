import { FlashList } from '@shopify/flash-list';
import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AZKAR_CATEGORIES } from '@/lib/azkar-data';

export default function AzkarScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Dua &amp; Azkar
        </ThemedText>

        <FlashList
          data={AZKAR_CATEGORIES}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item, index }) => (
            <Link href={{ pathname: '/more/azkar-category', params: { index } }} asChild>
              <Pressable>
                {({ pressed }) => (
                  <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.pressed]}>
                    <ThemedText type="smallBold">{item.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.chapters.length} dua{item.chapters.length === 1 ? '' : 's'}
                    </ThemedText>
                  </ThemedView>
                )}
              </Pressable>
            </Link>
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
        />
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
    fontSize: 32,
    lineHeight: 38,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  separator: {
    height: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Spacing.three,
    padding: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
