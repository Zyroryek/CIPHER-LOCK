import {
  TeamGameState,
  LeaderboardEntry,
  Level1Submission,
  Level2Submission,
  Level3Submission,
  EvidenceItem,
  SuspectProfile,
  CCTVEvent,
} from '../types/game';

const API_BASE = '/api';

export async function loginParticipant(identifier: string, accessKey: string) {
  const res = await fetch(`${API_BASE}/participants/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier,
      username: identifier,
      teamName: identifier,
      accessKey,
      passcode: accessKey,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Invalid credentials. Please verify your username or team name and access key.');
  }
  return res.json();
}

export async function organizerLogin(passcode: string) {
  const res = await fetch(`${API_BASE}/organizer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Incorrect organiser passkey');
  }
  return res.json();
}

export async function startInvestigation(teamId: string) {
  const res = await fetch(`${API_BASE}/sessions/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to start investigation');
  }
  return res.json();
}

export async function getGameState(teamId: string): Promise<{ success: boolean; gameState: TeamGameState }> {
  const res = await fetch(`${API_BASE}/game/state?teamId=${encodeURIComponent(teamId)}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch game state');
  }
  return res.json();
}

export async function discoverEvidence(teamId: string, evidenceId: string) {
  const res = await fetch(`${API_BASE}/game/discover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, evidenceId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to collect evidence');
  }
  return res.json();
}

export async function submitLevel1(teamId: string, payload: Level1Submission) {
  const res = await fetch(`${API_BASE}/game/submit-level1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, payload }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit Level 1');
  }
  return res.json();
}

export async function submitLevel2(teamId: string, payload: Level2Submission) {
  const res = await fetch(`${API_BASE}/game/submit-level2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, payload }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit Level 2');
  }
  return res.json();
}

export async function submitLevel3(teamId: string, payload: Level3Submission) {
  const res = await fetch(`${API_BASE}/game/submit-level3`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, payload }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit Level 3');
  }
  return res.json();
}

export async function getLeaderboard(): Promise<{ success: boolean; leaderboard: LeaderboardEntry[] }> {
  const res = await fetch(`${API_BASE}/leaderboard`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function getGameMetadata(): Promise<{
  allEvidence: EvidenceItem[];
  suspects: SuspectProfile[];
  cctvEvents: CCTVEvent[];
}> {
  const res = await fetch(`${API_BASE}/game/metadata`);
  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json();
}

export async function getOrganizerOverview() {
  const res = await fetch(`${API_BASE}/organizer/overview`);
  if (!res.ok) throw new Error('Failed to load organizer data');
  return res.json();
}

export async function promoteParticipant(participantId: string, targetRound: 2 | 3) {
  const res = await fetch(`${API_BASE}/organizer/promote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId, targetRound }),
  });
  if (!res.ok) throw new Error('Failed to promote participant');
  return res.json();
}

export async function batchPromoteParticipants(participantIds: string[], targetRound: 2 | 3) {
  const res = await fetch(`${API_BASE}/organizer/batch-promote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantIds, targetRound }),
  });
  if (!res.ok) throw new Error('Failed to promote selected participants');
  return res.json();
}

export async function eliminateParticipant(participantId: string) {
  const res = await fetch(`${API_BASE}/organizer/eliminate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId }),
  });
  if (!res.ok) throw new Error('Failed to eliminate participant');
  return res.json();
}

export async function resetParticipant(participantId: string) {
  const res = await fetch(`${API_BASE}/organizer/reset-participant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId }),
  });
  if (!res.ok) throw new Error('Failed to reset participant');
  return res.json();
}

export async function createParticipantAccount(username: string, accessKey: string, studentName: string, teamName?: string) {
  const res = await fetch(`${API_BASE}/organizer/create-participant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, accessKey, studentName, teamName }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create participant');
  }
  return res.json();
}

export async function modifyOrganizerSession(sessionId: string, action: 'PAUSE' | 'RESUME' | 'TERMINATE' | 'ADD_5_MIN') {
  const res = await fetch(`${API_BASE}/organizer/session-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, action }),
  });
  if (!res.ok) throw new Error('Failed to modify session');
  return res.json();
}

export async function clearAllStudents() {
  const res = await fetch(`${API_BASE}/organizer/clear-all-students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to clear all students');
  }
  return res.json();
}

export async function deleteParticipantAccount(participantId: string) {
  const res = await fetch(`${API_BASE}/organizer/delete-participant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete participant');
  }
  return res.json();
}
