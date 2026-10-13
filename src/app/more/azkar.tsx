import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AzkarTileTints, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AZKAR_CATEGORIES } from '@/lib/azkar-data';

/** Maps each category name to an Ionicons glyph standing in for Muslim
 * Pro's actual tile illustrations (small colored drawings -- hands, a
 * prayer mat, a plane, a drink -- that aren't buildable as fabricated
 * assets here). `cube-outline` for Hajj & Umrah reuses the same glyph the
 * Qibla screen already uses for the Kaaba, rather than a second one-off. */
const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Morning & Evening': 'partly-sunny-outline',
  'Home & Family': 'home-outline',
  'Food & Drink': 'restaurant-outline',
  'Joy & Distress': 'people-outline',
  Travel: 'airplane-outline',
  Prayer: 'body-outline',
  'Praising Allah': 'sparkles-outline',
  'Hajj & Umrah': 'cube-outline',
  'Good Etiquette': 'thumbs-up-outline',
  Nature: 'leaf-outline',
  'Sickness & Death': 'medkit-outline',
};

/** Muslim Pro's actual Dua/Azkar screen (confirmed via its real Play
 * Store screenshots) is a pastel tile grid -- icon, name, chapter count
 * per tile -- not a plain single-column settings-style list, which is
 * what this replaces. Tints cycle through `AzkarTileTints` (derived from
 * this app's own existing accent hues, see theme.ts) instead of a flat
 * card color repeated 11 times. */
export default function AzkarScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>
            Dua &amp; Azkar
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Start every action with a dua.
          </ThemedText>

          <View style={styles.grid}>
            {AZKAR_CATEGORIES.map((category, index) => {
              const tint = AzkarTileTints[index % AzkarTileTints.length];
              const icon = CATEGORY_ICONS[category.name] ?? 'flower-outline';
              return (
                <Link
                  key={category.name}
                  href={{ pathname: '/more/azkar-category', params: { index } }}
                  asChild>
                  <Pressable style={styles.gridItem}>
                    {({ pressed }) => (
                      <View style={[styles.tile, { backgroundColor: theme[tint] }, pressed && styles.pressed]}>
                        <Ionicons name={icon} size={26} color={theme.primary} />
                        <ThemedText type="smallBold" numberOfLines={2} style={styles.tileLabel}>
                          {category.name}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {category.chapters.length} chapter{category.chapters.length === 1 ? '' : 's'}
                        </ThemedText>
                      </View>
                    )}
                  </Pressable>
                </Link>
              );
            })}
          </View>
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
    paddingTop: Spacing.six,
    paddingBottom: Spacing.six,
  },
  title: {
    marginBottom: Spacing.half,
  },
  subtitle: {
    marginBottom: Spacing.four,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  gridItem: {
    width: '47%',
    flexGrow: 1,
  },
  tile: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.one,
    minHeight: 112,
    justifyContent: 'space-between',
  },
  tileLabel: {
    marginTop: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
});
