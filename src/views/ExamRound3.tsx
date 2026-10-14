import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ROUND_3_QUESTIONS } from '../data/examQuestions';
import { Level3Submission } from '../types/game';
import confetti from 'canvas-confetti';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Send,
  Shield,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ExamRound3: React.FC = () => {
  const { suspects, studentName, teamName, submitLevel3, isLoading } = useGame();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showDossiers, setShowDossiers] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelect = (questionId: string, optionKey: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
    if (validationError) setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setValidationError(null);

    const unanswered = ROUND_3_QUESTIONS.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setValidationError(`Please answer all ${ROUND_3_QUESTIONS.length} forensic deduction questions before submitting (${unanswered.length} unanswered).`);
      return;
    }

    const isQ1Correct = answers['R3-Q1'] === 'D';
    const isQ2Correct = answers['R3-Q2'] === 'B';
    const isQ3Correct = answers['R3-Q3'] === 'B';
    const isQ4Correct = answers['R3-Q4'] === 'B';

    const payload: Level3Submission = {
      attackerId: isQ1Correct ? 'suspect_trevor_bailey' : 'suspect_marcus_chen',
      entryMethod: 'cloned_rfid_plus_rubber_ducky',
      chronologyOrder: isQ4Correct ? [
        '21:08 - Cloned badge entry at East Turnstile',
        '21:12 - Camera 02 lens diffuser obstruction',
        '21:20 - Workstation 04 USB Rubber Ducky insertion & clock skew',
        '21:38 - Emergency stairwell exit without badging',
      ] : ['Incorrect chronology sequence'],
      supportingEvidenceIds: ['EVD-102', 'EVD-103', 'EVD-203', 'EVD-302', 'EVD-303'],
      eliminatedSuspectId: isQ2Correct ? 'suspect_marcus_chen' : 'suspect_elena_vance',
      eliminationReason: isQ3Correct
        ? 'Marcus Chen was verified locked in the basement data room by biometric fingerprint reader at Server Rack 04 continuously between 21:15 and 21:35.'
        : 'Inaccurate alibi validation.',
    };

    const res = await submitLevel3(payload);
    setFeedback(res.feedback);

    if (res.success) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Exam Header */}
      <div className="bg-[#090e17] border border-amber-500/30 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-0.5">
              <Award className="w-3.5 h-3.5" />
              <span>OFFICIAL COMPETITION PAPER // ROUND 3 (GRAND FINALS)</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-heading text-white">
              Round 3: The Final Forensic Case Deduction
            </h1>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <span className="text-slate-400 block text-[11px]">FINALIST:</span>
            <span className="text-amber-300 font-semibold">{studentName || teamName}</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Finals Assessment:</strong> Correlate the physical evidence from Round 1, the surveillance timeline from Round 2, and the cryptographic alibis below to convict the perpetrator and formally eliminate innocent personnel.
        </p>

        {/* Suspect Dossier Cards Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowDossiers(!showDossiers)}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-mono transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{showDossiers ? 'Hide Suspect Dossiers' : 'View Suspect Profiles & Alibis (+)'}</span>
            {showDossiers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDossiers && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in text-xs">
              {suspects.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-start gap-3"
                >
                  <img
                    src={s.avatarUrl}
                    alt={s.name}
                    className="w-12 h-12 rounded object-cover border border-slate-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-mono text-amber-400 font-bold block">{s.badgeId}</span>
                    <h4 className="font-bold text-white text-xs truncate">{s.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate mb-1">{s.role}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2">Alibi: "{s.alibi}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clean Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold pt-2">
          FINAL CASE DEDUCTION QUESTIONS:
        </div>

        {ROUND_3_QUESTIONS.map((q, idx) => (
          <div
            key={q.id}
            className="bg-[#090e17] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg space-y-3 transition-colors text-xs"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] mb-1">
                <span className="text-amber-400 font-bold">QUESTION {idx + 1} OF 4</span>
                <span>{q.points} Points</span>
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug">
                {q.question}
              </h3>
              {q.context && (
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Scope: {q.context}
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
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-500/30'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={isSelected}
                      onChange={() => handleSelect(q.id, opt.key)}
                      className="mt-0.5 text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                    />
                    <div className="flex-1">
                      <span className="font-mono font-bold mr-2 text-amber-400">{opt.key}.</span>
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
          className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? 'Verifying Grand Finals Dossier...' : 'Submit Final Examination & Get Certified Report'}</span>
        </button>
      </form>
    </div>
  );
};
