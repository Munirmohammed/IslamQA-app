/** The Qalam mark: a single pen-stroke swash + dot, in absolute 0-1024
 * viewBox coordinates. Shared by the launch animation and the shareable
 * ayah card's logo so the brand mark never drifts between the two. */
export const QALAM_MARK = {
  viewBox: '0 0 1024 1024',
  swashD:
    'M 362 692 C 362 572, 302 472, 402 372 C 482 292, 622 312, 662 392 C 692 452, 662 532, 582 552 C 522 567, 472 532, 482 472 C 490 427, 532 412, 567 437',
  dotCx: 662,
  dotCy: 692,
  dotR: 34,
} as const;

export const BRAND_COLORS = {
  emerald: '#0F6B4F',
  gold: '#C9A24B',
  cream: '#FBF7EF',
} as const;
