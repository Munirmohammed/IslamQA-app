/**
 * Auth token state (Zustand, client state) -- the access token itself is
 * the source of truth for "am I logged in"; the actual user profile is
 * server state and belongs to TanStack Query (see features/auth/api.ts's
 * useMe()), not duplicated here.
 */
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const ACCESS_TOKEN_KEY = 'islamqa_access_token';
const REFRESH_TOKEN_KEY = 'islamqa_refresh_token';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  /** True until the initial SecureStore read on app launch resolves. */
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  clearTokens: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isHydrating: true,

  hydrate: async () => {
    // isHydrating gates the entire app's first render (see _layout.tsx), so
    // a thrown read here -- SecureStore has no web implementation, and a
    // real device's keychain/keystore can fail too -- must never leave the
    // app stuck on a blank screen forever; fall back to logged-out instead.
    try {
      const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      ]);
      set({ accessToken, refreshToken, isHydrating: false });
    } catch (error) {
      console.warn('Failed to read persisted auth tokens, starting logged out:', error);
      set({ accessToken: null, refreshToken: null, isHydrating: false });
    }
  },

  setTokens: async (accessToken, refreshToken) => {
    // Update in-memory state unconditionally: SecureStore has no web
    // implementation (throws), and a real device's keychain/keystore can
    // fail too. Persistence failing shouldn't also fail login -- it just
    // means the session won't survive a reload, same tradeoff hydrate()
    // already makes on the read side.
    try {
      await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      ]);
    } catch (error) {
      console.warn('Failed to persist auth tokens, session will not survive a reload:', error);
    }
    set({ accessToken, refreshToken });
  },

  clearTokens: async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      ]);
    } catch (error) {
      console.warn('Failed to clear persisted auth tokens:', error);
    }
    set({ accessToken: null, refreshToken: null });
  },
}));
