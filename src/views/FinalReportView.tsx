import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import * as api from '../services/api';
import { LeaderboardEntry } from '../types/game';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  ArrowRight,
  RotateCcw,
  UserCheck,
  Key,
  Trophy,
  Medal,
  Sparkles,
} from 'lucide-react';

export const FinalReportView: React.FC = () => {
  const { lastReport, gameState, setActiveNavTab, logout, teamName, studentName } = useGame();
  const [topWinners, setTopWinners] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    api.getLeaderboard().then((res) => {
      if (res.success && res.leaderboard) {
        setTopWinners(res.leaderboard.slice(0, 3));
      }
    }).catch(console.warn);
  }, []);

  if (!lastReport) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center space-y-4">
        <FileText className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold font-heading text-white">
          No Case Resolution Report Available
        </h2>
        <p className="text-xs text-slate-400">
          Complete Level 3 (The Final Deduction) to compile and view your certified Incident Response Dossier.
        </p>
        <button
          onClick={() => setActiveNavTab('investigation')}
          className="px-4 py-2 bg-teal-500 text-black text-xs font-semibold rounded cursor-pointer"
        >
          Return to Investigation
        </button>
      </div>
    );
  }

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Top Action Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-teal-500/20">
        <div>
          <span className="text-xs font-mono text-teal-400 font-bold block mb-0.5">
            CLASSIFIED CYBER FORENSICS DOSSIER // ROUND 3 FINALS RESOLUTION
          </span>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white flex items-center gap-2">
            <span>Tournament Winners & Case Report</span>
            <Trophy className="w-6 h-6 text-amber-400" />
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Export / Print Dossier</span>
          </button>

          <button
            onClick={() => setActiveNavTab('leaderboard')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Full Winners Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="bg-[#090e17] border border-teal-500/40 rounded-xl p-6 md:p-8 shadow-2xl space-y-6 text-sm text-slate-200">
        {/* TOURNAMENT WINNERS PODIUM */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/40 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold tracking-widest text-amber-300 uppercase">
                COMPETITION WINNERS PODIUM · GRAND FINALS
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Verified by Organiser Console
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topWinners.map((winner, idx) => {
              const medals = [
                { rank: '1ST PLACE', color: 'from-amber-500/20 to-yellow-500/10 border-amber-400 text-amber-300', badge: '🥇 CHAMPION' },
                { rank: '2ND PLACE', color: 'from-slate-400/20 to-slate-500/10 border-slate-300 text-slate-200', badge: '🥈 RUNNER UP' },
                { rank: '3RD PLACE', color: 'from-amber-800/20 to-orange-700/10 border-amber-700 text-amber-400', badge: '🥉 3RD PLACE' },
              ];
              const m = medals[idx] || medals[0];
              const isCurrentTeam = (winner.studentName && (studentName?.includes(winner.studentName) || winner.studentName.includes(studentName || ''))) || winner.teamName === teamName;

              return (
                <div
                  key={winner.teamId}
                  className={`relative p-3.5 rounded-lg border bg-gradient-to-b ${m.color} ${
                    isCurrentTeam ? 'ring-2 ring-teal-400 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/50 border border-white/10">
                      {m.badge}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-white">
                      {winner.totalScore} pts
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white truncate">
                    {winner.studentName || winner.teamName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {winner.teamName}
                  </div>
                  {isCurrentTeam && (
                    <span className="inline-block mt-2 text-[9px] font-mono uppercase bg-teal-500 text-black font-extrabold px-1.5 py-0.5 rounded">
                      YOUR SQUAD
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Banner with Performance Rating & Total Score */}
        <div className="bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-950 border border-teal-500/30 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center text-teal-300">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-teal-400 tracking-wider uppercase block">
                INCIDENT RESPONSE SPECIALIST RATING
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-heading text-white">
                {lastReport.performanceRating}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Investigated by: <strong className="text-teal-300">{lastReport.teamName}</strong> (Session {lastReport.sessionCode})
              </p>
            </div>
          </div>

          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
            <span className="text-xs font-mono text-slate-400">TOTAL SCORE ACCREDITATION</span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-3xl font-extrabold text-amber-300">{lastReport.totalScore}</span>
              <span className="text-sm text-slate-500 font-mono">/ 300</span>
            </div>
            <span className="text-[11px] font-mono text-teal-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Elapsed: {formatDuration(lastReport.durationSeconds)}</span>
            </span>
          </div>
        </div>

        {/* Phase Breakdown Metrics */}
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
            PHASE-BY-PHASE SCORE ACCREDITATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg">
              <span className="text-[10px] font-mono text-teal-400 block mb-1">PHASE 01: THE HIDDEN ENTRY</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-white font-mono">{lastReport.levelScores.level1} / 100</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Isometric physical & digital evidence correlation.</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg">
              <span className="text-[10px] font-mono text-teal-400 block mb-1">PHASE 02: THE CCTV TRAP</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-white font-mono">{lastReport.levelScores.level2} / 100</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Multi-camera synchronized surveillance timeline.</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg">
              <span className="text-[10px] font-mono text-teal-400 block mb-1">PHASE 03: FINAL DEDUCTION</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-white font-mono">{lastReport.levelScores.level3} / 100</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Suspect case board & innocent alibi defense.</p>
            </div>
          </div>
        </div>

        {/* Forensic Debrief Summary */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            EXECUTIVE FORENSIC FINDINGS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg space-y-1.5">
              <span className="text-slate-400 font-mono block">IDENTIFIED PERPETRATOR:</span>
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <UserCheck className="w-4 h-4" />
                <span>{lastReport.attackerIdentified.name} ({lastReport.attackerIdentified.role})</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Motivated by corporate espionage; abused vendor HVAC credentials to traverse facility crawlspaces.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg space-y-1.5">
              <span className="text-slate-400 font-mono block">PROVEN INFILTRATION VECTOR:</span>
              <div className="flex items-center gap-2 text-sm font-bold text-teal-300">
                <Key className="w-4 h-4" />
                <span>Cloned RFID Badge + Rubber Ducky Keystroke Injector</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Bypassed entrance turnstiles using Elena Vance’s cloned RFID credential and adjusted hardware RTC clock.
              </p>
            </div>
          </div>

          {/* Exonerated Suspect Section */}
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-lg text-xs space-y-1.5">
            <span className="text-slate-400 font-mono block">DEFENDED INNOCENCE JUSTIFICATION:</span>
            <div className="font-semibold text-slate-200">
              Cleared Suspect: {lastReport.eliminatedSuspect.suspectName}
            </div>
            <p className="text-slate-300 leading-relaxed">
              "{lastReport.eliminatedSuspect.reason}"
            </p>
          </div>

          {/* Comprehensive Narrative Summary */}
          <div className="bg-teal-950/20 border border-teal-500/30 p-4 rounded-lg text-xs leading-relaxed text-slate-300">
            <span className="font-mono font-bold text-teal-400 block mb-1">OFFICIAL CASE DEBRIEF NOTE:</span>
            {lastReport.investigationSummary}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveNavTab('investigation')}
            className="text-teal-400 hover:underline cursor-pointer"
          >
            Review Evidence Locker & Workspaces
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Finish & Exit Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
