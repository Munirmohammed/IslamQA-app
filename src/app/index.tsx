import { Redirect } from 'expo-router';

// Home lives at /home (it needs its own nested Stack, under home/_layout.tsx,
// to support pushing the leaderboard screen -- NativeTabs doesn't provide a
// stack for its tab routes the way the JS <Tabs/> mock header did). The app
// still cold-starts at the bare "/", which otherwise has no matching route
// now that index.tsx moved out of this spot.
export default function RootIndexRedirect() {
  return <Redirect href="/home" />;
}
