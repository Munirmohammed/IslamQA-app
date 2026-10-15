/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/** Muslim Pro's actual palette. The values below are a second, corrected
 * measurement, superseding the first pass: that one was pixel-sampled
 * from Play Store marketing screenshots, which turned out to run
 * lighter and less saturated than the real app. These are measured
 * (Pillow, dominant-color histograms, not eyeballed) from real
 * screenshots taken directly off a phone running the live app --
 * `#003228` dominates every dark screen measured (Today, Prayers, Quran
 * list) at 35-45% of pixels, darker than the first pass's `#003030`, and
 * `#00D278` is its real accent green -- a vivid, saturated green, not
 * the muted sage `#48A884` the first pass used. Muslim Pro's own cream
 * (`#FCF0D8`, its "Paper" Quran-reading theme specifically) was tried
 * here first as this app's *general* light background -- a mistake,
 * since every other screen measured (Prayers, Quran list, Today) is the
 * dark teal, not cream, and it read as "yellow" rather than "the green
 * Muslim Pro app." The light background below is a light tint of the
 * real green instead; the existing Quran-reading-only theme picker
 * (`ReadingThemes` below, a separate, still-valid feature sourced from
 * Quran.com) is untouched and still offers an actual cream-toned "Paper"
 * option for anyone who wants one, just not as this app's default. */
const MUSLIM_PRO_DARK_BG = '#002828';
const MUSLIM_PRO_DARK_CARD = '#003228';
const MUSLIM_PRO_DARK_TEXT = '#FCFCFC';
const MUSLIM_PRO_GREEN = '#00D278';
const MUSLIM_PRO_LIGHT_BG = mixHex('#FFFFFF', MUSLIM_PRO_GREEN, 0.06);
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
    // A stronger, more visible outline than `border` -- used for the
    // Prayers screen's current-prayer row (an outlined box, not a filled
    // background; see `outlineStrong` dark-mode comment, pixel-sampled
    // from the real device screenshot). Derived the same "mix off an
    // existing color" way as everything else here rather than a fixed hex.
    outlineStrong: mixHex(MUSLIM_PRO_LIGHT_TEXT, MUSLIM_PRO_LIGHT_BG, 0.65),
    // Derived from the real background rather than a fixed value, so it
    // stays visibly distinct whatever the background actually is instead
    // of silently matching it (the previous fixed `#FBEBD7` nearly
    // vanished against an earlier cream background this app no longer
    // uses -- see MUSLIM_PRO_LIGHT_BG's own comment above).
    recitationHighlightMuted: mixHex(MUSLIM_PRO_LIGHT_BG, '#DC7702', 0.22),
    // Muslim Pro's signature diagonal green->purple gradient, used on its
    // real Home/"Today" tab for both its "Unlock ad-free" and "Get
    // Premium" banners -- pixel-sampled off the real device screenshot
    // (Pillow, averaging clean fill pixels at each end of the pill,
    // excluding background and the white banner text/icon) rather than
    // eyeballed: the left end reads ~rgb(14-23,150-157,98-101), the right
    // end ~rgb(46-48,26-44,100-104). Used here for this app's own feature/
    // community CTA banners (see Home), not a literal premium upsell --
    // this app has no premium tier. Kept identical across light/dark: a
    // brand gradient reads as a deliberate splash of color regardless of
    // the surrounding theme, the same way the real app's gradient doesn't
    // change with system appearance either.
    gradientBannerStart: '#0E9A62',
    gradientBannerEnd: '#2E1F64',
    // A tinted-card background for a dismissible alert banner -- adapted
    // from Muslim Pro's real solid dark-red "Your premium has expired"
    // bar (this app has no premium/subscription concept to clone that
    // literally for), reusing this app's own existing `error` red mixed
    // into the card surface instead of a fixed new hex, the same
    // derivation `tileRose` above already uses.
    dangerMuted: mixHex(MUSLIM_PRO_LIGHT_BG, '#C0392B', 0.16),
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
    // Same sampled gradient as light -- see its comment above.
    gradientBannerStart: '#0E9A62',
    gradientBannerEnd: '#2E1F64',
    // Same adapted-alert derivation as light, mixed into the dark card instead.
    dangerMuted: mixHex(MUSLIM_PRO_DARK_CARD, '#E0574A', 0.22),
    // Pixel-sampled (Pillow) from the real device Prayers screenshot: the
    // outline box around the current prayer's row (e.g. "Asr" when it's the
    // active prayer period) reads ~#ACC0C1 at both its top and bottom edge
    // (y=667 and y=737 on the 588x1280 reference image) -- a light,
    // slightly cool-tinted gray, not pure white and not the brand green.
    // mixHex(card, text, 0.7) lands at #B0BFBC, a close match, so it's
    // derived rather than hardcoded like the rest of this palette.
    outlineStrong: mixHex(MUSLIM_PRO_DARK_CARD, MUSLIM_PRO_DARK_TEXT, 0.7),
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
