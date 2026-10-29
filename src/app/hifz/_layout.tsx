import { Stack } from 'expo-router';

export default function HifzLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* headerShown: false -- garden.tsx renders its own styled back
          button + title matching the approved design, replacing the
          native bar so the two don't stack. */}
      <Stack.Screen name="garden" options={{ headerShown: false }} />
      <Stack.Screen name="coach" options={{ title: 'Tajweed Coach' }} />
    </Stack>
  );
}
