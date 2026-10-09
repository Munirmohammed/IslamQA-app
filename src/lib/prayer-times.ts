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
 * there's a settings surface to put a method picker on). */
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

/** Bearing from the given coordinates to the Kaaba, in degrees from true
 * north (0-360). */
export function getQiblaBearing(latitude: number, longitude: number): number {
  return Qibla(new Coordinates(latitude, longitude));
}
