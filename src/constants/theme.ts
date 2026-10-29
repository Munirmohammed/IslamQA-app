/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/** The approved Qalam palette -- signed off by the user directly on a
 * full-app design pass (11 screens, one canvas) before any of this was
 * implemented, superseding the earlier Muslim-Pro-measured values below
 * it in git history. These exact hex values are the source of truth now;
 * match them exactly rather than re-deriving or eyeballing. */
const DARK_BG = '#002A28';
const DARK_SURFACE = '#0B3D38';
const DARK_SURFACE_2 = '#0F4A42';
const DARK_TEXT = '#F6FBF9';
const BRAND_GREEN = '#17E08A';
const BRAND_GOLD = '#E3B869';
const MUSLIM_PRO_LIGHT_BG = mixHex('#FFFFFF', BRAND_GREEN, 0.06);
const MUSLIM_PRO_LIGHT_TEXT = '#1A1A1A';

export const Colors = {
  light: {
    text: MUSLIM_PRO_LIGHT_TEXT,
    background: MUSLIM_PRO_LIGHT_BG,
    backgroundElement: mixHex(MUSLIM_PRO_LIGHT_BG, MUSLIM_PRO_LIGHT_TEXT, 0.06),
    backgroundSelected: mixHex(MUSLIM_PRO_LIGHT_BG, MUSLIM_PRO_LIGHT_TEXT, 0.12),
    textSecondary: mixHex(MUSLIM_PRO_LIGHT_TEXT, MUSLIM_PRO_LIGHT_BG, 0.45),
    textFaint: mixHex(MUSLIM_PRO_LIGHT_TEXT, MUSLIM_PRO_LIGHT_BG, 0.65),
    primary: '#0F6B4F',
    primaryMuted: mixHex(MUSLIM_PRO_LIGHT_BG, '#0F6B4F', 0.14),
    accent: '#C9A24B',
    border: mixHex(MUSLIM_PRO_LIGHT_BG, MUSLIM_PRO_LIGHT_TEXT, 0.1),
    error: '#C0392B',
    success: '#2E8B57',
    mistakeModerate: '#D9762B',
    mistakeLow: '#C9A23B',
    recitationHighlight: '#DC7702',
    outlineStrong: mixHex(MUSLIM_PRO_LIGHT_TEXT, MUSLIM_PRO_LIGHT_BG, 0.65),
    recitationHighlightMuted: mixHex(MUSLIM_PRO_LIGHT_BG, '#DC7702', 0.22),
    gradientBannerStart: '#12A071',
    gradientBannerEnd: '#2A1E63',
    dangerMuted: mixHex(MUSLIM_PRO_LIGHT_BG, '#C0392B', 0.16),
  },
  dark: {
    text: DARK_TEXT,
    background: DARK_BG,
    backgroundElement: DARK_SURFACE,
    backgroundSelected: DARK_SURFACE_2,
    textSecondary: '#9FC2B6',
    // A third, dimmer text tier the approved design uses for the least
    // important label on a row (timestamps, muted captions) -- distinct
    // from `textSecondary`, not a duplicate of it.
    textFaint: '#6F9589',
    primary: BRAND_GREEN,
    primaryMuted: mixHex(DARK_SURFACE, BRAND_GREEN, 0.2),
    accent: BRAND_GOLD,
    border: 'rgba(168,196,184,0.14)',
    error: '#F0735A',
    success: BRAND_GREEN,
    mistakeModerate: '#E89A4D',
    mistakeLow: '#E3C94D',
    recitationHighlight: '#EF911D',
    recitationHighlightMuted: '#2E2112',
    gradientBannerStart: '#12A071',
    gradientBannerEnd: '#2A1E63',
    dangerMuted: mixHex(DARK_SURFACE, '#F0735A', 0.22),
    outlineStrong: mixHex(DARK_SURFACE, DARK_TEXT, 0.7),
  },
  // A true-black alternative to the dark teal above, for OLED screens --
  // a real, user-toggleable feature (not system-driven, see
  // theme-mode-store.ts), not a design clone of any competitor. Brand
  // colors (primary/accent/error/success/...) stay identical to `dark`
  // so a surah/ayah/badge doesn't shift hue when a user flips this --
  // only the neutral background/card/border scale drops toward true
  // black (Tailwind's neutral-950/900/800, the closest common "AMOLED
  // app" convention) instead of the teal-tinted dark scale.
  amoled: {
    text: DARK_TEXT,
    background: '#000000',
    backgroundElement: '#0a0a0a',
    backgroundSelected: '#171717',
    textSecondary: '#a3a3a3',
    textFaint: '#6b6b6b',
    primary: BRAND_GREEN,
    primaryMuted: mixHex('#0a0a0a', BRAND_GREEN, 0.2),
    accent: BRAND_GOLD,
    border: '#262626',
    error: '#F0735A',
    success: BRAND_GREEN,
    mistakeModerate: '#E89A4D',
    mistakeLow: '#E3C94D',
    recitationHighlight: '#EF911D',
    recitationHighlightMuted: '#2E2112',
    gradientBannerStart: '#12A071',
    gradientBannerEnd: '#2A1E63',
    dangerMuted: mixHex('#0a0a0a', '#F0735A', 0.22),
    outlineStrong: mixHex('#0a0a0a', DARK_TEXT, 0.7),
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
  // Sura-name "badge" rendering only (SurahListItem, RecentsStrip) --
  // NOT used for actual ayah/Mushaf text above. A real device screenshot
  // of Muslim Pro's Quran tab (not a marketing shot) was inspected at 5x
  // zoom for this: there is no geometric seal/stamp/rosette artwork
  // anywhere around the sura names, and the Sura List rows have no
  // badge box at all, just bare text. What reads as "ornate" at a glance
  // is the sura name's typeface itself -- bold, high-contrast swashes
  // and joined ligatures consistent with a Ruqʿah-style calligraphic cut.
  // Aref Ruqaa is a real, open-licensed (OFL) Google Font in exactly that
  // style, not fabricated artwork -- same "real typeface rendering real
  // text" category as NotoNaskhArabic above, just a more decorative cut
  // for this specifically decorative context. NOT the "Ink" variant: that
  // one is a COLR/CPAL color font with a baked-in reddish ink-brush
  // palette that ignores the `color` style entirely (confirmed by
  // screenshot -- it rendered maroon in both themes, never the intended
  // theme.text white), so it can never actually match either theme.
  badge: 'ArefRuqaa_400Regular',
  badgeBold: 'ArefRuqaa_700Bold',
} as const;

export const ArabicTypeScale = {
  ayah: { fontSize: 26, lineHeight: 52 },
  ayahCompact: { fontSize: 22, lineHeight: 44 },
  // Sized for the sura-name badge rendering (SurahListItem, RecentsStrip)
  // -- see ArabicFonts.badge below for what font this actually renders
  // in and why. Up from an earlier, smaller pass: once the real
  // calligraphic font replaced the plain Naskh one here, the old 17px
  // read too cramped for its taller, more ornamental letterforms.
  badge: { fontSize: 22, lineHeight: 34 },
  // The Recents card's sura name sits in a bigger box than list rows
  // (confirmed from the real screenshot: its badge is roughly square and
  // noticeably larger than a list row's inline name) -- same font,
  // larger size.
  badgeLarge: { fontSize: 30, lineHeight: 44 },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Manrope is the approved design's UI typeface (every mockup used it for
 * all non-Arabic text), loaded as four static weights in _layout.tsx.
 * Static (non-variable) custom fonts don't respond to a separate
 * `fontWeight` style prop the way the system font does -- each weight
 * needs its own `fontFamily` name -- so `UiFonts` maps the weight tiers
 * ThemedText's `type`s actually use onto the specific loaded family name,
 * and call sites should reach for one of these rather than pairing a
 * generic `fontFamily` with a `fontWeight` number. */
export const UiFonts = {
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
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
