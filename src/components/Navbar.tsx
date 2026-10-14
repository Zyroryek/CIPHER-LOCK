import React from 'react';
import { useGame } from '../context/GameContext';
import { ShieldAlert, Volume2, VolumeX, LogOut, Terminal, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    userRole,
    studentName,
    teamName,
    username,
    gameState,
    activeNavTab,
    setActiveNavTab,
    isMuted,
    toggleMute,
    logout,
  } = useGame();

  let activeRoundLabel = 'Round 1 in Progress';
  if (gameState?.level3Submitted) {
    activeRoundLabel = '🏆 Tournament Completed (Winners)';
  } else if (gameState?.level3QualifiedByOrganiser) {
    activeRoundLabel = 'Round 3 (Grand Finals)';
  } else if (gameState?.level2Submitted) {
    activeRoundLabel = 'Round 2 Submitted (Reviewing)';
  } else if (gameState?.level2QualifiedByOrganiser) {
    activeRoundLabel = 'Round 2 in Progress';
  } else if (gameState?.level1Submitted) {
    activeRoundLabel = 'Round 1 Submitted (Reviewing)';
  }

  return (
    <header className="sticky top-0 z-40 bg-[#060a10]/95 backdrop-blur-md border-b border-teal-500/20 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div 
          onClick={() => {
            if (userRole === 'organiser') setActiveNavTab('organizer');
            else if (userRole === 'participant') setActiveNavTab('investigation');
          }} 
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-8 h-8 rounded bg-teal-500/10 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:border-teal-400 transition-colors">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg md:text-xl tracking-wider text-white">
                ZERO<span className="text-teal-400">//</span>DAY
              </span>
              <span className="text-[10px] font-mono tracking-widest text-teal-400/80 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-500/30">
                EXAM PORTAL
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Strictly filtered by role!) */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-300">
          {userRole === 'participant' && (
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-teal-400 font-bold bg-teal-950/80 border border-teal-500/30 px-3 py-1 rounded">
                STATUS: {activeRoundLabel}
              </span>
              {gameState?.level3Submitted && (
                <>
                  <button
                    onClick={() => setActiveNavTab('leaderboard')}
                    className={`px-3 py-1 rounded border transition-colors cursor-pointer ${
                      activeNavTab === 'leaderboard'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'border-slate-800 text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    🏆 Winners & Standings
                  </button>
                  <button
                    onClick={() => setActiveNavTab('investigation')}
                    className={`px-3 py-1 rounded border transition-colors cursor-pointer ${
                      activeNavTab === 'investigation'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold'
                        : 'border-slate-800 text-slate-400 hover:text-teal-300'
                    }`}
                  >
                    📜 Incident Dossier
                  </button>
                </>
              )}
            </div>
          )}

          {userRole === 'organiser' && (
            <>
              <button
                onClick={() => setActiveNavTab('organizer')}
                className={`whitespace-nowrap transition-colors hover:text-cyan-300 cursor-pointer ${
                  activeNavTab === 'organizer' ? 'text-cyan-400 font-semibold' : ''
                }`}
              >
                Organiser Shortlisting Console
              </button>
              <button
                onClick={() => setActiveNavTab('leaderboard')}
                className={`whitespace-nowrap transition-colors hover:text-teal-300 cursor-pointer ${
                  activeNavTab === 'leaderboard' ? 'text-teal-400 font-semibold' : ''
                }`}
              >
                Tournament Standings
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Audio Toggle & Profile Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute Audio Cues' : 'Mute Audio Cues'}
            className="p-2 rounded text-slate-400 hover:text-teal-300 hover:bg-slate-800/60 border border-slate-700/50 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
          </button>

          {userRole === 'participant' && (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-teal-500/30 rounded px-3 py-1.5 text-xs">
              <Terminal className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-slate-200 truncate max-w-[120px] md:max-w-[160px]">
                  {studentName || teamName}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ID: {username}
                </span>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="ml-1 text-slate-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {userRole === 'organiser' && (
            <div className="flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/40 rounded px-3 py-1.5 text-xs">
              <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-cyan-200">
                  ORGANISER
                </span>
                <span className="text-[10px] font-mono text-cyan-400/80">
                  ADMIN CONSOLE
                </span>
              </div>
              <button
                onClick={logout}
                title="Exit Console"
                className="ml-1 text-slate-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
