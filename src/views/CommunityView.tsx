import React, { useState } from 'react';
import {
  Calendar,
  Flame,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react';
import { AppState } from '@/services/storage';

interface CommunityViewProps {
  appState: AppState;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ appState }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'halaqa' | 'heatmap'>('leaderboard');
  const [joinCode, setJoinCode] = useState('');
  const [hasJoinedCircle, setHasJoinedCircle] = useState(false);

  // Leaderboard demo members
  const leaderboardMembers = [
    { rank: 1, name: 'Aisha_Q', hasanat: 8420, streak: 21, avatar: '🧕', badge: 'Hafidhah' },
    { rank: 2, name: 'You (Demo User)', hasanat: appState.hasanat, streak: appState.streak, avatar: '👤', badge: 'Active Reciter', isCurrentUser: true },
    { rank: 3, name: 'Yusuf92', hasanat: 8150, streak: 18, avatar: '👳', badge: 'Muallim' },
    { rank: 4, name: 'Fatima_reads', hasanat: 7980, streak: 14, avatar: '🌸', badge: 'Student' },
    { rank: 5, name: 'Omar_K', hasanat: 7650, streak: 12, avatar: '🌿', badge: 'Murajaah' },
    { rank: 6, name: 'Zayd_AlAnsari', hasanat: 7210, streak: 9, avatar: '📖', badge: 'Learner' },
  ];

  // Activity heatmap dummy 52 weeks (365 days)
  const daysInYear = 140; // 20 weeks displayed
  const activityIntensity = (dayIdx: number) => {
    // Generate realistic activity
    if (dayIdx % 7 === 5 || dayIdx % 7 === 1) return 3;
    if (dayIdx % 4 === 0) return 2;
    if (dayIdx % 2 === 0) return 1;
    return 0;
  };

  const handleJoinCircle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode) return;
    setHasJoinedCircle(true);
    setJoinCode('');
  };

  const isAmoled = (appState.themeMode || 'deep-green') === 'amoled';
  const cardBg = isAmoled ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-[#003228] border-[#00D278]/20';
  const tabBg = isAmoled ? 'bg-neutral-900 border-neutral-800' : 'bg-[#003228] border-[#00D278]/20';
  const textMuted = isAmoled ? 'text-neutral-400' : 'text-[#A8C4B8]';

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-6 pb-24">
      {/* Community Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-[#00D278]" />
          <span>Quran Community & Halaqat</span>
          <span className="font-badge text-[#00D278] text-2xl font-normal">حلقات القرآن</span>
        </h2>
        <p className={`text-xs ${textMuted} mt-0.5`}>
          Join study circles, compete for righteous deeds (Hasanat), and track daily consistency
        </p>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-2 ${tabBg} p-1.5 rounded-2xl border text-xs font-semibold`}>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-[#00D278] text-[#002828] shadow'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Global Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('halaqa')}
          className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'halaqa'
              ? 'bg-[#00D278] text-[#002828] shadow'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Halaqa Circles</span>
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'heatmap'
              ? 'bg-[#00D278] text-[#002828] shadow'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Activity Heatmap</span>
        </button>
      </div>

      {/* -------------------------------------------------------- */}
      {/* TAB 1: LEADERBOARD */}
      {/* -------------------------------------------------------- */}
      {activeTab === 'leaderboard' && (
        <div className={`${cardBg} border rounded-3xl p-5 sm:p-6 shadow-xl space-y-4`}>
          <div className={`flex items-center justify-between pb-3 border-b ${isAmoled ? 'border-neutral-800' : 'border-[#002828]'}`}>
            <div>
              <h3 className="font-bold text-white text-base">Hasanat Leaderboard</h3>
              <p className={`text-xs ${textMuted}`}>
                Based on authentic hadith: 10 hasanat per letter recited
              </p>
            </div>
            <span className={`text-xs font-mono font-bold text-[#00D278] px-3 py-1 rounded-xl border ${isAmoled ? 'bg-neutral-900 border-neutral-800' : 'bg-[#002828] border-[#00D278]/20'}`}>
              Weekly Reset
            </span>
          </div>

          <div className="space-y-2">
            {leaderboardMembers.map((member) => {
              const medalEmoji =
                member.rank === 1 ? '🥇' : member.rank === 2 ? '🥈' : member.rank === 3 ? '🥉' : null;

              return (
                <div
                  key={member.rank}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                    member.isCurrentUser
                      ? 'bg-[#00D278]/20 border-[#00D278]/60 shadow'
                      : isAmoled
                      ? 'bg-[#121212] border-neutral-800 hover:border-neutral-700'
                      : 'bg-[#002828]/60 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-center font-bold text-sm">
                      {medalEmoji || <span className="text-gray-400 font-mono">#{member.rank}</span>}
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center text-lg">
                      {member.avatar}
                    </div>

                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{member.name}</span>
                        {member.isCurrentUser && (
                          <span className="text-[10px] bg-[#00D278] text-[#002828] font-extrabold px-1.5 py-0.2 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-2">
                        <span>{member.badge}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <Flame className="w-3 h-3 fill-amber-400" />
                          <span>{member.streak}d streak</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold font-mono text-sm text-[#00D278]">
                      {member.hasanat.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-400">hasanat</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 2: HALAQA STUDY CIRCLES */}
      {/* -------------------------------------------------------- */}
      {activeTab === 'halaqa' && (
        <div className="space-y-4">
          {/* Join / Create Form */}
          <div className={`${cardBg} border rounded-3xl p-5 shadow-lg`}>
            <h3 className="font-bold text-white text-base mb-2">Join a Halaqa Study Circle</h3>
            <p className={`text-xs ${textMuted} mb-3`}>
              Study under a qualified teacher or recite together with friends and family.
            </p>
            <form onSubmit={handleJoinCircle} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-character Halaqa code (e.g. QALAM7)..."
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className={`flex-1 border rounded-2xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00D278] ${
                  isAmoled ? 'bg-[#121212] border-neutral-800' : 'bg-[#002828] border-[#00D278]/20'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-2xl bg-[#00D278] hover:bg-[#00b868] text-[#002828] font-bold text-xs shadow transition cursor-pointer"
              >
                Join Circle
              </button>
            </form>
          </div>

          {/* Featured Halaqat List */}
          <div className={`${cardBg} border rounded-3xl p-5 sm:p-6 shadow-lg space-y-3`}>
            <h3 className="font-bold text-white text-base">Your Active Halaqa Circles</h3>

            {/* Circle 1 */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isAmoled ? 'bg-[#121212] border-neutral-800' : 'bg-[#002828]/60 border-[#00D278]/30'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base">Halaqa Noor al-Iman</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Teacher Mode
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  Focus: Juz Amma Tajweed & Memorization • Teacher: Shaykh Tariq Al-Madani
                </p>
                <div className={`text-[11px] ${textMuted} mt-1 flex items-center gap-3`}>
                  <span>14 Students</span>
                  <span>•</span>
                  <span>Code: <code className="text-[#00D278] font-mono">NOOR30</code></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Halaqa Roster: 14 students active. All homework submitted for Surah Al-Mulk.')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition cursor-pointer"
                >
                  View Roster
                </button>
              </div>
            </div>

            {/* Circle 2 (if joined) */}
            {hasJoinedCircle && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-[#00D278] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base">Halaqa Darul Quran</h4>
                    <span className="text-[10px] bg-[#00D278] text-[#002828] px-2 py-0.5 rounded-full font-bold">
                      Joined
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    Daily Murajaah (Review) Circle • Surah Al-Baqarah & Ali 'Imran
                  </p>
                </div>
                <span className="text-xs text-[#00D278] font-bold">Active Member</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 3: ACTIVITY HEATMAP */}
      {/* -------------------------------------------------------- */}
      {activeTab === 'heatmap' && (
        <div className={`${cardBg} border rounded-3xl p-6 shadow-xl space-y-4`}>
          <div className={`flex items-center justify-between pb-3 border-b ${isAmoled ? 'border-neutral-800' : 'border-[#002828]'}`}>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00D278]" />
                <span>Daily Quran Activity Heatmap</span>
              </h3>
              <p className={`text-xs ${textMuted}`}>
                Track your consistent daily reading and dhikr over the year
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{appState.streak} Day Streak</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto pb-2">
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
              {Array.from({ length: daysInYear }, (_, i) => {
                const intensity = activityIntensity(i);
                const color =
                  intensity === 3
                    ? 'bg-[#00D278]'
                    : intensity === 2
                    ? 'bg-[#0E9A62]'
                    : intensity === 1
                    ? isAmoled ? 'bg-[#1b3d2b]' : 'bg-[#003d32]'
                    : isAmoled ? 'bg-[#121212] border border-neutral-800' : 'bg-[#002828] border border-white/5';

                return (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-sm ${color} transition hover:scale-125 cursor-pointer`}
                    title={`Day ${i + 1}: ${intensity * 50 + 10} verses read`}
                  />
                );
              })}
            </div>
          </div>

          <div className={`flex items-center justify-between text-xs ${textMuted} pt-2`}>
            <span>Past 20 Weeks</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className={`w-3 h-3 rounded-sm ${isAmoled ? 'bg-[#121212] border border-neutral-800' : 'bg-[#002828] border border-white/5'}`} />
              <div className={`w-3 h-3 rounded-sm ${isAmoled ? 'bg-[#1b3d2b]' : 'bg-[#003d32]'}`} />
              <div className="w-3 h-3 rounded-sm bg-[#0E9A62]" />
              <div className="w-3 h-3 rounded-sm bg-[#00D278]" />
              <span>More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
