import { gregorianToHijri } from '@tabby_ai/hijri-converter';

// The 12 Hijri months, in order. Index 0 unused so HIJRI_MONTHS[month]
// matches the library's 1-indexed month number directly.
export const HIJRI_MONTHS = [
  '',
  'Muharram',
  'Safar',
  "Rabi' al-awwal",
  "Rabi' al-thani",
  'Jumada al-awwal',
  'Jumada al-thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
] as const;

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}

/**
 * Converts a Gregorian date to Hijri using a Umm al-Qura-based arithmetic
 * conversion (`@tabby_ai/hijri-converter`) -- NOT local moon-sighting.
 * This is the same honest caveat every tabular/calculated Hijri calendar
 * needs: the date shown here is a best-effort approximation for display,
 * and can be off by a day from the Hijri date a local mosque or religious
 * authority announces based on an actual moon sighting. Don't present
 * this as authoritative for fasting/Eid start dates.
 */
export function toHijri(date: Date): HijriDate {
  const { year, month, day } = gregorianToHijri({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
  return { year, month, day, monthName: HIJRI_MONTHS[month] };
}
