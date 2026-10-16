import { ThemeMode } from '@/services/storage';

export interface ThemeStyles {
  isAmoled: boolean;
  rootBg: string;
  headerBg: string;
  navBg: string;
  cardBg: string;
  cardSubtle: string;
  cardHover: string;
  borderDefault: string;
  borderSubtle: string;
  textSecondary: string;
  inputBg: string;
}

export function getThemeStyles(themeMode: ThemeMode): ThemeStyles {
  const isAmoled = themeMode === 'amoled';

  if (isAmoled) {
    return {
      isAmoled: true,
      rootBg: 'bg-[#000000]',
      headerBg: 'bg-[#000000]/95 border-neutral-900',
      navBg: 'bg-[#000000]/95 border-neutral-900',
      cardBg: 'bg-[#0a0a0a] border-neutral-800',
      cardSubtle: 'bg-[#121212] border-neutral-800/80',
      cardHover: 'hover:bg-[#141414]',
      borderDefault: 'border-neutral-800',
      borderSubtle: 'border-neutral-900',
      textSecondary: 'text-neutral-400',
      inputBg: 'bg-[#121212] border-neutral-800',
    };
  }

  return {
    isAmoled: false,
    rootBg: 'bg-[#002828]',
    headerBg: 'bg-[#002828]/95 border-[#003228]',
    navBg: 'bg-[#002828]/95 border-[#003228]',
    cardBg: 'bg-[#003228] border-[#00D278]/20',
    cardSubtle: 'bg-[#002828]/60 border-white/5',
    cardHover: 'hover:bg-[#003d32]',
    borderDefault: 'border-[#00D278]/20',
    borderSubtle: 'border-white/5',
    textSecondary: 'text-[#A8C4B8]',
    inputBg: 'bg-[#003228] border-[#00D278]/20',
  };
}
