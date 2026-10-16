import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav, TabKey } from '@/components/BottomNav';
import { HomeView } from '@/views/HomeView';
import { QuranView } from '@/views/QuranView';
import { HifzView } from '@/views/HifzView';
import { CommunityView } from '@/views/CommunityView';
import { MoreView, UtilityScreen } from '@/views/MoreView';
import { AppState, HifzCard, ThemeMode, loadAppState, saveAppState } from '@/services/storage';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(loadAppState());
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | undefined>(undefined);
  const [moreInitialUtility, setMoreInitialUtility] = useState<UtilityScreen>('menu');

  const themeMode: ThemeMode = appState.themeMode || 'deep-green';
  const isAmoled = themeMode === 'amoled';

  // Sync state changes with persistence
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Synchronize body class for global styling and scrollbars
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('theme-amoled', isAmoled);
    }
  }, [isAmoled]);

  const handleToggleThemeMode = () => {
    setAppState((prev) => ({
      ...prev,
      themeMode: (prev.themeMode || 'deep-green') === 'amoled' ? 'deep-green' : 'amoled',
    }));
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    setAppState((prev) => ({
      ...prev,
      themeMode: mode,
    }));
  };

  const handleSelectCity = (city: string) => {
    setAppState((prev) => ({ ...prev, selectedCity: city }));
  };

  const handleIncrementHasanat = (amount: number) => {
    setAppState((prev) => ({
      ...prev,
      hasanat: prev.hasanat + amount,
    }));
  };

  const handleAddToHifz = (card: HifzCard) => {
    setAppState((prev) => {
      // Check if already in queue
      const exists = prev.hifzCards.some(
        (c) => c.surahNumber === card.surahNumber && c.ayahNumber === card.ayahNumber
      );
      if (exists) return prev;
      return {
        ...prev,
        hifzCards: [card, ...prev.hifzCards],
      };
    });
  };

  const handleUpdateKhatmah = (surahNumber: number, ayahCount: number) => {
    setAppState((prev) => {
      const currentRead = prev.khatmah.readSurahAyahs[surahNumber] || [];
      if (currentRead.length >= ayahCount) return prev; // already recorded

      const newReadAyahs = Array.from({ length: ayahCount }, (_, i) => i + 1);
      const updatedMap = {
        ...prev.khatmah.readSurahAyahs,
        [surahNumber]: newReadAyahs,
      };

      const totalCompleted = Object.values(updatedMap).reduce((acc, curr) => acc + curr.length, 0);

      return {
        ...prev,
        khatmah: {
          ...prev.khatmah,
          completedAyahsCount: totalCompleted,
          readSurahAyahs: updatedMap,
        },
      };
    });
  };

  const handleIncrementReadingGoal = (amount = 1) => {
    setAppState((prev) => {
      const currentGoals = prev.dailyGoals;
      const newDone = currentGoals.readingCompletedAyahs + amount;
      const justAchieved =
        currentGoals.readingCompletedAyahs < currentGoals.readingGoalAyahs &&
        newDone >= currentGoals.readingGoalAyahs;

      if (justAchieved) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }

      return {
        ...prev,
        hasanat: justAchieved ? prev.hasanat + 100 : prev.hasanat + amount * 10,
        dailyGoals: {
          ...currentGoals,
          readingCompletedAyahs: newDone,
        },
      };
    });
  };

  const handleIncrementHifzGoal = (amount = 1) => {
    setAppState((prev) => {
      const currentGoals = prev.dailyGoals;
      const newDone = currentGoals.hifzCompletedCards + amount;
      const justAchieved =
        currentGoals.hifzCompletedCards < currentGoals.hifzGoalCards &&
        newDone >= currentGoals.hifzGoalCards;

      if (justAchieved) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }

      return {
        ...prev,
        hasanat: justAchieved ? prev.hasanat + 100 : prev.hasanat + amount * 20,
        dailyGoals: {
          ...currentGoals,
          hifzCompletedCards: newDone,
        },
      };
    });
  };

  const handleUpdateGoalTargets = (readingTarget: number, hifzTarget: number) => {
    setAppState((prev) => ({
      ...prev,
      dailyGoals: {
        ...prev.dailyGoals,
        readingGoalAyahs: readingTarget,
        hifzGoalCards: hifzTarget,
      },
    }));
  };

  const handleNavigateToQuran = (surahNum?: number) => {
    setSelectedSurahNumber(surahNum);
    setActiveTab('quran');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenUtility = (utility: UtilityScreen) => {
    setMoreInitialUtility(utility);
    setActiveTab('more');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen text-white flex flex-col font-sans transition-colors duration-200 ${
        isAmoled ? 'bg-[#000000]' : 'bg-[#002828]'
      }`}
    >
      {/* Global Header with Theme Toggle */}
      <Header
        selectedCity={appState.selectedCity}
        onSelectCity={handleSelectCity}
        streak={appState.streak}
        hasanat={appState.hasanat}
        themeMode={themeMode}
        onToggleThemeMode={handleToggleThemeMode}
        onOpenPrayerTimes={() => handleOpenUtility('prayers')}
        onOpenQibla={() => handleOpenUtility('qibla')}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            appState={appState}
            onNavigateToQuran={handleNavigateToQuran}
            onNavigateToHifz={() => setActiveTab('hifz')}
            onNavigateToCommunity={() => setActiveTab('community')}
            onOpenUtility={handleOpenUtility}
            onIncrementHasanat={handleIncrementHasanat}
            onIncrementReadingGoal={handleIncrementReadingGoal}
            onIncrementHifzGoal={handleIncrementHifzGoal}
            onUpdateGoalTargets={handleUpdateGoalTargets}
          />
        )}

        {activeTab === 'quran' && (
          <QuranView
            appState={appState}
            selectedSurahNumber={selectedSurahNumber}
            onSelectSurah={(num) => setSelectedSurahNumber(num)}
            onAddToHifz={handleAddToHifz}
            onUpdateKhatmah={handleUpdateKhatmah}
            onIncrementHasanat={handleIncrementHasanat}
            onIncrementReadingGoal={handleIncrementReadingGoal}
          />
        )}

        {activeTab === 'hifz' && (
          <HifzView
            appState={appState}
            onUpdateCards={(cards) => setAppState((prev) => ({ ...prev, hifzCards: cards }))}
            onIncrementHasanat={handleIncrementHasanat}
            onNavigateToQuran={handleNavigateToQuran}
            onIncrementHifzGoal={() => handleIncrementHifzGoal(1)}
          />
        )}

        {activeTab === 'community' && <CommunityView appState={appState} />}

        {activeTab === 'more' && (
          <MoreView
            appState={appState}
            initialUtility={moreInitialUtility}
            onSelectCity={handleSelectCity}
            onSetThemeMode={handleSetThemeMode}
            onIncrementHasanat={handleIncrementHasanat}
            onNavigateToQuran={handleNavigateToQuran}
          />
        )}
      </main>

      {/* Global Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'more') setMoreInitialUtility('menu');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        themeMode={themeMode}
      />
    </div>
  );
};
