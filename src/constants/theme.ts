/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/** Muslim Pro's actual palette, measured directly from its real Play
 * Store screenshots (pixel-sampled via Pillow, not eyeballed) --
 * `#003030`/`#002424` dominate its dark "Today"/Prayers/Quran-list
 * screens (a deep forest teal, not navy or near-black), and `#48A884` is
 * its real accent green. Muslim Pro's own cream (`#FCF0D8`, its "Paper"
 * Quran-reading theme specifically) was tried here first as this app's
 * *general* light background -- a mistake, since every other screen
 * measured (Prayers, Quran list, Today) is the dark teal, not cream, and
 * it read as "yellow" rather than "the green Muslim Pro app." The light
 * background below is a light tint of the real green instead; the
 * existing Quran-reading-only theme picker (`ReadingThemes` below, a
 * separate, still-valid feature sourced from Quran.com) is untouched and
 * still offers an actual cream-toned "Paper" option for anyone who wants
 * one, just not as this app's default. */
const MUSLIM_PRO_DARK_BG = '#002424';
const MUSLIM_PRO_DARK_CARD = '#003030';
const MUSLIM_PRO_DARK_TEXT = '#FCFCFC';
const MUSLIM_PRO_GREEN = '#48A884';
const MUSLIM_PRO_LIGHT_BG = mixHex('#FFFFFF', MUSLIM_PRO_GREEN, 0.08);
const MUSLIM_PRO_LIGHT_TEXT = '#1A1A1A';

export const Colors = {
  light: {
    text: MUSLIM_PRO_LIGHT_TEXT,
    background: MUSLIM_PRO_LIGHT_BG,
    backgroundElement: mixHex(MUSLIM_PRO_LIGHT_BG, MUSLIM_PRO_LIGHT_TEXT, 0.06),
    backgroundSelected: mixHex(MUSLIM_PRO_LIGHT_BG, MUSLIM_PRO_LIGHT_TEXT, 0.12),
    textSecondary: mixHex(MUSLIM_PRO_LIGHT_TEXT, MUSLIM_PRO_LIGHT_BG, 0.45),
    primary: '#0F6B4F',
    primaryMuted: mixHex(MUSLIM_PRO_LIGHT_BG, '#0F6B4F', 0.14),
    accent: '#C9A24B',
    border: mixHex(MUSLIM_PRO_LIGHT_BG, MUSLIM_PRO_LIGHT_TEXT, 0.1),
    error: '#C0392B',
    success: '#2E8B57',
    mistakeModerate: '#D9762B',
    mistakeLow: '#C9A23B',
    recitationHighlight: '#DC7702',
    // Derived from the real background rather than a fixed value, so it
    // stays visibly distinct whatever the background actually is instead
    // of silently matching it (the previous fixed `#FBEBD7` nearly
    // vanished against an earlier cream background this app no longer
    // uses -- see MUSLIM_PRO_LIGHT_BG's own comment above).
    recitationHighlightMuted: mixHex(MUSLIM_PRO_LIGHT_BG, '#DC7702', 0.22),
  },
  dark: {
    text: MUSLIM_PRO_DARK_TEXT,
    background: MUSLIM_PRO_DARK_BG,
    backgroundElement: MUSLIM_PRO_DARK_CARD,
    backgroundSelected: mixHex(MUSLIM_PRO_DARK_CARD, MUSLIM_PRO_DARK_TEXT, 0.1),
    textSecondary: '#A8C4B8',
    primary: MUSLIM_PRO_GREEN,
    primaryMuted: mixHex(MUSLIM_PRO_DARK_CARD, MUSLIM_PRO_GREEN, 0.2),
    accent: '#D8B463',
    border: mixHex(MUSLIM_PRO_DARK_CARD, MUSLIM_PRO_DARK_TEXT, 0.12),
    error: '#E0574A',
    success: '#3DAF72',
    mistakeModerate: '#E68A42',
    mistakeLow: '#D6B34C',
    recitationHighlight: '#EF911D',
    recitationHighlightMuted: '#2E2112',
  },
} as const;

/** Tarteel's own Advanced Analytics documents a 4-tier mistake-frequency
 * scale for "which surahs are strong vs. need more work" -- red (worst) ->
 * orange -> yellow -> green (best), applied regardless of mistake type.
 * Tarteel doesn't publish exact hex values (closed source, only color
 * *names* in their support docs), so `error`/`success` anchor the two
 * extremes and `mistakeModerate`/`mistakeLow` fill the middle two steps;
 * `correctRateColor` maps a 0-1 accuracy rate onto this scale. */
interface MistakeScaleColors {
  error: string;
  mistakeModerate: string;
  mistakeLow: string;
  success: string;
}

export function correctRateColor(theme: MistakeScaleColors, correctRate: number): string {
  if (correctRate < 0.5) return theme.error;
  if (correctRate < 0.7) return theme.mistakeModerate;
  if (correctRate < 0.85) return theme.mistakeLow;
  return theme.success;
}

/** Arabic (Uthmani Quran) type scale -- deliberately separate from the
 * Latin type scale: Arabic script needs larger sizes and more line-height
 * to read comfortably, and tajweed-colored spans (Backend Phase 5) need
 * room to breathe. */
