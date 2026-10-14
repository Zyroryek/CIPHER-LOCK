import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { MissionBanner } from './components/MissionBanner';
import { LandingView } from './views/LandingView';
import { ExamRound1 } from './views/ExamRound1';
import { ExamRound2 } from './views/ExamRound2';
import { ExamRound3 } from './views/ExamRound3';
import { AwaitingQualificationView } from './views/AwaitingQualificationView';
import { FinalReportView } from './views/FinalReportView';
import { LeaderboardView } from './views/LeaderboardView';
import { OrganizerDashboard } from './views/OrganizerDashboard';

const MainContent: React.FC = () => {
  const {
    userRole,
    gameState,
    activeNavTab,
  } = useGame();

  // 1. Unauthenticated Gateway
  if (userRole === 'none') {
    return <LandingView />;
  }

  // 2. Organiser View
  if (userRole === 'organiser') {
    return (
      <main className="flex-1 pb-16">
        {activeNavTab === 'leaderboard' ? <LeaderboardView /> : <OrganizerDashboard />}
      </main>
    );
  }

  // 3. Participant Examination View (STRICTLY MUTUALLY EXCLUSIVE ROUNDS)
  const renderCurrentExamStage = () => {
    // If Round 3 has been submitted: show winners & final certified report
    if (gameState?.level3Submitted) {
      if (activeNavTab === 'leaderboard') {
        return <LeaderboardView />;
      }
      return <FinalReportView />;
    }

    // If qualified by organiser for Round 3 (Grand Finals): show Round 3 only
    if (gameState?.level3QualifiedByOrganiser) {
      return <ExamRound3 />;
    }

    // If Round 2 has been submitted, but waiting for organiser Round 3 qualification:
    if (gameState?.level2Submitted) {
      return <AwaitingQualificationView roundCompleted={2} />;
    }

    // If qualified by organiser for Round 2: show Round 2 (video exam) only
    if (gameState?.level2QualifiedByOrganiser) {
      return <ExamRound2 />;
    }

    // If Round 1 has been submitted, but waiting for organiser Round 2 qualification:
    if (gameState?.level1Submitted) {
      return <AwaitingQualificationView roundCompleted={1} />;
    }

    // Default: Round 1 ONLY (The Hidden Entry with interactive map)
    return <ExamRound1 />;
  };

  return (
    <div className="flex-1 flex flex-col">
      <MissionBanner />

      <main className="flex-1 pb-16">
        {renderCurrentExamStage()}
      </main>

      {/* Minimalist Clean Footer */}
      <footer className="border-t border-slate-900 bg-[#04070a] py-4 px-4 text-center text-xs text-slate-500 font-mono">
        ZERO//DAY Competition Examination Portal · Automated Proctoring & Server Scoring
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <div className="min-h-screen flex flex-col bg-[#05080d] text-slate-200">
        <Navbar />
        <MainContent />
      </div>
    </GameProvider>
  );
}
