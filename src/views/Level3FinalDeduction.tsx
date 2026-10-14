import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Level3Submission } from '../types/game';
import confetti from 'canvas-confetti';
import {
  Users,
  ShieldCheck,
  Send,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Lock,
  UserX,
  Fingerprint,
} from 'lucide-react';

export const Level3FinalDeduction: React.FC = () => {
  const {
    suspects,
    allEvidence,
    gameState,
    submitLevel3,
    setSelectedEvidenceModal,
    isLoading,
  } = useGame();

  const [selectedSuspectId, setSelectedSuspectId] = useState<string>('suspect_trevor_bailey');
  const [entryMethod, setEntryMethod] = useState<string>('cloned_rfid_plus_rubber_ducky');
  const [eliminatedSuspectId, setEliminatedSuspectId] = useState<string>('suspect_marcus_chen');
  const [eliminationReason, setEliminationReason] = useState<string>(
    'Marcus Chen was verified locked in the basement data room by biometric fingerprint reader at Server Rack 04 continuously between 21:15 and 21:35, rendering physical workstation tampering at 21:24 impossible.'
  );

  const [chronology, setChronology] = useState<string[]>([
    '21:08 - Cloned badge entry at East Turnstile',
    '21:12 - Camera 02 lens diffuser obstruction',
    '21:20 - Workstation 04 USB Rubber Ducky insertion & clock skew',
    '21:38 - Emergency stairwell exit without badging',
  ]);

  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([
    'EVD-102',
    'EVD-103',
    'EVD-203',
    'EVD-302',
    'EVD-303',
  ]);

  const [feedback, setFeedback] = useState<string | null>(null);

  const activeSuspect = suspects.find((s) => s.id === selectedSuspectId) || suspects[0];
  const discoveredEvidenceIds = gameState?.discoveredEvidenceIds || [];

  const handleMoveChronology = (index: number, direction: 'up' | 'down') => {
    const newItems = [...chronology];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setChronology(newItems);
  };

  const toggleEvidence = (id: string) => {
    setSelectedEvidenceIds(!selectedEvidenceIds.includes(id) ? [...selectedEvidenceIds, id] : selectedEvidenceIds.filter((e) => e !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const payload: Level3Submission = {
      attackerId: selectedSuspectId,
      entryMethod,
      chronologyOrder: chronology,
      supportingEvidenceIds: selectedEvidenceIds,
      eliminatedSuspectId,
      eliminationReason,
    };

    const res = await submitLevel3(payload);
    setFeedback(res.feedback);

    if (res.success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-teal-500/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <span>ROUND 3 (GRAND FINALS) · 9 MINUTES</span>
            <span>·</span>
            <span>OBJECTIVE: FINAL FORENSIC CASE DEDUCTION & REPORT</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">
            The Final Deduction — Round 3 Suspect Case Board
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Correlate Level 1 physical evidence, Level 2 surveillance, and cryptographic alibis to convict the infiltrator and clear innocent personnel.
          </p>
        </div>

        {gameState?.unlockedCredential && (
          <div className="bg-teal-950/80 border border-teal-500/50 px-3.5 py-2 rounded text-xs font-mono text-teal-300 flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-teal-400" />
            <span className="truncate max-w-[260px]">{gameState.unlockedCredential}</span>
          </div>
        )}
      </div>

      {/* Case Board Suspect Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {suspects.map((suspect) => {
          const isSelected = selectedSuspectId === suspect.id;
          return (
            <div
              key={suspect.id}
              onClick={() => setSelectedSuspectId(suspect.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                isSelected
                  ? 'bg-teal-950/70 border-teal-400 ring-1 ring-teal-400/50 shadow-lg shadow-teal-950/50'
                  : 'bg-[#090e17] border-slate-800 hover:border-slate-700'
              }`}
            >
              <img
                src={suspect.avatarUrl}
                alt={suspect.name}
                className="w-14 h-14 rounded-lg object-cover border border-teal-500/30 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono text-teal-400 block font-bold">
                  {suspect.badgeId}
                </span>
                <h4 className="text-sm font-bold text-white truncate">
                  {suspect.name}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {suspect.role}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Active Suspect Dossier (6 cols) + 5-Task Case Solver (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Suspect Dossier & Forensic Card (6 cols) */}
        <div className="lg:col-span-6 bg-[#090e17] border border-teal-500/30 rounded-xl p-5 shadow-xl space-y-4">
          {activeSuspect && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-teal-500/20 pb-4">
                <img
                  src={activeSuspect.avatarUrl}
                  alt={activeSuspect.name}
                  className="w-20 h-20 rounded-lg object-cover border border-teal-500/50 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-xs font-mono text-teal-400 font-bold block mb-0.5">
                    DOSSIER // {activeSuspect.badgeId}
                  </span>
                  <h3 className="text-xl font-bold font-heading text-white">
                    {activeSuspect.name}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {activeSuspect.role} · {activeSuspect.department}
                  </p>
                </div>
              </div>

              {/* Background Dossier */}
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 block mb-1">
                  BACKGROUND DOSSIER:
                </span>
                <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded border border-slate-800 leading-relaxed">
                  {activeSuspect.backgroundDossier}
                </p>
              </div>

              {/* Alibi Statement */}
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 block mb-1">
                  RECORDED ALIBI STATEMENT:
                </span>
                <p className="text-xs text-slate-300 bg-amber-950/20 p-3 rounded border border-amber-500/30 leading-relaxed">
                  "{activeSuspect.alibi}"
                </p>
              </div>

              {/* Telemetry Tabs: Badge Swipes & Terminal Logs */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-400 block">
                  RECORDED ELECTRONIC BADGE LOGS:
                </span>
                <div className="bg-black/60 border border-slate-800 rounded p-2.5 space-y-1 text-[11px] font-mono">
                  {activeSuspect.accessCardLogs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-300">
                      <span className="text-cyan-400">{log.timestamp}</span>
                      <span className="text-slate-400">{log.location}</span>
                      <span className="text-slate-200 font-semibold">{log.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Forensic Contradiction */}
              <div className="bg-teal-950/30 border border-teal-500/30 p-3 rounded flex items-start gap-2.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-teal-300 block mb-0.5">Forensic Telemetry Correlation:</span>
                  <p className="text-slate-300">{activeSuspect.contradictions}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: 5-Task Case Submission Form (6 cols) */}
        <div className="lg:col-span-6 bg-[#090e17] border border-teal-500/30 rounded-xl p-5 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-white font-heading font-bold text-base border-b border-teal-500/20 pb-3">
            <FileCheck className="w-5 h-5 text-teal-400" />
            <span>5-Phase Final Forensic Deduction</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Task 1: Identify Attacker */}
            <div>
              <label className="block text-slate-200 font-mono font-bold mb-1">
                TASK 1. IDENTIFY THE PRIMARY INFILTRATOR:
              </label>
              <select
                value={selectedSuspectId}
                onChange={(e) => setSelectedSuspectId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-teal-300 font-mono rounded p-2 focus:outline-none focus:border-teal-500"
              >
                {suspects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Task 2: Entry Method */}
            <div>
              <label className="block text-slate-200 font-mono font-bold mb-1">
                TASK 2. IDENTIFY COMPLETE INGRESS & ATTACK VECTOR:
              </label>
              <select
                value={entryMethod}
                onChange={(e) => setEntryMethod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-teal-300 font-mono rounded p-2 focus:outline-none focus:border-teal-500"
              >
                <option value="cloned_rfid_plus_rubber_ducky">
                  Cloned RFID Proxmark3 Badge + Camera Blind Spot + USB Rubber Ducky HID Injection with RTC Clock Skew
                </option>
                <option value="phishing_remote_vpn">
                  Spear-Phishing Payload followed by VPN Lateral Movement
                </option>
                <option value="compromised_cloud_token">
                  Compromised AWS/Azure Cloud Token via Leaked CI/CD Secret
                </option>
              </select>
            </div>

            {/* Task 3: Arrange Chronology */}
            <div>
              <label className="block text-slate-200 font-mono font-bold mb-1">
                TASK 3. ARRANGE CHRONOLOGICAL MILESTONES:
              </label>
              <div className="space-y-1.5">
                {chronology.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800 font-mono text-[11px]"
                  >
                    <span className="text-slate-300 truncate mr-2">
                      <strong className="text-teal-400">#{idx + 1}</strong> {item}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveChronology(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveChronology(idx, 'down')}
                        disabled={idx === chronology.length - 1}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task 4: Supporting Evidence Links */}
            <div>
              <label className="block text-slate-200 font-mono font-bold mb-1">
                TASK 4. LINK SUPPORTING EVIDENCE PIECES:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950/60 rounded border border-slate-800">
                {allEvidence.map((ev) => {
                  const isChecked = selectedEvidenceIds.includes(ev.id);
                  return (
                    <label
                      key={ev.id}
                      className={`flex items-center gap-2 p-1.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-teal-950/60 text-teal-200 border border-teal-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEvidence(ev.id)}
                        className="rounded text-teal-500 bg-slate-900 border-slate-700"
                      />
                      <span className="truncate">{ev.id}: {ev.title}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Task 5: Eliminate Alternative Suspect */}
            <div className="space-y-2">
              <label className="block text-slate-200 font-mono font-bold mb-1">
                TASK 5. FORMALLY ELIMINATE ONE ALTERNATIVE SUSPECT:
              </label>
              <select
                value={eliminatedSuspectId}
                onChange={(e) => setEliminatedSuspectId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-teal-300 font-mono rounded p-2 focus:outline-none focus:border-teal-500"
              >
                <option value="suspect_marcus_chen">
                  Marcus Chen (Systems Administrator)
                </option>
                <option value="suspect_elena_vance">
                  Elena Vance (Lead NetOps Engineer)
                </option>
                <option value="suspect_sarah_lin">
                  Dr. Sarah Lin (Chief AI Scientist)
                </option>
              </select>

              <textarea
                rows={2}
                value={eliminationReason}
                onChange={(e) => setEliminationReason(e.target.value)}
                placeholder="State the concrete cryptographic, CCTV, or biometric log that proves their innocence..."
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-teal-500 font-sans"
              />
            </div>

            {feedback && (
              <div
                className={`p-3 rounded border text-xs leading-relaxed ${
                  feedback.includes('CASE RESOLVED')
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                }`}
              >
                {feedback}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-black font-heading font-bold text-sm uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/25"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Final Deduction...' : 'Deliver Final Investigation Brief'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
