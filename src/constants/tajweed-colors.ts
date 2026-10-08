/**
 * Tajweed rule -> color. The backend's 17 raw rule codes (see
 * TAJWEED_RULE_INFO in tajweed_service.py) collapse into 7 color families
 * here -- grouped by what a reciter actually does (the bounce, the
 * elongation, the nasal/merging family, the concealment family, the
 * conversion, the assimilation, the connecting hamza), matching how real
 * tajweed mushafs color-code rather than assigning all 17 their own
 * (indistinguishable) hue. "Silent" is deliberately NOT a bold color --
 * it's muted ink, since it represents a letter receding from pronunciation,
 * not a vocal rule to draw the eye to.
 *
 * The 7 hues are the dataviz skill's validated categorical palette (slots
 * 1-7, skipping the 8th/red to avoid implying "error"), re-validated here
 * against this app's own light (#ffffff) and dark (#0B0F0D) surfaces via
 * `validate_palette.js` -- all CVD/lightness/chroma checks pass in both
 * modes. Three light-mode hues (aqua/yellow/magenta) sit under 3:1 contrast
 * on white, which the palette's own "relief rule" flags -- mitigated here
 * by every colored span being tappable to reveal its rule name directly
 * (see TajweedText), so identity is never color-alone.
 */
import type { ThemeColor } from './theme';

export type TajweedFamily =
  | 'qalqalah'
  | 'madd'
  | 'nasal'
  | 'ikhfa'
  | 'iqlab'
  | 'shamsiyah'
  | 'hamWasl'
  | 'silent';

const RULE_TO_FAMILY: Record<string, TajweedFamily> = {
  qalaqah: 'qalqalah',
  madda_normal: 'madd',
  madda_permissible: 'madd',
  madda_necessary: 'madd',
  madda_obligatory: 'madd',
  ghunnah: 'nasal',
  idgham_ghunnah: 'nasal',
  idgham_wo_ghunnah: 'nasal',
  idgham_shafawi: 'nasal',
  idgham_mutajanisayn: 'nasal',
  idgham_mutaqaribayn: 'nasal',
  ikhafa: 'ikhfa',
  ikhafa_shafawi: 'ikhfa',
  iqlab: 'iqlab',
  laam_shamsiyah: 'shamsiyah',
  ham_wasl: 'hamWasl',
  slnt: 'silent',
};

export function familyForRule(rule: string): TajweedFamily {
  return RULE_TO_FAMILY[rule] ?? 'silent';
}

const FAMILY_COLORS: Record<TajweedFamily, { light: string; dark: string }> = {
  qalqalah: { light: '#2a78d6', dark: '#3987e5' },
  madd: { light: '#eb6834', dark: '#d95926' },
  nasal: { light: '#1baf7a', dark: '#199e70' },
  ikhfa: { light: '#eda100', dark: '#c98500' },
  iqlab: { light: '#e87ba4', dark: '#d55181' },
  shamsiyah: { light: '#008300', dark: '#008300' },
  hamWasl: { light: '#4a3aa7', dark: '#9085e9' },
  silent: { light: '#8A8F87', dark: '#8A8F87' },
};

export function tajweedColor(family: TajweedFamily, scheme: 'light' | 'dark'): string {
  return FAMILY_COLORS[family][scheme];
}

/** Falls back to this theme color for any character not covered by a rule
 * span, so plain text still follows the app's own light/dark text token. */
export const TAJWEED_DEFAULT_TEXT_COLOR: ThemeColor = 'text';
