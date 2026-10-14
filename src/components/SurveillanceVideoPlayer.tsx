import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Camera, ShieldAlert, FastForward, Clock, Maximize2, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { audioController } from '../utils/audio';

const CCTV_FEEDS = {
  CAM_01: '/src/assets/images/cctv_feed_cam01_entrance_1791959122567.jpg',
  CAM_02: '/src/assets/images/cctv_feed_cam02_diffuser_1791959122106.jpg',
  CAM_03: '/src/assets/images/cctv_feed_cam03_workstation_1791959123457.jpg',
};

interface SceneMarker {
  time: number;
  cam: 'CAM_01' | 'CAM_02' | 'CAM_03';
  label: string;
  questionRef: string;
  box: { x: number; y: number; w: number; h: number; title: string; subtitle: string; color: string };
}

const SCENE_MARKERS: SceneMarker[] = [
  {
    time: 494, // 21:08:14
    cam: 'CAM_01',
    label: '21:08:14 (Entrance Turnstile)',
    questionRef: 'Reference for Question 1',
    box: {
      x: 32,
      y: 28,
      w: 24,
      h: 56,
      title: 'SUBJECT DETECTED: TREVOR BAILEY',
      subtitle: 'Navy contractor jumpsuit, cap, tool bag, cloned badge swipe',
      color: '#06b6d4',
    },
  },
  {
    time: 750, // 21:12:30
    cam: 'CAM_02',
    label: '21:12:30 (Lens Diffuser Tamper)',
    questionRef: 'Reference for Question 2',
    box: {
      x: 48,
      y: 15,
      w: 32,
      h: 48,
      title: 'LENS TAMPER IN PROGRESS',
      subtitle: 'Affixing frosted 3M diffuser film via extension pole',
      color: '#f59e0b',
    },
  },
  {
    time: 1442, // 21:24:02
    cam: 'CAM_03',
    label: '21:24:02 (Desk 04 USB Injection)',
    questionRef: 'Reference for Question 3',
    box: {
      x: 36,
      y: 35,
      w: 30,
      h: 52,
      title: 'PHYSICAL COMPROMISE: DESK 04',
      subtitle: 'Kneeling behind workstation, inserting Rubber Ducky HID',
      color: '#ef4444',
    },
  },
  {
    time: 2330, // 21:38:50
    cam: 'CAM_01',
    label: '21:38:50 (Emergency Exit 3B)',
    questionRef: 'Reference for Question 4',
    box: {
      x: 64,
      y: 25,
      w: 22,
      h: 60,
      title: 'UNAUTHORIZED EGRESS: FIRE EXIT 3B',
      subtitle: 'Pushing through alarm door into alley without badging',
      color: '#10b981',
    },
  },
];

