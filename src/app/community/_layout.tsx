import { Stack } from 'expo-router';

export default function CommunityLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="halaqa-roster" options={{ title: '' }} />
      <Stack.Screen name="halaqa-student" options={{ title: '' }} />
      <Stack.Screen name="halaqa-leaderboard" options={{ title: '' }} />
      <Stack.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
    </Stack>
  );
}
