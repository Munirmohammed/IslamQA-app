import React, { useState, useEffect } from 'react';
import {
  Bell,
  BookOpen,
  ChevronRight,
  Clock,
  Compass,
  DollarSign,
  Heart,
  MapPin,
  Palette,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WORLD_CITIES } from '@/lib/world-cities';
import {
  getPrayerTimesForDate,
  findNextPrayer,
  findCurrentPrayer,
  formatCountdown,
  getQiblaBearing,
  getDistanceToKaabaKm,
} from '@/lib/prayer-times';
import { AZKAR_CATEGORIES } from '@/lib/azkar-data';
import { DHIKR_PHRASES, TASBIH_TARGETS } from '@/lib/tasbih-data';
import { calculateZakat, ZakatInputs } from '@/lib/zakat';
import { AppState, ThemeMode } from '@/services/storage';

export type UtilityScreen =
  | 'menu'
  | 'prayers'
  | 'qibla'
  | 'azkar'
  | 'tasbih'
  | 'hadith'
  | 'zakat'
  | 'calendar'
  | 'salah-tracker'
  | 'khatmah';

interface MoreViewProps {
  appState: AppState;
  initialUtility?: UtilityScreen;
  onSelectCity: (cityName: string) => void;
  onSetThemeMode: (mode: ThemeMode) => void;
  onIncrementHasanat: (amount: number) => void;
  onNavigateToQuran: (surahNumber: number) => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  appState,
  initialUtility = 'menu',
  onSelectCity,
  onSetThemeMode,
  onIncrementHasanat,
  onNavigateToQuran,
}) => {
  const [activeScreen, setActiveScreen] = useState<UtilityScreen>(initialUtility);
  const [now, setNow] = useState(new Date());

  const isAmoled = (appState.themeMode || 'deep-green') === 'amoled';
  const cardBg = isAmoled ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-[#003228] border-[#00D278]/20';
  const cardHover = isAmoled ? 'hover:bg-[#141414]' : 'hover:bg-[#003d32]';
  const subBg = isAmoled ? 'bg-[#121212] border-neutral-800' : 'bg-[#002828] border-[#00D278]/20';
  const textMuted = isAmoled ? 'text-neutral-400' : 'text-[#A8C4B8]';

  useEffect(() => {
    if (initialUtility && initialUtility !== 'menu') {
      setActiveScreen(initialUtility);
    }
  }, [initialUtility]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const city = WORLD_CITIES.find((c) => c.name === appState.selectedCity) || WORLD_CITIES[0];
  const prayers = getPrayerTimesForDate(city.latitude, city.longitude, now);
  const nextPrayer = findNextPrayer(prayers, now);
  const currentPrayer = findCurrentPrayer(prayers, now);
  const qiblaBearing = Math.round(getQiblaBearing(city.latitude, city.longitude));
  const distanceKm = Math.round(getDistanceToKaabaKm(city.latitude, city.longitude));

  // --- Tasbih State ---
  const [selectedDhikrId, setSelectedDhikrId] = useState<string>('subhanallah');
  const [tasbihCount, setTasbihCount] = useState<number>(0);
  const [tasbihTarget, setTasbihTarget] = useState<number>(33);
  const currentDhikr = DHIKR_PHRASES.find((d) => d.id === selectedDhikrId) || DHIKR_PHRASES[0];

  const handleTasbihTap = () => {
    const next = tasbihCount + 1;
    setTasbihCount(next);
    if (next === tasbihTarget) {
      onIncrementHasanat(100);
      confetti({ particleCount: 30, spread: 50 });
    }
  };

  const handleTasbihReset = () => {
    setTasbihCount(0);
  };

  // --- Azkar State ---
  const [selectedAzkarCatIndex, setSelectedAzkarCatIndex] = useState<number>(0);
  const [azkarCounts, setAzkarCounts] = useState<Record<string, number>>({});
  const activeAzkarCategory = AZKAR_CATEGORIES[selectedAzkarCatIndex] || AZKAR_CATEGORIES[0];

  // --- Zakat Calculator State ---
  const [zakatInputs, setZakatInputs] = useState<ZakatInputs>({
    cash: 5000,
    goldAndSilver: 2000,
    investments: 1000,
    businessAssets: 0,
    moneyOwedToYou: 500,
    debtsDue: 300,
    nisabThreshold: 6200, // Approximate gold nisab threshold in USD
  });
  const zakatResult = calculateZakat(zakatInputs);

  // --- Salah Tracker State (today's 5 prayers) ---
  const [completedPrayers, setCompletedPrayers] = useState<Record<string, boolean>>({
    fajr: true,
    dhuhr: true,
    asr: false,
    maghrib: false,
    isha: false,
  });

  const togglePrayer = (key: string) => {
    setCompletedPrayers((prev) => {
      const next = !prev[key];
      if (next) onIncrementHasanat(50);
      return { ...prev, [key]: next };
    });
  };

  // -------------------------------------------------------------
  // UTILITY: PRAYER TIMES
  // -------------------------------------------------------------
  if (activeScreen === 'prayers') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5 pb-24">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveScreen('menu')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#00D278] hover:underline cursor-pointer"
          >
            ← Back to Utilities
          </button>
          <div className={`text-xs ${textMuted} flex items-center gap-1`}>
            <MapPin className="w-3.5 h-3.5 text-[#00D278]" />
            <span>{city.name}, {city.country} {city.flag}</span>
          </div>
        </div>

        <div className={`${cardBg} border rounded-3xl p-6 shadow-xl space-y-6`}>
          <div className="text-center space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#00D278] font-bold">
              Today's Prayer Schedule
            </span>
            <h2 className="text-2xl font-bold text-white">
              {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <p className={`text-xs ${textMuted}`}>
              Method: Muslim World League (Fajr 18°, Isha 17°)
            </p>
          </div>

          {/* Next Prayer Highlight Card */}
          {nextPrayer && (
            <div className={`p-5 rounded-2xl border flex items-center justify-between ${
              isAmoled
                ? 'bg-gradient-to-r from-emerald-950/40 via-black to-neutral-900 border-neutral-800'
                : 'bg-gradient-to-r from-[#0E9A62]/30 via-[#002828] to-[#2E1F64]/30 border-[#00D278]/40'
            }`}>
              <div>
                <span className={`text-[11px] uppercase tracking-wider ${textMuted}`}>
                  Upcoming Prayer
                </span>
                <h3 className="text-2xl font-bold text-white">{nextPrayer.name}</h3>
                <span className="text-xs text-gray-300">
                  Scheduled at {nextPrayer.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-right">
                <span className={`text-xs ${textMuted}`}>Starts in</span>
                <div className="text-2xl font-mono font-bold text-[#00D278]">
                  {formatCountdown(nextPrayer.time.getTime() - now.getTime())}
                </div>
              </div>
            </div>
          )}

          {/* All 6 Prayer Rows */}
          <div className="space-y-2">
            {prayers.map((p) => {
              const isCurrent = currentPrayer?.key === p.key;
              const isNext = nextPrayer?.key === p.key;
              const isSunrise = p.key === 'sunrise';

              return (
                <div
                  key={p.key}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                    isCurrent
                      ? 'bg-[#00D278]/20 border-[#00D278] text-white font-bold'
                      : isNext
                      ? isAmoled ? 'bg-[#141414] border-neutral-700 text-emerald-300' : 'bg-[#002828] border-[#00D278]/40 text-emerald-300'
                      : isAmoled ? 'bg-[#101010] border-neutral-800/80 text-gray-300' : 'bg-[#002828]/60 border-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center text-xs font-bold text-[#00D278]">
                      {isSunrise ? '☀️' : '🕌'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{p.name}</span>
                        {isSunrise && (
                          <span className="text-[10px] text-amber-300 font-normal">
                            (Shurooq / No prayer)
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] bg-[#00D278] text-[#002828] font-extrabold px-1.5 py-0.2 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-mono font-bold text-white">
                      {p.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isSunrise && (
                      <button
                        onClick={() => togglePrayer(p.key)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          completedPrayers[p.key]
                            ? 'bg-[#00D278] text-[#002828]'
                            : isAmoled ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-300' : 'bg-black/30 hover:bg-black/50 text-gray-300'
                        }`}
                      >
                        {completedPrayers[p.key] ? 'Prayed ✓' : 'Mark Prayed'}
                      </button>
                    )}
                    <button
                      className="text-gray-400 hover:text-[#00D278] transition cursor-pointer"
                      title="Toggle Adhan Reminder"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // UTILITY: QIBLA COMPASS
  // -------------------------------------------------------------
  if (activeScreen === 'qibla') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5 pb-24">
        <button
          onClick={() => setActiveScreen('menu')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#00D278] hover:underline cursor-pointer"
        >
          ← Back to Utilities
        </button>

        <div className={`${cardBg} border rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6`}>
          <div>
            <span className="text-xs uppercase tracking-widest text-[#00D278] font-bold">
              Accurate Qibla Direction
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Facing the Holy Kaaba in Makkah
            </h2>
            <p className={`text-xs ${textMuted} mt-1`}>
              Location: {city.name}, {city.country} • Bearing: {qiblaBearing}° from True North
            </p>
          </div>

          {/* Compass Dial Visualizer */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center my-6">
            {/* Outer Dial */}
            <div className={`absolute inset-0 rounded-full border-4 shadow-2xl flex items-center justify-center ${
              isAmoled ? 'border-neutral-800 bg-[#000000]' : 'border-[#00D278]/30 bg-[#002828]'
            }`}>
              {/* Compass Card markings */}
              <span className="absolute top-2 font-bold text-xs text-red-400 font-mono">N (0°)</span>
              <span className="absolute right-3 font-bold text-xs text-gray-400 font-mono">E (90°)</span>
              <span className="absolute bottom-2 font-bold text-xs text-gray-400 font-mono">S (180°)</span>
              <span className="absolute left-3 font-bold text-xs text-gray-400 font-mono">W (270°)</span>

              {/* Kaaba Direction Needle */}
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
                style={{ transform: `rotate(${qiblaBearing}deg)` }}
              >
                <div className="relative w-3 h-48 flex flex-col items-center justify-between">
                  {/* North pointer (Kaaba) */}
                  <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[36px] border-b-[#00D278] drop-shadow-[0_0_12px_rgba(0,210,120,0.8)]" />
                  {/* Center Kaaba Icon */}
                  <div className="w-10 h-10 rounded-xl bg-black border border-amber-400 flex items-center justify-center shadow-lg z-10">
                    <span className="text-sm">🕋</span>
                  </div>
                  {/* Tail pointer */}
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[30px] border-t-white/30" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-center pt-2">
            <div className={`p-3 rounded-2xl border ${subBg}`}>
              <span className={`text-[11px] ${textMuted}`}>Qibla Angle</span>
              <div className="text-xl font-bold font-mono text-[#00D278]">{qiblaBearing}°</div>
            </div>
            <div className={`p-3 rounded-2xl border ${subBg}`}>
              <span className={`text-[11px] ${textMuted}`}>Distance to Kaaba</span>
              <div className="text-xl font-bold font-mono text-white">{distanceKm.toLocaleString()} km</div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border text-xs max-w-md mx-auto ${
            isAmoled ? 'bg-[#121212] border-neutral-800 text-neutral-400' : 'bg-[#002828]/60 border-[#00D278]/10 text-[#A8C4B8]'
          }`}>
            "So turn your face toward al-Masjid al-Haram. And wherever you [believers] are, turn your faces toward it [in prayer]." (Surah Al-Baqarah 2:144)
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // UTILITY: DUA & AZKAR (HISNUL MUSLIM)
  // -------------------------------------------------------------
  if (activeScreen === 'azkar') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-24">
        <button
          onClick={() => setActiveScreen('menu')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#00D278] hover:underline cursor-pointer"
        >
          ← Back to Utilities
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#00D278]" />
              <span>Hisnul Muslim — Daily Azkar & Duas</span>
            </h2>
            <p className="text-xs text-[#A8C4B8]">
              Authentic supplications from the Prophet Muhammad (ﷺ)
            </p>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {AZKAR_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => setSelectedAzkarCatIndex(idx)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedAzkarCatIndex === idx
                  ? 'bg-[#00D278] text-[#002828] shadow'
                  : isAmoled
                  ? 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                  : 'bg-[#003228] text-gray-300 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Chapters & Items */}
        <div className="space-y-6">
          {activeAzkarCategory.chapters.map((chapter) => (
            <div key={chapter.name} className={`${cardBg} border rounded-3xl p-5 space-y-4`}>
              <h3 className={`text-base font-bold text-[#00D278] border-b pb-2 ${isAmoled ? 'border-neutral-800' : 'border-[#002828]'}`}>
                {chapter.name}
              </h3>

              <div className="space-y-4">
                {chapter.items.map((item, itemIdx) => {
                  const key = `${activeAzkarCategory.name}-${chapter.name}-${itemIdx}`;
                  const count = azkarCounts[key] || 0;

                  return (
                    <div
                      key={itemIdx}
                      className={`p-4 rounded-2xl border space-y-3 ${
                        isAmoled ? 'bg-[#121212] border-neutral-800' : 'bg-[#002828]/70 border-white/5'
                      }`}
                    >
                      {/* Arabic */}
                      <p className="font-arabic text-xl sm:text-2xl text-right leading-loose text-white select-all">
                        {item.arabic}
                      </p>

                      {/* Translation */}
                      <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                        {item.translation}
                      </p>

                      {/* Reference & Counter */}
                      <div className={`flex items-center justify-between pt-2 border-t text-xs ${
                        isAmoled ? 'border-neutral-800 text-neutral-400' : 'border-white/5 text-[#A8C4B8]'
                      }`}>
                        <span className="italic truncate max-w-xs">{item.reference}</span>
                        <button
                          onClick={() => {
                            setAzkarCounts((prev) => ({
                              ...prev,
                              [key]: (prev[key] || 0) + 1,
                            }));
                            onIncrementHasanat(10);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#00D278] hover:bg-[#00b868] text-[#002828] font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                        >
                          <span>Recited: {count}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // UTILITY: DIGITAL TASBIH
  // -------------------------------------------------------------
  if (activeScreen === 'tasbih') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6 pb-24">
        <button
          onClick={() => setActiveScreen('menu')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#00D278] hover:underline cursor-pointer"
        >
          ← Back to Utilities
        </button>

        <div className={`${cardBg} border rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6`}>
          <div>
            <span className="text-xs uppercase tracking-widest text-purple-400 font-bold">
              Digital Tasbih Bead
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              {currentDhikr.transliteration}
            </h2>
            <p className="font-arabic text-3xl font-bold text-[#00D278] my-2">
              {currentDhikr.arabic}
            </p>
            <p className={`text-xs ${textMuted} italic max-w-md mx-auto`}>
              "{currentDhikr.translation}"
            </p>
          </div>

          {/* Target loop picker */}
          <div className="flex items-center justify-center gap-2">
            <span className={`text-xs ${textMuted}`}>Target:</span>
            {TASBIH_TARGETS.map((tgt) => (
              <button
                key={tgt}
                onClick={() => setTasbihTarget(tgt)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  tasbihTarget === tgt
                    ? 'bg-purple-600 text-white'
                    : isAmoled
                    ? 'bg-neutral-900 border border-neutral-800 text-gray-300 hover:text-white'
                    : 'bg-[#002828] text-gray-300 hover:text-white'
                }`}
              >
                /{tgt}
              </button>
            ))}
          </div>

          {/* Huge Circular Bead Counter */}
          <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
            <button
              onClick={handleTasbihTap}
              className={`w-full h-full rounded-full border-8 shadow-2xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer select-none group ${
                isAmoled
                  ? 'bg-neutral-950 border-neutral-800 hover:border-emerald-500/50'
                  : 'bg-gradient-to-br from-[#0E9A62] to-[#002828] border-[#00D278]/40'
              }`}
            >
              <span className="text-5xl font-extrabold font-mono text-white group-hover:text-[#00D278] transition">
                {tasbihCount}
              </span>
              <span className={`text-xs font-semibold ${textMuted} mt-1 uppercase tracking-wider`}>
                Target: {tasbihTarget}
              </span>
              <span className="text-[10px] text-emerald-300 mt-2 font-bold">
                TAP TO COUNT
              </span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleTasbihReset}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                isAmoled
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
                  : 'bg-[#002828] text-gray-300 hover:text-white border-white/10'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Counter</span>
            </button>
          </div>

          {/* Phrase Quick Picker */}
          <div className={`pt-4 border-t space-y-2 text-left ${isAmoled ? 'border-neutral-800' : 'border-[#002828]'}`}>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Select Dhikr Phrase:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DHIKR_PHRASES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDhikrId(d.id);
                    setTasbihTarget(d.defaultTarget);
                    setTasbihCount(0);
                  }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    selectedDhikrId === d.id
                      ? 'bg-[#00D278]/20 border-[#00D278] text-white font-bold'
                      : isAmoled
                      ? 'bg-[#121212] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      : 'bg-[#002828]/60 border-white/5 text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{d.transliteration}</span>
                    <span className="font-arabic text-sm text-[#00D278]">{d.arabic}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // UTILITY: ZAKAT CALCULATOR
  // -------------------------------------------------------------
  if (activeScreen === 'zakat') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5 pb-24">
        <button
          onClick={() => setActiveScreen('menu')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#00D278] hover:underline cursor-pointer"
        >
          ← Back to Utilities
        </button>

        <div className={`${cardBg} border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6`}>
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              Third Pillar of Islam
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Zakat Calculator (حاسبة الزكاة)
            </h2>
            <p className={`text-xs ${textMuted} mt-1`}>
              Calculate your exact 2.5% annual zakat on wealth exceeding the Nisab threshold
            </p>
          </div>

          {/* Results Summary Box */}
          <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${subBg}`}>
            <div>
              <span className={`text-xs ${textMuted}`}>Total Net Zakatable Wealth</span>
              <div className="text-2xl font-bold font-mono text-white">
                ${zakatResult.netWealth.toLocaleString()}
              </div>
              <span className="text-xs text-gray-400">
                {zakatResult.meetsNisab
                  ? 'Exceeds Nisab threshold — Zakat is due'
                  : 'Below Nisab threshold — No Zakat due'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#00D278] font-bold">Zakat Payable (2.5%)</span>
              <div className="text-3xl font-extrabold font-mono text-[#00D278]">
                ${Math.round(zakatResult.zakatDue).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Input fields */}
          <div className="space-y-3">
            {[
              { label: 'Cash in Bank & Hand ($)', key: 'cash' },
              { label: 'Gold & Silver Value ($)', key: 'goldAndSilver' },
              { label: 'Shares & Investments ($)', key: 'investments' },
              { label: 'Business Merchandise / Inventory ($)', key: 'businessAssets' },
              { label: 'Money Owed to You ($)', key: 'moneyOwedToYou' },
              { label: 'Immediate Debts & Liabilities to Deduct ($)', key: 'debtsDue' },
              { label: 'Current Nisab Threshold (Value of 87.48g Gold, $)', key: 'nisabThreshold' },
            ].map((field) => (
              <div
                key={field.key}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border ${
                  isAmoled ? 'bg-[#121212] border-neutral-800' : 'bg-[#002828]/60 border-white/5'
                }`}
              >
                <label className="text-xs font-medium text-gray-200">{field.label}</label>
                <input
                  type="number"
                  value={zakatInputs[field.key as keyof ZakatInputs]}
                  onChange={(e) =>
                    setZakatInputs({
                      ...zakatInputs,
                      [field.key]: Number(e.target.value) || 0,
                    })
                  }
                  className={`w-36 rounded-xl px-3 py-1.5 text-sm font-mono text-right text-white focus:outline-none focus:border-[#00D278] border ${
                    isAmoled ? 'bg-neutral-900 border-neutral-700' : 'bg-[#003228] border-white/10'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // UTILITY: HADITH LIBRARY
  // -------------------------------------------------------------
  if (activeScreen === 'hadith') {
    const featuredHadiths = [
      {
        collection: 'Sahih al-Bukhari',
        number: 1,
        arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
        translation: 'Actions are according to intentions, and everyone will get what was intended for.',
        chapter: 'Book of Revelation',
      },
      {
        collection: 'Sahih Muslim',
        number: 223,
        arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ',
        translation: 'Purity is half of iman (faith). Alhamdulillah fills the scale.',
        chapter: 'Book of Purification',
      },
      {
        collection: '40 Hadith an-Nawawi',
        number: 13,
        arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
        translation: 'None of you truly believes until he loves for his brother what he loves for himself.',
        chapter: 'Brotherhood in Islam',
      },
      {
        collection: 'Sunan at-Tirmidhi',
        number: 2910,
        arabic: 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالحَسَنَةُ بِعَشْرِ أَمْثَالِهَا',
        translation: 'Whoever recites a letter from the Book of Allah will receive one hasanah for it, and each hasanah is multiplied ten times.',
        chapter: 'Virtues of the Quran',
      },
    ];

    return (
      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-24">
        <button
          onClick={() => setActiveScreen('menu')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#00D278] hover:underline cursor-pointer"
        >
          ← Back to Utilities
        </button>

        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#00D278]" />
            <span>Hadith & Sunnah Collections</span>
          </h2>
          <p className={`text-xs ${textMuted}`}>
            Authentic traditions of the Prophet Muhammad (ﷺ)
          </p>
        </div>

        <div className="space-y-4">
          {featuredHadiths.map((h, i) => (
            <div key={i} className={`${cardBg} border rounded-3xl p-5 sm:p-6 space-y-3 shadow-lg`}>
              <div className={`flex items-center justify-between text-xs border-b pb-2 ${
                isAmoled ? 'border-neutral-800 text-neutral-400' : 'border-[#002828] text-[#A8C4B8]'
              }`}>
                <span className="font-bold text-[#00D278]">{h.collection} #{h.number}</span>
                <span>{h.chapter}</span>
              </div>

              <p className="font-arabic text-xl sm:text-2xl text-right text-white leading-loose select-all">
                {h.arabic}
              </p>

              <p className="text-sm text-gray-200 leading-relaxed italic">
                "{h.translation}"
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // UTILITY: KHATMAH TRACKER DETAILS
  // -------------------------------------------------------------
  if (activeScreen === 'khatmah') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5 pb-24">
        <button
          onClick={() => setActiveScreen('menu')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#00D278] hover:underline cursor-pointer"
        >
          ← Back to Utilities
        </button>

        <div className={`${cardBg} border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6`}>
          <div>
            <span className="text-xs uppercase tracking-widest text-[#00D278] font-bold">
              Quran Completion Tracker
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              {appState.khatmah.title}
            </h2>
            <p className={`text-xs ${textMuted} mt-1`}>
              Aiming to complete full Quran recitation in {appState.khatmah.targetDays} days
            </p>
          </div>

          <div className={`p-5 rounded-2xl border flex items-center justify-between ${subBg}`}>
            <div>
              <span className={`text-xs ${textMuted}`}>Completed Verses</span>
              <div className="text-3xl font-extrabold font-mono text-white">
                {appState.khatmah.completedAyahsCount} <span className="text-xs text-gray-400">/ 6,236</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#00D278] font-bold">Progress</span>
              <div className="text-3xl font-mono font-extrabold text-[#00D278]">
                {Math.round((appState.khatmah.completedAyahsCount / 6236) * 100)}%
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToQuran(1)}
            className="w-full py-3 bg-[#00D278] hover:bg-[#00b868] text-[#002828] font-bold text-sm rounded-2xl shadow transition cursor-pointer"
          >
            Continue Reading in Mushaf
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DEFAULT: MAIN UTILITY MENU / MORE DASHBOARD
  // -------------------------------------------------------------
  const utilityItems = [
    {
      screen: 'prayers' as UtilityScreen,
      icon: Clock,
      title: 'Prayer Times (مواقيت الصلاة)',
      desc: 'All 6 daily prayers with live adhan countdown & method calculation',
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      screen: 'qibla' as UtilityScreen,
      icon: Compass,
      title: 'Qibla Direction (القبلة)',
      desc: 'Accurate compass bearing to the Kaaba with distance in km',
      color: 'text-teal-400 bg-teal-500/10',
    },
    {
      screen: 'azkar' as UtilityScreen,
      icon: Heart,
      title: 'Dua & Azkar (الأذكار والأدعية)',
      desc: 'Hisnul Muslim morning, evening, after-prayer & sleep supplications',
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      screen: 'tasbih' as UtilityScreen,
      icon: RotateCcw,
      title: 'Digital Tasbih (المسبحة الإلكترونية)',
      desc: 'Interactive bead counter with target loops and authentic dhikr phrases',
      color: 'text-purple-400 bg-purple-500/10',
    },
    {
      screen: 'hadith' as UtilityScreen,
      icon: BookOpen,
      title: 'Hadith Library (الأحاديث النبوية)',
      desc: 'Sahih Bukhari, Sahih Muslim, and 40 Hadith an-Nawawi',
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      screen: 'zakat' as UtilityScreen,
      icon: DollarSign,
      title: 'Zakat Calculator (حاسبة الزكاة)',
      desc: 'Exact 2.5% calculation with current Nisab thresholds & assets',
      color: 'text-yellow-400 bg-yellow-500/10',
    },
    {
      screen: 'khatmah' as UtilityScreen,
      icon: Sparkles,
      title: 'Khatmah Tracker (ختمة القرآن)',
      desc: 'Track and plan your full 30 Juz reading completion',
      color: 'text-emerald-400 bg-emerald-500/10',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-6 pb-24">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#00D278]" />
          <span>Islamic Lifestyle & Utilities</span>
          <span className="font-badge text-[#00D278] text-2xl font-normal">المزيد</span>
        </h2>
        <p className="text-xs text-[#A8C4B8] mt-0.5">
          Everything for your daily worship, prayer times, remembrance, and charitable obligations
        </p>
      </div>

      {/* User-Controlled Theme Switcher Card */}
      <div className={`p-5 rounded-3xl border shadow-xl space-y-4 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-inherit/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00D278]/10 text-[#00D278]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">App Appearance & Theme</h3>
              <p className={`text-xs ${textMuted}`}>
                Choose between classic emerald Islamic green or 100% true black AMOLED mode
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center text-xs font-mono font-bold text-[#00D278] bg-black/30 px-3 py-1 rounded-xl border border-[#00D278]/30">
            {isAmoled ? 'True Black AMOLED' : 'Deep Green Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Deep Green Option */}
          <button
            onClick={() => onSetThemeMode('deep-green')}
            className={`p-4 rounded-2xl border text-left transition flex items-start justify-between cursor-pointer ${
              !isAmoled
                ? 'bg-[#00D278]/20 border-[#00D278] shadow-md shadow-[#00D278]/10'
                : 'bg-black/40 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#002828] border-2 border-[#00D278] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00D278]" />
                </div>
                <span className="font-bold text-sm text-white">Deep Green (السمت الأخضر)</span>
              </div>
              <p className={`text-xs ${textMuted} leading-relaxed`}>
                Heritage emerald-teal palette (#002828). Traditional aesthetic with calming spiritual tones.
              </p>
            </div>
            {!isAmoled && (
              <span className="w-5 h-5 rounded-full bg-[#00D278] text-[#002828] flex items-center justify-center text-xs font-bold shrink-0 ml-2">
                ✓
              </span>
            )}
          </button>

          {/* True Black AMOLED Option */}
          <button
            onClick={() => onSetThemeMode('amoled')}
            className={`p-4 rounded-2xl border text-left transition flex items-start justify-between cursor-pointer ${
              isAmoled
                ? 'bg-[#00D278]/20 border-[#00D278] shadow-md shadow-[#00D278]/10'
                : 'bg-[#002828]/50 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-black border-2 border-neutral-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <span className="font-bold text-sm text-white">True Black AMOLED (الوضع المعتم)</span>
              </div>
              <p className={`text-xs ${textMuted} leading-relaxed`}>
                100% OLED black (#000000). Maximum contrast, zero light bleed, battery saving for night recitation.
              </p>
            </div>
            {isAmoled && (
              <span className="w-5 h-5 rounded-full bg-[#00D278] text-[#002828] flex items-center justify-center text-xs font-bold shrink-0 ml-2">
                ✓
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Utilities List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {utilityItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.screen}
              onClick={() => setActiveScreen(item.screen)}
              className={`p-4 rounded-3xl border transition flex items-center justify-between text-left group shadow-lg cursor-pointer ${cardBg} ${cardHover}`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition ${item.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-[#00D278] transition">
                    {item.title}
                  </h3>
                  <p className={`text-xs ${textMuted} mt-0.5 max-w-xs`}>
                    {item.desc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition" />
            </button>
          );
        })}
      </div>

      {/* About App & Islamic Heritage Box */}
      <div className={`p-5 rounded-3xl border text-xs space-y-2 ${isAmoled ? 'bg-[#0a0a0a] border-neutral-800 text-neutral-400' : 'bg-[#003228]/60 border-white/5 text-[#A8C4B8]'}`}>
        <h4 className="font-bold text-white text-sm">About Qalam (قلم)</h4>
        <p>
          "Recite in the name of your Lord who created — Created man from a clinging substance. Recite, and your Lord is the most Generous — Who taught by the pen." (Surah Al-'Alaq 96:1-4)
        </p>
        <p className="text-[11px] text-gray-400">
          Built with love for the Ummah. Quranic text in Uthmani calligraphy, authentic hadith and Hisnul Muslim supplications.
        </p>
      </div>
    </div>
  );
};