export const SurveillanceVideoPlayer: React.FC = () => {
  const [activeCam, setActiveCam] = useState<'CAM_01' | 'CAM_02' | 'CAM_03'>('CAM_01');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSeconds, setCurrentSeconds] = useState(494); // Start at 21:08:14
  const [fractionalTick, setFractionalTick] = useState(14);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Playback timer loop simulating real 30fps security DVR
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        setCurrentSeconds((prev) => {
          const next = prev + delta * playbackSpeed;
          if (next >= 2400) {
            setIsPlaying(false);
            return 2400;
          }
          return next;
        });

        setFractionalTick(Math.floor((now % 1000) / 33)); // 0 to 29 frames
      }

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, playbackSpeed]);

  // Subtle canvas noise & surveillance lines animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const drawNoise = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Random subtle scanline jitter
      const scanY = (Date.now() / 20) % h;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.fillRect(0, scanY, w, 3);

      // Occasional glitch artifacts
      if (Math.random() > 0.88) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        const gy = Math.random() * h;
        ctx.fillRect(0, gy, w, Math.random() * 8 + 2);
      }

      animId = requestAnimationFrame(drawNoise);
    };

    animId = requestAnimationFrame(drawNoise);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Format time relative to 21:00:00 UTC
  const formatTime = (secs: number) => {
    const totalSec = Math.floor(21 * 3600 + secs);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const f = Math.floor(fractionalTick).toString().padStart(2, '0');
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${f}`;
  };

  const timeString = formatTime(currentSeconds);

  const handleJump = (marker: SceneMarker) => {
    audioController.playBeep(880, 0.08);
    setActiveCam(marker.cam);
    setCurrentSeconds(marker.time);
    setIsPlaying(false);
  };

  // Find active scene marker if within window (+/- 45 seconds)
  const activeMarker = SCENE_MARKERS.find(
    (m) => m.cam === activeCam && Math.abs(currentSeconds - m.time) < 40
  );

  // Check if CAM 02 is obstructed by diffuser film (starts at 21:12:30 = 750s)
  const isDiffuserActive = activeCam === 'CAM_02' && currentSeconds >= 750;

  return (
    <div className="bg-[#090e17] border border-cyan-500/40 rounded-xl p-4 md:p-5 shadow-2xl space-y-4">
      {/* Video Header & Camera Channels */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <h3 className="font-heading font-bold text-white text-sm md:text-base flex items-center gap-2">
            <span>Surveillance CCTV Video Player</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              ROUND 2 VIDEO EVIDENCE
            </span>
          </h3>
        </div>

        {/* Camera Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveCam('CAM_01'); audioController.playClick(); }}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeCam === 'CAM_01'
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            CAM 01: North Lobby
          </button>

          <button
            type="button"
            onClick={() => { setActiveCam('CAM_02'); audioController.playClick(); }}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeCam === 'CAM_02'
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            CAM 02: Server Corridor
          </button>

          <button
            type="button"
            onClick={() => { setActiveCam('CAM_03'); audioController.playClick(); }}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeCam === 'CAM_03'
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            CAM 03: Workstation 04
          </button>
        </div>
      </div>

      {/* Main CCTV Video Screen Viewport */}
      <div className="relative aspect-[16/9] w-full bg-black rounded-lg overflow-hidden border border-slate-800 shadow-inner group">
        {/* Real Generated CCTV Video Image Frame */}
        <img
          src={CCTV_FEEDS[activeCam]}
          alt={`CCTV Feed ${activeCam}`}
          className={`w-full h-full object-cover select-none transition-all duration-300 filter contrast-105 brightness-95 ${
            isDiffuserActive ? 'blur-[3px] opacity-75' : ''
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Diffuser Obstruction Simulation Banner when active */}
        {isDiffuserActive && (
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[4px] pointer-events-none flex items-center justify-center">
            <div className="bg-black/85 border border-amber-500/60 p-3 rounded-lg text-center max-w-sm mx-4 space-y-1 shadow-2xl">
              <span className="text-amber-400 font-mono font-bold text-xs flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>CAMERA 02 DIFFUSER OBSTRUCTION DETECTED</span>
              </span>
              <p className="text-[11px] text-slate-300 leading-tight">
                Frosted film applied over optical dome at 21:12:30. View restricted for 23 minutes.
              </p>
            </div>
          </div>
        )}

        {/* Live CRT Noise Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen"
        />

        {/* Live Video OSD Watermarks */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-200 pointer-events-none z-10 bg-black/60 px-3 py-1.5 rounded border border-white/10 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="font-bold tracking-wider">{isPlaying ? 'LIVE REPLAY' : 'PAUSED'}</span>
            <span>·</span>
            <span className="text-cyan-300 font-semibold">{activeCam}</span>
            <span>·</span>
            <span className="text-slate-400">{playbackSpeed}x</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 font-bold tabular-nums">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeString} UTC</span>
          </div>
        </div>

        {/* Dynamic AI Target Tracking Bounding Box */}
        {activeMarker && (
          <div
            style={{
              left: `${activeMarker.box.x}%`,
              top: `${activeMarker.box.y}%`,
              width: `${activeMarker.box.w}%`,
              height: `${activeMarker.box.h}%`,
              borderColor: activeMarker.box.color,
            }}
            className="absolute border-2 rounded-xs pointer-events-none z-10 animate-pulse shadow-lg"
          >
            {/* Top label tag */}
            <div
              style={{ backgroundColor: activeMarker.box.color }}
              className="absolute -top-6 left-0 px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold text-black uppercase tracking-wider whitespace-nowrap shadow"
            >
              {activeMarker.box.title}
            </div>

            {/* Corner Crosshairs */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />
          </div>
        )}

        {/* Target Bounding Box / Anomaly Status Banner */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono pointer-events-none z-10 bg-black/80 px-3 py-1.5 rounded border border-cyan-500/30">
          <span className="text-cyan-300 truncate mr-2">
            {activeMarker ? activeMarker.box.subtitle : 'SCANNING FOR SECURITY ANOMALIES...'}
          </span>
          <span className="text-slate-400 shrink-0 hidden sm:inline">30 FPS · H.265 SECURE ARCHIVE</span>
        </div>
      </div>

      {/* Video Scrubber & Playback Controls */}
      <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="2400"
            step="1"
            value={Math.floor(currentSeconds)}
            onChange={(e) => {
              setCurrentSeconds(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="font-mono text-cyan-300 font-bold shrink-0 tabular-nums text-xs">
            {timeString}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsPlaying(!isPlaying);
                audioController.playClick();
              }}
              className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs shadow-sm shadow-cyan-500/30"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause Video' : 'Play Video'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentSeconds(494);
                setIsPlaying(false);
                audioController.playClick();
              }}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 cursor-pointer"
              title="Reset Video"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Playback speed selector */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-0.5 text-[11px] font-mono">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    playbackSpeed === spd ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Quick Scene Jump Buttons corresponding strictly to questions */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <span className="text-slate-500 mr-1 hidden lg:inline">Jump to Exam Question Footage:</span>
            {SCENE_MARKERS.map((marker, idx) => (
              <button
                key={marker.time}
                type="button"
                onClick={() => handleJump(marker)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 cursor-pointer transition-colors flex items-center gap-1"
                title={marker.questionRef}
              >
                <span className="text-cyan-400 font-bold">Q{idx + 1}:</span>
                <span>{marker.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
