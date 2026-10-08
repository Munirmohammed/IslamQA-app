import { Stack } from 'expo-router';

export default function QuranLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Quran' }} />
      <Stack.Screen name="[surah]" options={{ title: '' }} />
      <Stack.Screen name="quiz" options={{ title: 'Mutashabihat Quiz' }} />
      <Stack.Screen name="tafsir" options={{ title: 'Tafsir' }} />
      {/* practice.tsx renders its own in-screen title (it used to be a
          standalone tab with no Stack header at all) -- hide the native
          one here so it doesn't duplicate. */}
      <Stack.Screen name="practice" options={{ headerShown: false }} />
      <Stack.Screen name="ask" options={{ title: 'Ask the Quran' }} />
    </Stack>
  );
}
