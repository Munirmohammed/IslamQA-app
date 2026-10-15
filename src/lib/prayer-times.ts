import { CalculationMethod, Coordinates, PrayerTimes, Qibla } from 'adhan';

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeEntry {
  key: PrayerKey;
  name: string;
  time: Date;
}

const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

/** Muslim World League is a widely-used global default calculation
 * method; not user-configurable yet (a reasonable fast-follow once
 * there's a settings surface to put a method picker on). Exported so the
 * Prayers screen's method chip (matching the real Muslim Pro app's own
 * "Muslim World League (MWL)" chip) shows the actual method in use
 * instead of a hardcoded string that could drift from this file. */
export const CALCULATION_METHOD_LABEL = 'Muslim World League (MWL)';

export function getPrayerTimesForDate(latitude: number, longitude: number, date: Date): PrayerTimeEntry[] {
  const coordinates = new Coordinates(latitude, longitude);
  const params = CalculationMethod.MuslimWorldLeague();
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  return (Object.keys(PRAYER_LABELS) as PrayerKey[]).map((key) => ({
    key,
    name: PRAYER_LABELS[key],
    time: prayerTimes[key],
  }));
}

/** "sunrise" isn't a prayer -- skip it when picking what's "next". Wraps
 * to fajr once isha has passed for the day. Shared by the Prayers screen
 * and Home's condensed version of the same "Now" card so the two never
 * drift out of sync. */
export function findNextPrayer(prayers: PrayerTimeEntry[], now: Date): PrayerTimeEntry | null {
  const actionable = prayers.filter((p) => p.key !== 'sunrise');
  const next = actionable.find((p) => p.time.getTime() > now.getTime());
  return next ?? actionable[0] ?? null;
}

/** The prayer period currently in effect -- Muslim Pro's real Prayers
 * screen (confirmed off a real device screenshot) outlines this row
 * (e.g. "Asr" between Asr and Maghrib) separately from the "next"
 * countdown badge on the *upcoming* prayer, and its Home/"Today" card
 * labels the same period "Now" (e.g. "Now · Asr"), showing its start
 * time as the big number with the countdown underneath counting down to
 * `findNextPrayer`'s result instead. Shared by both screens so they
 * never drift out of sync. Mirrors `findNextPrayer`'s wrap-around: before
 * Fajr, the period in effect is still the previous day's Isha, so this
 * returns the last entry rather than null. Unlike `findNextPrayer`,
 * Sunrise is included -- the period between Sunrise and Dhuhr is a real
 * (if non-prayer) period Muslim Pro still highlights. */
export function findCurrentPrayer(prayers: PrayerTimeEntry[], now: Date): PrayerTimeEntry | null {
  const past = prayers.filter((p) => p.time.getTime() <= now.getTime());
  if (past.length > 0) return past[past.length - 1];
  return prayers.length > 0 ? prayers[prayers.length - 1] : null;
}

export function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/** Bearing from the given coordinates to the Kaaba, in degrees from true
 * north (0-360). */
export function getQiblaBearing(latitude: number, longitude: number): number {
  return Qibla(new Coordinates(latitude, longitude));
}

const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;
const EARTH_RADIUS_KM = 6371;

/** Great-circle distance from the given coordinates to the Kaaba, in km
 * (haversine formula) -- the qibla map view's complement to the compass's
 * bearing, not something `adhan`'s Qibla() itself exposes. */
export function getDistanceToKaabaKm(latitude: number, longitude: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(KAABA_LATITUDE - latitude);
  const dLon = toRad(KAABA_LONGITUDE - longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latitude)) * Math.cos(toRad(KAABA_LATITUDE)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}
