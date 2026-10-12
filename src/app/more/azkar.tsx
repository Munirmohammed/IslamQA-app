import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { AZKAR_CATEGORIES } from '@/lib/azkar-data';

// Muslim Pro's actual Azkar screen (its own Play Store screenshots) is a
// pastel multi-color category grid, not a single-brand-color list -- the
// exact tones in that screenshot sit behind a blended marketing photo, so
// precise pixel-sampling (the method used for the app's core palette)
// isn't reliable here. This is a reasonable pastel set inspired by what's
// visible, applied cyclically per category rather than hand-picked per
// name, and an icon chosen per category's actual meaning.
const TILE_COLORS = ['#D9EDD9', '#F0E6D2', '#E3DCF0', '#F5E6B8', '#D7E3E8'];

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Morning & Evening': 'partly-sunny-outline',
  'Home & Family': 'home-outline',
  'Food & Drink': 'restaurant-outline',
  'Joy & Distress': 'happy-outline',
  Travel: 'airplane-outline',
  Prayer: 'hand-left-outline',
  'Praising Allah': 'star-outline',
  'Hajj & Umrah': 'cube-outline',
  'Good Etiquette': 'thumbs-up-outline',
  Nature: 'leaf-outline',
  'Sickness & Death': 'medkit-outline',
};

export default function AzkarScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedText type="title" style={styles.title}>
        Dua &amp; Azkar
      </ThemedText>

      <FlashList
        data={AZKAR_CATEGORIES}
        numColumns={2}
        keyExtractor={(_, index) => String(index)}
        renderItem={({ item, index }) => (
          <Link href={{ pathname: '/more/azkar-category', params: { index } }} asChild>
            <Pressable style={styles.tileWrapper}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.tile,
                    { backgroundColor: TILE_COLORS[index % TILE_COLORS.length] },
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons
                    name={CATEGORY_ICONS[item.name] ?? 'book-outline'}
                    size={22}
                    color="#1A1A1A"
                  />
                  <ThemedText type="smallBold" style={styles.tileText}>
                    {item.name}
                  </ThemedText>
                  <ThemedText type="small" style={styles.tileText}>
                    {item.chapters.length} dua{item.chapters.length === 1 ? '' : 's'}
                  </ThemedText>
                </View>
              )}
            </Pressable>
          </Link>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Spacing.six,
  },
  title: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  tileWrapper: {
    flex: 1,
    padding: Spacing.one,
  },
  tile: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: 2,
    minHeight: 96,
    justifyContent: 'space-between',
  },
  // Tile backgrounds are fixed pastel hexes, independent of the app's own
  // light/dark theme (same reasoning as the reading themes) -- text on
  // them is a fixed dark ink, not ThemedText's theme-driven color, since
  // these tiles don't invert in dark mode.
  tileText: {
    color: '#1A1A1A',
  },
  pressed: {
    opacity: 0.7,
  },
});
