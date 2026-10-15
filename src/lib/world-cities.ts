export interface WorldCity {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  /** Unicode regional-indicator flag emoji for `country` -- shown on the
   * Prayers screen's location chip (matching the real Muslim Pro app's
   * own flag+city chip, confirmed via a real device screenshot). A literal
   * per-entry field rather than a name->flag lookup function, since this
   * list is small and every entry's flag is already known at authoring
   * time -- no need to guess one from a country string at render time. */
  flag: string;
}

/** A manual fallback for users who decline location permission -- not an
 * exhaustive city database, just enough geographic spread (including
 * major Muslim-population centers) to make prayer times/qibla usable
 * without GPS. */
export const WORLD_CITIES: WorldCity[] = [
  { name: 'Mecca', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, flag: '🇸🇦' },
  { name: 'Medina', country: 'Saudi Arabia', latitude: 24.4672, longitude: 39.6024, flag: '🇸🇦' },
  { name: 'Jeddah', country: 'Saudi Arabia', latitude: 21.4858, longitude: 39.1925, flag: '🇸🇦' },
  { name: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753, flag: '🇸🇦' },
  { name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, flag: '🇦🇪' },
  { name: 'Doha', country: 'Qatar', latitude: 25.2854, longitude: 51.531, flag: '🇶🇦' },
  { name: 'Amman', country: 'Jordan', latitude: 31.9454, longitude: 35.9284, flag: '🇯🇴' },
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, flag: '🇪🇬' },
  { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, flag: '🇹🇷' },
  { name: 'Baghdad', country: 'Iraq', latitude: 33.3152, longitude: 44.3661, flag: '🇮🇶' },
  { name: 'Tehran', country: 'Iran', latitude: 35.6892, longitude: 51.389, flag: '🇮🇷' },
  { name: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, flag: '🇵🇰' },
  { name: 'Lahore', country: 'Pakistan', latitude: 31.5497, longitude: 74.3436, flag: '🇵🇰' },
  { name: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, flag: '🇧🇩' },
  { name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, flag: '🇮🇩' },
  { name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.139, longitude: 101.6869, flag: '🇲🇾' },
  // Added from the real device screenshot used to correct the Prayers
  // screen's layout (a real "Bole, Ethiopia" location chip) -- this app
  // has no Addis Ababa district-level granularity, so the city entry
  // below is the closest honest match, not a fabricated "Bole" city.
  { name: 'Addis Ababa', country: 'Ethiopia', latitude: 8.9806, longitude: 38.7578, flag: '🇪🇹' },
  { name: 'London', country: 'United Kingdom', latitude: 51.5072, longitude: -0.1276, flag: '🇬🇧' },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006, flag: '🇺🇸' },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, flag: '🇨🇦' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, flag: '🇦🇺' },
];
