import fs from 'fs';
import path from 'path';
import type {
  TeamGameState,
  LeaderboardEntry,
  FinalReport,
  Level1Submission,
  Level2Submission,
  Level3Submission,
  QualificationStatus,
} from '../types/game.ts';
import { MASTER_EVIDENCE_ITEMS, VALIDATION_RULES, SUSPECT_DOSSIERS } from '../data/scenarioData.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

export interface StoredParticipant {
  id: string;
  username: string;
  accessKey: string;
  studentName: string;
  teamName: string;
  sessionId: string;
  createdAt: string;
}

interface StoredSession {
  id: string;
  sessionCode: string;
  title: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED';
  durationSeconds: number;
  createdAt: string;
}

interface StoredSubmission {
  id: string;
  teamId: string;
  username: string;
  levelNumber: number;
  payload: any;
  isCorrect: boolean;
  scoreAwarded: number;
  submittedAt: string;
  feedback: string;
}

interface StoredAuditLog {
  id: string;
  teamId?: string;
  action: string;
  details: any;
  timestamp: string;
}

interface DatabaseSchema {
  sessions: Record<string, StoredSession>;
  participants: Record<string, StoredParticipant>;
  gameStates: Record<string, TeamGameState>;
  submissions: StoredSubmission[];
  auditLogs: StoredAuditLog[];
}

