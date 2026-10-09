import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface SpeedControlProps {
  speed: number;
  onChange: (speed: number) => void;
}

/** A row of playback-speed chips (0.5x-2x) for drilling a passage slower
 * or reviewing it faster -- a staple of every competitor's recitation
 * player that this app's listening feature otherwise lacked entirely. */
export function SpeedControl({ speed, onChange }: SpeedControlProps) {
  return (
    <View style={styles.row}>
      {SPEEDS.map((value) => {
        const selected = value === speed;
        return (
          <Pressable key={value} onPress={() => onChange(value)} hitSlop={4}>
            {({ pressed }) => (
              <ThemedView
                type={selected ? 'primaryMuted' : 'backgroundSelected'}
                style={[styles.chip, pressed && styles.pressed]}>
                <ThemedText type="small" themeColor={selected ? 'primary' : 'textSecondary'}>
                  {value}x
                </ThemedText>
              </ThemedView>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    borderRadius: Spacing.two,
    paddingVertical: 4,
    paddingHorizontal: Spacing.three,
  },
  pressed: {
    opacity: 0.6,
  },
});
