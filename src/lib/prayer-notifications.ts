import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import type { PrayerKey, PrayerTimeEntry } from './prayer-times';

/** Real local-notification scheduling for the Prayers screen's per-row
 * bell toggle -- not a decorative control. Per the SDK 57 docs
 * (docs.expo.dev/versions/v57.0.0/sdk/notifications), local notifications
 * work in Expo Go on both platforms (only *remote* push was dropped from
 * Expo Go); the docs don't list web as a supported platform at all, so
 * every function here is a deliberate no-op on web instead of throwing.
 *
 * Scope: this only schedules *today's* occurrence of each enabled prayer,
 * recomputed every time the Prayers screen mounts (see
 * `reconcilePrayerNotifications`'s call site). A real "every day, forever"
 * reminder needs a background task to reschedule after midnight while the
 * app isn't open -- genuinely out of scope here (no background-task
 * plumbing exists yet in this app) -- so the honest behavior is: enabled
 * prayers notify today (and any future day the app happens to be opened
 * on), not days the app is never opened. */

// Without a handler, a scheduled notification silently does nothing while
// the app is foregrounded (see docs above) -- set once at module scope so
// it's registered as soon as anything imports this file.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

let permissionRequested = false;

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  // Only ask once per app session -- repeatedly re-prompting every time a
  // bell is toggled after the user already said no is the kind of
  // nagging this app avoids elsewhere (see RecordButton's mic permission).
  if (permissionRequested) return false;
  permissionRequested = true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function identifierFor(key: PrayerKey, date: Date): string {
  // One stable id per prayer *per calendar day* -- lets a reconcile pass
  // safely cancel-then-reschedule without guessing whether something was
  // already scheduled.
  const dateKey = date.toISOString().slice(0, 10);
  return `prayer-${key}-${dateKey}`;
}

const PRAYER_NOTIFICATION_BODY: Record<PrayerKey, string> = {
  fajr: 'It’s time for Fajr prayer.',
  sunrise: 'The sun is rising.',
  dhuhr: 'It’s time for Dhuhr prayer.',
  asr: 'It’s time for Asr prayer.',
  maghrib: 'It’s time for Maghrib prayer.',
  isha: 'It’s time for Isha prayer.',
};

/** Cancels and (if the time hasn't passed yet) reschedules today's local
 * notification for every prayer whose key is in `enabledKeys`, and cancels
 * any for keys that aren't. Safe to call on every Prayers screen mount and
 * every time the enabled set changes -- it's always a full reconcile
 * against `prayers`/`now`, never an incremental diff, so it can't drift
 * out of sync with what's actually scheduled. */
export async function reconcilePrayerNotifications(
  prayers: PrayerTimeEntry[],
  now: Date,
  enabledKeys: ReadonlySet<PrayerKey>
): Promise<void> {
  if (Platform.OS === 'web') return;

  const results = await Promise.allSettled(
    prayers.map(async (prayer) => {
      const id = identifierFor(prayer.key, prayer.time);
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

      const isFuture = prayer.time.getTime() > now.getTime();
      if (!enabledKeys.has(prayer.key) || !isFuture) return;

      const granted = await ensurePermission();
      if (!granted) return;

      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: { title: prayer.name, body: PRAYER_NOTIFICATION_BODY[prayer.key] },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: prayer.time },
      });
    })
  );

  const failure = results.find((r) => r.status === 'rejected');
  if (failure && failure.status === 'rejected') {
    console.warn('Failed to reconcile a prayer notification:', failure.reason);
  }
}
