/** Formats a timestamp the way Muslim Pro's own Recents strip does
 * (measured from its real Play Store screenshots): "Just now" for the
 * first minute, then a compact "Nm"/"Nh"/"Nd" for the first week, then a
 * plain short date ("03/12/25") beyond that. */
export function formatRecentTimestamp(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;

  const mm = String(then.getMonth() + 1).padStart(2, '0');
  const dd = String(then.getDate()).padStart(2, '0');
  const yy = String(then.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}
