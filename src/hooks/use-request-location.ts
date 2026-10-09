import * as Location from 'expo-location';
import { useState } from 'react';

import { useLocationStore } from '@/stores/location-store';

/** Requests foreground location permission and, if granted, a GPS fix --
 * only ever called from an explicit user tap (never on mount), matching
 * this app's existing "don't ask before the user has expressed intent"
 * convention (see RecordButton's mic-permission handling). */
export function useRequestLocation() {
  const setLocation = useLocationStore((s) => s.setLocation);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async (): Promise<boolean> => {
    setIsRequesting(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError("Location permission denied -- pick a city below instead.");
        return false;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation(coords.latitude, coords.longitude, 'gps');
      return true;
    } catch {
      setError("Couldn't get your location -- pick a city below instead.");
      return false;
    } finally {
      setIsRequesting(false);
    }
  };

  return { request, isRequesting, error };
}
