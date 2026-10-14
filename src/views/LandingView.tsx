import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Shield,
  KeyRound,
  Users,
  ArrowRight,
  Terminal,
  Lock,
  ArrowLeft,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SUSPECT_AVATARS } from '../data/scenarioData';

type ViewMode = 'selection' | 'participant_login' | 'organiser_login';

export const LandingView: React.FC = () => {
  const { loginAsParticipant, loginAsOrganiser, isLoading, error } = useGame();

  const [mode, setMode] = useState<ViewMode>('selection');

  // Participant Form
  const [identifier, setIdentifier] = useState('');
  const [accessKey, setAccessKey] = useState('');

  // Organiser Form
  const [passcode, setPasscode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showQuickHelp, setShowQuickHelp] = useState(false);

  const handleParticipantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!identifier.trim() || !accessKey.trim()) {
      setLocalError('Please enter your Username or Team Name and your Access Key or Passcode.');
      return;
    }
    const success = await loginAsParticipant(identifier, accessKey);
    if (!success) {
      setLocalError('Invalid credentials. Please verify your username or team name and access key.');
    }
  };

  const handleOrganiserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!passcode.trim()) {
      setLocalError('Please enter the organiser master passkey.');
      return;
    }
    const success = await loginAsOrganiser(passcode);
    if (!success) {
      setLocalError('Access Denied: Incorrect organiser passkey.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col justify-between overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0">
        <img
          src={SUSPECT_AVATARS.cyber_backdrop}
          alt="Cyber Command Room"
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080d] via-[#05080d]/90 to-[#05080d]/60" />
        <div className="absolute inset-0 cyber-grid opacity-30" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16 flex-1 flex flex-col items-center justify-center text-center">
        {/* Event Header Banner */}
        <div className="space-y-4 max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-teal-950/70 border border-teal-500/40 text-teal-400 text-xs font-mono tracking-widest uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>COLLEGE TECHNICAL EVENT COMPETITION // CYBER ESCAPE LAB</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight">
            ZERO<span className="text-teal-400">//</span>DAY
          </h1>

          <p className="text-lg md:text-xl text-teal-300 font-medium font-heading">
            One Breach. Three Crises. Zero Second Chances.
          </p>

          <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
            A step-by-step multi-round elimination tournament. Every player attends Round 1, and only candidates selected by the organizer advance to subsequent rounds.
          </p>
        </div>

        {/* Dynamic Card Container */}
        <div className="w-full max-w-xl">
          {/* STAGE 1: ROLE SELECTION (At First, Ask For Organiser Login or Participants Login) */}
          {mode === 'selection' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in text-left">
              {/* Option A: Participants Login */}
              <div
                onClick={() => {
                  setMode('participant_login');
                  setLocalError(null);
                }}
                className="group bg-[#090e17]/95 hover:bg-[#0c1320] border border-teal-500/40 hover:border-teal-400 rounded-xl p-6 transition-all cursor-pointer shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-teal-500/10 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-teal-400 tracking-wider uppercase font-bold block mb-1">
                      STUDENTS & COMPETITORS
                    </span>
                    <h3 className="text-xl font-bold font-heading text-white group-hover:text-teal-300 transition-colors">
                      Participants Login
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter with credentials given by the organizers to attend Round 1.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter as Participant</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Option B: Organiser Login */}
              <div
                onClick={() => {
                  setMode('organiser_login');
                  setLocalError(null);
                }}
                className="group bg-[#090e17]/95 hover:bg-[#0c1320] border border-cyan-500/40 hover:border-cyan-400 rounded-xl p-6 transition-all cursor-pointer shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase font-bold block mb-1">
                      JURY & EVENT ADMINS
                    </span>
                    <h3 className="text-xl font-bold font-heading text-white group-hover:text-cyan-300 transition-colors">
                      Organiser Login
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Access proctor controls with passkey to shortlist students and manage rounds.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter with Passkey</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2A: PARTICIPANTS LOGIN FORM */}
          {mode === 'participant_login' && (
            <div className="bg-[#090e17]/95 border border-teal-500/40 rounded-xl p-6 md:p-8 shadow-2xl text-left animate-fade-in backdrop-blur-md">
              <button
                onClick={() => {
                  setMode('selection');
                  setLocalError(null);
                }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 mb-5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login Selection</span>
              </button>

              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-teal-500/20">
                <div className="w-10 h-10 rounded bg-teal-500/10 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading text-white">Participants Login</h2>
                  <p className="text-xs text-slate-400">Enter your username or team name and access key or passcode to begin</p>
                </div>
              </div>

              {(error || localError) && (
                <div className="mb-4 p-3 rounded bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300">
                  {error || localError}
                </div>
              )}

              <form onSubmit={handleParticipantSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-mono text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>ENTER YOUR USERNAME OR TEAM NAME:</span>
                    <span className="text-[10px] text-teal-400/90 font-mono">Team or User</span>
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your username or team name"
                    required
                    className="w-full px-3.5 py-2.5 rounded bg-slate-900 border border-slate-800 text-sm font-mono text-teal-300 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>ACCESS KEY OR PASSCODE:</span>
                    <span className="text-[10px] text-slate-500">Provided by Organiser</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      placeholder="Enter your access key or passcode"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded bg-slate-900 border border-slate-800 text-sm font-mono text-teal-300 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-teal-500 hover:bg-teal-400 text-black font-heading font-bold text-sm tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-500/20"
                >
                  <Terminal className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying...' : 'Attend Round 1'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
                <p className="text-[11px] font-mono text-slate-400">
                  Credentials are individually assigned by event jury & organisers.
                </p>
              </div>
            </div>
          )}

          {/* STAGE 2B: ORGANISER LOGIN FORM */}
          {mode === 'organiser_login' && (
            <div className="bg-[#090e17]/95 border border-cyan-500/40 rounded-xl p-6 md:p-8 shadow-2xl text-left animate-fade-in backdrop-blur-md">
              <button
                onClick={() => {
                  setMode('selection');
                  setLocalError(null);
                }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 mb-5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login Selection</span>
              </button>

              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-cyan-500/20">
                <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading text-white">Organiser Login</h2>
                  <p className="text-xs text-slate-400">Protected administration & student shortlisting</p>
                </div>
              </div>

              {(error || localError) && (
                <div className="mb-4 p-3 rounded bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300">
                  {error || localError}
                </div>
              )}

              <form onSubmit={handleOrganiserSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-mono text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>ORGANISER PASSWORD:</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter organiser password"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded bg-slate-900 border border-slate-800 text-sm font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-heading font-bold text-sm tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoading ? 'Authenticating...' : 'Unlock Organiser Console'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
