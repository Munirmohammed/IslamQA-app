import React, { useState } from 'react';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Flame,
  Info,
  Minus,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyGoalTracker, ThemeMode } from '@/services/storage';

interface DailyGoalWidgetProps {
  dailyGoals: DailyGoalTracker;
  streak: number;
  themeMode?: ThemeMode;
  onIncrementReadingGoal: (amount?: number) => void;
  onIncrementHifzGoal: (amount?: number) => void;
  onUpdateGoalTargets: (readingTarget: number, hifzTarget: number) => void;
  onNavigateToQuran: (surahNumber?: number) => void;
  onNavigateToHifz: () => void;
}

export const DailyGoalWidget: React.FC<DailyGoalWidgetProps> = ({
  dailyGoals,
  streak,
  themeMode = 'deep-green',
  onIncrementReadingGoal,
  onIncrementHifzGoal,
  onUpdateGoalTargets,
  onNavigateToQuran,
  onNavigateToHifz,
}) => {
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempReadingTarget, setTempReadingTarget] = useState(dailyGoals.readingGoalAyahs);
  const [tempHifzTarget, setTempHifzTarget] = useState(dailyGoals.hifzGoalCards);

  const isAmoled = themeMode === 'amoled';

  // Calculations
  const readingTarget = Math.max(1, dailyGoals.readingGoalAyahs);
  const hifzTarget = Math.max(1, dailyGoals.hifzGoalCards);
  const readingDone = dailyGoals.readingCompletedAyahs;
  const hifzDone = dailyGoals.hifzCompletedCards;

  const readingPct = Math.min(100, Math.round((readingDone / readingTarget) * 100));
  const hifzPct = Math.min(100, Math.round((hifzDone / hifzTarget) * 100));
  const totalCombinedPct = Math.round((readingPct + hifzPct) / 2);

  const isReadingComplete = readingDone >= readingTarget;
  const isHifzComplete = hifzDone >= hifzTarget;
  const isAllComplete = isReadingComplete && isHifzComplete;

  // Theming classes
  const cardBg = isAmoled ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-[#003228] border-[#00D278]/20';
  const cardSubtle = isAmoled ? 'bg-[#121212] border-neutral-800' : 'bg-[#002828]/70 border-[#00D278]/15';
  const buttonSubtle = isAmoled
    ? 'bg-neutral-900 hover:bg-neutral-800 text-gray-200 border-neutral-800'
    : 'bg-[#002828] hover:bg-[#003d32] text-gray-200 border-[#00D278]/20';
  const textMuted = isAmoled ? 'text-neutral-400' : 'text-[#A8C4B8]';

  // Last 7 days consistency tracker strip
  const today = new Date();
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 6;

    if (isToday) {
      return {
        dateStr,
        dayLabel: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
        achieved: isAllComplete,
        isToday: true,
      };
    }

    const matchedHistory = (dailyGoals.history || []).find((h) => h.date === dateStr);
    return {
      dateStr,
      dayLabel: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      achieved: matchedHistory ? matchedHistory.achieved : false,
      isToday: false,
    };
  });

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoalTargets(Math.max(1, tempReadingTarget), Math.max(1, tempHifzTarget));
    setIsEditingGoals(false);
  };

  const handleQuickAddReading = (amount: number) => {
    onIncrementReadingGoal(amount);
  };

  const handleQuickAddHifz = (amount: number) => {
    onIncrementHifzGoal(amount);
  };

  return (
    <div className={`${cardBg} rounded-3xl p-5 sm:p-6 border shadow-xl relative overflow-hidden transition-all duration-200`}>
      {/* Background ambient accent */}
      {isAllComplete && (
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-[#00D278]/10 blur-3xl pointer-events-none" />
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-inherit/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00D278]/15 text-[#00D278] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Daily Consistency Tracker</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#00D278]/20 text-[#00D278] border border-[#00D278]/30">
                  {totalCombinedPct}% Today
                </span>
              </h3>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                Build your steadfast habit of Quran recitation and active memorization
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Active streak pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold text-amber-400 ${cardSubtle}`}>
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{streak} Days Streak</span>
          </div>

          {/* Edit Goals Target Button */}
          <button
            onClick={() => {
              setTempReadingTarget(readingTarget);
              setTempHifzTarget(hifzTarget);
              setIsEditingGoals(true);
            }}
            className={`p-2 rounded-xl border transition cursor-pointer text-xs font-medium flex items-center gap-1.5 ${buttonSubtle}`}
            title="Adjust Daily Goals Target"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Set Targets</span>
          </button>
        </div>
      </div>

      {/* Celebratory Banner if both completed today */}
      {isAllComplete && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-600/25 via-[#00D278]/20 to-teal-600/25 border border-[#00D278]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00D278] text-[#002828] flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>Alhamdulillah! Both Daily Goals Achieved</span>
                <span className="text-xs">🎉</span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Consistency is beloved to Allah. May Allah bless your steadfast devotion.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
            }}
            className="px-3.5 py-1.5 bg-[#00D278] hover:bg-[#00b868] text-[#002828] font-bold text-xs rounded-xl shadow cursor-pointer transition whitespace-nowrap"
          >
            Celebrate 🎉
          </button>
        </div>
      )}

      {/* Goals Trackers Dual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Tracker 1: Daily Quran Reading */}
        <div className={`${cardSubtle} rounded-2xl p-4 sm:p-5 border transition flex flex-col justify-between space-y-4`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-[#00D278] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Quran Reading Goal</span>
                    {isReadingComplete && <CheckCircle2 className="w-4 h-4 text-[#00D278]" />}
                  </h4>
                  <span className={`text-[11px] ${textMuted}`}>Recitation & Contemplation</span>
                </div>
              </div>

              {/* Counter status badge */}
              <div className="text-right">
                <span className="text-lg font-mono font-extrabold text-white">
                  {readingDone}
                </span>
                <span className={`text-xs font-mono ${textMuted}`}> / {readingTarget} Ayahs</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3.5">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className={textMuted}>Daily Progress</span>
                <span className={`font-mono font-bold ${isReadingComplete ? 'text-[#00D278]' : 'text-emerald-300'}`}>
                  {readingPct}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/30 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#00D278] transition-all duration-500"
                  style={{ width: `${readingPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions for Reading */}
          <div className="pt-2 border-t border-inherit/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] ${textMuted} mr-1 hidden sm:inline`}>Quick Log:</span>
              <button
                onClick={() => handleQuickAddReading(1)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition ${buttonSubtle}`}
                title="Mark +1 Ayah read"
              >
                +1
              </button>
              <button
                onClick={() => handleQuickAddReading(5)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition ${buttonSubtle}`}
                title="Mark +5 Ayahs read"
              >
                +5
              </button>
              <button
                onClick={() => handleQuickAddReading(10)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition ${buttonSubtle}`}
                title="Mark +10 Ayahs read"
              >
                +10
              </button>
            </div>

            <button
              onClick={() => onNavigateToQuran()}
              className="px-3 py-1.5 rounded-xl bg-[#00D278] hover:bg-[#00b868] text-[#002828] font-bold text-xs flex items-center gap-1 transition shadow cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Mushaf</span>
            </button>
          </div>
        </div>

        {/* Tracker 2: Daily Hifz Revision */}
        <div className={`${cardSubtle} rounded-2xl p-4 sm:p-5 border transition flex flex-col justify-between space-y-4`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Hifz Memorization Goal</span>
                    {isHifzComplete && <CheckCircle2 className="w-4 h-4 text-[#00D278]" />}
                  </h4>
                  <span className={`text-[11px] ${textMuted}`}>SM-2 Memory Reviews</span>
                </div>
              </div>

              {/* Counter status badge */}
              <div className="text-right">
                <span className="text-lg font-mono font-extrabold text-white">
                  {hifzDone}
                </span>
                <span className={`text-xs font-mono ${textMuted}`}> / {hifzTarget} Cards</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3.5">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className={textMuted}>Daily Progress</span>
                <span className={`font-mono font-bold ${isHifzComplete ? 'text-[#00D278]' : 'text-purple-300'}`}>
                  {hifzPct}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/30 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${hifzPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions for Hifz */}
          <div className="pt-2 border-t border-inherit/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] ${textMuted} mr-1 hidden sm:inline`}>Quick Log:</span>
              <button
                onClick={() => handleQuickAddHifz(1)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition ${buttonSubtle}`}
                title="Mark +1 Card reviewed"
              >
                +1
              </button>
              <button
                onClick={() => handleQuickAddHifz(3)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition ${buttonSubtle}`}
                title="Mark +3 Cards reviewed"
              >
                +3
              </button>
            </div>

            <button
              onClick={onNavigateToHifz}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-[#00D278] hover:opacity-95 text-[#002828] font-bold text-xs flex items-center gap-1 transition shadow cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Review Hifz Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Consistency History Strip */}
      <div className={`mt-4 pt-3.5 border-t border-inherit/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold ${textMuted}`}>7-Day Habit Tracker:</span>
          <div className="flex items-center gap-1.5">
            {pastDays.map((day, idx) => (
              <div
                key={day.dateStr}
                className="flex flex-col items-center gap-1"
                title={`${day.dateStr}: ${day.achieved ? 'Goals Completed' : 'Pending/Incomplete'}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition ${
                    day.achieved
                      ? 'bg-[#00D278] text-[#002828] shadow-sm'
                      : day.isToday
                      ? 'border-2 border-[#00D278]/60 text-white'
                      : isAmoled
                      ? 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                      : 'bg-[#002828] text-gray-500 border border-[#00D278]/10'
                  }`}
                >
                  {day.dayLabel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Hadith snippet */}
        <div className={`flex items-center gap-1.5 text-[11px] italic ${textMuted}`}>
          <Info className="w-3.5 h-3.5 text-[#00D278] shrink-0" />
          <span>"The most beloved of deeds to Allah are those that are most consistent." (Bukhari)</span>
        </div>
      </div>

      {/* Modal: Customize Daily Targets */}
      {isEditingGoals && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cardBg} border text-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95`}>
            <div className="flex items-center justify-between pb-3 border-b border-inherit/10">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-[#00D278]" />
                <h3 className="text-base font-bold text-white">Adjust Daily Consistency Targets</h3>
              </div>
              <button
                onClick={() => setIsEditingGoals(false)}
                className="p-1.5 rounded-xl hover:bg-black/20 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="mt-4 space-y-5">
              {/* Reading Target Setting */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Daily Quran Reading Target (Ayahs)
                </label>
                <p className={`text-[11px] ${textMuted} mb-2`}>
                  Select how many verses you strive to recite or listen to each day.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTempReadingTarget(Math.max(5, tempReadingTarget - 5))}
                    className={`p-2.5 rounded-xl border cursor-pointer ${buttonSubtle}`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={tempReadingTarget}
                    onChange={(e) => setTempReadingTarget(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 py-2 px-3 rounded-xl bg-black/30 border border-inherit/20 text-center font-mono font-bold text-lg text-[#00D278] focus:outline-none focus:ring-1 focus:ring-[#00D278]"
                  />
                  <button
                    type="button"
                    onClick={() => setTempReadingTarget(tempReadingTarget + 5)}
                    className={`p-2.5 rounded-xl border cursor-pointer ${buttonSubtle}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {/* Presets */}
                <div className="flex items-center gap-2 mt-2">
                  {[10, 20, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTempReadingTarget(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border cursor-pointer ${
                        tempReadingTarget === preset
                          ? 'bg-[#00D278] text-[#002828] border-[#00D278]'
                          : buttonSubtle
                      }`}
                    >
                      {preset} ayahs
                    </button>
                  ))}
                </div>
              </div>

              {/* Hifz Target Setting */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Daily Hifz Revision Target (Cards)
                </label>
                <p className={`text-[11px] ${textMuted} mb-2`}>
                  Select how many verses/cards you aim to review using Spaced Repetition each day.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTempHifzTarget(Math.max(1, tempHifzTarget - 1))}
                    className={`p-2.5 rounded-xl border cursor-pointer ${buttonSubtle}`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={tempHifzTarget}
                    onChange={(e) => setTempHifzTarget(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 py-2 px-3 rounded-xl bg-black/30 border border-inherit/20 text-center font-mono font-bold text-lg text-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                  <button
                    type="button"
                    onClick={() => setTempHifzTarget(tempHifzTarget + 1)}
                    className={`p-2.5 rounded-xl border cursor-pointer ${buttonSubtle}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {/* Presets */}
                <div className="flex items-center gap-2 mt-2">
                  {[3, 5, 10, 15].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTempHifzTarget(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border cursor-pointer ${
                        tempHifzTarget === preset
                          ? 'bg-purple-500 text-white border-purple-500'
                          : buttonSubtle
                      }`}
                    >
                      {preset} cards
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-inherit/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingGoals(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${buttonSubtle}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00D278] hover:bg-[#00b868] text-[#002828] font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Save Targets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
