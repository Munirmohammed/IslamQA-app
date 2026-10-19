  import { ArefRuqaa_400Regular, ArefRuqaa_700Bold } from '@expo-google-fonts/aref-ruqaa';
  import { NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold } from '@expo-google-fonts/noto-naskh-arabic';
  import { QueryClientProvider } from '@tanstack/react-query';
  import { useFonts } from 'expo-font';
  import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from 'expo-router';
  import * as SplashScreen from 'expo-splash-screen';
  import { useEffect, useState } from 'react';
  import { useColorScheme } from 'react-native';

  import AppTabs from '@/components/app-tabs';
  import { LaunchAnimation } from '@/components/launch-animation';
  import { Colors } from '@/constants/theme';
  import { queryClient } from '@/lib/query-client';
  import { useAuthStore } from '@/stores/auth-store';
  import { useDailyGoalsStore } from '@/stores/daily-goals-store';
  import { useThemeModeStore } from '@/stores/theme-mode-store';

// React Navigation's own DefaultTheme/DarkTheme ship a plain white
// (`rgb(255, 255, 255)`) `colors.card` -- the color every native
// Stack-header and tab bar background falls back to when a screen
// doesn't set its own `headerStyle`. No screen in this app ever did, so
// every native header has been rendering as an unthemed white bar this
// whole time, invisible in the web preview (its own header is hidden
// behind the custom web tab bar, a separate known issue). Overriding
// `card`/`background`/`text`/`primary`/`border` here fixes every native
// header and the default tab bar at once, instead of repeating
// `headerStyle`/`headerTintColor` across five separate per-tab layouts.
function buildNavigationTheme(scheme: 'light' | 'dark' | 'amoled'): Theme {
  const base = scheme === 'light' ? DefaultTheme : DarkTheme;
  const colors = Colors[scheme];
  return {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      primary: colors.primary,
      border: colors.border,
    },
  };
}

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const darkMode = useThemeModeStore((s) => s.mode);
  const hydrateThemeMode = useThemeModeStore((s) => s.hydrate);
  const isThemeModeHydrated = useThemeModeStore((s) => s.isHydrated);
  const hydrateDailyGoals = useDailyGoalsStore((s) => s.hydrate);
  const [showLaunchAnimation, setShowLaunchAnimation] = useState(true);

  const [fontsLoaded] = useFonts({
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_700Bold,
    ArefRuqaa_400Regular,
    ArefRuqaa_700Bold,
  });

  useEffect(() => {
    hydrate();
    hydrateThemeMode();
    hydrateDailyGoals();
  }, [hydrate, hydrateThemeMode, hydrateDailyGoals]);

  const ready = fontsLoaded && !isHydrating && isThemeModeHydrated;
  const resolvedScheme = colorScheme === 'dark' ? (darkMode === 'amoled' ? 'amoled' : 'dark') : 'light';

  useEffect(() => {
    // Hand off from the native splash screen to our own LaunchAnimation
    // overlay the instant both the Arabic webfont and the persisted auth
    // token are ready -- otherwise ayah text would flash in the system
    // fallback font, and the app would briefly render as "logged out"
    // before the stored token is read back.
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={buildNavigationTheme(resolvedScheme)}>
        <AppTabs />
        {showLaunchAnimation && <LaunchAnimation onFinish={() => setShowLaunchAnimation(false)} />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
