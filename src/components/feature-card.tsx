import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  href: string;
}

/** Icon + label (+ optional one-line description) navigation card --
 * the one shared building block for "here are the app's features" lists,
 * used both as a full-width row (More's Islamic Tools) and as a grid tile
 * (Home's feature grid). Replaces two previously hand-rolled, visually
 * inconsistent styles (plain emoji text rows vs. nothing) with one. */
export function FeatureCard({ icon, label, description, href }: FeatureCardProps) {
  const theme = useTheme();

  return (
    <Link href={href as never} asChild>
      <Pressable style={styles.pressable}>
        {({ pressed }) => (
          <ThemedView type="backgroundElement" style={[styles.card, pressed && styles.pressed]}>
            <View style={[styles.iconBadge, { backgroundColor: theme.primaryMuted }]}>
              <Ionicons name={icon} size={22} color={theme.primary} />
            </View>
            <View style={styles.textColumn}>
              <ThemedText type="smallBold" numberOfLines={1}>
                {label}
              </ThemedText>
              {description && (
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {description}
                </ThemedText>
              )}
            </View>
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
});
