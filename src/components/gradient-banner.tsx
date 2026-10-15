import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface GradientBannerProps {
  href: string;
  title: string;
  /** Only used in the "feature" variant -- a second line under the title. */
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** 'compact': one line of text + a trailing arrow, matching Muslim Pro's
   * slim "Unlock 24 hours of ad-free experience ->" pill. 'feature': an
   * icon circle + two lines of text + bold CTA, matching its taller "Get
   * Premium" card. Both reuse the same diagonal brand gradient -- see
   * `gradientBannerStart`/`gradientBannerEnd` in theme.ts for where the
   * colors came from. */
  variant?: 'compact' | 'feature';
}

/** Muslim Pro's real Home/"Today" tab (confirmed off a real device
 * screenshot, not a marketing screenshot) uses this exact diagonal
 * green->purple gradient pill shape twice: once as a slim "Unlock 24
 * hours of ad-free experience" strip, once as a taller "Get Premium"
 * card. This app has no ads or premium tier to upsell, so both calls
 * below point this same shape at real features instead (the community
 * leaderboard, halaqas) -- see home/index.tsx for which. */
export function GradientBanner({ href, title, subtitle, icon, variant = 'compact' }: GradientBannerProps) {
  const theme = useTheme();

  return (
    <Link href={href as never} asChild>
      <Pressable>
        {({ pressed }) => (
          <LinearGradient
            colors={[theme.gradientBannerStart, theme.gradientBannerEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.banner,
              variant === 'compact' ? styles.compact : styles.feature,
              pressed && styles.pressed,
            ]}>
            {variant === 'feature' && icon && (
              <View style={styles.iconCircle}>
                <Ionicons name={icon} size={20} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.textColumn}>
              <ThemedText type={variant === 'feature' ? 'small' : 'smallBold'} style={styles.whiteText}>
                {title}
              </ThemedText>
              {subtitle && (
                <ThemedText type="smallBold" style={styles.whiteText}>
                  {subtitle}
                </ThemedText>
              )}
            </View>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </LinearGradient>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.card,
    gap: Spacing.three,
  },
  compact: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.pill,
  },
  feature: {
    padding: Spacing.three,
  },
  pressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    flexShrink: 0,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  whiteText: {
    color: '#FFFFFF',
  },
});