function getInitialDatabase(): DatabaseSchema {
  const sessionId = 'sess-main-tech-fest';
  const defaultSession: StoredSession = {
    id: sessionId,
    sessionCode: 'TECH-2026',
    title: 'COLLEGE CYBER TECH ESCAPE COMPETITION',
    status: 'ACTIVE',
    durationSeconds: 1500, // 25 mins
    createdAt: new Date().toISOString(),
  };

  // Initial participants seed: empty by default (all students removed as requested)
  const initialStudents: Array<{ id: string; username: string; accessKey: string; studentName: string; teamName: string }> = [];

  const participants: Record<string, StoredParticipant> = {};
  const gameStates: Record<string, TeamGameState> = {};

  initialStudents.forEach((st) => {
    participants[st.id] = {
      id: st.id,
      username: st.username,
      accessKey: st.accessKey,
      studentName: st.studentName,
      teamName: st.teamName,
      sessionId: sessionId,
      createdAt: new Date().toISOString(),
    };

    gameStates[st.id] = {
      teamId: st.id,
      teamName: st.teamName,
      studentName: st.studentName,
      username: st.username,
      accessKey: st.accessKey,
      sessionId: sessionId,
      sessionCode: defaultSession.sessionCode,
      status: 'NOT_STARTED',
      currentLevel: 1,
      startedAt: null,
      expiresAt: null,
      completedAt: null,
      serverTime: new Date().toISOString(),
      remainingSeconds: 1500,
      level1Unlocked: true,
      level2Unlocked: false,
      level3Unlocked: false,
      level1Submitted: false,
      level2Submitted: false,
      level3Submitted: false,
      level2QualifiedByOrganiser: false,
      level3QualifiedByOrganiser: false,
      qualificationStatus: 'NOT_STARTED',
      level1Score: 0,
      level2Score: 0,
      level3Score: 0,
      totalScore: 0,
      unlockedCredential: null,
      discoveredEvidenceIds: [],
      attempts: {
        level1: 0,
        level2: 0,
        level3: 0,
      },
    };
  });

  return {
    sessions: { [sessionId]: defaultSession },
    participants,
    gameStates,
    submissions: [],
    auditLogs: [
      {
        id: 'init-audit-1',
        action: 'COMPETITION_INITIALIZED',
        details: { message: 'Competition gateway initialized. Student database is clean.' },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export class DBStore {
  private static instance: DBStore;
  private db: DatabaseSchema;

  private constructor() {
    this.db = this.loadDatabase();
  }

  public static getInstance(): DBStore {
    if (!DBStore.instance) {
      DBStore.instance = new DBStore();
    }
    return DBStore.instance;
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure participants map exists
        if (parsed.participants && parsed.gameStates) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to read db.json, generating fresh competition state:', err);
    }
    const initial = getInitialDatabase();
    this.saveDatabase(initial);
    return initial;
  }

  private isWriting = false;
  private pendingWrite = false;
  private saveTimeout: NodeJS.Timeout | null = null;

  private saveDatabase(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  private async flushToDisk(): Promise<void> {
    if (this.isWriting) {
      this.pendingWrite = true;
      return;
    }
    this.isWriting = true;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const dataStr = JSON.stringify(this.db, null, 2);
      const tmpFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(7)}.tmp`;
      await fs.promises.writeFile(tmpFile, dataStr, 'utf-8');
      await fs.promises.rename(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed async db flush:', err);
    } finally {
      this.isWriting = false;
      if (this.pendingWrite) {
        this.pendingWrite = false;
        this.flushToDisk();
      }
    }
  }

  private persist(): void {
    // High-performance batched async disk persistence: all state mutations are O(1) in-memory
    // so hundreds of simultaneous logins and submissions succeed instantly without event-loop lag.
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.flushToDisk();
    }, 40);
  }

  // --- PARTICIPANT AUTHENTICATION ---
  public authenticateParticipant(identifier: string, accessKey: string): { participant: StoredParticipant; gameState: TeamGameState } | null {
    const cleanId = identifier.trim().toLowerCase();
    const cleanKey = accessKey.trim();

    // Match by Username, Team Name, or Student Name
    const participant = Object.values(this.db.participants).find(
      (p) =>
        (p.username.toLowerCase() === cleanId ||
         p.teamName.toLowerCase() === cleanId ||
         p.studentName.toLowerCase() === cleanId) &&
        p.accessKey === cleanKey
    );

    if (!participant) return null;

    let gameState = this.getGameState(participant.id);
    if (gameState.status === 'NOT_STARTED') {
      gameState = this.startInvestigation(participant.id);
    }
    this.logAudit('PARTICIPANT_LOGIN', { participantId: participant.id, username: participant.username, teamName: participant.teamName });
    return { participant, gameState };
  }

  public createParticipant(username: string, accessKey: string, studentName: string, teamName?: string): StoredParticipant {
    const cleanUser = username.trim().toLowerCase();
    const existing = Object.values(this.db.participants).find((p) => p.username.toLowerCase() === cleanUser);
    if (existing) {
      throw new Error(`Participant with username '${username}' already exists.`);
    }

    const sessionId = Object.keys(this.db.sessions)[0] || 'sess-main-tech-fest';
    const id = 'student-' + Date.now();
    const participant: StoredParticipant = {
      id,
      username: cleanUser,
      accessKey: accessKey.trim(),
      studentName: studentName.trim(),
      teamName: teamName?.trim() || studentName.trim(),
      sessionId,
      createdAt: new Date().toISOString(),
    };

    const newGameState: TeamGameState = {
      teamId: id,
      teamName: participant.teamName,
      studentName: participant.studentName,
      username: participant.username,
      accessKey: participant.accessKey,
      sessionId,
      sessionCode: this.db.sessions[sessionId]?.sessionCode || 'TECH-2026',
      status: 'NOT_STARTED',
      currentLevel: 1,
      startedAt: null,
      expiresAt: null,
      completedAt: null,
      serverTime: new Date().toISOString(),
      remainingSeconds: 1500,
      level1Unlocked: true,
      level2Unlocked: false,
      level3Unlocked: false,
      level1Submitted: false,
      level2Submitted: false,
      level3Submitted: false,
      level2QualifiedByOrganiser: false,
      level3QualifiedByOrganiser: false,
      qualificationStatus: 'NOT_STARTED',
      level1Score: 0,
      level2Score: 0,
      level3Score: 0,
      totalScore: 0,
      unlockedCredential: null,
      discoveredEvidenceIds: [],
      attempts: { level1: 0, level2: 0, level3: 0 },
    };

    this.db.participants[id] = participant;
    this.db.gameStates[id] = newGameState;
    this.logAudit('PARTICIPANT_CREATED', { id, username: cleanUser, studentName });
    this.persist();

    return participant;
  }

  // --- GAME STATE ---
  public getGameState(participantId: string): TeamGameState {
    let state = this.db.gameStates[participantId];
    if (!state) {
      const p = this.db.participants[participantId];
      if (!p) throw new Error('Participant not found');
      state = {
        teamId: p.id,
        teamName: p.teamName,
        studentName: p.studentName,
        username: p.username,
        accessKey: p.accessKey,
        sessionId: p.sessionId,
        sessionCode: this.db.sessions[p.sessionId]?.sessionCode || 'TECH-2026',
        status: 'NOT_STARTED',
        currentLevel: 1,
        startedAt: null,
        expiresAt: null,
        completedAt: null,
        serverTime: new Date().toISOString(),
        remainingSeconds: 1500,
        level1Unlocked: true,
        level2Unlocked: false,
        level3Unlocked: false,
        level1Submitted: false,
        level2Submitted: false,
        level3Submitted: false,
        level2QualifiedByOrganiser: false,
        level3QualifiedByOrganiser: false,
        qualificationStatus: 'NOT_STARTED',
        level1Score: 0,
        level2Score: 0,
        level3Score: 0,
        totalScore: 0,
        unlockedCredential: null,
        discoveredEvidenceIds: [],
        attempts: { level1: 0, level2: 0, level3: 0 },
      };
      this.db.gameStates[participantId] = state;
      this.persist();
    }

    // Refresh server time & calculate remaining seconds if active
    const now = Date.now();
    state.serverTime = new Date().toISOString();

    if (state.status === 'ACTIVE' && state.expiresAt) {
      const expiry = new Date(state.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      state.remainingSeconds = diff;
      if (diff <= 0) {
        state.status = 'EXPIRED';
        this.logAudit('SESSION_EXPIRED', { participantId });
        this.persist();
      }
    }

    return state;
  }

  public startInvestigation(participantId: string): TeamGameState {
    const state = this.getGameState(participantId);
    if (state.status === 'NOT_STARTED') {
      const session = this.db.sessions[state.sessionId];
      const durationSec = session ? session.durationSeconds : 1500;
      const startedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + durationSec * 1000).toISOString();

      state.status = 'ACTIVE';
      state.qualificationStatus = 'ROUND_1_IN_PROGRESS';
      state.startedAt = startedAt;
      state.expiresAt = expiresAt;
      state.remainingSeconds = durationSec;

      this.logAudit('ROUND_1_STARTED', { participantId, startedAt });
      this.persist();
    }
    return state;
  }

  public discoverEvidence(participantId: string, evidenceId: string): { success: boolean; evidence: any; alreadyFound: boolean; gameState: TeamGameState } {
    const state = this.getGameState(participantId);
    const item = MASTER_EVIDENCE_ITEMS.find((e) => e.id === evidenceId);
    if (!item) {
      throw new Error('Unknown evidence identifier: ' + evidenceId);
    }

    const alreadyFound = state.discoveredEvidenceIds.includes(evidenceId);
    if (!alreadyFound) {
      state.discoveredEvidenceIds.push(evidenceId);
      this.logAudit('EVIDENCE_DISCOVERED', { participantId, evidenceId, title: item.title });
      this.persist();
    }

    return {
      success: true,
      evidence: { ...item, discoveredAt: new Date().toISOString() },
      alreadyFound,
      gameState: state,
    };
  }

  // --- SUBMISSIONS & ORGANISER APPROVAL GATEWAY ---
  public submitLevel1(participantId: string, payload: Level1Submission): { success: boolean; score: number; feedback: string; gameState: TeamGameState } {
    const state = this.getGameState(participantId);
    if (state.status === 'EXPIRED') {
      return { success: false, score: 0, feedback: 'Cannot submit: time expired.', gameState: state };
    }

    state.attempts.level1 += 1;
    let score = 0;
    const feedbackList: string[] = [];

    // 1. Vector matching
    if (payload.entryVector === VALIDATION_RULES.level1.correctEntryVector) {
      score += 40;
      feedbackList.push('Workstation vector verified: Physical HID USB keystroke injection.');
    } else {
      feedbackList.push('Entry vector hypothesis incorrect.');
    }

    // 2. Clock discrepancy
    if (payload.clockDiscrepancy === VALIDATION_RULES.level1.clockDiscrepancyAnswer) {
      score += 30;
      feedbackList.push('Timestamp audit verified: w32tm -28m clock skew was used to fabricate false alibi.');
    } else {
      feedbackList.push('Clock discrepancy explanation rejected.');
    }

    // 3. Evidence references
    const matchedEvidence = payload.selectedEvidenceIds.filter((id) =>
      VALIDATION_RULES.level1.requiredEvidence.includes(id)
    );
    score += Math.min(30, matchedEvidence.length * 10);
    feedbackList.push(`Artifact correlation: ${matchedEvidence.length} of ${VALIDATION_RULES.level1.requiredEvidence.length} verified.`);

    state.level1Score = score;
    state.totalScore = state.level1Score + state.level2Score + state.level3Score;
    state.level1Submitted = true;
    state.qualificationStatus = 'ROUND_1_SUBMITTED';

    // IMPORTANT: Round 2 remains LOCKED until the organiser selects this student!
    state.level2Unlocked = false;

    feedbackList.push('SUBMISSION RECORDED: Round 1 completed. Awaiting Organiser shortlisting. Only shortlisted participants will be unlocked for Round 2.');

    this.recordSubmission(participantId, state.username, 1, payload, true, score, feedbackList.join(' '));
    this.persist();

    return {
      success: true,
      score,
      feedback: feedbackList.join(' '),
      gameState: state,
    };
  }

  public submitLevel2(participantId: string, payload: Level2Submission): { success: boolean; score: number; feedback: string; unlockedCredential?: string; gameState: TeamGameState } {
    const state = this.getGameState(participantId);
    if (!state.level2QualifiedByOrganiser || !state.level2Unlocked) {
      return { success: false, score: 0, feedback: 'You have not been selected by the organiser for Round 2.', gameState: state };
    }

    state.attempts.level2 += 1;
    let score = 0;
    const feedbackList: string[] = [];

    // 1. Suspect identification
    if (payload.suspectId === VALIDATION_RULES.level2.correctSuspect) {
      score += 40;
      feedbackList.push('Surveillance suspect confirmed: Trevor Bailey.');
    } else {
      feedbackList.push('Suspect misidentified.');
    }

    // 2. Prime CCTV Event
    if (payload.primeCctvEventId === VALIDATION_RULES.level2.primeEventId) {
      score += 30;
      feedbackList.push('Prime incident frame confirmed: 21:24:02 Workstation 04 keystroke payload injection.');
    } else {
      feedbackList.push('Prime event timestamp incorrect.');
    }

    // 3. Chronology
    const chronologyMatches = payload.chronologyOrder.filter((ev, idx) =>
      VALIDATION_RULES.level2.requiredEventsInOrder[idx] === ev
    );
    score += Math.min(30, chronologyMatches.length * 8);

    state.level2Score = score;
    state.totalScore = state.level1Score + state.level2Score + state.level3Score;
    state.level2Submitted = true;
    state.qualificationStatus = 'ROUND_2_SUBMITTED';
    state.unlockedCredential = VALIDATION_RULES.level2.unlockedCredentialText;

    // IMPORTANT: Round 3 remains LOCKED until the organiser selects this student!
    state.level3Unlocked = false;

    feedbackList.push('SUBMISSION RECORDED: Round 2 completed. Awaiting Organiser final round selection. Only shortlisted finalists will move to Round 3.');

    this.recordSubmission(participantId, state.username, 2, payload, true, score, feedbackList.join(' '));
    this.persist();

    return {
      success: true,
      score,
      feedback: feedbackList.join(' '),
      unlockedCredential: state.unlockedCredential,
      gameState: state,
    };
  }

  public submitLevel3(participantId: string, payload: Level3Submission): { success: boolean; score: number; feedback: string; report?: FinalReport; gameState: TeamGameState } {
    const state = this.getGameState(participantId);
    if (!state.level3QualifiedByOrganiser || !state.level3Unlocked) {
      return { success: false, score: 0, feedback: 'You have not been selected by the organiser for Round 3.', gameState: state };
    }

    state.attempts.level3 += 1;
    let score = 0;
    const feedbackList: string[] = [];

    // 1. Attacker
    const isAttackerCorrect = payload.attackerId === VALIDATION_RULES.level3.correctAttacker;
    if (isAttackerCorrect) {
      score += 30;
      feedbackList.push('Infiltrator accurately convicted: Trevor Bailey.');
    }

    // 2. Entry Method
    const isMethodCorrect = payload.entryMethod === VALIDATION_RULES.level3.correctEntryMethod;
    if (isMethodCorrect) {
      score += 25;
      feedbackList.push('Infiltration vector reconstructed accurately.');
    }

    // 3. Chronology
    score += Math.min(20, payload.chronologyOrder.length * 5);

    // 4. Elimination
    const isEliminationValid = VALIDATION_RULES.level3.eliminatedSuspects.includes(payload.eliminatedSuspectId) && payload.eliminationReason.length > 10;
    if (isEliminationValid) {
      score += 25;
      feedbackList.push('Alternative suspect eliminated with forensic proof.');
    }

    state.level3Score = score;
    state.totalScore = state.level1Score + state.level2Score + state.level3Score;
    state.level3Submitted = true;
    state.qualificationStatus = 'ROUND_3_COMPLETED';
    state.status = 'COMPLETED';
    state.completedAt = new Date().toISOString();

    const startTime = state.startedAt ? new Date(state.startedAt).getTime() : Date.now() - 900000;
    const durationSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000));

    let rating: FinalReport['performanceRating'] = 'RECON RECRUIT';
    if (state.totalScore >= 270) rating = 'MASTER FORENSIC AGENT';
    else if (state.totalScore >= 220) rating = 'SENIOR INCIDENT RESPONDER';
    else if (state.totalScore >= 160) rating = 'CYBER OPERATIVE';

    const attacker = SUSPECT_DOSSIERS.find((s) => s.id === payload.attackerId);
    const eliminated = SUSPECT_DOSSIERS.find((s) => s.id === payload.eliminatedSuspectId);

    const report: FinalReport = {
      teamId: state.teamId,
      teamName: state.teamName,
      sessionCode: state.sessionCode,
      status: state.status,
      startedAt: state.startedAt || new Date().toISOString(),
      completedAt: state.completedAt,
      durationSeconds,
      totalScore: state.totalScore,
      levelScores: {
        level1: state.level1Score,
        level2: state.level2Score,
        level3: state.level3Score,
      },
      attackerIdentified: {
        name: attacker?.name || 'Unknown',
        role: attacker?.role || 'Unknown',
        isCorrect: isAttackerCorrect,
      },
      entryMethod: {
        method: payload.entryMethod,
        isCorrect: isMethodCorrect,
      },
      chronologyVerified: true,
      supportingEvidenceCount: payload.supportingEvidenceIds.length,
      eliminatedSuspect: {
        suspectName: eliminated?.name || 'None',
        reason: payload.eliminationReason,
      },
      performanceRating: rating,
      investigationSummary: 'The security breach was executed by contractor Trevor Bailey via cloned RFID keycard impersonation of Elena Vance, facilitated by CCTV optical blinding, and culminated in Rubber Ducky HID script injection on Marcus Chen’s workstation with deliberate clock tampering.',
    };

    feedbackList.push('CONGRATULATIONS: Grand Finals completed! Official forensics dossier compiled.');
    this.recordSubmission(participantId, state.username, 3, payload, true, score, feedbackList.join(' '));
    this.persist();

    return {
      success: true,
      score,
      feedback: feedbackList.join(' '),
      report,
      gameState: state,
    };
  }

  // --- ORGANISER EXCLUSIVE CONTROL: SHORTLISTING / QUALIFYING PARTICIPANTS ---
  public promoteParticipant(participantId: string, targetRound: 2 | 3): TeamGameState {
    const state = this.getGameState(participantId);

    if (targetRound === 2) {
      state.level2QualifiedByOrganiser = true;
      state.level2Unlocked = true;
      state.currentLevel = 2;
      state.qualificationStatus = 'QUALIFIED_ROUND_2';
      this.logAudit('ORGANISER_PROMOTED_ROUND_2', { participantId, username: state.username });
    } else if (targetRound === 3) {
      state.level3QualifiedByOrganiser = true;
      state.level3Unlocked = true;
      state.currentLevel = 3;
      state.qualificationStatus = 'QUALIFIED_ROUND_3';
      this.logAudit('ORGANISER_PROMOTED_ROUND_3', { participantId, username: state.username });
    }

    this.persist();
    return state;
  }

  public eliminateParticipant(participantId: string): TeamGameState {
    const state = this.getGameState(participantId);
    state.qualificationStatus = 'ELIMINATED';
    this.logAudit('ORGANISER_ELIMINATED_PARTICIPANT', { participantId, username: state.username });
    this.persist();
    return state;
  }

  public resetParticipant(participantIdOrUsername: string): TeamGameState {
    let participantId = participantIdOrUsername;
    const participant = Object.values(this.db.participants).find(
      (p) => p.id === participantIdOrUsername || p.username.toLowerCase() === participantIdOrUsername.toLowerCase()
    );
    if (participant) {
      participantId = participant.id;
    }
    const state = this.getGameState(participantId);
    state.status = 'NOT_STARTED';
    state.currentLevel = 1;
    state.startedAt = null;
    state.expiresAt = null;
    state.completedAt = null;
    state.remainingSeconds = 1500;
    state.level1Unlocked = true;
    state.level2Unlocked = false;
    state.level3Unlocked = false;
    state.level1Submitted = false;
    state.level2Submitted = false;
    state.level3Submitted = false;
    state.level2QualifiedByOrganiser = false;
    state.level3QualifiedByOrganiser = false;
    state.qualificationStatus = 'NOT_STARTED';
    state.level1Score = 0;
    state.level2Score = 0;
    state.level3Score = 0;
    state.totalScore = 0;
    state.unlockedCredential = null;
    state.discoveredEvidenceIds = [];
    state.attempts = { level1: 0, level2: 0, level3: 0 };

    this.db.submissions = this.db.submissions.filter(
      (s) => s.teamId !== participantId && s.username.toLowerCase() !== state.username.toLowerCase()
    );
    this.logAudit('ORGANISER_RESET_PARTICIPANT', { participantId, username: state.username });
    this.persist();
    return state;
  }

  public clearAllParticipants(): void {
    this.db.participants = {};
    this.db.gameStates = {};
    this.db.submissions = [];
    this.logAudit('ORGANISER_CLEARED_ALL_PARTICIPANTS', {
      timestamp: new Date().toISOString(),
      message: 'All student details, game states, and submissions removed from database.',
    });
    this.persist();
  }

  public deleteParticipant(participantId: string): void {
    const participant = this.db.participants[participantId];
    delete this.db.participants[participantId];
    delete this.db.gameStates[participantId];
    this.db.submissions = this.db.submissions.filter((s) => s.teamId !== participantId);
    this.logAudit('ORGANISER_DELETED_PARTICIPANT', {
      participantId,
      username: participant?.username,
      studentName: participant?.studentName,
    });
    this.persist();
  }

  public batchPromote(participantIds: string[], targetRound: 2 | 3): TeamGameState[] {
    const results: TeamGameState[] = [];
    for (const id of participantIds) {
      results.push(this.promoteParticipant(id, targetRound));
    }
    return results;
  }

  private recordSubmission(teamId: string, username: string, level: number, payload: any, isCorrect: boolean, score: number, feedback: string) {
    this.db.submissions.push({
      id: 'sub-' + Date.now(),
      teamId,
      username,
      levelNumber: level,
      payload,
      isCorrect,
      scoreAwarded: score,
      submittedAt: new Date().toISOString(),
      feedback,
    });
  }

  // --- LEADERBOARD & ORGANISER ---
  public getLeaderboard(): LeaderboardEntry[] {
    const list: LeaderboardEntry[] = Object.values(this.db.gameStates).map((state) => {
      let timeTakenSeconds: number | null = null;
      if (state.completedAt && state.startedAt) {
        timeTakenSeconds = Math.max(0, Math.floor((new Date(state.completedAt).getTime() - new Date(state.startedAt).getTime()) / 1000));
      }
      return {
        rank: 1,
        teamId: state.teamId,
        teamName: state.teamName,
        studentName: state.studentName,
        username: state.username,
        sessionCode: state.sessionCode,
        status: state.status,
        qualificationStatus: state.qualificationStatus,
        currentLevel: state.currentLevel,
        level1Score: state.level1Score,
        level2Score: state.level2Score,
        level3Score: state.level3Score,
        totalScore: state.totalScore,
        timeTakenSeconds,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
      };
    });

    list.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (a.timeTakenSeconds !== null && b.timeTakenSeconds !== null) {
        return a.timeTakenSeconds - b.timeTakenSeconds;
      }
      return 0;
    });

    list.forEach((item, index) => {
      item.rank = index + 1;
    });

    return list;
  }

  public getOrganizerOverview() {
    return {
      sessions: Object.values(this.db.sessions),
      participants: Object.values(this.db.participants),
      gameStates: Object.values(this.db.gameStates),
      submissions: this.db.submissions.slice(-50).reverse(),
      auditLogs: this.db.auditLogs.slice(-100).reverse(),
    };
  }

  public modifySession(sessionId: string, action: 'PAUSE' | 'RESUME' | 'TERMINATE' | 'ADD_5_MIN') {
    const session = this.db.sessions[sessionId];
    if (!session) throw new Error('Session not found');

    const affectedStates = Object.values(this.db.gameStates).filter((s) => s.sessionId === sessionId);

    affectedStates.forEach((state) => {
      if (action === 'PAUSE' && state.status === 'ACTIVE') {
        state.status = 'PAUSED';
      } else if (action === 'RESUME' && state.status === 'PAUSED') {
        state.status = 'ACTIVE';
        state.expiresAt = new Date(Date.now() + state.remainingSeconds * 1000).toISOString();
      } else if (action === 'TERMINATE') {
        state.status = 'EXPIRED';
        state.remainingSeconds = 0;
      } else if (action === 'ADD_5_MIN' && state.status === 'ACTIVE') {
        const currentExp = state.expiresAt ? new Date(state.expiresAt).getTime() : Date.now();
        state.expiresAt = new Date(currentExp + 300 * 1000).toISOString();
        state.remainingSeconds += 300;
      }
    });

    this.logAudit('ORGANIZER_SESSION_MODIFIED', { sessionId, action, teamsAffected: affectedStates.length });
    this.persist();
    return { success: true, message: `Session action ${action} executed.` };
  }

  private logAudit(action: string, details: any) {
    this.db.auditLogs.push({
      id: 'audit-' + Date.now(),
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
