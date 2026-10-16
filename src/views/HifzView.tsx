import React, { useState } from 'react';
import {
  Award,
  Brain,
  CheckCircle2,
  ChevronRight,
  Eye,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, HifzCard, processSM2Review } from '@/services/storage';
import { SURAHS_LIST, getAyahAudioUrl } from '@/services/quran-data';

interface HifzViewProps {
  appState: AppState;
  onUpdateCards: (cards: HifzCard[]) => void;
  onIncrementHasanat: (amount: number) => void;
  onNavigateToQuran: (surahNumber: number) => void;
  onIncrementHifzGoal?: () => void;
}

export const HifzView: React.FC<HifzViewProps> = ({
  appState,
  onUpdateCards,
  onIncrementHasanat,
  onNavigateToQuran,
  onIncrementHifzGoal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'srs' | 'garden' | 'quiz' | 'coach'>('srs');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Mutashabihat Quiz State
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);

  const cards = appState.hifzCards || [];
  const currentCard = cards[currentCardIndex] || null;

  // Handle SM-2 Review response
  const handleGrade = (grade: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    const updatedCard = processSM2Review(currentCard, grade);
    const updatedCards = [...cards];
    updatedCards[currentCardIndex] = updatedCard;

    onUpdateCards(updatedCards);
    onIncrementHasanat(grade === 'easy' ? 40 : 20);
    onIncrementHifzGoal?.();

    if (grade === 'easy' || grade === 'good') {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }

    setIsAnswerRevealed(false);
    if (currentCardIndex + 1 < cards.length) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  // Mutashabihat questions dataset
  const quizQuestions = [
    {
      question: 'Complete the Ayah: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ"',
      surah: 'Ar-Rahman (Surah 55)',
      options: [
        'خَلَقَ الْإِنسَانَ مِن صَلْصَالٍ كَالْفَخَّارِ',
        'يُرْسَلُ عَلَيْكُمَا شُوَاظٌ مِّن نَّارٍ',
        'مَرَجَ الْبَحْرَيْنِ يَلْتَقِيَانِ',
        'هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ',
      ],
      correctIndex: 0,
      translation: 'Which of the favors of your Lord will you deny? He created man from dry clay like pottery.',
    },
    {
      question: 'Which Surah starts with: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ"?',
      surah: 'Surah Identification',
      options: ['Al-Kawthar (108)', 'Al-Ikhlas (112)', 'An-Nasr (110)', 'Al-Qadr (97)'],
      correctIndex: 0,
      translation: 'Indeed, We have granted you, [O Muhammad], al-Kawthar.',
    },
    {
      question: 'Complete the mutashabih verse: "الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ..."',
      surah: 'Al-Kahf (Surah 18:1)',
      options: [
        'وَلَمْ يَجْعَل لَّهُ عِوَجًا',
        'قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا',
        'الَّذِي لَهُ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ',
        'سَيَقُولُونَ ثَلَاثَةٌ رَّابِعُهُمْ كَلْبُهُمْ',
      ],
      correctIndex: 0,
      translation: '[All] praise is due to Allah, who has sent down upon His Servant the Book and has not made therein any deviance.',
    },
  ];

  const currentQuiz = quizQuestions[quizQuestionIndex];

  const handleQuizOption = (index: number) => {
    if (isQuizAnswered) return;
    setSelectedQuizAnswer(index);
    setIsQuizAnswered(true);

    if (index === currentQuiz.correctIndex) {
      setQuizScore((prev) => prev + 1);
      onIncrementHasanat(50);
      confetti({ particleCount: 40, spread: 60 });
    }
  };

  const nextQuizQuestion = () => {
    setIsQuizAnswered(false);
    setSelectedQuizAnswer(null);
    setQuizQuestionIndex((prev) => (prev + 1) % quizQuestions.length);
  };

  const isAmoled = (appState.themeMode || 'deep-green') === 'amoled';
  const cardBg = isAmoled ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-[#003228] border-[#00D278]/20';
  const subBg = isAmoled ? 'bg-[#121212] border-neutral-800' : 'bg-[#002828] border-[#00D278]/20';
  const pillBg = isAmoled ? 'bg-neutral-900 border-neutral-800' : 'bg-[#003228] border-[#00D278]/20';
  const textMuted = isAmoled ? 'text-neutral-400' : 'text-[#A8C4B8]';

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-6 pb-24">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#00D278]" />
            <span>Hifz & Memorization Hub</span>
            <span className="font-badge text-[#00D278] text-2xl font-normal">الحفظ والمراجعة</span>
          </h2>
          <p className={`text-xs ${textMuted} mt-0.5`}>
            Spaced Repetition (SM-2) memory coach, interactive 30 Juz Garden, and Mutashabihat quiz
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className={`flex items-center gap-2 ${pillBg} border px-3 py-1.5 rounded-2xl text-xs`}>
          <span className="text-gray-300 font-medium">Mastered:</span>
          <span className="font-bold text-[#00D278]">
            {cards.filter((c) => c.status === 'mastered').length}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-300 font-medium">In Review:</span>
          <span className="font-bold text-amber-400">
            {cards.filter((c) => c.status === 'review').length}
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className={`flex items-center gap-2 ${pillBg} p-1.5 rounded-2xl border text-xs font-semibold overflow-x-auto`}>
        <button
          onClick={() => setActiveSubTab('srs')}
          className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'srs'
              ? 'bg-[#00D278] text-[#002828] shadow'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Daily Review ({cards.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('garden')}
          className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'garden'
              ? 'bg-[#00D278] text-[#002828] shadow'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hifz Garden (30 Juz)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'quiz'
              ? 'bg-[#00D278] text-[#002828] shadow'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Mutashabihat Quiz</span>
        </button>

        <button
          onClick={() => setActiveSubTab('coach')}
          className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'coach'
              ? 'bg-[#00D278] text-[#002828] shadow'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Tajweed Coach</span>
        </button>
      </div>

      {/* -------------------------------------------------------- */}
      {/* SUB-VIEW 1: SPACED REPETITION REVIEW (SM-2) */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'srs' && (
        <div className="space-y-4">
          {currentCard ? (
            <div className={`${cardBg} border rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 relative`}>
              {/* Top metadata */}
              <div className={`flex items-center justify-between text-xs border-b pb-3 ${isAmoled ? 'border-neutral-800 text-neutral-400' : 'border-[#002828] text-[#A8C4B8]'}`}>
                <span className="font-semibold text-white">
                  Card {currentCardIndex + 1} of {cards.length}
                </span>
                <span className={`px-2.5 py-1 rounded-full border font-bold text-[#00D278] capitalize ${isAmoled ? 'bg-neutral-900 border-neutral-800' : 'bg-[#002828] border-[#00D278]/20'}`}>
                  {currentCard.status} • Interval: {currentCard.intervalDays}d
                </span>
                <span className="text-xs">
                  {currentCard.surahName} ({currentCard.surahNumber}:{currentCard.ayahNumber})
                </span>
              </div>

              {/* Card Question/Prompt */}
              <div className="py-4 space-y-3">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                  Recall this Verse:
                </span>
                <p className="text-sm sm:text-base text-gray-200 italic max-w-xl mx-auto">
                  "{currentCard.translation}"
                </p>
              </div>

              {/* Reveal toggle button */}
              <div>
                {!isAnswerRevealed ? (
                  <button
                    onClick={() => setIsAnswerRevealed(true)}
                    className={`px-6 py-3 rounded-2xl border text-white font-bold text-sm transition flex items-center gap-2 mx-auto shadow cursor-pointer ${
                      isAmoled
                        ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700'
                        : 'bg-[#002828] hover:bg-[#003d32] border-[#00D278]/30'
                    }`}
                  >
                    <Eye className="w-4 h-4 text-[#00D278]" />
                    <span>Reveal Arabic Ayah</span>
                  </button>
                ) : (
                  <div className={`p-6 rounded-2xl border space-y-4 animate-in fade-in ${subBg}`}>
                    <p className="font-arabic text-2xl sm:text-3xl text-white font-medium leading-loose select-all">
                      {currentCard.textUthmani}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          const url = getAyahAudioUrl(currentCard.surahNumber, currentCard.ayahNumber);
                          const audio = new Audio(url);
                          audio.play().catch(() => {});
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Listen to Recitation</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Grading Buttons (SM-2 Quality Rating) */}
              {isAnswerRevealed && (
                <div className="pt-4 border-t border-[#002828] space-y-2">
                  <span className="text-xs text-[#A8C4B8] font-medium block">
                    How well did you remember this Ayah?
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto">
                    <button
                      onClick={() => handleGrade('again')}
                      className="p-3 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-bold text-xs transition cursor-pointer"
                    >
                      <div className="text-sm">Again</div>
                      <div className="text-[10px] opacity-75 font-normal">&lt; 1 day</div>
                    </button>

                    <button
                      onClick={() => handleGrade('hard')}
                      className="p-3 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 font-bold text-xs transition cursor-pointer"
                    >
                      <div className="text-sm">Hard</div>
                      <div className="text-[10px] opacity-75 font-normal">3 days</div>
                    </button>

                    <button
                      onClick={() => handleGrade('good')}
                      className="p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition cursor-pointer"
                    >
                      <div className="text-sm">Good</div>
                      <div className="text-[10px] opacity-75 font-normal">6 days</div>
                    </button>

                    <button
                      onClick={() => handleGrade('easy')}
                      className="p-3 rounded-2xl bg-[#00D278]/20 hover:bg-[#00D278]/30 border border-[#00D278]/50 text-[#00D278] font-bold text-xs transition cursor-pointer"
                    >
                      <div className="text-sm">Easy</div>
                      <div className="text-[10px] opacity-75 font-normal">12 days</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#003228] rounded-3xl border border-[#00D278]/20 p-6 space-y-3">
              <Sparkles className="w-10 h-10 text-[#00D278] mx-auto" />
              <h3 className="text-lg font-bold text-white">No Ayahs in Review Queue</h3>
              <p className="text-xs text-[#A8C4B8] max-w-sm mx-auto">
                While reading in the Quran tab, tap "+ Hifz" on any Ayah to add it to your daily Spaced Repetition queue.
              </p>
              <button
                onClick={() => onNavigateToQuran(1)}
                className="mt-2 px-4 py-2 rounded-xl bg-[#00D278] text-[#002828] font-bold text-xs"
              >
                Open Quran to Add Verses
              </button>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* SUB-VIEW 2: HIFZ GARDEN (30 JUZ VISUALIZER) */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'garden' && (
        <div className="space-y-5">
          <div className={`${cardBg} border rounded-3xl p-6 shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00D278]" />
                  <span>The 30 Juz Memorization Garden</span>
                </h3>
                <p className={`text-xs ${textMuted}`}>
                  Watch your garden bloom as you learn and retain every Juz of the Holy Quran
                </p>
              </div>
              <span className={`text-xs font-mono font-bold text-[#00D278] px-3 py-1.5 rounded-xl border ${isAmoled ? 'bg-neutral-900 border-neutral-800' : 'bg-[#002828] border-[#00D278]/20'}`}>
                1 / 30 Juz Bloomed
              </span>
            </div>

            {/* 30 Juz Flower Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2.5 pt-2">
              {Array.from({ length: 30 }, (_, i) => {
                const juzNum = i + 1;
                const isBloomed = juzNum === 30 || juzNum === 1; // Demo progress
                return (
                  <div
                    key={juzNum}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition ${
                      isBloomed
                        ? isAmoled
                          ? 'bg-neutral-900 border-emerald-500/60 text-white shadow'
                          : 'bg-gradient-to-b from-[#0E9A62]/30 to-[#002828] border-[#00D278]/60 text-white shadow'
                        : isAmoled
                        ? 'bg-black border-neutral-800 text-neutral-500 hover:border-neutral-700'
                        : 'bg-[#002828]/50 border-white/5 text-gray-500 hover:border-[#00D278]/30'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                        isBloomed
                          ? 'bg-[#00D278] text-[#002828] shadow-md shadow-[#00D278]/30'
                          : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {isBloomed ? '🌸' : '🌱'}
                    </div>
                    <span className="text-[10px] font-bold">Juz {juzNum}</span>
                    <span className="text-[9px] opacity-75 font-mono">
                      {isBloomed ? '100%' : '0%'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Surah Memorization Leaf List */}
          <div className={`${cardBg} border rounded-3xl p-6 shadow-lg space-y-3`}>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Surah Mastery Breakdown
            </h4>
            <div className="space-y-2">
              {SURAHS_LIST.slice(0, 7).map((s) => {
                const isComplete = s.number === 1;
                const progress = isComplete ? 100 : s.number === 112 ? 80 : 25;
                return (
                  <div
                    key={s.number}
                    className={`flex items-center justify-between p-3 rounded-2xl border ${
                      isAmoled ? 'bg-[#121212] border-neutral-800' : 'bg-[#002828]/60 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center font-bold text-xs text-[#00D278]">
                        {s.number}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{s.englishName}</div>
                        <div className="text-[11px] text-gray-400">
                          {s.numberOfAyahs} ayahs • Juz {s.startingJuz}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-black/30 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#00D278] h-full rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00D278] w-9 text-right">
                        {progress}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* SUB-VIEW 3: MUTASHABIHAT QUIZ */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'quiz' && (
        <div className={`${cardBg} border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6`}>
          <div className={`flex items-center justify-between pb-3 border-b ${isAmoled ? 'border-neutral-800' : 'border-[#002828]'}`}>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#00D278]" />
                <span>Mutashabihat Verse Quiz</span>
              </h3>
              <p className={`text-xs ${textMuted}`}>
                Master identical and similar verses across different Surahs
              </p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border ${isAmoled ? 'bg-neutral-900 border-neutral-800' : 'bg-[#002828] border-[#00D278]/20'}`}>
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Score: {quizScore}</span>
            </div>
          </div>

          {/* Question Box */}
          <div className={`p-5 rounded-2xl border text-center space-y-2 ${subBg}`}>
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">
              {currentQuiz.surah}
            </span>
            <p className="font-arabic text-xl sm:text-2xl font-medium text-white leading-relaxed">
              {currentQuiz.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuiz.options.map((opt, idx) => {
              const isSelected = selectedQuizAnswer === idx;
              const isCorrect = idx === currentQuiz.correctIndex;

              let btnStyle = isAmoled
                ? 'bg-[#121212] hover:bg-[#1a1a1a] border-neutral-800 text-white'
                : 'bg-[#002828]/60 hover:bg-[#002828] border-white/10 text-white';

              if (isQuizAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-red-950/60 border-red-500 text-red-200';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleQuizOption(idx)}
                  disabled={isQuizAnswered}
                  className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between text-sm cursor-pointer ${btnStyle}`}
                >
                  <span className="font-arabic text-lg sm:text-xl">{opt}</span>
                  {isQuizAnswered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next */}
          {isQuizAnswered && (
            <div className={`pt-3 border-t flex items-center justify-between ${isAmoled ? 'border-neutral-800' : 'border-[#002828]'}`}>
              <p className={`text-xs max-w-md italic ${textMuted}`}>
                Translation: "{currentQuiz.translation}"
              </p>
              <button
                onClick={nextQuizQuestion}
                className="px-4 py-2 bg-[#00D278] hover:bg-[#00b868] text-[#002828] font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* SUB-VIEW 4: TAJWEED COACH DASHBOARD */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'coach' && (
        <div className="space-y-4">
          <div className={`${cardBg} border rounded-3xl p-6 shadow-lg space-y-4`}>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#00D278]" />
              <span>Tajweed & Recitation Performance</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-4 rounded-2xl border text-center ${subBg}`}>
                <span className={`text-xs ${textMuted}`}>Overall Accuracy</span>
                <div className="text-2xl font-bold text-[#00D278] mt-1">94.8%</div>
                <span className="text-[10px] text-emerald-400">Consistent pace</span>
              </div>

              <div className={`p-4 rounded-2xl border text-center ${isAmoled ? 'bg-[#121212] border-amber-500/20' : 'bg-[#002828] border-amber-500/20'}`}>
                <span className={`text-xs ${textMuted}`}>Recited Verses</span>
                <div className="text-2xl font-bold text-amber-400 mt-1">142</div>
                <span className="text-[10px] text-amber-300">+24 this week</span>
              </div>

              <div className={`p-4 rounded-2xl border text-center ${isAmoled ? 'bg-[#121212] border-purple-500/20' : 'bg-[#002828] border-purple-500/20'}`}>
                <span className={`text-xs ${textMuted}`}>Focus Area</span>
                <div className="text-2xl font-bold text-purple-300 mt-1">Qalqalah</div>
                <span className="text-[10px] text-purple-300">Surah Al-Falaq</span>
              </div>
            </div>

            {/* Rule breakdown */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Tajweed Rule Accuracy:
              </span>
              {[
                { name: 'Madd (Prolongation)', rate: 98, color: 'bg-emerald-500' },
                { name: 'Ghunnah (Nasalization)', rate: 92, color: 'bg-teal-500' },
                { name: 'Qalqalah (Echoing sound)', rate: 85, color: 'bg-amber-500' },
                { name: 'Ikhfa (Concealment)', rate: 88, color: 'bg-purple-500' },
                { name: 'Idgham (Merging)', rate: 94, color: 'bg-blue-500' },
              ].map((rule) => (
                <div key={rule.name} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#002828]/50">
                  <span className="font-medium text-gray-200">{rule.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-28 bg-black/40 h-2 rounded-full overflow-hidden">
                      <div className={`${rule.color} h-full rounded-full`} style={{ width: `${rule.rate}%` }} />
                    </div>
                    <span className="font-mono font-bold text-white w-8 text-right">{rule.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
