import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface SettingsRowItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: string;
}

/** A grouped, divided settings list -- icon in a fixed-width column (so
 * every row's title lines up regardless of glyph width), title, disclosure
 * chevron. Sourced from Quran.com's actual Settings screen
 * (github.com/quran/quran-ios, Features/SettingsFeature/Sources/
 * SettingsRootView.swift + NoorListIcon's fixed `width = 30` icon column),
 * not FeatureCard's rounded-card-per-item look -- a real settings screen
 * reading as a classic grouped list (like iOS's own Settings app) is the
 * correct pattern for *this* screen specifically. FeatureCard stays as-is
 * for Home's feature-grid tiles, a genuinely different surface. */
export function SettingsSection({ items }: { items: SettingsRowItem[] }) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      {items.map((item, index) => (
        <Fragment key={item.href}>
          {index > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
          <Link href={item.href as never} asChild>
            <Pressable>
              {({ pressed }) => (
                <View style={[styles.row, pressed && { backgroundColor: theme.backgroundSelected }]}>
                  <View style={styles.iconColumn}>
                    <Ionicons name={item.icon} size={20} color={theme.primary} />
                  </View>
                  <ThemedText style={styles.label}>{item.label}</ThemedText>
                  <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
                </View>
              )}
            </Pressable>
          </Link>
        </Fragment>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  // Fixed-width column every icon centers in, the same convention
  // Quran.com's NoorListIcon uses, so row titles align across rows
  // regardless of which glyph (a wide "cash" vs. a narrow "time") sits in
  // the column.
  iconColumn: {
    width: 24,
    alignItems: 'center',
  },
  label: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.three + 24 + Spacing.three,
  },
});
