import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Clock, ShieldAlert, Award, Play } from 'lucide-react';

export const MissionBanner: React.FC = () => {
  const {
    gameState,
    remainingSeconds,
    studentName,
    teamName,
    username,
    startInvestigation,
    isLoading,
  } = useGame();

  // Turn on timer automatically whenever an exam session is loaded in NOT_STARTED state
  useEffect(() => {
    if (gameState && gameState.status === 'NOT_STARTED' && !isLoading) {
      startInvestigation();
    }
  }, [gameState?.status, isLoading, startInvestigation]);

  if (!gameState) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = remainingSeconds < 180 && remainingSeconds > 0;
  const isCriticalTime = remainingSeconds <= 60 && remainingSeconds > 0;

  // Determine current active exam title
  let currentExamTitle = 'ROUND 1 EXAMINATION';
  let badgeColor = 'text-teal-400 border-teal-500/40 bg-teal-950/60';

  if (gameState.level3QualifiedByOrganiser) {
    currentExamTitle = 'ROUND 3: GRAND FINALS EXAMINATION';
    badgeColor = 'text-amber-300 border-amber-500/40 bg-amber-950/60';
  } else if (gameState.level2QualifiedByOrganiser) {
    currentExamTitle = 'ROUND 2: SURVEILLANCE VIDEO EXAMINATION';
    badgeColor = 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60';
  }

  return (
    <div className="bg-[#080d14] border-b border-teal-500/20 px-4 md:px-8 py-3">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Active Exam Identifier */}
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded font-mono font-bold text-[11px] border ${badgeColor}`}>
            {currentExamTitle}
          </span>
          <span className="text-slate-400 font-mono hidden md:inline">
            Candidate: <strong className="text-white">{studentName || teamName}</strong> ({username})
          </span>
        </div>

        {/* Exam Timer & Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-slate-400">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Score:</span>
            <span className="font-bold text-amber-300 text-sm tabular-nums">
              {gameState.totalScore}
            </span>
            <span className="text-slate-600">/ 300</span>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${
              gameState.status === 'COMPLETED'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : gameState.status === 'EXPIRED'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : isCriticalTime
                ? 'bg-rose-950/70 border-rose-500/70 text-rose-200 animate-pulse'
                : isLowTime
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-teal-500/30 text-teal-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono font-bold tabular-nums">
              {gameState.status === 'COMPLETED'
                ? 'EXAM FINISHED'
                : gameState.status === 'EXPIRED'
                ? 'TIME EXPIRED'
                : formatTime(remainingSeconds)}
            </span>
          </div>

          {gameState.status === 'NOT_STARTED' && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/20 border border-teal-500/40 text-teal-300 font-mono text-xs rounded animate-pulse">
              <Play className="w-3 h-3 fill-current" />
              <span>Starting Timer...</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
