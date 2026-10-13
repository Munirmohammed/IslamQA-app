import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface AvatarProps {
  /** Username or circle name -- its first letter(s) become the initials.
   * This app has no profile-picture field on `User`, so an initials
   * circle is the honest default (the same fallback Muslim Pro, WhatsApp,
   * etc. use for any contact without a photo), not a fabricated photo or
   * generic silhouette. */
  label: string;
  size?: number;
}

/** A colored initials circle -- the avatar convention that makes a list of
 * people/circles read as a roster of real, distinct members rather than a
 * stack of plain text rows (the single biggest density lever Muslim Pro's
 * Ummah feed and leaderboard rows use). Reuses the `primaryMuted`/`primary`
 * pairing already used for badges elsewhere (e.g. home's ContinueReadingCard
 * ayah badge) instead of inventing a new color. */
export function Avatar({ label, size = 40 }: AvatarProps) {
  const theme = useTheme();
  const initials = getInitials(label);

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.primaryMuted },
      ]}>
      <ThemedText type="smallBold" themeColor="primary" style={{ fontSize: size * 0.4, lineHeight: size * 0.4 + 2 }}>
        {initials}
      </ThemedText>
    </View>
  );
}

function getInitials(label: string): string {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
