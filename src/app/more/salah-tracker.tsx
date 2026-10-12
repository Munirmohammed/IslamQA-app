import { Redirect } from 'expo-router';

/** Muslim Pro's "Prayers" screen merges prayer times and the prayed/
 * fasting tracker into one view; `/more/prayer-times` now does the same,
 * so this route just forwards there instead of keeping a duplicate
 * screen (and breaking anyone who still has this link/tab-history
 * entry). */
export default function SalahTrackerRedirect() {
  return <Redirect href="/more/prayer-times" />;
}