export const ArabicFonts = {
  // Noto Naskh Arabic: reliable, broad Unicode coverage (diacritics,
  // Quranic marks), available as a normal Google Font. A dedicated Uthmani
  // script font (e.g. KFGQPC Uthmanic) reads more authentically but isn't
  // on Google Fonts and needs manual font-file bundling -- a follow-up
  // polish item, not a Phase F0 blocker.
  quran: 'NotoNaskhArabic_400Regular',
  quranBold: 'NotoNaskhArabic_700Bold',
} as const;

export const ArabicTypeScale = {
  ayah: { fontSize: 26, lineHeight: 52 },
  ayahCompact: { fontSize: 22, lineHeight: 44 },
  // Sized to sit inside the small bounded "calligraphy badge" box
  // (SurahListItem, RecentsStrip) that stands in for Muslim Pro's actual
  // stylized-calligraphy sura-name artwork -- this app has no such image
  // assets, so a tinted container + this smaller size gives a badge-like
  // silhouette without fabricating artwork that doesn't exist.
  badge: { fontSize: 17, lineHeight: 26 },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/** Corner-radius scale, decoupled from `Spacing` -- tying radius to the
 * spacing scale (one previous fix) made every card/button consistent
 * with each other, but Quran.com's own shipped design system (sourced
 * directly from its open-source iOS app, UI/NoorUI/Sources/Dimensions)
 * uses 12pt as its one baseline card/button radius, not 16. `card` is
 * that baseline; `pill` matches their circular/capsule buttons. */
export const Radius = {
  card: 12,
  pill: 999,
} as const;

/** Reading-screen color themes, distinct from the app's own light/dark mode
 * -- a separate preference for the Mushaf reading view only. Sourced from
 * Quran.com's own open-source iOS app (github.com/quran/quran-ios,
 * UI/NoorUI/Sources/Colors/Colors.xcassets/theme-*.colorset), whose named
 * themes are Original/Paper/Calm/Focus/Quiet. Their asset catalog stores
 * Display P3 float components, not hex; these are read off as sRGB
 * approximations (close enough for these near-neutral tones -- no wide-gamut
 * saturated colors here). Their own `ThemeService` always forces the device
 * into dark mode when Quiet is selected, so Quiet's real on-screen colors
 * are its *dark*-appearance asset entry, not the lighter, effectively-unused
 * one its light-appearance entry lists -- that's why Quiet below is a
 * near-black page with dim gray text, not a mid-gray one. */
function mixHex(from: string, to: string, amount: number): string {
  const a = parseInt(from.slice(1), 16);
  const b = parseInt(to.slice(1), 16);
  const channel = (shift: number) => {
    const av = (a >> shift) & 0xff;
    const bv = (b >> shift) & 0xff;
    return Math.round(av + (bv - av) * amount);
  };
  return `#${[16, 8, 0].map((shift) => channel(shift).toString(16).padStart(2, '0')).join('')}`;
}

export type ReadingThemeId = 'system' | 'original' | 'paper' | 'calm' | 'focus' | 'quiet';

const READING_THEME_BASE = {
  original: { label: 'Original', background: '#FFFFFF', text: '#000000' },
  paper: { label: 'Paper', background: '#EEEDED', text: '#1D1A1A' },
  calm: { label: 'Calm', background: '#EEE2CC', text: '#32281E' },
  focus: { label: 'Focus', background: '#FEFCF5', text: '#141202' },
  quiet: { label: 'Quiet', background: '#000000', text: '#928D92' },
} satisfies Record<Exclude<ReadingThemeId, 'system'>, { label: string; background: string; text: string }>;

// A card surface that reads as a distinct layer on the page, and a softened
// secondary text tone, both mixed off the two colors each theme already
// defines rather than hand-tuning a 6th/7th hex value per theme -- the same
// "derive, don't hardcode" approach Quran.com's own UIColor variants
// (`.secondaryLabelVariant()` etc.) take.
export const ReadingThemes = Object.fromEntries(
  Object.entries(READING_THEME_BASE).map(([id, { label, background, text }]) => [
    id,
    {
      label,
      background,
      text,
      backgroundElement: mixHex(background, text, 0.06),
      textSecondary: mixHex(text, background, 0.35),
    },
  ])
) as Record<
  Exclude<ReadingThemeId, 'system'>,
  { label: string; background: string; backgroundElement: string; text: string; textSecondary: string }
>;

/** Cards had no depth at all before this -- flat `backgroundElement`
 * fills on a flat background. iOS reads `shadow*`, Android reads
 * `elevation`; both are set so either platform gets the right look.
 * Not themed per light/dark on purpose: a black shadow naturally fades
 * on a near-black dark background, which is the normal, expected look
 * for depth in dark mode, not a bug to special-case around. */
export const Elevation = {
  low: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2 },
    android: { elevation: 2 },
    default: {},
  }),
  medium: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
    android: { elevation: 4 },
    default: {},
  }),
  high: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 12 },
    android: { elevation: 8 },
    default: {},
  }),
} as const;
