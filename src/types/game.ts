export type EvidenceCategory =
  | 'digital_forensics'
  | 'physical_access'
  | 'cctv_observations'
  | 'timestamps'
  | 'suspect_information'
  | 'verified_findings';

export interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  category: EvidenceCategory;
  originLevel: 1 | 2 | 3;
  sourceLocation: string;
  discoveredAt?: string;
  isVerified: boolean;
  technicalMetadata: {
    hashOrSerial?: string;
    targetSystem?: string;
    rawLogExcerpt?: string;
    significance?: string;
  };
}

export interface SuspectProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  badgeId: string;
  avatarUrl: string;
  backgroundDossier: string;
  alibi: string;
  accessCardLogs: Array<{ timestamp: string; location: string; event: string }>;
  workstationLogs: Array<{ timestamp: string; action: string; terminal: string }>;
  cctvSightings: Array<{ timestamp: string; camera: string; note: string }>;
  contradictions: string;
  isPerpetrator: boolean;
}

export interface CCTVEvent {
  id: string;
  cameraId: 'CAM_01' | 'CAM_02' | 'CAM_03';
  cameraName: string;
  timestampSeconds: number; // 0 to 3600 (represents 21:00 to 22:00)
  displayTimestamp: string; // e.g. "21:14:22"
  title: string;
  description: string;
  evidenceId?: string;
  visualOverlay: {
    boundingBox?: { x: number; y: number; w: number; h: number };
    label?: string;
    motionLevel: 'low' | 'medium' | 'high';
    highlightColor?: string;
  };
  anomalyDetected: boolean;
}

export type SessionStatus = 'NOT_STARTED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED';

export type QualificationStatus =
  | 'NOT_STARTED'
  | 'ROUND_1_IN_PROGRESS'
  | 'ROUND_1_SUBMITTED' // Awaiting Organiser Review & Shortlisting
  | 'QUALIFIED_ROUND_2' // Selected by Organiser for Round 2!
  | 'ROUND_2_IN_PROGRESS'
  | 'ROUND_2_SUBMITTED' // Awaiting Organiser Review & Shortlisting
  | 'QUALIFIED_ROUND_3' // Selected by Organiser for Round 3!
  | 'ROUND_3_IN_PROGRESS'
  | 'ROUND_3_COMPLETED'
  | 'ELIMINATED';

export interface TeamGameState {
  teamId: string;
  teamName: string;
  studentName?: string;
  username: string;
  accessKey: string;
  sessionId: string;
  sessionCode: string;
  status: SessionStatus;
  currentLevel: 1 | 2 | 3;
  startedAt: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  serverTime: string;
  remainingSeconds: number;
  level1Unlocked: boolean;
  level2Unlocked: boolean;
  level3Unlocked: boolean;
  level1Submitted: boolean;
  level2Submitted: boolean;
  level3Submitted: boolean;
  level2QualifiedByOrganiser: boolean;
  level3QualifiedByOrganiser: boolean;
  qualificationStatus: QualificationStatus;
  level1Score: number;
  level2Score: number;
  level3Score: number;
  totalScore: number;
  unlockedCredential: string | null;
  discoveredEvidenceIds: string[];
  attempts: {
    level1: number;
    level2: number;
    level3: number;
  };
}

export interface Level1Submission {
  entryVector: string;
  primaryDevice: string;
  clockDiscrepancy: string;
  selectedEvidenceIds: string[];
}

export interface Level2Submission {
  suspectId: string;
  primeCctvEventId: string;
  chronologyOrder: string[];
  selectedEvidenceIds: string[];
  investigatorNotes: string;
}

export interface Level3Submission {
  attackerId: string;
  entryMethod: string;
  chronologyOrder: string[];
  supportingEvidenceIds: string[];
  eliminatedSuspectId: string;
  eliminationReason: string;
}

export interface FinalReport {
  teamId: string;
  teamName: string;
  sessionCode: string;
  status: SessionStatus;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  totalScore: number;
  levelScores: {
    level1: number;
    level2: number;
    level3: number;
  };
  attackerIdentified: {
    name: string;
    role: string;
    isCorrect: boolean;
  };
  entryMethod: {
    method: string;
    isCorrect: boolean;
  };
  chronologyVerified: boolean;
  supportingEvidenceCount: number;
  eliminatedSuspect: {
    suspectName: string;
    reason: string;
  };
  performanceRating: 'MASTER FORENSIC AGENT' | 'SENIOR INCIDENT RESPONDER' | 'CYBER OPERATIVE' | 'RECON RECRUIT';
  investigationSummary: string;
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  studentName?: string;
  username: string;
  sessionCode: string;
  status: SessionStatus;
  qualificationStatus: QualificationStatus;
  currentLevel: number;
  level1Score: number;
  level2Score: number;
  level3Score: number;
  totalScore: number;
  timeTakenSeconds: number | null;
  startedAt: string | null;
  completedAt: string | null;
}
