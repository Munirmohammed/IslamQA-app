export interface WorldCity {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

/** A manual fallback for users who decline location permission -- not an
 * exhaustive city database, just enough geographic spread (including
 * major Muslim-population centers) to make prayer times/qibla usable
 * without GPS. */
export const WORLD_CITIES: WorldCity[] = [
  { name: 'Mecca', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262 },
  { name: 'Medina', country: 'Saudi Arabia', latitude: 24.4672, longitude: 39.6024 },
  { name: 'Jeddah', country: 'Saudi Arabia', latitude: 21.4858, longitude: 39.1925 },
  { name: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753 },
  { name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Doha', country: 'Qatar', latitude: 25.2854, longitude: 51.531 },
  { name: 'Amman', country: 'Jordan', latitude: 31.9454, longitude: 35.9284 },
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357 },
  { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Baghdad', country: 'Iraq', latitude: 33.3152, longitude: 44.3661 },
  { name: 'Tehran', country: 'Iran', latitude: 35.6892, longitude: 51.389 },
  { name: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011 },
  { name: 'Lahore', country: 'Pakistan', latitude: 31.5497, longitude: 74.3436 },
  { name: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125 },
  { name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456 },
  { name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.139, longitude: 101.6869 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5072, longitude: -0.1276 },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
];
