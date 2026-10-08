import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="hifz" options={{ title: 'Hifz Review' }} />
      <Stack.Screen name="garden" options={{ title: 'Hifz Garden' }} />
      <Stack.Screen name="halaqa" options={{ title: 'Halaqa' }} />
      <Stack.Screen name="halaqa-roster" options={{ title: '' }} />
      <Stack.Screen name="halaqa-student" options={{ title: '' }} />
    </Stack>
  );
}
