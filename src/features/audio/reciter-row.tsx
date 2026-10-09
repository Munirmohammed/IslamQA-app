import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import type { Reciter } from './types';

interface ReciterRowProps {
  reciter: Reciter;
  selected: boolean;
  onPress: () => void;
}

/** One row in a reciter picker list -- shared by the surah-level and
 * (future) ayah-level pickers so the visual treatment stays consistent. */
export function ReciterRow({ reciter, selected, onPress }: ReciterRowProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.pressed]}>
          <ThemedText type="small">
            {reciter.name}
            {reciter.style ? ` (${reciter.style})` : ''}
          </ThemedText>
          {selected && <Ionicons name="checkmark-circle" size={18} color={theme.primary} />}
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  pressed: {
    opacity: 0.6,
  },
});
