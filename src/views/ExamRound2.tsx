import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ROUND_2_QUESTIONS } from '../data/examQuestions';
import { Level2Submission } from '../types/game';
import { SurveillanceVideoPlayer } from '../components/SurveillanceVideoPlayer';
import {
  Video,
  CheckCircle2,
  AlertCircle,
  Send,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const ExamRound2: React.FC = () => {
  const { gameState, studentName, teamName, submitLevel2, isLoading } = useGame();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelect = (questionId: string, optionKey: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
    if (validationError) setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setValidationError(null);

    const unanswered = ROUND_2_QUESTIONS.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setValidationError(`Please answer all ${ROUND_2_QUESTIONS.length} surveillance questions before submitting (${unanswered.length} unanswered).`);
      return;
    }

    const isQ1Correct = answers['R2-Q1'] === 'B';
    const isQ2Correct = answers['R2-Q2'] === 'B';
    const isQ3Correct = answers['R2-Q3'] === 'B';
    const isQ4Correct = answers['R2-Q4'] === 'A';

    const payload: Level2Submission = {
      suspectId: isQ1Correct ? 'suspect_trevor_bailey' : 'suspect_marcus_chen',
      primeCctvEventId: isQ3Correct ? 'CCTV-EV-04' : 'CCTV-EV-01',
      chronologyOrder: [
        isQ1Correct ? 'CCTV-EV-01' : 'WRONG-01',
        isQ2Correct ? 'CCTV-EV-02' : 'WRONG-02',
        isQ3Correct ? 'CCTV-EV-04' : 'WRONG-04',
        isQ4Correct ? 'CCTV-EV-05' : 'WRONG-05',
      ],
      selectedEvidenceIds: ['EVD-201', 'EVD-202', 'EVD-203', 'EVD-204'],
      investigatorNotes: `CCTV Video Answers: Q1=${answers['R2-Q1']}, Q2=${answers['R2-Q2']}, Q3=${answers['R2-Q3']}, Q4=${answers['R2-Q4']}`,
    };

    const res = await submitLevel2(payload);
    setFeedback(res.feedback);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Exam Header */}
      <div className="bg-[#090e17] border border-cyan-500/30 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-0.5">
              <Shield className="w-3.5 h-3.5" />
              <span>OFFICIAL COMPETITION PAPER // ROUND 2 (QUALIFIED CANDIDATES ONLY)</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-heading text-white">
              Round 2: Surveillance CCTV Video Examination
            </h1>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <span className="text-slate-400 block text-[11px]">CANDIDATE:</span>
            <span className="text-cyan-300 font-semibold">{studentName || teamName}</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Exam Instructions:</strong> Watch the multi-camera surveillance video player below. You can switch between CAM 01, CAM 02, and CAM 03, play or pause the clip, or jump to critical timestamps. Answer all 4 video observation questions below based on the footage.
        </p>
      </div>

      {/* Embedded Surveillance Video Player */}
      <SurveillanceVideoPlayer />

      {/* Clean Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold pt-2">
          SURVEILLANCE VIDEO COMPREHENSION QUESTIONS:
        </div>

        {ROUND_2_QUESTIONS.map((q, idx) => (
          <div
            key={q.id}
            className="bg-[#090e17] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg space-y-3 transition-colors text-xs"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] mb-1">
                <span className="text-cyan-400 font-bold">QUESTION {idx + 1} OF 4</span>
                <span>{q.points} Points</span>
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug">
                {q.question}
              </h3>
              {q.context && (
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Source: {q.context}
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
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={isSelected}
                      onChange={() => handleSelect(q.id, opt.key)}
                      className="mt-0.5 text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                    />
                    <div className="flex-1">
                      <span className="font-mono font-bold mr-2 text-cyan-400">{opt.key}.</span>
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
          className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? 'Submitting Answers...' : 'Submit Round 2 Examination'}</span>
        </button>
      </form>
    </div>
  );
};
