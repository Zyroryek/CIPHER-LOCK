import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ROUND_1_QUESTIONS } from '../data/examQuestions';
import { Level1Submission } from '../types/game';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  Shield,
  Monitor,
  Usb,
  CreditCard,
  Clock,
  EyeOff,
  MapPin,
  Cpu,
} from 'lucide-react';

interface Hotspot {
  id: string;
  name: string;
  code: string;
  icon: any;
  coords: { x: number; y: number };
  evidenceBrief: string;
  telemetry: string;
}

export const ExamRound1: React.FC = () => {
  const { studentName, teamName, submitLevel1, isLoading } = useGame();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const hotspots: Hotspot[] = [
    {
      id: 'workstation',
      name: 'Area A: Workstation 04 (Marcus Chen)',
      code: 'AREA_A // WS-04',
      icon: Monitor,
      coords: { x: 55, y: 45 },
      evidenceBrief: 'Interactive logon occurred while Marcus Chen was logged off. Event 4688 shows hidden Base64 PowerShell execution.',
      telemetry: 'Process: powershell.exe -NoP -NonI -W Hidden -Enc SUVY... | LogonType: 2 (Interactive Console)',
    },
    {
      id: 'usb_drive',
      name: 'Area B: Suspicious USB Device',
      code: 'AREA_B // USB-INJECTOR',
      icon: Usb,
      coords: { x: 62, y: 55 },
      evidenceBrief: 'Rubber Ducky hardware keystroke injector inserted into rear port. Emulates generic Apple Keyboard (VID: 0x05AC / PID: 0x0220).',
      telemetry: 'Device Descriptor: Apple Extended Keyboard II | Automated script injected via Win+R run dialog',
    },
    {
      id: 'card_reader',
      name: 'Area C: Turnstiles Access Reader',
      code: 'AREA_C // RFID-READER',
      icon: CreditCard,
      coords: { x: 25, y: 70 },
      evidenceBrief: 'Turnstile Door 01 badged at 21:08:14 with Elena Vance’s badge (#8841), but reader flagged antenna polarity mismatch (cloned card).',
      telemetry: 'Reader UID: 04:88:41:E7 | Protocol: 37-bit Wiegand | Antenna Flag: 0x04 POLARITY_MISMATCH',
    },
    {
      id: 'wall_clock',
      name: 'Area D: Hardware RTC Clock & NTP',
      code: 'AREA_D // CLOCK-OFFSET',
      icon: Clock,
      coords: { x: 42, y: 22 },
      evidenceBrief: 'Event ID 261: System CMOS clock was forcefully adjusted backwards by -1694 seconds (-28 mins 14 secs) to 20:52:00 UTC.',
      telemetry: 'Anti-Forensic Time Stomp: w32tm used to backdate execution into Marcus Chen’s dinner break window',
    },
    {
      id: 'blind_spot',
      name: 'Area E: Corridor B Camera Blind Spot',
      code: 'AREA_E // BLIND-ZONE',
      icon: EyeOff,
      coords: { x: 78, y: 28 },
      evidenceBrief: 'Overhead HVAC maintenance duct hatch unlatched. Camera 02 lens blinded with frosted diffuser film at 21:12.',
      telemetry: 'Location: Corridor Junction B | Treads: Heavy contractor utility boots leading toward server room',
    },
  ];

  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(hotspots[0]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelect = (questionId: string, optionKey: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
    if (validationError) setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setValidationError(null);

    const unanswered = ROUND_1_QUESTIONS.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setValidationError(`Please answer all ${ROUND_1_QUESTIONS.length} questions before submitting (${unanswered.length} unanswered).`);
      return;
    }

    const isQ1Correct = answers['R1-Q1'] === 'B';
    const isQ2Correct = answers['R1-Q2'] === 'B';
    const isQ3Correct = answers['R1-Q3'] === 'B';
    const isQ4Correct = answers['R1-Q4'] === 'B';

    const evidenceList: string[] = [];
    if (isQ1Correct) evidenceList.push('EVD-103');
    if (isQ2Correct) evidenceList.push('EVD-102');
    if (isQ3Correct) evidenceList.push('EVD-104');
    if (isQ4Correct) evidenceList.push('EVD-101');

    const payload: Level1Submission = {
      entryVector: isQ2Correct ? 'physical_incursion_usb_hid' : 'remote_network_ssh',
      primaryDevice: isQ2Correct ? 'Rubber Ducky HID Keystroke Injector' : 'Standard USB Storage',
      clockDiscrepancy: isQ3Correct ? 'rtc_skew_manipulation' : 'clock_drift',
      selectedEvidenceIds: evidenceList,
    };

    const res = await submitLevel1(payload);
    setFeedback(res.feedback);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Exam Header */}
      <div className="bg-[#090e17] border border-teal-500/30 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-0.5">
              <Shield className="w-3.5 h-3.5" />
              <span>OFFICIAL COMPETITION PAPER // ROUND 1 EXAMINATION</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-heading text-white">
              Round 1: Physical & Digital Office Forensics
            </h1>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <span className="text-slate-400 block text-[11px]">CANDIDATE:</span>
            <span className="text-teal-300 font-semibold">{studentName || teamName}</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Incident Briefing:</strong> At 22:00, security operations flagged an unauthorized privilege escalation that occurred at Workstation 04 (belonging to Marcus Chen). Inspect the office map below to review the recovered physical and digital artifacts, then answer the 4 exam questions.
        </p>
      </div>

      {/* Interactive Isometric Office Floorplan Map */}
      <div className="bg-[#090e17] border border-teal-500/30 rounded-xl p-4 md:p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-teal-500/20 pb-2 text-xs font-mono">
          <span className="text-teal-400 font-bold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>INTERACTIVE OFFICE FLOOR PLAN (CLICK PINS TO INSPECT FORENSICS)</span>
          </span>
          <span className="text-slate-400 hidden sm:inline">5 High-Priority Incident Sectors</span>
        </div>

        {/* SVG Map Canvas */}
        <div className="relative w-full aspect-[16/9] bg-[#05080e] rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
          <svg
            viewBox="0 0 800 450"
            className="w-full h-full select-none"
          >
            {/* Perspective Room Grid */}
            <defs>
              <linearGradient id="floorG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f1a28" />
                <stop offset="100%" stopColor="#070c14" />
              </linearGradient>
            </defs>

            {/* Room Polygon */}
            <polygon
              points="400,40 760,190 400,420 40,260"
              fill="url(#floorG)"
              stroke="#14b8a6"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />

            {/* Interior Walls & Partitions */}
            <line x1="280" y1="110" x2="500" y2="205" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="500" y1="205" x2="360" y2="300" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />

            {/* Desk 04 (Marcus Chen) */}
            <polygon points="440,190 540,230 490,270 390,225" fill="#1e293b" stroke="#2dd4bf" strokeWidth="1.5" />
            <rect x="445" y="195" width="28" height="18" rx="2" fill="#0284c7" opacity="0.8" />
            <text x="450" y="208" fill="#e0f2fe" fontSize="8" fontFamily="monospace">WS-04</text>

            {/* Turnstiles Area */}
            <polygon points="140,220 220,260 180,300 100,250" fill="#0c1824" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 2" />
            <text x="110" y="275" fill="#38bdf8" fontSize="9" fontFamily="monospace" transform="rotate(22 110 275)">
              TURNSTILES
            </text>

            {/* Corridor B Blind Spot */}
            <polygon points="580,110 700,165 660,200 540,140" fill="#1a111a" stroke="#f43f5e" strokeWidth="1" strokeOpacity="0.5" />
            <text x="580" y="150" fill="#fb7185" fontSize="8" fontFamily="monospace" transform="rotate(22 580 150)">
              CORRIDOR B
            </text>

            {/* Wall Clock */}
            <circle cx="340" cy="80" r="12" fill="#090f17" stroke="#14b8a6" strokeWidth="1.5" />
            <line x1="340" y1="80" x2="340" y2="73" stroke="#2dd4bf" strokeWidth="1.5" />
            <line x1="340" y1="80" x2="345" y2="82" stroke="#2dd4bf" strokeWidth="1.5" />
          </svg>

          {/* Interactive Map Hotspot Pins */}
          {hotspots.map((spot) => {
            const isSelected = selectedHotspot.id === spot.id;
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => setSelectedHotspot(spot)}
                style={{ left: `${spot.coords.x}%`, top: `${spot.coords.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-mono transition-transform hover:scale-110 cursor-pointer z-10 ${
                  isSelected
                    ? 'bg-teal-400 text-black border-teal-300 font-bold shadow-lg shadow-teal-500/50 scale-105'
                    : 'bg-slate-900/90 text-teal-300 border-teal-500/40 hover:border-teal-300'
                }`}
              >
                <spot.icon className="w-3 h-3 shrink-0" />
                <span>{spot.code.split(' // ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Sector Inspector Card */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-teal-300 flex items-center gap-1.5 font-mono">
              <selectedHotspot.icon className="w-3.5 h-3.5 text-teal-400" />
              <span>{selectedHotspot.name}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">SECTOR TELEMETRY</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            {selectedHotspot.evidenceBrief}
          </p>
          <div className="bg-black/60 p-2 rounded text-[11px] font-mono text-cyan-300 border border-slate-800">
            {selectedHotspot.telemetry}
          </div>
        </div>
      </div>

      {/* Round 1 Examination Questions */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-xs font-mono text-teal-400 uppercase tracking-wider font-bold pt-2">
          ROUND 1 EXAMINATION QUESTIONS:
        </div>

        {ROUND_1_QUESTIONS.map((q, idx) => (
          <div
            key={q.id}
            className="bg-[#090e17] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg space-y-3 transition-colors text-xs"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] mb-1">
                <span className="text-teal-400 font-bold">QUESTION {idx + 1} OF 4</span>
                <span>{q.points} Points</span>
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug">
                {q.question}
              </h3>
              {q.context && (
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Reference: {q.context}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2 pt-1">
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt.key;
                return (
                  <label
                    key={opt.key}
                    onClick={() => handleSelect(q.id, opt.key)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-950/60 border-teal-500 text-teal-200 ring-1 ring-teal-500/30'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={isSelected}
                      onChange={() => handleSelect(q.id, opt.key)}
                      className="mt-0.5 text-teal-500 focus:ring-0 bg-slate-900 border-slate-700"
                    />
                    <div className="flex-1">
                      <span className="font-mono font-bold mr-2 text-teal-400">{opt.key}.</span>
                      <span className="leading-relaxed">{opt.text}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {validationError && (
          <div className="p-4 bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {feedback && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-black font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? 'Submitting Answers...' : 'Submit Round 1 Examination'}</span>
        </button>
      </form>
    </div>
  );
};
