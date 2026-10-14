import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { CCTVEvent, Level2Submission } from '../types/game';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Camera,
  FolderPlus,
  Send,
  Eye,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
  Clock,
  Layers,
} from 'lucide-react';

export const Level2CCTVInvestigation: React.FC = () => {
  const {
    cctvEvents,
    allEvidence,
    gameState,
    collectEvidence,
    submitLevel2,
    setSelectedEvidenceModal,
    isLoading,
  } = useGame();

  const [activeCameraId, setActiveCameraId] = useState<'CAM_01' | 'CAM_02' | 'CAM_03'>('CAM_01');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentSeconds, setCurrentSeconds] = useState<number>(450); // 21:07:30
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Preliminary prediction form
  const [suspectId, setSuspectId] = useState('suspect_trevor_bailey');
  const [primeEventId, setPrimeEventId] = useState('CCTV-EV-04');
  const [eventOrder, setEventOrder] = useState<string[]>([
    'CCTV-EV-01',
    'CCTV-EV-02',
    'CCTV-EV-04',
    'CCTV-EV-05',
  ]);
  const [investigatorNotes, setInvestigatorNotes] = useState(
    'Surveillance feeds identify contractor Trevor Bailey entering with cloned card at 21:08, blinding CAM 02 at 21:12, executing physical USB attack on Workstation 04 at 21:24, and fleeing via fire stairs at 21:38.'
  );

  const discoveredEvidenceIds = gameState?.discoveredEvidenceIds || [];

  // Playback timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSeconds((prev) => {
          if (prev >= 2400) {
            setIsPlaying(false);
            return 2400;
          }
          return prev + Math.round(2 * playbackSpeed);
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Format current playback timestamp relative to 21:00:00
  const formatSurveillanceTimestamp = (offsetSec: number) => {
    const totalSec = 21 * 3600 + offsetSec;
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentDisplayTime = formatSurveillanceTimestamp(currentSeconds);

  // Active event currently matching seeker window
  const activeEvent = cctvEvents.find(
    (ev) =>
      ev.cameraId === activeCameraId &&
      Math.abs(ev.timestampSeconds - currentSeconds) <= 60
  );

  // All events for this camera
  const cameraEvents = cctvEvents.filter((ev) => ev.cameraId === activeCameraId);

  const handleJumpToEvent = (ev: CCTVEvent) => {
    setActiveCameraId(ev.cameraId);
    setCurrentSeconds(ev.timestampSeconds);
    setIsPlaying(false);
  };

  const handleCollectFrame = async (evidenceId?: string) => {
    if (!evidenceId) return;
    const res = await collectEvidence(evidenceId);
    if (res.success) {
      const item = allEvidence.find((e) => e.id === evidenceId);
      if (item) setSelectedEvidenceModal(item);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionFeedback(null);

    const payload: Level2Submission = {
      suspectId,
      primeCctvEventId: primeEventId,
      chronologyOrder: eventOrder,
      selectedEvidenceIds: ['EVD-201', 'EVD-202', 'EVD-203', 'EVD-204'],
      investigatorNotes,
    };

    const res = await submitLevel2(payload);
    setSubmissionFeedback(res.feedback);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-teal-500/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <span>ROUND 2 · 8 MINUTES</span>
            <span>·</span>
            <span>OBJECTIVE: RECONSTRUCT MULTI-CAMERA SURVEILLANCE TIMELINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">
            The CCTV Trap — Round 2 Surveillance Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Scrub through 3 synchronized feeds to track the contractor’s incursion route and correlate physical footage with digital keystrokes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-teal-500/30 px-3.5 py-2 rounded text-xs font-mono">
          <span className="text-slate-400">STATUS:</span>
          {gameState?.level3QualifiedByOrganiser ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> QUALIFIED FOR GRAND FINALS
            </span>
          ) : (
            <span className="text-cyan-300 font-bold">ANALYZING FEEDS</span>
          )}
        </div>
      </div>

      {/* Main Grid: CCTV Console (7 cols) + Synchronized Event Log & Prediction (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Surveillance Deck (7 cols) */}
        <div className="lg:col-span-7 bg-[#080d15] border border-teal-500/30 rounded-xl p-4 md:p-5 shadow-2xl flex flex-col space-y-4">
          {/* Camera Feeds Tabs */}
          <div className="flex items-center justify-between gap-2 border-b border-teal-500/20 pb-3 overflow-x-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCameraId('CAM_01')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  activeCameraId === 'CAM_01'
                    ? 'bg-teal-500 text-black font-bold shadow-md shadow-teal-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>CAM 01 // Main Entrance</span>
              </button>

              <button
                onClick={() => setActiveCameraId('CAM_02')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  activeCameraId === 'CAM_02'
                    ? 'bg-teal-500 text-black font-bold shadow-md shadow-teal-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>CAM 02 // Server Corridor</span>
              </button>

              <button
                onClick={() => setActiveCameraId('CAM_03')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  activeCameraId === 'CAM_03'
                    ? 'bg-teal-500 text-black font-bold shadow-md shadow-teal-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>CAM 03 // Workstations</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-rose-400 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>LIVE VCR REPLAY</span>
            </div>
          </div>

          {/* Simulated CCTV Screen Viewport */}
          <div className="relative aspect-[16/10] bg-[#020508] border border-slate-800 rounded-lg overflow-hidden cyber-scanlines flex items-center justify-center">
            {/* Camera Visual Simulation Graphic */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none z-10 font-mono text-[11px]">
              {/* OSD Top Bar */}
              <div className="flex items-center justify-between text-cyan-400 bg-black/60 px-3 py-1.5 rounded border border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-wider">{activeCameraId}</span>
                  <span>·</span>
                  <span className="text-slate-300">
                    {activeCameraId === 'CAM_01'
                      ? 'NORTH LOBBY TURNSTILES'
                      : activeCameraId === 'CAM_02'
                      ? 'JUNCTION B SERVER CORRIDOR'
                      : 'EXECUTIVE SUITE DESK 04'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold tabular-nums">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentDisplayTime} UTC</span>
                </div>
              </div>

              {/* Center Wireframe / Target Bounding Box */}
              {activeEvent ? (
                <div
                  className="absolute p-2 rounded pointer-events-auto transition-all animate-pulse"
                  style={{
                    left: `${activeEvent.visualOverlay.boundingBox?.x || 30}%`,
                    top: `${activeEvent.visualOverlay.boundingBox?.y || 25}%`,
                    width: `${activeEvent.visualOverlay.boundingBox?.w || 35}%`,
                    height: `${activeEvent.visualOverlay.boundingBox?.h || 45}%`,
                    border: `2px solid ${activeEvent.visualOverlay.highlightColor || '#06b6d4'}`,
                    boxShadow: `0 0 15px ${activeEvent.visualOverlay.highlightColor || '#06b6d4'}40`,
                    background: 'rgba(6, 182, 212, 0.05)',
                  }}
                >
                  <div className="bg-black/80 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/40 font-mono inline-block mb-1">
                    {activeEvent.visualOverlay.label || 'SUSPECT MOVEMENT DETECTED'}
                  </div>
                </div>
              ) : (
                <div className="m-auto text-slate-600 font-mono text-xs flex flex-col items-center gap-2">
                  <Eye className="w-6 h-6 opacity-40 text-teal-400" />
                  <span>NOMINAL SURVEILLANCE BUFFER // NO MOTION ANOMALIES</span>
                </div>
              )}

              {/* OSD Bottom Bar */}
              <div className="flex items-center justify-between text-slate-400 bg-black/60 px-3 py-1 rounded border border-slate-800">
                <span>FPS: 30.00 · CODEC: H.265 HIGH PROFILE</span>
                <span className="text-cyan-400">
                  MOTION DETECT: {activeEvent ? 'TRIGGERED (94%)' : 'STANDBY (0%)'}
                </span>
              </div>
            </div>

            {/* Lens Tamper Effect for CAM 02 when tampered */}
            {activeCameraId === 'CAM_02' && currentSeconds >= 750 && currentSeconds <= 2100 && (
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md z-0 flex items-center justify-center">
                <div className="bg-black/90 p-4 rounded border border-rose-500/50 text-center max-w-sm">
                  <AlertOctagon className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                  <span className="text-rose-400 font-mono font-bold text-xs block">
                    OPTIC DEFECT DETECTED: DIFFUSER FILM OBSTRUCTION
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Camera lens covered with translucent tape. Feed blurred by intruder to conceal corridor traversal.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scrubber Timeline Controls */}
          <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
            {/* Timeline Slider with Event Markers */}
            <div className="relative pt-2">
              <input
                type="range"
                min="0"
                max="2400"
                value={currentSeconds}
                onChange={(e) => setCurrentSeconds(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />

              {/* Event Marker Pins */}
              {cameraEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => handleJumpToEvent(ev)}
                  title={`${ev.displayTimestamp} - ${ev.title}`}
                  style={{ left: `${(ev.timestampSeconds / 2400) * 100}%` }}
                  className="absolute top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-black hover:scale-125 transition-transform cursor-pointer"
                />
              ))}
            </div>

            {/* Playback Buttons & Speeds */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => { setCurrentSeconds(0); setIsPlaying(false); }}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 transition-colors"
                  title="Rewind to 21:00"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Playback Speed Toggles */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded border border-slate-800">
                {[0.5, 1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-teal-500 text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <div className="font-mono text-teal-300 text-xs">
                <span>SEEK: {currentDisplayTime}</span>
              </div>
            </div>
          </div>

          {/* Active Frame Intelligence Drawer */}
          {activeEvent && (
            <div className="bg-[#0b121d] border border-cyan-500/40 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                  <span>FRAME MATCH: {activeEvent.displayTimestamp}</span>
                  <span>·</span>
                  <span className="uppercase">{activeEvent.cameraName}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {activeEvent.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeEvent.description}
                </p>
              </div>

              {activeEvent.evidenceId && (
                <div className="shrink-0">
                  {discoveredEvidenceIds.includes(activeEvent.evidenceId) ? (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Frame Saved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCollectFrame(activeEvent.evidenceId)}
                      className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-mono rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Save CCTV Evidence</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Synchronized Event Log & Prediction Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Synchronized Event Log Table */}
          <div className="bg-[#090e17] border border-teal-500/30 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-teal-500/20 pb-3 mb-3">
              <div className="flex items-center gap-2 font-heading font-bold text-white text-base">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Multi-Feed Surveillance Log</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {cctvEvents.length} INCIDENT FRAMES
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cctvEvents.map((ev) => {
                const isSelected = activeEvent?.id === ev.id;
                const isFound = ev.evidenceId ? discoveredEvidenceIds.includes(ev.evidenceId) : false;

                return (
                  <div
                    key={ev.id}
                    onClick={() => handleJumpToEvent(ev)}
                    className={`p-2.5 rounded border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-950/70 border-teal-400 text-teal-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                      <span className="text-cyan-400 font-bold">{ev.displayTimestamp}</span>
                      <span className="text-slate-400">{ev.cameraId}</span>
                    </div>
                    <div className="font-semibold text-white truncate mb-0.5">{ev.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{ev.description}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preliminary Prediction Form */}
          <div className="bg-[#090e17] border border-teal-500/30 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-heading font-bold text-base border-b border-teal-500/20 pb-2">
              <ShieldAlert className="w-4 h-4 text-teal-400" />
              <span>Phase 2 Surveillance Synthesis</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Submit your preliminary prediction of the suspect identity and the prime suspicious event to unlock Level 3 case dossiers.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  1. IDENTIFIED SURVEILLANCE SUSPECT:
                </label>
                <select
                  value={suspectId}
                  onChange={(e) => setSuspectId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-teal-500 font-mono"
                >
                  <option value="suspect_trevor_bailey">
                    Trevor Bailey (HVAC Contractor / Navy Utility Gear)
                  </option>
                  <option value="suspect_marcus_chen">
                    Marcus Chen (Senior Systems Administrator)
                  </option>
                  <option value="suspect_elena_vance">
                    Elena Vance (Lead Network Operations Engineer)
                  </option>
                  <option value="suspect_sarah_lin">
                    Dr. Sarah Lin (Chief AI Scientist)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  2. CRITICAL ANOMALY EVENT TIMESTAMP:
                </label>
                <select
                  value={primeEventId}
                  onChange={(e) => setPrimeEventId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-teal-500 font-mono"
                >
                  <option value="CCTV-EV-04">
                    21:24:02 — Workstation 04 Keystroke Injection & USB insertion
                  </option>
                  <option value="CCTV-EV-01">
                    21:08:14 — Contractor Swipes Cloned Badge at East Turnstile
                  </option>
                  <option value="CCTV-EV-02">
                    21:12:30 — Camera 02 Optical Diffuser Tampering in Corridor B
                  </option>
                  <option value="CCTV-EV-05">
                    21:38:50 — Emergency Stairwell Exfiltration into Alleyway
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  3. INVESTIGATOR SURVEILLANCE NOTES:
                </label>
                <textarea
                  rows={2}
                  value={investigatorNotes}
                  onChange={(e) => setInvestigatorNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-teal-500 font-sans"
                />
              </div>

              {submissionFeedback && (
                <div
                  className={`p-3 rounded border text-xs leading-relaxed ${
                    submissionFeedback.includes('CRITICAL UNLOCK')
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
                <span>{isLoading ? 'Verifying Chronology...' : 'Submit Phase 2 Prediction'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
