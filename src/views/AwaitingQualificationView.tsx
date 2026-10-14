import React from 'react';
import { useGame } from '../context/GameContext';
import { Hourglass, CheckCircle2, ShieldAlert, Award, FolderArchive, ArrowRight, UserX, RefreshCw } from 'lucide-react';

interface AwaitingQualificationViewProps {
  roundCompleted: 1 | 2;
}

export const AwaitingQualificationView: React.FC<AwaitingQualificationViewProps> = ({ roundCompleted }) => {
  const { gameState, studentName, teamName, setIsEvidenceLockerOpen, setActiveLevel, refreshState } = useGame();

  if (!gameState) return null;

  const isEliminated = gameState.qualificationStatus === 'ELIMINATED';
  const targetRound = roundCompleted + 1;
  const score = roundCompleted === 1 ? gameState.level1Score : gameState.level2Score;

  if (isEliminated) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-12 text-center space-y-6 mt-8 bg-[#090e17] border border-rose-500/30 rounded-xl shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
          <UserX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono text-rose-400 uppercase tracking-widest font-bold">
            COMPETITION NOTIFICATION // CUTOFF NOT REACHED
          </span>
          <h2 className="text-2xl font-bold font-heading text-white">
            Thank You for Participating, {studentName || teamName}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The organizers have finalized qualifications for Round {targetRound}. Your squad was not shortlisted for this round. Your efforts and forensic audit records have been saved on the competition tournament board.
          </p>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 max-w-sm mx-auto flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">Total Recorded Score:</span>
          <span className="font-mono font-bold text-amber-300 text-sm">{gameState.totalScore} / 300</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-12 text-center space-y-6 mt-6 bg-[#090e17] border border-teal-500/40 rounded-xl shadow-2xl animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
        <Hourglass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-mono tracking-wider uppercase">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>ROUND {roundCompleted} COMPLETED · AWAITING ORGANISER SHORTLISTING</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">
          Submission Logged for {studentName || teamName}
        </h2>

        <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Your forensic deduction for Round {roundCompleted} has been securely transmitted. Only candidates chosen by the event organizer will be promoted to <strong>Round {targetRound}</strong>.
        </p>
      </div>

      {/* Score Summary Box */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-xs">
        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg text-left">
          <span className="text-[10px] font-mono text-slate-400 block mb-0.5">ROUND {roundCompleted} SCORE</span>
          <span className="text-lg font-bold font-mono text-teal-300">{score} / 100</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg text-left">
          <span className="text-[10px] font-mono text-slate-400 block mb-0.5">NEXT ROUND</span>
          <span className="text-sm font-bold font-heading text-amber-300">
            {roundCompleted === 1 ? 'Round 2 (CCTV Trap)' : 'Round 3 (Finals)'}
          </span>
        </div>
      </div>

      <div className="bg-teal-950/20 border border-teal-500/20 p-3.5 rounded-lg max-w-md mx-auto text-xs text-slate-400 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
        <span>Live channel open. The page will automatically unlock when promoted.</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => refreshState()}
          className="flex items-center gap-2 px-4 py-2 rounded bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 text-xs text-teal-300 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Check Qualification Status Now</span>
        </button>

        <button
          onClick={() => setIsEvidenceLockerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
        >
          <FolderArchive className="w-4 h-4 text-teal-400" />
          <span>Browse Evidence Locker</span>
        </button>
      </div>
    </div>
  );
};
