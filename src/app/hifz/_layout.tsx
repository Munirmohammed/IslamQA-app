import { Stack } from 'expo-router';

export default function HifzLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="garden" options={{ title: 'Hifz Garden' }} />
      <Stack.Screen name="coach" options={{ title: 'Tajweed Coach' }} />
    </Stack>
  );
}
