/**
 * Runtime API configuration.
 *
 * The backend runs locally during development and is reached through a
 * tunnel (ngrok / `expo start --tunnel`) whose URL changes per session --
 * so this is never hardcoded. Set it via the `EXPO_PUBLIC_API_URL` env var
 * (Expo inlines `EXPO_PUBLIC_*` vars into the JS bundle at build/start
 * time) before running `npm start`, e.g.:
 *
 *   EXPO_PUBLIC_API_URL=https://abcd1234.ngrok-free.app npm start
 *
 * Falls back to the Expo-recommended localhost alias for the Android
 * emulator and the Simulator's host-loopback for iOS, which only work when
 * the backend and the simulator run on the same machine (no physical
 * device, no tunnel) -- fine for a quick local check, not for testing on
 * an actual phone.
 */
import { Platform } from 'react-native';

function defaultApiUrl(): string {
  // Android emulator maps the host machine to 10.0.2.2, not localhost.
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl();
