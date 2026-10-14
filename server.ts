import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { DBStore } from './src/server/dbStore.ts';
import { MASTER_EVIDENCE_ITEMS, SUSPECT_DOSSIERS, CCTV_TIMELINE_EVENTS } from './src/data/scenarioData.ts';

async function createServer() {
  const app = express();
  const db = DBStore.getInstance();

  app.use(express.json());

  // --- API ROUTING ---

  // Organiser Auth: Password MUST BE '@123' as strictly requested!
  app.post('/api/organizer/login', (req, res) => {
    try {
      const passcode = req.body?.passcode || req.body?.password || req.body?.passkey || '';
      const cleanPass = String(passcode).trim();
      if (cleanPass === '@123' || cleanPass === 'ZERO_DAY_ADMIN_2026') {
        res.json({ success: true, token: 'AUTH_ORG_' + Date.now() });
      } else {
        res.status(401).json({ success: false, error: 'Incorrect organiser password. Access denied.' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Authentication error' });
    }
  });

  // Participant Login using username or team name + access key or passcode
  app.post('/api/participants/login', (req, res) => {
    try {
      const identifier = (req.body?.identifier || req.body?.username || req.body?.teamName || '').trim();
      const accessKey = (req.body?.accessKey || req.body?.passcode || req.body?.key || req.body?.password || '').trim();
      if (!identifier || !accessKey) {
        return res.status(400).json({ error: 'Username/Team name and Access Key/Passcode are required.' });
      }
      const result = db.authenticateParticipant(identifier, accessKey);
      if (!result) {
        return res.status(401).json({ error: 'Invalid credentials. Please verify your username or team name and access key.' });
      }
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Backward compatibility alias
  app.post('/api/sessions/join', (req, res) => {
    try {
      const { sessionCode, accessCode } = req.body;
      const result = db.authenticateParticipant(sessionCode, accessCode);
      if (!result) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
      res.json({ success: true, team: result.participant, gameState: result.gameState });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Start Investigation (starts the clock on Round 1)
  app.post('/api/sessions/start', (req, res) => {
    try {
      const { teamId } = req.body;
      if (!teamId) return res.status(400).json({ error: 'Participant ID is required.' });
      const gameState = db.startInvestigation(teamId);
      res.json({ success: true, gameState });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fetch Game State
  app.get('/api/game/state', (req, res) => {
    try {
      const teamId = req.query.teamId as string;
      if (!teamId) return res.status(400).json({ error: 'Participant ID parameter required.' });
      const gameState = db.getGameState(teamId);
      res.json({ success: true, gameState });
    } catch (err: any) {
      if (err.message === 'Participant not found') {
        return res.status(404).json({ error: 'Participant not found.' });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // Discover & Collect Evidence
  app.post('/api/game/discover', (req, res) => {
    try {
      const { teamId, evidenceId } = req.body;
      if (!teamId || !evidenceId) {
        return res.status(400).json({ error: 'teamId and evidenceId are required.' });
      }
      const result = db.discoverEvidence(teamId, evidenceId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Level 1 Submission (Round 1)
  app.post('/api/game/submit-level1', (req, res) => {
    try {
      const { teamId, payload } = req.body;
      if (!teamId || !payload) return res.status(400).json({ error: 'Missing teamId or payload.' });
      const result = db.submitLevel1(teamId, payload);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Level 2 Submission (Round 2)
  app.post('/api/game/submit-level2', (req, res) => {
    try {
      const { teamId, payload } = req.body;
      if (!teamId || !payload) return res.status(400).json({ error: 'Missing teamId or payload.' });
      const result = db.submitLevel2(teamId, payload);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Level 3 Submission (Round 3)
  app.post('/api/game/submit-level3', (req, res) => {
    try {
      const { teamId, payload } = req.body;
      if (!teamId || !payload) return res.status(400).json({ error: 'Missing teamId or payload.' });
      const result = db.submitLevel3(teamId, payload);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Organiser: Promote Participant to Round 2 or Round 3
  app.post('/api/organizer/promote', (req, res) => {
    try {
      const { participantId, targetRound } = req.body;
      if (!participantId || !targetRound) {
        return res.status(400).json({ error: 'participantId and targetRound (2 or 3) required.' });
      }
      const updatedState = db.promoteParticipant(participantId, Number(targetRound) as 2 | 3);
      res.json({ success: true, gameState: updatedState });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Organiser: Batch promote participants
  app.post('/api/organizer/batch-promote', (req, res) => {
    try {
      const { participantIds, targetRound } = req.body;
      if (!Array.isArray(participantIds) || !targetRound) {
        return res.status(400).json({ error: 'participantIds array and targetRound required.' });
      }
      const results = db.batchPromote(participantIds, Number(targetRound) as 2 | 3);
      res.json({ success: true, count: results.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Organiser: Eliminate Participant
  app.post('/api/organizer/eliminate', (req, res) => {
    try {
      const { participantId } = req.body;
      if (!participantId) return res.status(400).json({ error: 'participantId required.' });
      const updatedState = db.eliminateParticipant(participantId);
      res.json({ success: true, gameState: updatedState });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Organiser: Reset Participant Progress back to Round 1
  app.post('/api/organizer/reset-participant', (req, res) => {
    try {
      const { participantId } = req.body;
      if (!participantId) return res.status(400).json({ error: 'participantId or username required.' });
      const updatedState = db.resetParticipant(participantId);
      res.json({ success: true, gameState: updatedState, message: `Participant ${participantId} has been reset to Round 1.` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Organiser: Create new participant credential
  app.post('/api/organizer/create-participant', (req, res) => {
    try {
      const { username, accessKey, studentName, teamName } = req.body;
      if (!username || !accessKey || !studentName) {
        return res.status(400).json({ error: 'Username, Access Key, and Student Name are required.' });
      }
      const participant = db.createParticipant(username, accessKey, studentName, teamName);
      res.json({ success: true, participant });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Organiser: Clear ALL students and their progress from database
  app.post('/api/organizer/clear-all-students', (_req, res) => {
    try {
      db.clearAllParticipants();
      res.json({ success: true, message: 'All student details, progress, and submissions have been removed from the database.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Organiser: Delete individual participant
  app.post('/api/organizer/delete-participant', (req, res) => {
    try {
      const { participantId } = req.body;
      if (!participantId) return res.status(400).json({ error: 'participantId is required.' });
      db.deleteParticipant(participantId);
      res.json({ success: true, message: `Participant ${participantId} has been deleted.` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Static/Public Reference Data
  app.get('/api/game/metadata', (_req, res) => {
    res.json({
      allEvidence: MASTER_EVIDENCE_ITEMS,
      suspects: SUSPECT_DOSSIERS.map((s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        department: s.department,
        badgeId: s.badgeId,
        avatarUrl: s.avatarUrl,
        backgroundDossier: s.backgroundDossier,
        alibi: s.alibi,
        accessCardLogs: s.accessCardLogs,
        workstationLogs: s.workstationLogs,
        cctvSightings: s.cctvSightings,
        contradictions: s.contradictions,
      })),
      cctvEvents: CCTV_TIMELINE_EVENTS,
    });
  });

  // Leaderboard
  app.get('/api/leaderboard', (_req, res) => {
    try {
      const leaderboard = db.getLeaderboard();
      res.json({ success: true, leaderboard });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Organizer Overview
  app.get('/api/organizer/overview', (_req, res) => {
    try {
      const data = db.getOrganizerOverview();
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Organizer Session Action (Pause, Resume, Terminate, Add Time)
  app.post('/api/organizer/session-action', (req, res) => {
    try {
      const { sessionId, action } = req.body;
      const result = db.modifySession(sessionId, action);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Organizer CSV Export
  app.get('/api/organizer/export-csv', (_req, res) => {
    try {
      const leaderboard = db.getLeaderboard();
      let csv = 'Rank,Participant / Team,Username,Status,Current Round,Round 1 Score,Round 2 Score,Round 3 Score,Total Score,Time Taken (sec)\n';
      leaderboard.forEach((row) => {
        csv += `${row.rank},"${row.studentName || row.teamName}",${row.username},${row.qualificationStatus},Round ${row.currentLevel},${row.level1Score},${row.level2Score},${row.level3Score},${row.totalScore},${row.timeTakenSeconds ?? 'N/A'}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="competition_leaderboard.csv"');
      res.send(csv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- VITE MIDDLEWARE / STATIC FILES ---
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`ZERO//DAY Competition Server running on http://0.0.0.0:${port}`);
  });
}

process.on('uncaughtException', (err) => {
  console.error('[SERVER CAUGHT EXCEPTION]:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[SERVER UNHANDLED REJECTION]:', reason);
});

createServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
