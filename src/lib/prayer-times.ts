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
