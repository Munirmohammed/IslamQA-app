import { Stack } from 'expo-router';

export default function MoreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="prayer-times" options={{ headerShown: false }} />
      <Stack.Screen name="qibla" options={{ headerShown: false }} />
      <Stack.Screen name="calendar" options={{ headerShown: false }} />
      <Stack.Screen name="azkar" options={{ headerShown: false }} />
      <Stack.Screen name="azkar-category" options={{ title: '' }} />
      <Stack.Screen name="hadith" options={{ headerShown: false }} />
      <Stack.Screen name="hadith-collection" options={{ title: '' }} />
    </Stack>
  );
}
