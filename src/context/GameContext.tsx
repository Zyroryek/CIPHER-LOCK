import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  TeamGameState,
  EvidenceItem,
  SuspectProfile,
  CCTVEvent,
  FinalReport,
  Level1Submission,
  Level2Submission,
  Level3Submission,
  QualificationStatus,
} from '../types/game';
import * as api from '../services/api';
import { sound } from '../utils/audio';

interface GameContextType {
  userRole: 'none' | 'participant' | 'organiser';
  teamId: string | null;
  teamName: string | null;
  studentName: string | null;
  username: string | null;
  sessionCode: string | null;
  gameState: TeamGameState | null;
  allEvidence: EvidenceItem[];
  suspects: SuspectProfile[];
  cctvEvents: CCTVEvent[];
  activeLevel: 1 | 2 | 3;
  setActiveLevel: (level: 1 | 2 | 3) => void;
  activeNavTab: 'investigation' | 'evidence' | 'timeline' | 'leaderboard' | 'report' | 'organizer';
  setActiveNavTab: (tab: 'investigation' | 'evidence' | 'timeline' | 'leaderboard' | 'report' | 'organizer') => void;
  isEvidenceLockerOpen: boolean;
  setIsEvidenceLockerOpen: (open: boolean) => void;
  selectedEvidenceModal: EvidenceItem | null;
  setSelectedEvidenceModal: (item: EvidenceItem | null) => void;
  lastReport: FinalReport | null;
  isLoading: boolean;
  error: string | null;
  isMuted: boolean;
  toggleMute: () => void;
  remainingSeconds: number;

  // Actions
  loginAsParticipant: (username: string, accessKey: string) => Promise<boolean>;
  loginAsOrganiser: (passcode: string) => Promise<boolean>;
  startInvestigation: () => Promise<void>;
  collectEvidence: (evidenceId: string) => Promise<{ success: boolean; alreadyFound: boolean }>;
  submitLevel1: (payload: Level1Submission) => Promise<{ success: boolean; feedback: string }>;
  submitLevel2: (payload: Level2Submission) => Promise<{ success: boolean; feedback: string }>;
  submitLevel3: (payload: Level3Submission) => Promise<{ success: boolean; feedback: string }>;
  refreshState: () => Promise<void>;
  logout: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<'none' | 'participant' | 'organiser'>(() => {
    if (sessionStorage.getItem('zd_org_token')) return 'organiser';
    if (localStorage.getItem('zd_team_id')) return 'participant';
    return 'none';
  });

