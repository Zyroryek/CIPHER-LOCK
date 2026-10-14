import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { EvidenceCategory, EvidenceItem } from '../types/game';
import { Search, Filter, ShieldCheck, Lock, ExternalLink, Database } from 'lucide-react';

interface EvidenceLockerProps {
  asDrawer?: boolean;
}

export const EvidenceLocker: React.FC<EvidenceLockerProps> = ({ asDrawer = false }) => {
  const {
    allEvidence,
    gameState,
    setSelectedEvidenceModal,
    setIsEvidenceLockerOpen,
  } = useGame();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'level' | 'title'>('level');

  const discoveredIds = gameState?.discoveredEvidenceIds || [];

  const categories: { label: string; value: string }[] = [
    { label: 'All Artifacts', value: 'all' },
    { label: 'Digital Forensics', value: 'digital_forensics' },
    { label: 'Physical Access', value: 'physical_access' },
    { label: 'CCTV Feeds', value: 'cctv_observations' },
    { label: 'Timestamps', value: 'timestamps' },
    { label: 'Suspect Intel', value: 'suspect_information' },
    { label: 'Verified Findings', value: 'verified_findings' },
  ];

  const filteredEvidence = allEvidence
    .filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sourceLocation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'level') return a.originLevel - b.originLevel;
      return a.title.localeCompare(b.title);
    });

  const discoveredCount = allEvidence.filter((e) => discoveredIds.includes(e.id)).length;

  return (
    <div className={`flex flex-col h-full ${asDrawer ? 'p-4 md:p-6' : 'p-6 max-w-7xl mx-auto'}`}>
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-teal-500/20">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-teal-500/10 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-heading text-white">
                Forensic Evidence Locker
              </h2>
              <p className="text-xs text-slate-400">
                Persistent chain of custody across all three incident phases.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-teal-500/30 px-3 py-1.5 rounded text-xs flex items-center gap-2">
            <span className="text-slate-400">Archived Clues:</span>
            <span className="font-mono font-bold text-teal-300">
              {discoveredCount} / {allEvidence.length}
            </span>
          </div>

          {asDrawer && (
            <button
              onClick={() => setIsEvidenceLockerOpen(false)}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills / Segmented Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-teal-500 text-black font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search evidence or hashes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
          >
            <option value="level">Sort by Level</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Grid of Evidence Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
        {filteredEvidence.map((item) => {
          const isDiscovered = discoveredIds.includes(item.id);

          if (!isDiscovered) {
            return (
              <div
                key={item.id}
                className="bg-[#080d14]/70 border border-slate-800/80 rounded-lg p-5 flex flex-col justify-between opacity-60 hover:opacity-80 transition-opacity"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
                    <span>{item.id}</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                      <span>UNDISCOVERED</span>
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-400 mb-1">
                    [Classified Incident Artifact]
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Inspect Level {item.originLevel} location ({item.sourceLocation}) during the investigation to log this clue into the locker.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] text-slate-600 font-mono">
                  Origin: Phase {item.originLevel} Investigation
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              onClick={() => setSelectedEvidenceModal(item)}
              className="bg-[#0b1017] hover:bg-[#0e1622] border border-teal-500/30 hover:border-teal-400/60 rounded-lg p-5 flex flex-col justify-between transition-all cursor-pointer group shadow-sm hover:shadow-teal-950/40"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-teal-400 font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30">
                    {item.id}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>VERIFIED</span>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-white group-hover:text-teal-300 transition-colors mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                  {item.sourceLocation}
                </span>
                <span className="text-teal-400 flex items-center gap-1 font-mono text-[11px] group-hover:underline">
                  Inspect Clue
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
