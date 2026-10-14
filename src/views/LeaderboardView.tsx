import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types/game';
import * as api from '../services/api';
import { useGame } from '../context/GameContext';
import { Trophy, RefreshCw, Search, Award, Clock, Users, ArrowUpRight, ArrowLeft } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { userRole, setActiveNavTab } = useGame();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getLeaderboard();
      if (res.success) {
        setLeaderboard(res.leaderboard);
      }
    } catch (err) {
      console.warn('Leaderboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s live polling
    return () => clearInterval(interval);
  }, []);

  const formatSeconds = (sec: number | null) => {
    if (sec === null) return '--:--';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const filtered = leaderboard.filter(
    (item) =>
      item.teamName.toLowerCase().includes(search.toLowerCase()) ||
      item.sessionCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-teal-500/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>COLLEGE TOURNAMENT SCOREBOARD // LIVE TELEMETRY</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">
            Incident Response Leaderboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official ranking based on forensic accuracy (max 300 pts) and speed of resolution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team or session..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {userRole === 'participant' && (
            <button
              onClick={() => setActiveNavTab('investigation')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-xs text-teal-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dossier</span>
            </button>
          )}

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-teal-500/30 text-xs text-teal-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-[#090e17] border border-teal-500/30 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-teal-500/20 text-slate-400 font-mono">
              <tr>
                <th className="px-5 py-3.5 w-16">RANK</th>
                <th className="px-5 py-3.5">TEAM / SQUAD</th>
                <th className="px-5 py-3.5">SESSION</th>
                <th className="px-5 py-3.5">STATUS</th>
                <th className="px-5 py-3.5 text-center">L1</th>
                <th className="px-5 py-3.5 text-center">L2</th>
                <th className="px-5 py-3.5 text-center">L3</th>
                <th className="px-5 py-3.5 text-right">TOTAL SCORE</th>
                <th className="px-5 py-3.5 text-right">TIME TAKEN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    No teams registered yet. Start an investigation session to appear on the leaderboard.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isTop3 = item.rank <= 3;
                  return (
                    <tr
                      key={item.teamId}
                      className="hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${
                            item.rank === 1
                              ? 'bg-amber-400 text-black font-extrabold shadow-sm shadow-amber-400/50'
                              : item.rank === 2
                              ? 'bg-slate-300 text-black font-bold'
                              : item.rank === 3
                              ? 'bg-amber-700 text-white font-bold'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          #{item.rank}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{item.teamName}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-400">
                        {item.sessionCode}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            item.status === 'COMPLETED'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : item.status === 'ACTIVE'
                              ? 'bg-teal-950/80 text-teal-300 border-teal-500/40'
                              : item.status === 'EXPIRED'
                              ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          {item.status} (L{item.currentLevel})
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center font-mono text-slate-300 tabular-nums">
                        {item.level1Score}
                      </td>
                      <td className="px-5 py-4 text-center font-mono text-slate-300 tabular-nums">
                        {item.level2Score}
                      </td>
                      <td className="px-5 py-4 text-center font-mono text-slate-300 tabular-nums">
                        {item.level3Score}
                      </td>

                      <td className="px-5 py-4 text-right font-mono font-bold text-amber-300 text-sm tabular-nums">
                        {item.totalScore}
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-slate-400 tabular-nums">
                        {formatSeconds(item.timeTakenSeconds)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
