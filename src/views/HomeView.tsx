import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  Heart,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { WORLD_CITIES } from '@/lib/world-cities';
import { getPrayerTimesForDate, findNextPrayer, findCurrentPrayer, formatCountdown } from '@/lib/prayer-times';
import { getAyahAudioUrl } from '@/services/quran-data';
import { AppState } from '@/services/storage';
import { DailyGoalWidget } from '@/components/DailyGoalWidget';

interface HomeViewProps {
  appState: AppState;
  onNavigateToQuran: (surahNumber?: number) => void;
  onNavigateToHifz: () => void;
  onNavigateToCommunity: () => void;
  onOpenUtility: (utilityKey: 'prayers' | 'qibla' | 'azkar' | 'tasbih' | 'hadith' | 'zakat' | 'khatmah') => void;
  onIncrementHasanat: (amount: number) => void;
  onIncrementReadingGoal: (amount?: number) => void;
  onIncrementHifzGoal: (amount?: number) => void;
  onUpdateGoalTargets: (readingTarget: number, hifzTarget: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  appState,
  onNavigateToQuran,
  onNavigateToHifz,
  onNavigateToCommunity,
  onOpenUtility,
  onIncrementHasanat,
  onIncrementReadingGoal,
  onIncrementHifzGoal,
  onUpdateGoalTargets,
}) => {
  const [now, setNow] = useState(new Date());
  const [dailyDhikrCount, setDailyDhikrCount] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const city = WORLD_CITIES.find((c) => c.name === appState.selectedCity) || WORLD_CITIES[0];
  const prayers = getPrayerTimesForDate(city.latitude, city.longitude, now);
  const currentPrayer = findCurrentPrayer(prayers, now);
  const nextPrayer = findNextPrayer(prayers, now);
  const msUntilNext = nextPrayer ? nextPrayer.time.getTime() - now.getTime() : 0;

  const isAmoled = (appState.themeMode || 'deep-green') === 'amoled';
  const cardBg = isAmoled ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-[#003228] border-[#00D278]/20';
  const cardHover = isAmoled ? 'hover:bg-[#141414]' : 'hover:bg-[#003d32]';
  const cardSubtle = isAmoled ? 'bg-[#121212] border-neutral-800' : 'bg-[#002828]/60 border-[#00D278]/10';
  const textMuted = isAmoled ? 'text-neutral-400' : 'text-[#A8C4B8]';

  // Khatmah progress: 6236 total ayahs in Quran
  const totalAyahsInQuran = 6236;
  const khatmahPercent = Math.min(
    100,
    Math.round((appState.khatmah.completedAyahsCount / totalAyahsInQuran) * 100)
  );

  const handlePlayAyahOfTheDay = () => {
    if (isPlayingAudio && audioElement) {
      audioElement.pause();
      setIsPlayingAudio(false);
      return;
    }
    const audioUrl = getAyahAudioUrl(1, 1, appState.reciterId);
    const audio = new Audio(audioUrl);
    setAudioElement(audio);
    setIsPlayingAudio(true);
    audio.play().catch((e) => {
      console.warn('Audio play prevented', e);
      setIsPlayingAudio(false);
    });
    audio.onended = () => setIsPlayingAudio(false);
  };

  const handleDhikrTap = () => {
    setDailyDhikrCount((prev) => {
      const next = prev + 1;
      if (next % 10 === 0) {
        onIncrementHasanat(100);
      }
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-6 pb-24">
      {/* Welcome & Motivational Greeting */}
      <div className="bg-gradient-to-r from-[#0E9A62] via-[#003228] to-[#2E1F64] rounded-3xl p-5 sm:p-6 text-white border border-[#00D278]/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                Assalamu Alaikum
              </span>
              <span className="text-xs text-emerald-200">
                {now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Begin your day with the remembrance of Allah
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-lg">
              "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured." (13:28)
            </p>
          </div>
          <button
            onClick={() => onNavigateToQuran(1)}
            className="self-start md:self-center px-4 py-2.5 rounded-2xl bg-white text-[#002828] font-bold text-xs sm:text-sm hover:bg-[#00D278] hover:text-white transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Mushaf</span>
          </button>
        </div>
      </div>

      {/* Daily Hifz and Quran Reading Goal Consistency Tracker */}
      <DailyGoalWidget
        dailyGoals={appState.dailyGoals}
        streak={appState.streak}
        themeMode={appState.themeMode}
        onIncrementReadingGoal={onIncrementReadingGoal}
        onIncrementHifzGoal={onIncrementHifzGoal}
        onUpdateGoalTargets={onUpdateGoalTargets}
        onNavigateToQuran={onNavigateToQuran}
        onNavigateToHifz={onNavigateToHifz}
      />

      {/* Main Grid: Prayer Times Card + Continue Reading Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prayer Times "Now" Widget */}
        <div className={`${cardBg} rounded-3xl p-5 flex flex-col justify-between shadow-lg relative`}>
          <div>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 text-xs font-semibold ${textMuted}`}>
                <Clock className="w-4 h-4 text-[#00D278]" />
                <span>PRAYER TIMES · {city.name} {city.flag}</span>
              </div>
              <button
                onClick={() => onOpenUtility('prayers')}
                className="text-xs text-[#00D278] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>Full Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className={`text-xs uppercase tracking-wider font-medium ${textMuted}`}>
                  {currentPrayer ? `Active · ${currentPrayer.name}` : 'Next Prayer'}
                </span>
                <h3 className="text-3xl font-extrabold text-white mt-0.5">
                  {nextPrayer?.name}
                </h3>
              </div>
              <div className="text-right">
                <span className={`text-xs ${textMuted}`}>Starts in</span>
                <div className="text-2xl font-mono font-bold text-[#00D278]">
                  {formatCountdown(msUntilNext)}
                </div>
              </div>
            </div>

            {/* Prayer Timeline Strip */}
            <div className={`mt-4 grid grid-cols-5 gap-1.5 pt-3 border-t ${isAmoled ? 'border-neutral-800' : 'border-[#002828]/60'}`}>
              {prayers
                .filter((p) => p.key !== 'sunrise')
                .map((p) => {
                  const isCurrent = currentPrayer?.key === p.key;
                  const isNext = nextPrayer?.key === p.key;
                  const timeStr = p.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div
                      key={p.key}
                      className={`text-center p-2 rounded-xl transition ${
                        isCurrent
                          ? 'bg-[#00D278]/20 border border-[#00D278]/50 text-white font-bold'
                          : isNext
                          ? 'bg-white/10 text-emerald-300'
                          : `${textMuted} hover:bg-black/20`
                      }`}
                    >
                      <div className="text-[10px] uppercase font-semibold">{p.name}</div>
                      <div className="text-xs font-mono mt-0.5">{timeStr}</div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className={`mt-4 pt-3 flex items-center justify-between text-xs border-t ${isAmoled ? 'border-neutral-800 text-neutral-400' : 'border-[#002828] text-[#A8C4B8]'}`}>
            <button
              onClick={() => onOpenUtility('qibla')}
              className="flex items-center gap-1.5 text-gray-300 hover:text-[#00D278] transition cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#00D278]" />
              <span>Find Qibla Direction</span>
            </button>
            <span className="text-[11px] text-gray-400">Muslim World League</span>
          </div>
        </div>

        {/* Khatmah Progress Card */}
        <div className={`${cardBg} rounded-3xl p-5 flex flex-col justify-between shadow-lg`}>
          <div>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 text-xs font-semibold ${textMuted}`}>
                <BookOpen className="w-4 h-4 text-[#00D278]" />
                <span>KHATMAH PROGRESS</span>
              </div>
              <button
                onClick={() => onOpenUtility('khatmah')}
                className="text-xs text-[#00D278] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {appState.khatmah.title}
                </h3>
                <p className={`text-xs mt-0.5 ${textMuted}`}>
                  {appState.khatmah.completedAyahsCount} of {totalAyahsInQuran} verses completed
                </p>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isAmoled ? 'text-neutral-900' : 'text-[#002828]'}
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#00D278]"
                    strokeDasharray={`${Math.max(khatmahPercent, 3)}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-white">
                  {khatmahPercent}%
                </span>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-2xl flex items-center justify-between ${cardSubtle}`}>
              <div>
                <div className={`text-[11px] ${textMuted}`}>Continue from</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Al-Fatihah</span>
                  <span className="text-[#00D278] font-badge font-normal text-base">الفاتحة</span>
                </div>
              </div>
              <button
                onClick={() => onNavigateToQuran(1)}
                className="px-3 py-1.5 bg-[#00D278] hover:bg-[#00b868] text-[#002828] font-bold text-xs rounded-xl transition shadow cursor-pointer"
              >
                Read Now
              </button>
            </div>
          </div>

          <div className={`mt-4 pt-3 flex items-center justify-between text-xs border-t ${isAmoled ? 'border-neutral-800 text-neutral-400' : 'border-[#002828] text-[#A8C4B8]'}`}>
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{appState.streak} Day Active Streak</span>
            </span>
            <span className="text-[#00D278] font-medium">+{appState.hasanat} hasanat</span>
          </div>
        </div>
      </div>

      {/* 6-Tile Feature Grid (Quick Deen Utilities) */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00D278]" />
          <span>Daily Islamic Utilities</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* Prayers */}
          <button
            onClick={() => onOpenUtility('prayers')}
            className={`p-4 rounded-2xl border transition flex flex-col items-center text-center group cursor-pointer shadow-md ${cardBg} ${cardHover}`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#00D278] group-hover:scale-110 transition flex items-center justify-center mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Prayer Times</span>
            <span className={`text-[10px] ${textMuted} font-arabic mt-0.5`}>مواقيت الصلاة</span>
          </button>

          {/* Qibla */}
          <button
            onClick={() => onOpenUtility('qibla')}
            className={`p-4 rounded-2xl border transition flex flex-col items-center text-center group cursor-pointer shadow-md ${cardBg} ${cardHover}`}
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-110 transition flex items-center justify-center mb-2">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Qibla Compass</span>
            <span className={`text-[10px] ${textMuted} font-arabic mt-0.5`}>اتجاه القبلة</span>
          </button>

          {/* Azkar */}
          <button
            onClick={() => onOpenUtility('azkar')}
            className={`p-4 rounded-2xl border transition flex flex-col items-center text-center group cursor-pointer shadow-md ${cardBg} ${cardHover}`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition flex items-center justify-center mb-2">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Dua & Azkar</span>
            <span className={`text-[10px] ${textMuted} font-arabic mt-0.5`}>أذكار المسلم</span>
          </button>

          {/* Tasbih */}
          <button
            onClick={() => onOpenUtility('tasbih')}
            className={`p-4 rounded-2xl border transition flex flex-col items-center text-center group cursor-pointer shadow-md ${cardBg} ${cardHover}`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition flex items-center justify-center mb-2">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Digital Tasbih</span>
            <span className={`text-[10px] ${textMuted} font-arabic mt-0.5`}>المسبحة</span>
          </button>

          {/* Hadith */}
          <button
            onClick={() => onOpenUtility('hadith')}
            className={`p-4 rounded-2xl border transition flex flex-col items-center text-center group cursor-pointer shadow-md ${cardBg} ${cardHover}`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Hadith Library</span>
            <span className={`text-[10px] ${textMuted} font-arabic mt-0.5`}>السنة النبوية</span>
          </button>

          {/* Zakat */}
          <button
            onClick={() => onOpenUtility('zakat')}
            className={`p-4 rounded-2xl border transition flex flex-col items-center text-center group cursor-pointer shadow-md ${cardBg} ${cardHover}`}
          >
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Zakat Calc</span>
            <span className={`text-[10px] ${textMuted} font-arabic mt-0.5`}>حاسبة الزكاة</span>
          </button>
        </div>
      </div>

      {/* Ayah of the Day & Quick Interactive Tasbih */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ayah of the day */}
        <div className={`${cardBg} rounded-3xl p-5 shadow-lg flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#00D278] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ayah of the Day</span>
              </span>
              <button
                onClick={handlePlayAyahOfTheDay}
                className={`flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:text-white px-3 py-1 rounded-full border transition cursor-pointer ${
                  isAmoled ? 'bg-neutral-900 border-neutral-800' : 'bg-[#002828] border-[#00D278]/30'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-[#00D278]" />
                <span>{isPlayingAudio ? 'Pause Recitation' : 'Listen'}</span>
              </button>
            </div>

            <div className="my-3 text-right">
              <p className="font-arabic text-xl sm:text-2xl text-white leading-loose select-all font-medium">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ
              </p>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 italic mt-2">
              "[All] praise is [due] to Allah, Lord of the worlds - The Entirely Merciful, the Especially Merciful."
            </p>
          </div>

          <div className={`mt-4 pt-3 flex items-center justify-between text-xs border-t ${isAmoled ? 'border-neutral-800 text-neutral-400' : 'border-[#002828] text-[#A8C4B8]'}`}>
            <span className="font-medium text-white">Al-Fatihah 1:1-2</span>
            <button
              onClick={() => onNavigateToQuran(1)}
              className="text-[#00D278] hover:underline font-semibold cursor-pointer"
            >
              Read Surah →
            </button>
          </div>
        </div>

        {/* Quick Dhikr Tap Counter */}
        <div className={`${cardBg} rounded-3xl p-5 shadow-lg flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Quick Dhikr Bead</span>
              </span>
              <span className={`text-xs font-mono ${textMuted}`}>
                Goal: 33
              </span>
            </div>

            <div className="text-center py-2">
              <p className="font-arabic text-2xl font-bold text-white mb-1">
                سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
              </p>
              <p className="text-xs text-gray-300">
                SubhanAllahi wa bihamdihi
              </p>
              <p className={`text-[11px] ${textMuted} italic mt-0.5`}>
                "Glory be to Allah and His is the praise"
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleDhikrTap}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0E9A62] to-[#00D278] text-[#002828] font-extrabold text-sm hover:opacity-95 active:scale-98 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Tap to Count ({dailyDhikrCount})</span>
            </button>
            <button
              onClick={() => onOpenUtility('tasbih')}
              className={`px-3.5 py-3 rounded-2xl border transition text-xs font-semibold cursor-pointer ${
                isAmoled
                  ? 'bg-neutral-900 text-gray-300 hover:text-white border-neutral-800'
                  : 'bg-[#002828] text-gray-300 hover:text-white border-[#00D278]/20'
              }`}
            >
              Full Tasbih
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
