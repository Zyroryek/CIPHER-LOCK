import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Level1Submission } from '../types/game';
import {
  Monitor,
  Usb,
  CreditCard,
  Clock,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  Send,
  HelpCircle,
  FileCode,
  ShieldAlert,
} from 'lucide-react';

interface Hotspot {
  id: string;
  name: string;
  code: string;
  icon: any;
  evidenceId: string;
  coords: { x: number; y: number }; // SVG percentage
  summary: string;
  telemetry: {
    system: string;
    timestamp: string;
    anomaly: string;
    technicalDetails: string;
  };
}

export const Level1IsometricOffice: React.FC = () => {
  const {
    gameState,
    allEvidence,
    collectEvidence,
    submitLevel1,
    setSelectedEvidenceModal,
    isLoading,
  } = useGame();

  const hotspots: Hotspot[] = [
    {
      id: 'workstation',
      name: 'Workstation 04 (Marcus Chen)',
      code: 'AREA_A // WS-04-DESK',
      icon: Monitor,
      evidenceId: 'EVD-101',
      coords: { x: 58, y: 44 },
      summary: 'Primary targeted desk. Suspicious interactive logon while the administrator was away.',
      telemetry: {
        system: 'Workstation 04 (Windows 11 Enterprise x64)',
        timestamp: '21:20:14 UTC (Reported as 20:52:00 locally)',
        anomaly: 'Event 4688: Process creation powershell.exe with Base64 payload & hidden console window.',
        technicalDetails:
          'ParentProcess: explorer.exe (PID 4920)\nCommandLine: powershell -NoP -NonI -W Hidden -Enc SUVY(New-Object Net.WebClient)...\nLogonType: 2 (Interactive console directly from keyboard)\nUserSID: S-1-5-21-39281-CHEN_M (Marcus Chen)',
      },
    },
    {
      id: 'usb_drive',
      name: 'Rogue USB Device',
      code: 'AREA_B // USB-INJECTOR',
      icon: Usb,
      evidenceId: 'EVD-102',
      coords: { x: 65, y: 56 },
      summary: 'Hardware keystroke injector plugged into the rear motherboard USB port.',
      telemetry: {
        system: 'USB Controller Subsystem / Port 03',
        timestamp: '21:20:12 UTC',
        anomaly: 'Hardware device disguised as generic Apple keyboard rapidly injecting 800+ words/minute.',
        technicalDetails:
          'Device ID: USB\\VID_05AC&PID_0220\\REV_0100\nDevice Descriptor: Apple Extended Keyboard II (Spoofed HID)\nExtracted Payload: Injects Win+R, launches powershell -ep bypass, drops remote beacon cradle.',
      },
    },
    {
      id: 'card_reader',
      name: 'East Turnstile Access Reader',
      code: 'AREA_C // RFID-READER-01',
      icon: CreditCard,
      evidenceId: 'EVD-103',
      coords: { x: 24, y: 72 },
      summary: 'Main entrance access reader. Flagged parity bit anomalies consistent with cloned badge.',
      telemetry: {
        system: 'HID iCLASS SE Access Controller',
        timestamp: '21:08:14 UTC',
        anomaly: 'Badge #8841 (Elena Vance) accepted, but antenna flagged Proxmark3 modulation signature.',
        technicalDetails:
          'Reader: Turnstile East #01\nBadge UID: 04:88:41:E7 (Registered to Elena Vance, NetOps)\nWiegand Protocol: 37-bit H10304\nAntenna Flag: 0x04 POLARITY_MISMATCH (Common symptom of T5577 rewritable cards)',
      },
    },
    {
      id: 'wall_clock',
      name: 'NTP Time Server vs Hardware RTC',
      code: 'AREA_D // CLOCK-DESYNC',
      icon: Clock,
      evidenceId: 'EVD-104',
      coords: { x: 42, y: 22 },
      summary: 'Workstation CMOS clock was forcefully rolled back 28 minutes to fabricate an alibi.',
      telemetry: {
        system: 'Domain Time Service (time.nexus.corp)',
        timestamp: '21:20:14 UTC -> Skewed to 20:52:00',
        anomaly: 'w32tm /config /manualpeerlist forced a -1694 second negative offset before malicious script execution.',
        technicalDetails:
          'Event ID 261 (System Time Alteration)\nPrevious Time: 2026-10-13T21:20:14.281Z\nNew System Time: 2026-10-13T20:52:00.000Z\nDelta: -1694.281 seconds (-28 mins 14 secs)\nPurpose: Spoofs log events into Marcus Chen’s dinner break window.',
      },
    },
    {
      id: 'blind_spot',
      name: 'Corridor B Blind Spot & Duct',
      code: 'AREA_E // OPTIC-BLINDZONE',
      icon: EyeOff,
      evidenceId: 'EVD-105',
      coords: { x: 78, y: 26 },
      summary: 'Maintenance corridor deadzone where Camera 02 lens was blinded with static diffuser film.',
      telemetry: {
        system: 'Physical Facilities / HVAC Damper B-12',
        timestamp: '21:12:30 UTC',
        anomaly: 'Overhead access hatch unlatched; work-boot scuff marks lead directly under the camera angle.',
        technicalDetails:
          'Location: Corridor Junction B (Connecting Server Room to Workstations)\nFootwear Impression: VIBRAM-HVAC Heavy Utility Boot (Size 11.5)\nTape Residue: 3M Frosted Optic Diffuser Film found adhering to Camera 02 housing.',
      },
    },
  ];

  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(hotspots[0]);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Form State
  const [entryVector, setEntryVector] = useState('physical_incursion_usb_hid');
  const [clockDiscrepancy, setClockDiscrepancy] = useState('rtc_skew_manipulation');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>(['EVD-102']);

  const discoveredEvidenceIds = gameState?.discoveredEvidenceIds || [];
  const isSelectedDiscovered = discoveredEvidenceIds.includes(selectedHotspot.evidenceId);

  const handleCollect = async (evidenceId: string) => {
    const res = await collectEvidence(evidenceId);
    if (res.success) {
      const item = allEvidence.find((e) => e.id === evidenceId);
      if (item) {
        setSelectedEvidenceModal(item);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionFeedback(null);

    const payload: Level1Submission = {
      entryVector,
      primaryDevice: 'Rubber Ducky HID Keystroke Injector',
      clockDiscrepancy,
      selectedEvidenceIds: selectedEvidence,
    };

    const result = await submitLevel1(payload);
    setSubmissionFeedback(result.feedback);
  };

  const toggleEvidenceSelect = (id: string) => {
    setSelectedEvidence(!selectedEvidence.includes(id) ? [...selectedEvidence, id] : selectedEvidence.filter((e) => e !== id));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Level Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-teal-500/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <span>ROUND 1 · 8 MINUTES</span>
            <span>·</span>
            <span>OBJECTIVE: IDENTIFY ENTRY VECTOR & WORKSTATION COMPROMISE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">
            The Hidden Entry — Round 1 Investigation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect all 5 high-priority sectors on the corporate floor plan to extract physical and digital artifacts into your Evidence Locker.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-teal-500/30 px-3.5 py-2 rounded text-xs">
          <span className="text-slate-400">Round 1 Evidence Collected:</span>
          <span className="font-mono font-bold text-teal-300">
            {hotspots.filter((h) => discoveredEvidenceIds.includes(h.evidenceId)).length} / 5
          </span>
        </div>
      </div>

      {/* Main Investigation Workspace: Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Isometric Floorplan Map (7 cols) */}
        <div className="lg:col-span-7 bg-[#080d15] border border-teal-500/30 rounded-xl p-4 md:p-5 relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
            <span className="text-teal-400 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              FLOOR MAP: EXECUTIVE IT SUITE & SERVER CORRIDOR
            </span>
            <span>CLICK HOTSPOT TO INSPECT</span>
          </div>

          {/* Isometric SVG Canvas */}
          <div className="relative w-full aspect-[16/10] bg-[#05080e] rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center">
            {/* SVG Floor Architecture */}
            <svg
              viewBox="0 0 800 500"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
            >
              <defs>
                <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d1522" />
                  <stop offset="100%" stopColor="#080c14" />
                </linearGradient>
                <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f1928" />
                  <stop offset="100%" stopColor="#070c14" />
                </linearGradient>
                <linearGradient id="deskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a2536" />
                  <stop offset="100%" stopColor="#0f1724" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <g stroke="rgba(20, 184, 166, 0.08)" strokeWidth="1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={i * 35} x2="800" y2={i * 35} />
                ))}
                {Array.from({ length: 24 }).map((_, i) => (
                  <line key={`v-${i}`} x1={i * 35} y1="0" x2={i * 35} y2="500" />
                ))}
              </g>

              {/* Isometric Room Outline */}
              <polygon
                points="400,60 740,210 400,440 60,280"
                fill="url(#floorGrad)"
                stroke="#14b8a6"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />

              {/* Back Walls */}
              <polygon
                points="60,280 400,60 400,10 60,230"
                fill="url(#wallGrad)"
                stroke="#1e293b"
                strokeWidth="1"
              />
              <polygon
                points="400,60 740,210 740,160 400,10"
                fill="#0a101a"
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* Interior Corridor Dividers */}
              <line x1="280" y1="130" x2="490" y2="225" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="490" y1="225" x2="350" y2="320" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

              {/* Desks Clusters */}
              {/* Desk Cluster 1: Workstation 04 */}
              <polygon
                points="430,210 530,250 480,290 380,240"
                fill="url(#deskGrad)"
                stroke="#2dd4bf"
                strokeWidth="1"
                strokeOpacity="0.6"
              />
              <rect x="440" y="210" width="30" height="20" rx="2" fill="#0369a1" opacity="0.8" />
              <text x="445" y="224" fill="#38bdf8" fontSize="9" fontFamily="monospace">WS-04</text>

              {/* Desk Cluster 2: Workstation 02 */}
              <polygon
                points="300,180 380,215 340,250 260,210"
                fill="#0d1420"
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* Turnstiles & Entrance Area (Bottom-Left) */}
              <polygon
                points="160,240 240,280 200,320 120,270"
                fill="#0c1824"
                stroke="#06b6d4"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text x="140" y="290" fill="#22d3ee" fontSize="10" fontFamily="monospace" transform="rotate(22 140 290)">
                ENTRY TURNSTILES
              </text>

              {/* Server Corridor & Blind Spot Duct (Top-Right) */}
              <polygon
                points="560,130 680,185 640,220 520,160"
                fill="#0e1726"
                stroke="#f43f5e"
                strokeWidth="1"
                strokeOpacity="0.4"
              />
              <text x="560" y="170" fill="#f43f5e" fontSize="9" fontFamily="monospace" transform="rotate(22 560 170)">
                CORRIDOR B (CAM 02)
              </text>

              {/* Wall Clock Graphic near upper axis */}
              <circle cx="340" cy="100" r="14" fill="#0a121e" stroke="#14b8a6" strokeWidth="1" />
              <line x1="340" y1="100" x2="340" y2="92" stroke="#2dd4bf" strokeWidth="1.5" />
              <line x1="340" y1="100" x2="346" y2="102" stroke="#2dd4bf" strokeWidth="1.5" />
            </svg>

            {/* Hotspot HTML Markers */}
            {hotspots.map((spot) => {
              const isSelected = selectedHotspot.id === spot.id;
              const isDiscovered = discoveredEvidenceIds.includes(spot.evidenceId);

              return (
                <button
                  key={spot.id}
                  onClick={() => setSelectedHotspot(spot)}
                  style={{ left: `${spot.coords.x}%`, top: `${spot.coords.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono transition-all transform hover:scale-105 cursor-pointer z-20 ${
                    isSelected
                      ? 'bg-teal-400 text-black border-teal-300 font-bold shadow-lg shadow-teal-500/50 scale-105'
                      : isDiscovered
                      ? 'bg-slate-900/90 text-teal-300 border-teal-500/50 hover:border-teal-400'
                      : 'bg-slate-950/90 text-amber-300 border-amber-500/60 hover:border-amber-400'
                  }`}
                >
                  <spot.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{spot.name.split(' ')[0]}</span>
                  {isDiscovered ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Hotspot Legend */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
            {hotspots.map((h) => {
              const active = selectedHotspot.id === h.id;
              const collected = discoveredEvidenceIds.includes(h.evidenceId);
              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedHotspot(h)}
                  className={`p-2 rounded text-left border transition-colors cursor-pointer ${
                    active
                      ? 'bg-teal-950/80 border-teal-500 text-teal-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-teal-400 font-bold">{h.code.split(' // ')[0]}</span>
                    {collected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <div className="truncate font-sans font-medium text-slate-200 text-xs">
                    {h.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Area Telemetry & Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#090e17] border border-teal-500/30 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-teal-500/20 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 font-bold block">
                    {selectedHotspot.code}
                  </span>
                  <h3 className="text-lg font-bold font-heading text-white">
                    {selectedHotspot.name}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <selectedHotspot.icon className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedHotspot.summary}
              </p>

              {/* Telemetry Box */}
              <div className="space-y-2.5 text-xs">
                <div className="bg-black/60 border border-slate-800 rounded p-3 space-y-1.5 font-mono">
                  <div className="text-[11px] text-slate-400">
                    <span className="text-teal-400">SUB-SYSTEM:</span> {selectedHotspot.telemetry.system}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <span className="text-teal-400">TIMESTAMP:</span> {selectedHotspot.telemetry.timestamp}
                  </div>
                  <div className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800">
                    <span className="font-bold text-amber-400">ANOMALY:</span> {selectedHotspot.telemetry.anomaly}
                  </div>
                </div>

                {/* Raw Forensic Dump */}
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-teal-400" />
                    <span>RAW TELEMETRY / ARTIFACT BUFFER:</span>
                  </span>
                  <pre className="bg-black/90 border border-teal-900/40 p-3 rounded text-[11px] font-mono text-cyan-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-tight">
                    {selectedHotspot.telemetry.technicalDetails}
                  </pre>
                </div>
              </div>
            </div>

            {/* Evidence Collection Button */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              {isSelectedDiscovered ? (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cataloged in Evidence Locker</span>
                </div>
              ) : (
                <button
                  onClick={() => handleCollect(selectedHotspot.evidenceId)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer shadow-md shadow-teal-500/20"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Collect Artifact Evidence</span>
                </button>
              )}

              <button
                onClick={() => {
                  const ev = allEvidence.find((e) => e.id === selectedHotspot.evidenceId);
                  if (ev) setSelectedEvidenceModal(ev);
                }}
                className="text-xs text-teal-400 hover:underline font-mono cursor-pointer"
              >
                Inspect Clue Dossier
              </button>
            </div>
          </div>

          {/* Level 1 Entry-Method Conclusion Submission Form */}
          <div className="bg-[#090e17] border border-teal-500/30 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-heading font-bold text-base border-b border-teal-500/20 pb-2">
              <ShieldAlert className="w-4 h-4 text-teal-400" />
              <span>Round 1 Deduction Submission</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesize your discoveries and submit the definitive entry vector to the incident coordinator for Round 2 qualification review.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  1. IDENTIFIED WORKSTATION ENTRY VECTOR:
                </label>
                <select
                  value={entryVector}
                  onChange={(e) => setEntryVector(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-teal-500 font-mono"
                >
                  <option value="physical_incursion_usb_hid">
                    Physical Covert Incursion + Malicious USB HID Keystroke Injector
                  </option>
                  <option value="compromised_rdp_brute_force">
                    Remote RDP Brute-Force via External Gateway
                  </option>
                  <option value="email_phishing_macro">
                    Spear-Phishing Attachment with VBA Macro Execution
                  </option>
                  <option value="insider_authenticated_console">
                    Authorized Administrator Self-Execution during Shift
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  2. TIME STAMP / CLOCK DISCREPANCY ANALYSIS:
                </label>
                <select
                  value={clockDiscrepancy}
                  onChange={(e) => setClockDiscrepancy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-teal-500 font-mono"
                >
                  <option value="rtc_skew_manipulation">
                    Active Anti-Forensic Clock Stomp (w32tm -28 min backward skew)
                  </option>
                  <option value="ntp_drift">
                    Passive NTP Domain Clock Drift due to Network Latency
                  </option>
                  <option value="time_zone_dst_error">
                    Daylight Saving Time (DST) Configuration Bug
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1.5">
                  3. SELECT SUPPORTING EVIDENCE ARTIFACTS:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allEvidence
                    .filter((e) => e.originLevel === 1)
                    .map((ev) => {
                      const isChecked = selectedEvidence.includes(ev.id);
                      return (
                        <label
                          key={ev.id}
                          className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-teal-950/60 border-teal-500/60 text-teal-200'
                              : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleEvidenceSelect(ev.id)}
                            className="mt-0.5 rounded text-teal-500 focus:ring-0 bg-slate-900 border-slate-700"
                          />
                          <span className="truncate">{ev.title}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {submissionFeedback && (
                <div
                  className={`p-3 rounded border text-xs leading-relaxed ${
                    submissionFeedback.includes('ACCESS GRANTED')
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                  }`}
                >
                  {submissionFeedback}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-heading font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Validating Conclusion...' : 'Submit Phase 1 Deduction'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
