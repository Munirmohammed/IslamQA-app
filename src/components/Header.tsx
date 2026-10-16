import React, { useState, useEffect } from 'react';
import { Compass, Flame, MapPin, Moon, Sparkles, Sun } from 'lucide-react';
import { toHijri } from '@/lib/hijri';
import { WORLD_CITIES } from '@/lib/world-cities';
import { getPrayerTimesForDate, findNextPrayer, formatCountdown } from '@/lib/prayer-times';
import { ThemeMode } from '@/services/storage';

interface HeaderProps {
  selectedCity: string;
  onSelectCity: (cityName: string) => void;
  streak: number;
  hasanat: number;
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
  onOpenPrayerTimes: () => void;
  onOpenQibla: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCity,
  onSelectCity,
  streak,
  hasanat,
  themeMode,
  onToggleThemeMode,
  onOpenPrayerTimes,
  onOpenQibla,
}) => {
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const isAmoled = themeMode === 'amoled';
  const hijri = toHijri(now);
  const currentCityObj = WORLD_CITIES.find((c) => c.name === selectedCity) || WORLD_CITIES[0];
  const prayers = getPrayerTimesForDate(currentCityObj.latitude, currentCityObj.longitude, now);
  const nextPrayer = findNextPrayer(prayers, now);
  const msUntilNext = nextPrayer ? nextPrayer.time.getTime() - now.getTime() : 0;

  const filteredCities = WORLD_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <>
      <header
        className={`sticky top-0 z-40 backdrop-blur-md px-4 py-3 transition-colors ${
          isAmoled
            ? 'bg-black/95 border-b border-neutral-900 text-white'
            : 'bg-[#002828]/95 border-b border-[#003228] text-white'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-md transition ${
                isAmoled
                  ? 'bg-neutral-900 border-neutral-800 text-[#00D278]'
                  : 'bg-gradient-to-br from-[#0E9A62] to-[#003228] border-[#00D278]/30 text-[#00D278] shadow-[#00D278]/10'
              }`}
            >
              <span className="font-badge text-2xl font-bold leading-none select-none">
                ق
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Qalam <span className="text-[#00D278] font-badge text-xl font-normal">قلم</span>
                </h1>
                <span
                  className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${
                    isAmoled
                      ? 'bg-neutral-900 text-[#00D278] border-neutral-800'
                      : 'bg-[#00D278]/15 text-[#00D278] border-[#00D278]/20'
                  }`}
                >
                  {isAmoled ? 'AMOLED' : 'Mushaf & Deen'}
                </span>
              </div>
              <p className={`text-xs flex items-center gap-1.5 ${isAmoled ? 'text-neutral-400' : 'text-[#A8C4B8]'}`}>
                <span>{hijri.day} {hijri.monthName} {hijri.year} AH</span>
                <span>•</span>
                <button
                  onClick={() => setShowCityModal(true)}
                  className="hover:text-white transition flex items-center gap-1 text-[#00D278] cursor-pointer"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{currentCityObj.name} {currentCityObj.flag}</span>
                </button>
              </p>
            </div>
          </div>

          {/* Right quick stats */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Next Prayer Pill */}
            {nextPrayer && (
              <button
                onClick={onOpenPrayerTimes}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full transition text-xs shadow-sm cursor-pointer border ${
                  isAmoled
                    ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-gray-200'
                    : 'bg-[#003228] hover:bg-[#003b30] border-[#00D278]/30 text-gray-300'
                }`}
                title="View Prayer Times"
              >
                <span className="w-2 h-2 rounded-full bg-[#00D278] animate-pulse" />
                <span className="font-medium">{nextPrayer.name}</span>
                <span className="text-[#00D278] font-mono font-bold">in {formatCountdown(msUntilNext)}</span>
              </button>
            )}

            {/* Qibla Button */}
            <button
              onClick={onOpenQibla}
              className={`p-2 rounded-xl transition cursor-pointer border ${
                isAmoled
                  ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-[#00D278]'
                  : 'bg-[#003228] hover:bg-[#003d32] border-[#00D278]/20 text-[#00D278]'
              }`}
              title="Qibla Compass"
            >
              <Compass className="w-4 h-4" />
            </button>

            {/* User-Controlled Theme Toggle Button */}
            <button
              onClick={onToggleThemeMode}
              className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 border text-xs font-semibold ${
                isAmoled
                  ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-emerald-400'
                  : 'bg-[#003228] hover:bg-[#003d32] border-[#00D278]/30 text-amber-300'
              }`}
              title={isAmoled ? 'Switch to Deep Green Islamic Theme' : 'Switch to True Black AMOLED Mode'}
              aria-label="Toggle Theme Mode"
            >
              {isAmoled ? (
                <>
                  <Sun className="w-4 h-4 text-emerald-400" />
                  <span className="hidden md:inline text-[11px] font-medium text-emerald-300">Green</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-amber-300" />
                  <span className="hidden md:inline text-[11px] font-medium text-amber-200">AMOLED</span>
                </>
              )}
            </button>

            {/* Streak */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-400 border ${
                isAmoled
                  ? 'bg-neutral-900 border-amber-500/20'
                  : 'bg-[#003228] border-amber-500/20'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{streak}d</span>
            </div>

            {/* Hasanat */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#00D278] border ${
                isAmoled
                  ? 'bg-neutral-900 border-neutral-800'
                  : 'bg-[#003228] border-[#00D278]/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hasanat.toLocaleString()} hasanat</span>
            </div>
          </div>
        </div>
      </header>

      {/* City Switcher Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`border rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col max-h-[85vh] ${
              isAmoled
                ? 'bg-[#0a0a0a] border-neutral-800 text-white'
                : 'bg-[#002828] border-[#003228] text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isAmoled ? 'border-neutral-800' : 'border-[#003228]'}`}>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00D278]" />
                Select Your Location
              </h2>
              <button
                onClick={() => setShowCityModal(false)}
                className="text-gray-400 hover:text-white text-sm px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className={`text-xs mt-2 mb-3 ${isAmoled ? 'text-neutral-400' : 'text-[#A8C4B8]'}`}>
              Prayer times and Qibla direction are calculated accurately using Muslim World League methodology.
            </p>

            <input
              type="text"
              placeholder="Search city or country..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className={`w-full border rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#00D278] ${
                isAmoled
                  ? 'bg-neutral-900 border-neutral-800'
                  : 'bg-[#003228] border-[#00D278]/20'
              }`}
            />

            <div className="mt-3 overflow-y-auto space-y-1.5 flex-1 pr-1">
              {filteredCities.map((city) => {
                const isSelected = city.name === selectedCity;
                return (
                  <button
                    key={city.name}
                    onClick={() => {
                      onSelectCity(city.name);
                      setShowCityModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-sm transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#00D278]/20 border border-[#00D278]/50 text-white font-medium'
                        : isAmoled
                        ? 'bg-neutral-900/60 hover:bg-neutral-900 border border-transparent text-gray-200'
                        : 'bg-[#003228]/60 hover:bg-[#003228] border border-transparent text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{city.flag}</span>
                      <div>
                        <div className="font-semibold">{city.name}</div>
                        <div className="text-xs text-gray-400">{city.country}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-bold text-[#00D278] bg-[#00D278]/10 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
