import { Ionicons } from '@expo/vector-icons';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Outline by default, filled when the tab is active -- matches the native
// tab bar's `sf={{ default, selected }}` icon pairing (confirmed as the
// convention Quran.com's own app uses throughout its tab bar).
const TAB_ICONS: Record<string, { outline: keyof typeof Ionicons.glyphMap; filled: keyof typeof Ionicons.glyphMap }> = {
  Home: { outline: 'home-outline', filled: 'home' },
  Quran: { outline: 'book-outline', filled: 'book' },
  Hifz: { outline: 'leaf-outline', filled: 'leaf' },
  Community: { outline: 'people-outline', filled: 'people' },
  More: { outline: 'person-outline', filled: 'person' },
};

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/home" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="quran" href="/quran" asChild>
            <TabButton>Quran</TabButton>
          </TabTrigger>
          <TabTrigger name="hifz" href="/hifz" asChild>
            <TabButton>Hifz</TabButton>
          </TabTrigger>
          <TabTrigger name="community" href="/community" asChild>
            <TabButton>Community</TabButton>
          </TabTrigger>
          <TabTrigger name="more" href="/more" asChild>
            <TabButton>More</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const theme = useTheme();
  const label = typeof children === 'string' ? children : '';
  const icon = TAB_ICONS[label];

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      {/* Suppress ThemedView's default "backgroundElement" shadow here --
          these buttons already sit inside the nav bar pill's own shadow,
          and a shadow on every individual tab would look cluttered. */}
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.tabButtonView, styles.noShadow]}>
        {icon && (
          <Ionicons
            name={isFocused ? icon.filled : icon.outline}
            size={16}
            color={isFocused ? theme.text : theme.textSecondary}
          />
        )}
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          Qalam
        </ThemedText>

        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.card,
  },
  noShadow: {
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
});
