import React from 'react';
import { BookOpen, Brain, Home, MoreHorizontal, Users } from 'lucide-react';
import { ThemeMode } from '@/services/storage';

export type TabKey = 'home' | 'quran' | 'hifz' | 'community' | 'more';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  themeMode?: ThemeMode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  themeMode = 'deep-green',
}) => {
  const isAmoled = themeMode === 'amoled';

  const tabs = [
    { key: 'home' as TabKey, label: 'Home', arabic: 'الرئيسية', icon: Home },
    { key: 'quran' as TabKey, label: 'Quran', arabic: 'القرآن', icon: BookOpen },
    { key: 'hifz' as TabKey, label: 'Hifz', arabic: 'الحفظ', icon: Brain },
    { key: 'community' as TabKey, label: 'Community', arabic: 'المجتمع', icon: Users },
    { key: 'more' as TabKey, label: 'More', arabic: 'المزيد', icon: MoreHorizontal },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg px-2 py-1.5 sm:py-2 transition-colors ${
        isAmoled
          ? 'bg-black/95 border-t border-neutral-900'
          : 'bg-[#002828]/95 border-t border-[#003228]'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition duration-150 cursor-pointer ${
                isActive
                  ? 'text-[#00D278] font-semibold'
                  : isAmoled
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                  : 'text-[#A8C4B8] hover:text-white hover:bg-[#003228]/40'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-[#00D278]/15 scale-105' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
