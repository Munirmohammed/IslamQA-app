// Mirrors app/api/v1/endpoints/salah.py's response model.

export interface SalahLog {
  log_date: string; // ISO date, e.g. "2026-01-01"
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  fasting: boolean;
}

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface UpdateSalahLogRequest {
  fajr?: boolean;
  dhuhr?: boolean;
  asr?: boolean;
  maghrib?: boolean;
  isha?: boolean;
  fasting?: boolean;
}
