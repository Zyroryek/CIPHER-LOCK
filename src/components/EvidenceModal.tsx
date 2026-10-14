import React from 'react';
import { EvidenceItem } from '../types/game';
import { X, CheckCircle, Shield, FileText, Cpu, MapPin, Hash } from 'lucide-react';

interface EvidenceModalProps {
  item: EvidenceItem | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#090e17] border border-teal-500/40 rounded-lg shadow-2xl shadow-teal-950/50 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-teal-500/20 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-950 border border-teal-500/40 text-teal-300 font-bold">
              {item.id}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="capitalize">{item.category.replace('_', ' ')}</span>
              <span>·</span>
              <span>Level {item.originLevel} Origin</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          <div>
            <h2 className="text-xl font-bold font-heading text-white mb-2">
              {item.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-mono">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location: {item.sourceLocation}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded p-4 text-slate-200 leading-relaxed">
            {item.description}
          </div>

          {/* Technical Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Forensic Telemetry & Hash Data</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {item.technicalMetadata.targetSystem && (
                <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded">
                  <span className="text-slate-400 block text-[11px] mb-1">Target Subsystem:</span>
                  <span className="font-mono text-teal-300">{item.technicalMetadata.targetSystem}</span>
                </div>
              )}
              {item.technicalMetadata.hashOrSerial && (
                <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded">
                  <span className="text-slate-400 block text-[11px] mb-1">Hash / Peripheral ID:</span>
                  <span className="font-mono text-amber-300 break-all">{item.technicalMetadata.hashOrSerial}</span>
                </div>
              )}
            </div>

            {item.technicalMetadata.rawLogExcerpt && (
              <div className="mt-3">
                <span className="text-slate-400 block text-xs font-mono mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>Raw Capture / Execution Log Excerpt:</span>
                </span>
                <pre className="bg-black/90 border border-teal-900/50 p-3.5 rounded text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-tight">
                  {item.technicalMetadata.rawLogExcerpt}
                </pre>
              </div>
            )}

            {item.technicalMetadata.significance && (
              <div className="bg-teal-950/30 border border-teal-500/30 p-3 rounded flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-teal-300 block mb-0.5">Forensic Significance:</span>
                  <p className="text-slate-300">{item.technicalMetadata.significance}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-teal-500/20 bg-slate-950/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <CheckCircle className="w-4 h-4" />
            <span>Chain-of-Custody Verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
