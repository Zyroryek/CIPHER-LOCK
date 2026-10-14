import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import {
  ShieldAlert,
  Key,
  Users,
  Clock,
  Play,
  Pause,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Terminal,
  UserCheck,
  UserX,
  Filter,
  ArrowRight,
  Shield,
  Search,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { VALIDATION_RULES } from '../data/scenarioData';

export const OrganizerDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem('zd_org_token'));
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'round1_shortlist' | 'round2_shortlist' | 'all_participants' | 'create_credentials'>('round1_shortlist');

  // New Participant Account Form
  const [newUsername, setNewUsername] = useState('');
  const [newAccessKey, setNewAccessKey] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Search filter
  const [search, setSearch] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await api.organizerLogin(passcode);
      if (res.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('zd_org_token', res.token);
        loadOverview();
      }
    } catch {
      setAuthError('Access Denied: Incorrect organiser password.');
    }
  };

  const loadOverview = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrganizerOverview();
      if (data.success) {
        setOverview(data);
      }
    } catch (err: any) {
      console.warn('Failed to load organizer data:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOverview();
      const interval = setInterval(loadOverview, 5000); // 5-sec live auto-refresh
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handlePromote = async (participantId: string, targetRound: 2 | 3) => {
    try {
      await api.promoteParticipant(participantId, targetRound);
      setActionSuccessMsg(`Candidate successfully qualified and promoted to Round ${targetRound}!`);
      loadOverview();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setActionSuccessMsg('Action error: ' + err.message);
    }
  };

  const handleEliminate = async (participantId: string) => {
    try {
      await api.eliminateParticipant(participantId);
      setActionSuccessMsg('Participant status updated to Eliminated.');
      loadOverview();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setActionSuccessMsg('Action error: ' + err.message);
    }
  };

  const handleResetParticipant = async (participantId: string, name: string) => {
    try {
      await api.resetParticipant(participantId);
      setActionSuccessMsg(`Reset progress for ${name}. Returned to Round 1 with 0 points.`);
      loadOverview();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setActionSuccessMsg('Reset error: ' + err.message);
    }
  };

  const handleDeleteParticipant = async (participantId: string, name: string) => {
    try {
      await api.deleteParticipantAccount(participantId);
      setActionSuccessMsg(`Deleted student record for ${name}.`);
      loadOverview();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setActionSuccessMsg('Delete error: ' + err.message);
    }
  };

  const handleClearAllStudents = async () => {
    if (!window.confirm('Are you sure you want to remove ALL student details from the database? This action cannot be undone.')) {
      return;
    }
    try {
      await api.clearAllStudents();
      setActionSuccessMsg('All student details and submissions have been cleared from the database.');
      loadOverview();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setActionSuccessMsg('Clear error: ' + err.message);
    }
  };

  const handleCreateParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newAccessKey || !newStudentName) return;
    try {
      await api.createParticipantAccount(newUsername, newAccessKey, newStudentName, newTeamName || undefined);
      setActionSuccessMsg(`Created credentials for ${newStudentName}! Username: ${newUsername}`);
      setNewUsername('');
      setNewAccessKey('');
      setNewStudentName('');
      setNewTeamName('');
      loadOverview();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setActionSuccessMsg('Creation error: ' + err.message);
    }
  };

  const handleDownloadCsv = () => {
    const a = document.createElement('a');
    a.href = '/api/organizer/export-csv';
    a.download = 'competition_leaderboard.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6 md:p-8 mt-12 bg-[#090e17] border border-cyan-500/40 rounded-xl shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-white">Organiser Console Login</h2>
            <p className="text-xs text-slate-400">Strictly restricted to competition organizers</p>
          </div>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs rounded">
            {authError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center justify-between">
              <span>ENTER ORGANISER PASSWORD:</span>
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full px-3.5 py-2.5 rounded bg-slate-900 border border-slate-800 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-heading font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
          >
            Authenticate Organiser
          </button>
        </form>
      </div>
    );
  }

  const participants = overview?.participants || [];
  const gameStates = overview?.gameStates || [];

  // Merge state for each participant
  const participantList = participants.map((p: any) => {
    const st = gameStates.find((g: any) => g.teamId === p.id) || {};
    return {
      ...p,
      ...st,
    };
  }).filter((p: any) =>
    (p.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.teamName || '').toLowerCase().includes(search.toLowerCase())
  );

  const round1SubmittedCount = participantList.filter((p: any) => p.level1Submitted).length;
  const round2QualifiedCount = participantList.filter((p: any) => p.level2QualifiedByOrganiser).length;
  const round2SubmittedCount = participantList.filter((p: any) => p.level2Submitted).length;
  const round3QualifiedCount = participantList.filter((p: any) => p.level3QualifiedByOrganiser).length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>ORGANISER & JURY COMMAND DASHBOARD</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">
            Competition Round Administration & Shortlisting
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step gatekeeper: review participant submissions and manually select candidates to promote to Round 2 & Round 3.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-mono transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              sessionStorage.removeItem('zd_org_token');
              setIsAuthenticated(false);
            }}
            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-teal-950/90 border border-teal-500/60 text-teal-200 text-xs font-mono rounded flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Funnel Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#090e17] border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">TOTAL PARTICIPANTS</span>
          <span className="text-2xl font-bold font-heading text-white">{participants.length}</span>
        </div>

        <div className="bg-[#090e17] border border-teal-500/30 p-4 rounded-xl">
          <span className="text-[11px] font-mono text-teal-400 block mb-1">ROUND 1 SUBMITTED</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-heading text-teal-300">{round1SubmittedCount}</span>
            <span className="text-xs font-mono text-slate-500">Awaiting Selection</span>
          </div>
        </div>

        <div className="bg-[#090e17] border border-cyan-500/30 p-4 rounded-xl">
          <span className="text-[11px] font-mono text-cyan-400 block mb-1">ROUND 2 QUALIFIED</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-heading text-cyan-300">{round2QualifiedCount}</span>
            <span className="text-xs font-mono text-slate-500">{round2SubmittedCount} Finished R2</span>
          </div>
        </div>

        <div className="bg-[#090e17] border border-amber-500/30 p-4 rounded-xl">
          <span className="text-[11px] font-mono text-amber-400 block mb-1">ROUND 3 FINALISTS</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-heading text-amber-300">{round3QualifiedCount}</span>
            <span className="text-xs font-mono text-slate-500">Grand Finals</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('round1_shortlist')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === 'round1_shortlist'
                ? 'bg-teal-500 text-black font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Round 1 Shortlist (Select for Round 2)
          </button>

          <button
            onClick={() => setActiveTab('round2_shortlist')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === 'round2_shortlist'
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Round 2 Shortlist (Select for Round 3)
          </button>

          <button
            onClick={() => setActiveTab('all_participants')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === 'all_participants'
                ? 'bg-slate-200 text-black font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Registered Accounts
          </button>

          <button
            onClick={() => setActiveTab('create_credentials')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === 'create_credentials'
                ? 'bg-amber-400 text-black font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            + Create Participant Credentials
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* TAB 1: ROUND 1 SHORTLISTING (SELECT STUDENTS FOR ROUND 2) */}
      {activeTab === 'round1_shortlist' && (
        <div className="bg-[#090e17] border border-teal-500/30 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-400" />
                <span>Round 1 Participants — Select Candidates to Qualify for Round 2</span>
              </h3>
              <p className="text-xs text-slate-400">
                Only the participants you approve here will be able to unlock and play Round 2 (The CCTV Trap).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                <tr>
                  <th className="px-4 py-3">STUDENT / SQUAD</th>
                  <th className="px-4 py-3">USERNAME</th>
                  <th className="px-4 py-3">R1 STATUS</th>
                  <th className="px-4 py-3 text-center">R1 SCORE</th>
                  <th className="px-4 py-3">ROUND 2 ACCESS</th>
                  <th className="px-4 py-3 text-right">ORGANISER ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {participantList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No participants registered.
                    </td>
                  </tr>
                ) : (
                  participantList.map((p: any) => {
                    const isQualified = p.level2QualifiedByOrganiser;
                    const hasSubmitted = p.level1Submitted;

                    return (
                      <tr key={p.id} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-white">{p.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{p.teamName}</div>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-teal-300 font-bold">
                          {p.username}
                        </td>

                        <td className="px-4 py-3.5 font-mono">
                          {hasSubmitted ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Submitted
                            </span>
                          ) : (
                            <span className="text-slate-500">In Progress / Pending</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-center font-mono font-bold text-amber-300 text-sm">
                          {p.level1Score || 0} / 100
                        </td>

                        <td className="px-4 py-3.5">
                          {isQualified ? (
                            <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-[10px]">
                              QUALIFIED FOR ROUND 2
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono text-[10px]">
                              LOCKED (Awaiting Selection)
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isQualified ? (
                              <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> Selected
                              </span>
                            ) : (
                              <button
                                onClick={() => handlePromote(p.id, 2)}
                                className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded text-xs transition-colors cursor-pointer"
                              >
                                Qualify for Round 2
                              </button>
                            )}

                            <button
                              onClick={() => handleEliminate(p.id)}
                              className="p-1.5 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Eliminate candidate"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROUND 2 SHORTLISTING (SELECT STUDENTS FOR ROUND 3 / GRAND FINALS) */}
      {activeTab === 'round2_shortlist' && (
        <div className="bg-[#090e17] border border-cyan-500/30 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <span>Round 2 Finalists — Select Candidates to Qualify for Round 3 (Grand Finals)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Only students qualified for Round 2 can attend Round 2. Once they submit, select your top finalists to unlock Round 3.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                <tr>
                  <th className="px-4 py-3">STUDENT / SQUAD</th>
                  <th className="px-4 py-3">USERNAME</th>
                  <th className="px-4 py-3">R2 STATUS</th>
                  <th className="px-4 py-3 text-center">R2 SCORE</th>
                  <th className="px-4 py-3">ROUND 3 ACCESS</th>
                  <th className="px-4 py-3 text-right">ORGANISER ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {participantList.filter((p: any) => p.level2QualifiedByOrganiser).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-mono">
                      No participants qualified for Round 2 yet. (Approve students in Round 1 Shortlist)
                    </td>
                  </tr>
                ) : (
                  participantList
                    .filter((p: any) => p.level2QualifiedByOrganiser)
                    .map((p: any) => {
                    const isR3Qualified = p.level3QualifiedByOrganiser;
                    const hasSubmittedR2 = p.level2Submitted;

                    return (
                      <tr key={p.id} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-white">{p.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{p.teamName}</div>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-cyan-300 font-bold">
                          {p.username}
                        </td>

                        <td className="px-4 py-3.5 font-mono">
                          {hasSubmittedR2 ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> R2 Submitted
                            </span>
                          ) : (
                            <span className="text-amber-400">R2 Playing / Pending</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-center font-mono font-bold text-amber-300 text-sm">
                          {p.level2Score || 0} / 100
                        </td>

                        <td className="px-4 py-3.5">
                          {isR3Qualified ? (
                            <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono font-bold text-[10px]">
                              GRAND FINALIST (ROUND 3)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono text-[10px]">
                              LOCKED (Awaiting Selection)
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isR3Qualified ? (
                              <span className="text-amber-300 text-xs font-mono font-bold flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> Finalist Selected
                              </span>
                            ) : (
                              <button
                                onClick={() => handlePromote(p.id, 3)}
                                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded text-xs transition-colors cursor-pointer"
                              >
                                Qualify for Round 3
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL REGISTERED ACCOUNTS */}
      {activeTab === 'all_participants' && (
        <div className="bg-[#090e17] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              <span>Complete Registered Competitor Directory</span>
            </h3>

            {participantList.length > 0 && (
              <button
                onClick={handleClearAllStudents}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/50 text-rose-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove All Students From Database</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                <tr>
                  <th className="px-4 py-2.5">STUDENT NAME</th>
                  <th className="px-4 py-2.5">USERNAME</th>
                  <th className="px-4 py-2.5">ACCESS KEY</th>
                  <th className="px-4 py-2.5 text-center">R1</th>
                  <th className="px-4 py-2.5 text-center">R2</th>
                  <th className="px-4 py-2.5 text-center">R3</th>
                  <th className="px-4 py-2.5 text-right">TOTAL</th>
                  <th className="px-4 py-2.5">STATUS</th>
                  <th className="px-4 py-2.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {participantList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <Users className="w-8 h-8 text-slate-600" />
                        <span className="text-sm font-semibold text-slate-300">No Student Records in Database</span>
                        <span className="text-xs text-slate-500 max-w-md">
                          All student details have been removed from the database. You can generate fresh student credentials in the "+ Create Participant Credentials" tab.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  participantList.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-900/50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{p.studentName}</div>
                        <div className="text-[11px] text-teal-400/90 font-mono">Team: {p.teamName || '—'}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-teal-300 font-bold">{p.username}</td>
                      <td className="px-4 py-3 font-mono text-amber-300">{p.accessKey}</td>
                      <td className="px-4 py-3 text-center font-mono">{p.level1Score || 0}</td>
                      <td className="px-4 py-3 text-center font-mono">{p.level2Score || 0}</td>
                      <td className="px-4 py-3 text-center font-mono">{p.level3Score || 0}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-amber-300">{p.totalScore || 0}</td>
                      <td className="px-4 py-3 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-teal-300 border border-teal-500/30 text-[10px]">
                          {p.qualificationStatus || 'NOT_STARTED'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleResetParticipant(p.id, p.studentName || p.username)}
                            title="Reset this participant back to Round 1 (0 points)"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-500/50 text-[10px] font-mono text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                          <button
                            onClick={() => handleDeleteParticipant(p.id, p.studentName || p.username)}
                            title="Permanently remove this student record"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-[10px] font-mono text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 text-rose-400" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CREATE PARTICIPANT CREDENTIALS */}
      {activeTab === 'create_credentials' && (
        <div className="bg-[#090e17] border border-amber-500/30 rounded-xl p-6 shadow-xl space-y-4 max-w-xl mx-auto">
          <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3">
            <Plus className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-heading text-white">
              Issue New Participant Credentials
            </h3>
          </div>

          <form onSubmit={handleCreateParticipant} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-mono mb-1">STUDENT FULL NAME & ROLL/ID:</label>
              <input
                type="text"
                placeholder="e.g. Jason Scott (CS-204)"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-mono mb-1">PARTICIPANT USERNAME:</label>
              <input
                type="text"
                placeholder="e.g. jason_s"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-teal-300 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-mono mb-1">ACCESS KEY / PASSWORD:</label>
              <input
                type="text"
                placeholder="e.g. secretKey99"
                value={newAccessKey}
                onChange={(e) => setNewAccessKey(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-amber-300 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-mono mb-1 flex items-center justify-between">
                <span>SQUAD / TEAM NAME:</span>
                <span className="text-[10px] text-teal-400 font-mono">Participants can log in using this Team Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Binary Enforcers"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-slate-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-heading font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
            >
              Issue Credential to Competitor
            </button>
          </form>
        </div>
      )}

      {/* Secret Answer Key (Jury / Proctor Only) */}
      <div className="bg-[#090e17] border border-amber-500/30 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold font-heading text-white">
              Official Scenario Solution & Ground Truth Answer Key
            </h3>
          </div>
          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded cursor-pointer"
          >
            {showAnswerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showAnswerKey ? 'Conceal Key' : 'Reveal Solution Key'}</span>
          </button>
        </div>

        {showAnswerKey && (
          <div className="bg-slate-950/80 p-4 rounded border border-amber-500/40 text-xs font-mono space-y-3 animate-fade-in text-slate-300">
            <div>
              <span className="text-amber-400 font-bold block mb-1">
                ROUND 1: THE HIDDEN ENTRY
              </span>
              <p>• Correct Vector: Physical Covert Incursion + Emulated USB HID Keystroke Injector (Rubber Ducky VID_05AC)</p>
              <p>• Clock Discrepancy: Active Anti-Forensic Clock Stomp (w32tm -28 min backward skew to 20:52 UTC)</p>
              <p>• Required Evidence: EVD-102 (Rubber Ducky), EVD-103 (Cloned Badge), EVD-104 (NTP Skew)</p>
            </div>

            <div>
              <span className="text-amber-400 font-bold block mb-1">
                ROUND 2: THE CCTV TRAP
              </span>
              <p>• Prime Suspect: Trevor Bailey (Air-Tech HVAC Contractor in navy work gear)</p>
              <p>• Prime Anomaly Event: 21:24:02 UTC at Workstation 04</p>
              <p>• Sequence: 21:08 Entry → 21:12 Cam 02 Blinding → 21:24 Workstation Keystroke Inject → 21:38 Exit</p>
            </div>

            <div>
              <span className="text-amber-400 font-bold block mb-1">
                ROUND 3: FINAL DEDUCTION
              </span>
              <p>• Attacker: Trevor Bailey</p>
              <p>• Infiltration: Cloned Elena Vance badge #8841 + crawlspace blind spot + Rubber Ducky</p>
              <p>• Exoneration of Marcus Chen: Biometric fingerprint reader recorded him locked in Basement Server Room at Rack 04 from 21:15 to 21:35.</p>
              <p>• Exoneration of Elena Vance: Active remote VPN connection from home IP 198.51.100.42 with 2FA push.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
