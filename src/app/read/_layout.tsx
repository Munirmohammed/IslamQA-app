import { Stack } from 'expo-router';

export default function ReadLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Quran' }} />
      <Stack.Screen name="[surah]" options={{ title: '' }} />
    </Stack>
  );
}
