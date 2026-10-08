import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Consistent empty/error-state treatment (icon + message + optional
 * action), replacing the plain centered-gray-text pattern repeated across
 * the app's screens. */
export function EmptyState({ icon, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={40} color={theme.textSecondary} />
      <ThemedText themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>
      {actionLabel && onAction && (
        <Pressable onPress={onAction}>
          {({ pressed }) => (
            <ThemedView type="primaryMuted" style={[styles.actionButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold" themeColor="primary">
                {actionLabel}
              </ThemedText>
            </ThemedView>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  message: {
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});
