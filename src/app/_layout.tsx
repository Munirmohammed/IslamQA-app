import { NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold } from '@expo-google-fonts/noto-naskh-arabic';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { LaunchAnimation } from '@/components/launch-animation';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth-store';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const [showLaunchAnimation, setShowLaunchAnimation] = useState(true);

  const [fontsLoaded] = useFonts({
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_700Bold,
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const ready = fontsLoaded && !isHydrating;

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
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppTabs />
        {showLaunchAnimation && <LaunchAnimation onFinish={() => setShowLaunchAnimation(false)} />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
