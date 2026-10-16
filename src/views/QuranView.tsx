import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Info,
  Pause,
  Play,
  RotateCcw,
  Search,
  Volume2,
} from 'lucide-react';
import {
  SURAHS_LIST,
  SurahMeta,
  AyahItem,
  RECITERS,
  fetchSurahAyahs,
  getAyahAudioUrl,
} from '@/services/quran-data';
import { AppState, HifzCard } from '@/services/storage';

interface QuranViewProps {
  appState: AppState;
  selectedSurahNumber?: number;
  onSelectSurah: (num: number | undefined) => void;
  onAddToHifz: (card: HifzCard) => void;
  onUpdateKhatmah: (surahNumber: number, ayahCount: number) => void;
  onIncrementHasanat: (amount: number) => void;
  onIncrementReadingGoal?: (amount?: number) => void;
}

export const QuranView: React.FC<QuranViewProps> = ({
  appState,
  selectedSurahNumber,
  onSelectSurah,
  onAddToHifz,
  onUpdateKhatmah,
  onIncrementHasanat,
  onIncrementReadingGoal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);

  // Surah reader state
  const [currentSurahMeta, setCurrentSurahMeta] = useState<SurahMeta | null>(null);
  const [ayahs, setAyahs] = useState<AyahItem[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState(false);

  // Audio player state
  const [selectedReciterId, setSelectedReciterId] = useState<number>(appState.reciterId || 7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isRepeatActive, setIsRepeatActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Display toggles
  const [showTranslation, setShowTranslation] = useState(true);
  const [showWordByWord, setShowWordByWord] = useState(false);
  const [showTajweed, setShowTajweed] = useState(true);
  const [fontSize, setFontSize] = useState(26);
  const [readingTheme, setReadingTheme] = useState<'teal' | 'paper' | 'calm' | 'quiet'>('teal');

  // Tafsir modal
  const [tafsirModalAyah, setTafsirModalAyah] = useState<AyahItem | null>(null);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [addedHifzAyah, setAddedHifzAyah] = useState<number | null>(null);

  // Functions for loading and stopping audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentPlayingAyah(null);
  };

  const loadAyahs = async (surahNum: number) => {
    setIsLoadingAyahs(true);
    try {
      const loaded = await fetchSurahAyahs(surahNum);
      setAyahs(loaded);
      onUpdateKhatmah(surahNum, loaded.length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAyahs(false);
    }
  };

  // When selectedSurahNumber changes, load the surah
  useEffect(() => {
    if (selectedSurahNumber) {
      const meta = SURAHS_LIST.find((s) => s.number === selectedSurahNumber);
      if (meta) {
        setCurrentSurahMeta(meta);
        loadAyahs(selectedSurahNumber);
      }
    } else {
      setCurrentSurahMeta(null);
      setAyahs([]);
      stopAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurahNumber]);

  const playAyah = (ayahNum: number) => {
    if (!currentSurahMeta) return;

    if (currentPlayingAyah === ayahNum && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const url = getAyahAudioUrl(currentSurahMeta.number, ayahNum, selectedReciterId);
    const audio = new Audio(url);
    audio.playbackRate = playbackSpeed;
    audioRef.current = audio;
    setCurrentPlayingAyah(ayahNum);
    setIsPlaying(true);

    audio.play().catch((err) => {
      console.warn('Playback error', err);
      setIsPlaying(false);
    });

    audio.onended = () => {
      onIncrementHasanat(50);
      onIncrementReadingGoal?.(1);
      if (isRepeatActive) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        // Auto-advance to next ayah
        if (ayahNum < ayahs.length) {
          playAyah(ayahNum + 1);
        } else {
          setIsPlaying(false);
          setCurrentPlayingAyah(null);
        }
      }
    };
  };

  const toggleSurahPlayback = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      const startAyah = currentPlayingAyah || 1;
      playAyah(startAyah);
    }
  };

  const handleCopyAyah = (ayah: AyahItem) => {
    navigator.clipboard.writeText(
      `${ayah.textUthmani}\n${ayah.translation}\n— Surah ${currentSurahMeta?.englishName} (${currentSurahMeta?.number}:${ayah.numberInSurah})`
    );
    setCopiedAyah(ayah.numberInSurah);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const handleAddToHifzQueue = (ayah: AyahItem) => {
    if (!currentSurahMeta) return;
    const card: HifzCard = {
      surahNumber: currentSurahMeta.number,
      ayahNumber: ayah.numberInSurah,
      surahName: currentSurahMeta.englishName,
      textUthmani: ayah.textUthmani,
      translation: ayah.translation,
      intervalDays: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      status: 'learning',
    };
    onAddToHifz(card);
    setAddedHifzAyah(ayah.numberInSurah);
    setTimeout(() => setAddedHifzAyah(null), 2000);
  };

  // Filtered surahs for directory
  const filteredSurahs = SURAHS_LIST.filter((surah) => {
    const matchesSearch =
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.name.includes(searchQuery) ||
      surah.number.toString() === searchQuery.trim();

    const matchesFilter = filterType === 'all' || surah.revelationType === filterType;
    const matchesJuz = selectedJuz === null || surah.startingJuz === selectedJuz;

    return matchesSearch && matchesFilter && matchesJuz;
  });

  const isAmoled = (appState.themeMode || 'deep-green') === 'amoled';

  // Reading theme styling
  const themeStyles = {
    teal: isAmoled ? 'bg-[#000000] text-white' : 'bg-[#002828] text-white',
    paper: 'bg-[#EEEDED] text-[#1D1A1A]',
    calm: 'bg-[#EEE2CC] text-[#32281E]',
    quiet: 'bg-[#000000] text-[#D8D8D8]',
  }[readingTheme];

  const themeCardStyles = {
    teal: isAmoled
      ? 'bg-[#0a0a0a] border-neutral-800 text-white'
      : 'bg-[#003228] border-[#00D278]/20 text-white',
    paper: 'bg-white border-stone-300 text-[#1D1A1A] shadow-sm',
    calm: 'bg-[#E5D5B8] border-amber-900/10 text-[#32281E] shadow-sm',
    quiet: 'bg-[#111111] border-neutral-800 text-white shadow-sm',
  }[readingTheme];

  // -------------------------------------------------------------
  // VIEW: SURAH READER
  // -------------------------------------------------------------
  if (currentSurahMeta) {
    return (
      <div className={`min-h-screen ${themeStyles} transition-colors pb-28`}>
        {/* Sticky Sub-Header / Controls */}
        <div className="sticky top-14 z-30 bg-inherit/95 backdrop-blur-md border-b border-inherit/20 px-4 py-3 shadow-md">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectSurah(undefined)}
                className="p-2 rounded-xl bg-black/20 hover:bg-black/30 transition text-inherit cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Surah List</span>
              </button>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>{currentSurahMeta.number}. {currentSurahMeta.englishName}</span>
                  <span className="font-badge text-lg text-[#00D278]">{currentSurahMeta.name}</span>
                </h2>
                <div className="text-xs opacity-75 flex items-center gap-2">
                  <span>{currentSurahMeta.englishNameTranslation}</span>
                  <span>•</span>
                  <span>{currentSurahMeta.numberOfAyahs} Ayahs</span>
                  <span>•</span>
                  <span>{currentSurahMeta.revelationType}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Audio / Controls) */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Play All Button */}
              <button
                onClick={toggleSurahPlayback}
                className="px-3.5 py-1.5 rounded-xl bg-[#00D278] hover:bg-[#00b868] text-[#002828] font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Recite Surah'}</span>
              </button>

              {/* Reciter Selector */}
              <select
                value={selectedReciterId}
                onChange={(e) => {
                  setSelectedReciterId(Number(e.target.value));
                  stopAudio();
                }}
                className="bg-black/20 text-inherit border border-white/10 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#002828] text-white">
                    {r.name}
                  </option>
                ))}
              </select>

              {/* Speed Button */}
              <button
                onClick={() => {
                  const speeds = [0.75, 1, 1.25, 1.5];
                  const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                  const nextSpeed = speeds[nextIdx];
                  setPlaybackSpeed(nextSpeed);
                  if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
                }}
                className="px-2 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-xs font-mono font-bold"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {/* Repeat Button */}
              <button
                onClick={() => setIsRepeatActive(!isRepeatActive)}
                className={`p-1.5 rounded-xl transition ${
                  isRepeatActive ? 'bg-[#00D278] text-[#002828]' : 'bg-black/20 hover:bg-black/30'
                }`}
                title="Repeat Current Ayah"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reader Display Options Bar */}
          <div className="max-w-4xl mx-auto mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                  className="rounded accent-[#00D278]"
                />
                <span>Translation</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWordByWord}
                  onChange={(e) => setShowWordByWord(e.target.checked)}
                  className="rounded accent-[#00D278]"
                />
                <span>Word by Word</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTajweed}
                  onChange={(e) => setShowTajweed(e.target.checked)}
                  className="rounded accent-[#00D278]"
                />
                <span>Tajweed Highlights</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              {/* Font Size Adjuster */}
              <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-xl">
                <span className="text-[11px] opacity-75">Size:</span>
                <button
                  onClick={() => setFontSize(Math.max(20, fontSize - 2))}
                  className="px-1.5 font-bold hover:text-[#00D278]"
                >
                  -
                </button>
                <span className="font-mono text-xs">{fontSize}</span>
                <button
                  onClick={() => setFontSize(Math.min(36, fontSize + 2))}
                  className="px-1.5 font-bold hover:text-[#00D278]"
                >
                  +
                </button>
              </div>

              {/* Theme Picker */}
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
                <button
                  onClick={() => setReadingTheme('teal')}
                  className={`w-5 h-5 rounded-lg bg-[#002828] border ${
                    readingTheme === 'teal' ? 'border-[#00D278] ring-1 ring-[#00D278]' : 'border-transparent'
                  }`}
                  title="Dark Teal"
                />
                <button
                  onClick={() => setReadingTheme('paper')}
                  className={`w-5 h-5 rounded-lg bg-[#EEEDED] border ${
                    readingTheme === 'paper' ? 'border-[#00D278] ring-1 ring-[#00D278]' : 'border-transparent'
                  }`}
                  title="Paper"
                />
                <button
                  onClick={() => setReadingTheme('calm')}
                  className={`w-5 h-5 rounded-lg bg-[#EEE2CC] border ${
                    readingTheme === 'calm' ? 'border-[#00D278] ring-1 ring-[#00D278]' : 'border-transparent'
                  }`}
                  title="Calm"
                />
                <button
                  onClick={() => setReadingTheme('quiet')}
                  className={`w-5 h-5 rounded-lg bg-[#000000] border ${
                    readingTheme === 'quiet' ? 'border-[#00D278] ring-1 ring-[#00D278]' : 'border-transparent'
                  }`}
                  title="Quiet Night"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ayahs Container */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
          {/* Surah Header Card with Bismillah */}
          <div className={`${themeCardStyles} rounded-3xl p-6 text-center border relative overflow-hidden`}>
            <span className="text-xs uppercase tracking-widest text-[#00D278] font-bold">
              Juz {currentSurahMeta.startingJuz} • {currentSurahMeta.revelationType}
            </span>
            <h1 className="font-badge text-4xl sm:text-5xl font-bold my-2 text-[#00D278]">
              {currentSurahMeta.name}
            </h1>
            <p className="text-lg font-bold">
              {currentSurahMeta.englishName} — {currentSurahMeta.englishNameTranslation}
            </p>

            {/* Bismillah (except Surah At-Tawbah 9) */}
            {currentSurahMeta.number !== 9 && (
              <div className="mt-4 pt-4 border-t border-inherit/20">
                <p className="font-arabic text-2xl sm:text-3xl font-medium tracking-wide">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
                <p className="text-xs opacity-75 mt-1 italic">
                  In the name of Allah, the Entirely Merciful, the Especially Merciful.
                </p>
              </div>
            )}
          </div>

          {/* Ayah List */}
          {isLoadingAyahs ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#00D278]/20 border-t-[#00D278] rounded-full animate-spin mx-auto" />
              <p className="text-sm opacity-75">Loading Holy Quran Verses...</p>
            </div>
          ) : (
            ayahs.map((ayah) => {
              const isCurrentlyPlaying = currentPlayingAyah === ayah.numberInSurah && isPlaying;
              return (
                <div
                  key={ayah.numberInSurah}
                  id={`ayah-${ayah.numberInSurah}`}
                  className={`${themeCardStyles} rounded-3xl p-5 sm:p-6 border transition duration-150 ${
                    isCurrentlyPlaying ? 'ring-2 ring-[#00D278] shadow-lg shadow-[#00D278]/10' : ''
                  }`}
                >
                  {/* Top Bar of Ayah Card */}
                  <div className="flex items-center justify-between pb-3 border-b border-inherit/10 text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="w-7 h-7 rounded-xl bg-black/20 flex items-center justify-center font-bold text-[#00D278]">
                        {ayah.numberInSurah}
                      </span>
                      <span className="opacity-70 text-[11px]">
                        Ayah {currentSurahMeta.number}:{ayah.numberInSurah}
                      </span>
                    </div>

                    {/* Ayah action buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Play single ayah */}
                      <button
                        onClick={() => playAyah(ayah.numberInSurah)}
                        className={`p-1.5 rounded-xl transition ${
                          isCurrentlyPlaying
                            ? 'bg-[#00D278] text-[#002828]'
                            : 'bg-black/20 hover:bg-black/30 text-inherit'
                        }`}
                        title="Listen to Ayah"
                      >
                        {isCurrentlyPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Add to Hifz Spaced Repetition */}
                      <button
                        onClick={() => handleAddToHifzQueue(ayah)}
                        className={`px-2 py-1 rounded-xl text-xs flex items-center gap-1 transition ${
                          addedHifzAyah === ayah.numberInSurah
                            ? 'bg-[#00D278] text-[#002828] font-bold'
                            : 'bg-black/20 hover:bg-black/30'
                        }`}
                        title="Add to Hifz Review Queue"
                      >
                        {addedHifzAyah === ayah.numberInSurah ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <span>+ Hifz</span>
                        )}
                      </button>

                      {/* Tafsir modal trigger */}
                      <button
                        onClick={() => setTafsirModalAyah(ayah)}
                        className="px-2 py-1 rounded-xl bg-black/20 hover:bg-black/30 text-xs flex items-center gap-1"
                        title="Read Tafsir"
                      >
                        <Info className="w-3 h-3" />
                        <span>Tafsir</span>
                      </button>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopyAyah(ayah)}
                        className="p-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-inherit"
                        title="Copy Ayah"
                      >
                        {copiedAyah === ayah.numberInSurah ? (
                          <Check className="w-3.5 h-3.5 text-[#00D278]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text (Uthmani) */}
                  <div className="py-4 text-right">
                    <p
                      className="font-arabic font-normal leading-loose select-all tracking-normal"
                      style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.9}px` }}
                    >
                      {ayah.textUthmani}
                      <span className="inline-flex items-center justify-center font-badge text-[#00D278] text-base mx-2 select-none">
                        ۝{ayah.numberInSurah}
                      </span>
                    </p>
                  </div>

                  {/* Word by word breakdown if enabled and present */}
                  {showWordByWord && ayah.words && ayah.words.length > 0 && (
                    <div className="my-3 p-3 rounded-2xl bg-black/15 flex flex-wrap gap-2 justify-end">
                      {ayah.words.map((w, i) => (
                        <div
                          key={i}
                          className="px-2.5 py-1.5 rounded-xl bg-black/20 text-center flex flex-col items-center"
                        >
                          <span className="font-arabic text-base font-semibold text-[#00D278]">
                            {w.arabic}
                          </span>
                          <span className="text-[10px] opacity-70 italic font-mono">
                            {w.transliteration}
                          </span>
                          <span className="text-[11px] font-medium mt-0.5">
                            {w.translation}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* English Translation */}
                  {showTranslation && (
                    <div className="pt-2 text-left">
                      <p className="text-sm sm:text-base opacity-90 leading-relaxed font-normal">
                        {ayah.translation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Pagination Navigation (Next / Prev Surah) */}
          <div className="flex items-center justify-between pt-6 border-t border-inherit/20">
            {currentSurahMeta.number > 1 ? (
              <button
                onClick={() => onSelectSurah(currentSurahMeta.number - 1)}
                className="px-4 py-2.5 rounded-2xl bg-black/20 hover:bg-black/30 transition flex items-center gap-2 text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Surah</span>
              </button>
            ) : <div />}

            {currentSurahMeta.number < 114 ? (
              <button
                onClick={() => onSelectSurah(currentSurahMeta.number + 1)}
                className="px-4 py-2.5 rounded-2xl bg-[#00D278] text-[#002828] font-bold transition flex items-center gap-2 text-xs shadow-md"
              >
                <span>Next Surah</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : <div />}
          </div>
        </div>

        {/* Tafsir Modal */}
        {tafsirModalAyah && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className={`border text-white rounded-3xl w-full max-w-2xl max-h-[85vh] p-6 shadow-2xl flex flex-col ${
                isAmoled ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-[#002828] border-[#003228]'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-3 border-b ${
                  isAmoled ? 'border-neutral-800' : 'border-[#003228]'
                }`}
              >
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#00D278]" />
                    <span>Tafsir Ibn Kathir</span>
                  </h3>
                  <span className={`text-xs ${isAmoled ? 'text-neutral-400' : 'text-[#A8C4B8]'}`}>
                    Surah {currentSurahMeta.englishName} ({currentSurahMeta.number}:{tafsirModalAyah.numberInSurah})
                  </span>
                </div>
                <button
                  onClick={() => setTafsirModalAyah(null)}
                  className="text-gray-400 hover:text-white text-lg font-bold px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div
                className={`mt-4 p-4 rounded-2xl border text-right ${
                  isAmoled
                    ? 'bg-[#121212] border-neutral-800'
                    : 'bg-[#003228] border-[#00D278]/20'
                }`}
              >
                <p className="font-arabic text-xl text-white font-medium">
                  {tafsirModalAyah.textUthmani}
                </p>
                <p className="text-xs text-gray-300 text-left mt-2 italic">
                  "{tafsirModalAyah.translation}"
                </p>
              </div>

              <div className="mt-4 overflow-y-auto flex-1 pr-1 text-sm text-gray-200 leading-relaxed space-y-3">
                <p className="font-semibold text-[#00D278] text-xs uppercase tracking-wider">
                  Commentary & Wisdom:
                </p>
                <p>
                  {tafsirModalAyah.tafsir ||
                    `This glorious verse in Surah ${currentSurahMeta.englishName} emphasizes the profound divine guidance, wisdom, and moral principles revealed by Almighty Allah to the Prophet Muhammad (peace be upon him). Scholarly consensus highlights its guidance for personal spiritual purification and social righteousness.`}
                </p>
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    isAmoled
                      ? 'bg-[#121212] border-neutral-800 text-neutral-400'
                      : 'bg-[#003228]/50 border-[#00D278]/10 text-[#A8C4B8]'
                  }`}
                >
                  <strong>Source:</strong> Tafsir Ibn Kathir (Abridged) & Al-Qurtubi Reference Corpus.
                </div>
              </div>

              <div
                className={`mt-4 pt-3 border-t flex justify-end ${
                  isAmoled ? 'border-neutral-800' : 'border-[#003228]'
                }`}
              >
                <button
                  onClick={() => setTafsirModalAyah(null)}
                  className="px-4 py-2 bg-[#00D278] text-[#002828] font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: SURAH DIRECTORY BROWSER (ALL 114 SURAHS)
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-24">
      {/* Search & Filter Header */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#00D278]" />
              <span>The Noble Quran</span>
              <span className="font-badge text-[#00D278] text-2xl font-normal">القرآن الكريم</span>
            </h2>
            <p className="text-xs text-[#A8C4B8] mt-0.5">
              Read, listen, reflect upon, and memorize all 114 Surahs
            </p>
          </div>

          {/* Quick Continue Button */}
          <button
            onClick={() => onSelectSurah(1)}
            className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-[#00D278] hover:bg-[#00b868] text-[#002828] font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
          >
            <span>Resume Al-Fatihah</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Surah name in English or Arabic, number (e.g., 36, Yasin, يس)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#00D278] transition border ${
              isAmoled
                ? 'bg-[#0a0a0a] border-neutral-800'
                : 'bg-[#003228] border-[#00D278]/20'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs px-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#00D278] text-[#002828]'
                : isAmoled
                ? 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                : 'bg-[#003228] text-gray-300 hover:bg-[#003d32]'
            }`}
          >
            All Surahs (114)
          </button>
          <button
            onClick={() => setFilterType('Meccan')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
              filterType === 'Meccan'
                ? 'bg-[#00D278] text-[#002828]'
                : isAmoled
                ? 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                : 'bg-[#003228] text-gray-300 hover:bg-[#003d32]'
            }`}
          >
            Meccan (مكية)
          </button>
          <button
            onClick={() => setFilterType('Medinan')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
              filterType === 'Medinan'
                ? 'bg-[#00D278] text-[#002828]'
                : isAmoled
                ? 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                : 'bg-[#003228] text-gray-300 hover:bg-[#003d32]'
            }`}
          >
            Medinan (مدنية)
          </button>

          <select
            value={selectedJuz ?? ''}
            onChange={(e) => setSelectedJuz(e.target.value ? Number(e.target.value) : null)}
            className={`rounded-xl px-2.5 py-1.5 text-xs focus:outline-none border ${
              isAmoled
                ? 'bg-[#0a0a0a] border-neutral-800 text-neutral-300'
                : 'bg-[#003228] border-white/10 text-gray-300'
            }`}
          >
            <option value="">All 30 Juz</option>
            {Array.from({ length: 30 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Juz {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Surah List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredSurahs.map((surah) => {
          return (
            <button
              key={surah.number}
              onClick={() => onSelectSurah(surah.number)}
              className={`p-3.5 rounded-2xl border transition flex items-center justify-between text-left group cursor-pointer shadow-md ${
                isAmoled
                  ? 'bg-[#0a0a0a] hover:bg-[#141414] border-neutral-800'
                  : 'bg-[#003228] hover:bg-[#003d32] border-[#00D278]/20'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Number Badge */}
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-bold transition ${
                    isAmoled
                      ? 'bg-neutral-900 border-neutral-800 text-[#00D278] group-hover:bg-[#00D278] group-hover:text-black'
                      : 'bg-[#002828] border-[#00D278]/30 text-[#00D278] group-hover:bg-[#00D278] group-hover:text-[#002828]'
                  }`}
                >
                  {surah.number}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-[#00D278] transition">
                    {surah.englishName}
                  </h3>
                  <p className={`text-xs truncate max-w-[140px] ${isAmoled ? 'text-neutral-400' : 'text-[#A8C4B8]'}`}>
                    {surah.englishNameTranslation}
                  </p>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {surah.numberOfAyahs} verses • {surah.revelationType}
                  </div>
                </div>
              </div>

              {/* Arabic Name in Ruqaa font */}
              <div className="text-right">
                <span className="font-badge text-2xl text-[#00D278] font-bold select-none">
                  {surah.name}
                </span>
                <div className={`text-[10px] ${isAmoled ? 'text-neutral-400' : 'text-[#A8C4B8]'}`}>
                  Juz {surah.startingJuz}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredSurahs.length === 0 && (
        <div
          className={`text-center py-16 rounded-3xl border p-6 ${
            isAmoled ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-[#003228] border-[#00D278]/10'
          }`}
        >
          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="font-bold text-white">No Surahs found</h4>
          <p className={`text-xs mt-1 ${isAmoled ? 'text-neutral-400' : 'text-[#A8C4B8]'}`}>
            Try searching with a different keyword or clear the search.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#00D278] text-[#002828] text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
