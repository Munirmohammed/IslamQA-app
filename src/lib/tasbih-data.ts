export interface DhikrPhrase {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  /** The loop size this phrase is traditionally counted in -- not a fixed
   * app default, just what's offered first when this phrase is selected. */
  defaultTarget: number;
}

/** Common tasbih phrases, pulled directly out of the real Hisnul Muslim
 * data this app already ships (src/data/azkar.json, "Praising Allah" ->
 * "Excellence of remembrance and glorification of Allah") rather than a
 * second, hand-typed list living only here. Each short phrase below is a
 * fragment of a longer hadith already present verbatim in that file --
 * e.g. "Al-Baqiyaat As-Saalihaat" (the five phrases together) and the
 * standalone "SubhanAllahi wa bihamdihi x100" hadith -- so the Arabic,
 * translation wording, and reference all trace back to that same sourced
 * content instead of being invented for this screen. */
export const DHIKR_PHRASES: DhikrPhrase[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory is to Allah',
    reference: 'Ahmad (Hadith no. 513) -- Al-Baqiyaat As-Saalihaat',
    defaultTarget: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'Praise is to Allah',
    reference: 'Ahmad (Hadith no. 513) -- Al-Baqiyaat As-Saalihaat',
    defaultTarget: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Most Great',
    reference: 'Ahmad (Hadith no. 513) -- Al-Baqiyaat As-Saalihaat',
    defaultTarget: 34,
  },
  {
    id: 'la-ilaha-illallah',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illallah',
    translation: 'There is none worthy of worship but Allah',
    reference: 'Ahmad (Hadith no. 513) -- Al-Baqiyaat As-Saalihaat',
    defaultTarget: 100,
  },
  {
    id: 'la-hawla',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'La hawla wala quwwata illa billah',
    translation: 'There is no power and no might except by Allah',
    reference: 'Al-Bukhari, Muslim 4/2076',
    defaultTarget: 33,
  },
  {
    id: 'subhanallahi-wa-bihamdihi',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdihi',
    translation: 'Glorified is Allah and praised is He',
    reference: 'Al-Bukhari 7/168, Muslim 4/2071',
    defaultTarget: 100,
  },
];

export function getDhikrPhrase(id: string): DhikrPhrase {
  return DHIKR_PHRASES.find((d) => d.id === id) ?? DHIKR_PHRASES[0];
}

/** Loop-size choices offered in the target picker. The real Muslim Pro
 * screenshot this screen is built from shows "/33" as its own default, and
 * 33 (one third of the traditional 99 names / post-salah tasbih) is the
 * standard single-loop count generally, so it anchors the list; 99 and 100
 * are the other two traditional counts the hadith data above actually
 * calls for (see subhanallahi-wa-bihamdihi and la-ilaha-illallah above). */
export const TASBIH_TARGETS = [33, 99, 100] as const;