  const [teamId, setTeamId] = useState<string | null>(() => localStorage.getItem('zd_team_id'));
  const [teamName, setTeamName] = useState<string | null>(() => localStorage.getItem('zd_team_name'));
  const [studentName, setStudentName] = useState<string | null>(() => localStorage.getItem('zd_student_name'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('zd_username'));
  const [sessionCode, setSessionCode] = useState<string | null>(() => localStorage.getItem('zd_session_code'));

  const [gameState, setGameState] = useState<TeamGameState | null>(null);
  const [allEvidence, setAllEvidence] = useState<EvidenceItem[]>([]);
  const [suspects, setSuspects] = useState<SuspectProfile[]>([]);
  const [cctvEvents, setCctvEvents] = useState<CCTVEvent[]>([]);

  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1);
  const [activeNavTab, setActiveNavTab] = useState<'investigation' | 'evidence' | 'timeline' | 'leaderboard' | 'report' | 'organizer'>('investigation');
  const [isEvidenceLockerOpen, setIsEvidenceLockerOpen] = useState(false);
  const [selectedEvidenceModal, setSelectedEvidenceModal] = useState<EvidenceItem | null>(null);
  const [lastReport, setLastReport] = useState<FinalReport | null>(() => {
    const cached = localStorage.getItem('zd_last_report');
    return cached ? JSON.parse(cached) : null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1500);

  // Load static metadata (evidence definitions, suspects, cctv)
  useEffect(() => {
    api.getGameMetadata()
      .then((data) => {
        setAllEvidence(data.allEvidence);
        setSuspects(data.suspects);
        setCctvEvents(data.cctvEvents);
      })
      .catch((err) => console.warn('Could not load game metadata:', err));
  }, []);

  // Sync state if participant logged in
  const refreshState = useCallback(async () => {
    if (!teamId || userRole !== 'participant') return;
    try {
      const res = await api.getGameState(teamId);
      if (res.success && res.gameState) {
        setGameState(res.gameState);
        setRemainingSeconds(res.gameState.remainingSeconds);
        if (res.gameState.currentLevel) {
          setActiveLevel(res.gameState.currentLevel);
        }
        if (res.gameState.status === 'NOT_STARTED') {
          api.startInvestigation(teamId).then((startRes) => {
            if (startRes.success && startRes.gameState) {
              setGameState(startRes.gameState);
              setRemainingSeconds(startRes.gameState.remainingSeconds);
            }
          }).catch(() => {});
        }
      }
    } catch (err: any) {
      console.warn('Refresh state failed:', err.message);
    }
  }, [teamId, userRole]);

  useEffect(() => {
    if (teamId && userRole === 'participant') {
      refreshState();
    }
  }, [teamId, userRole, refreshState]);

  // Periodic tick for countdown timer & state sync
  useEffect(() => {
    if (!gameState || gameState.status !== 'ACTIVE' || userRole !== 'participant') return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          refreshState();
          return 0;
        }
        if (prev === 120 || prev === 60) {
          sound.playWarning();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, userRole, refreshState]);

  // Periodic polling to check if organiser has promoted the student
  useEffect(() => {
    if (userRole !== 'participant' || !teamId) return;
    const pollInterval = setInterval(() => {
      refreshState();
    }, 4000); // 4-second poll for instant promotion recognition
    return () => clearInterval(pollInterval);
  }, [userRole, teamId, refreshState]);

  const loginAsParticipant = async (identifier: string, key: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.loginParticipant(identifier, key);
      if (res.success && res.participant && res.gameState) {
        setTeamId(res.participant.id);
        setTeamName(res.participant.teamName);
        setStudentName(res.participant.studentName);
        setUsername(res.participant.username);
        setSessionCode(res.gameState.sessionCode);
        setGameState(res.gameState);
        setRemainingSeconds(res.gameState.remainingSeconds);
        setActiveLevel(res.gameState.currentLevel || 1);
        setUserRole('participant');
        setActiveNavTab('investigation');

        localStorage.setItem('zd_team_id', res.participant.id);
        localStorage.setItem('zd_team_name', res.participant.teamName);
        localStorage.setItem('zd_student_name', res.participant.studentName);
        localStorage.setItem('zd_username', res.participant.username);
        localStorage.setItem('zd_session_code', res.gameState.sessionCode);

        if (res.gameState.status === 'NOT_STARTED') {
          api.startInvestigation(res.participant.id).then((startRes) => {
            if (startRes.success && startRes.gameState) {
              setGameState(startRes.gameState);
              setRemainingSeconds(startRes.gameState.remainingSeconds);
            }
          }).catch(() => {});
        }

        sound.playBlip(750);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your username or team name and access key.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsOrganiser = async (passcode: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.organizerLogin(passcode);
      if (res.success) {
        setUserRole('organiser');
        setActiveNavTab('organizer');
        sessionStorage.setItem('zd_org_token', res.token);
        sound.playLevelSuccess();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Incorrect organiser passkey');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const startInvestigation = async () => {
    if (!teamId) return;
    setIsLoading(true);
    try {
      const res = await api.startInvestigation(teamId);
      if (res.success && res.gameState) {
        setGameState(res.gameState);
        setRemainingSeconds(res.gameState.remainingSeconds);
        sound.playLevelSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const collectEvidence = async (evidenceId: string) => {
    if (!teamId) return { success: false, alreadyFound: false };
    try {
      const res = await api.discoverEvidence(teamId, evidenceId);
      if (res.success) {
        setGameState(res.gameState);
        if (!res.alreadyFound) {
          sound.playEvidenceCollect();
        } else {
          sound.playBlip(400);
        }
        return { success: true, alreadyFound: res.alreadyFound };
      }
      return { success: false, alreadyFound: false };
    } catch (err: any) {
      setError(err.message);
      return { success: false, alreadyFound: false };
    }
  };

  const submitLevel1 = async (payload: Level1Submission) => {
    if (!teamId) return { success: false, feedback: 'No active session' };
    setIsLoading(true);
    try {
      const res = await api.submitLevel1(teamId, payload);
      setGameState(res.gameState);
      sound.playLevelSuccess();
      return { success: res.success, feedback: res.feedback };
    } catch (err: any) {
      return { success: false, feedback: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const submitLevel2 = async (payload: Level2Submission) => {
    if (!teamId) return { success: false, feedback: 'No active session' };
    setIsLoading(true);
    try {
      const res = await api.submitLevel2(teamId, payload);
      setGameState(res.gameState);
      sound.playLevelSuccess();
      return { success: res.success, feedback: res.feedback };
    } catch (err: any) {
      return { success: false, feedback: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const submitLevel3 = async (payload: Level3Submission) => {
    if (!teamId) return { success: false, feedback: 'No active session' };
    setIsLoading(true);
    try {
      const res = await api.submitLevel3(teamId, payload);
      setGameState(res.gameState);
      if (res.success && res.report) {
        setLastReport(res.report);
        localStorage.setItem('zd_last_report', JSON.stringify(res.report));
        sound.playLevelSuccess();
        setActiveNavTab('report');
      } else {
        sound.playWarning();
      }
      return { success: res.success, feedback: res.feedback };
    } catch (err: any) {
      return { success: false, feedback: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('zd_team_id');
    localStorage.removeItem('zd_team_name');
    localStorage.removeItem('zd_student_name');
    localStorage.removeItem('zd_username');
    localStorage.removeItem('zd_session_code');
    sessionStorage.removeItem('zd_org_token');
    setTeamId(null);
    setTeamName(null);
    setStudentName(null);
    setUsername(null);
    setSessionCode(null);
    setGameState(null);
    setUserRole('none');
    setActiveNavTab('investigation');
  };

  const toggleMute = () => {
    const val = sound.toggleMute();
    setIsMuted(val);
  };

  return (
    <GameContext.Provider
      value={{
        userRole,
        teamId,
        teamName,
        studentName,
        username,
        sessionCode,
        gameState,
        allEvidence,
        suspects,
        cctvEvents,
        activeLevel,
        setActiveLevel,
        activeNavTab,
        setActiveNavTab,
        isEvidenceLockerOpen,
        setIsEvidenceLockerOpen,
        selectedEvidenceModal,
        setSelectedEvidenceModal,
        lastReport,
        isLoading,
        error,
        isMuted,
        toggleMute,
        remainingSeconds,
        loginAsParticipant,
        loginAsOrganiser,
        startInvestigation,
        collectEvidence,
        submitLevel1,
        submitLevel2,
        submitLevel3,
        refreshState,
        logout,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
