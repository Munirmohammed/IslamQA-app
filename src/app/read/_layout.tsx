import { Stack } from 'expo-router';

export default function ReadLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Quran' }} />
      <Stack.Screen name="[surah]" options={{ title: '' }} />
      <Stack.Screen name="quiz" options={{ title: 'Mutashabihat Quiz' }} />
      <Stack.Screen name="tafsir" options={{ title: 'Tafsir' }} />
    </Stack>
  );
}
