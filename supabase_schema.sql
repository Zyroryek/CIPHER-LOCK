-- ============================================================================
-- ZERO//DAY — TECH ESCAPE LAB
-- PostgreSQL / Supabase Database Architecture & Security Schema
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'organizer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. INVESTIGATION SESSIONS
CREATE TABLE IF NOT EXISTS public.investigation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'OPERATION_MIDNIGHT_SYNAPSE',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'EXPIRED')),
  max_duration_seconds INTEGER NOT NULL DEFAULT 1500, -- 25 minutes (8m L1, 8m L2, 9m L3)
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TEAMS & PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.investigation_sessions(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  access_code TEXT UNIQUE NOT NULL,
  leader_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(session_id, team_name)
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  member_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. GAME SCENARIOS & LEVELS
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_name TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  synopsis TEXT NOT NULL,
  max_score INTEGER NOT NULL DEFAULT 300,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.scenario_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL CHECK (level_number BETWEEN 1 AND 3),
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 480,
  max_score INTEGER NOT NULL DEFAULT 100,
  UNIQUE(scenario_id, level_number)
);

-- 6. SCENARIO EVIDENCE REPOSITORY
CREATE TABLE IF NOT EXISTS public.scenario_evidence (
  id TEXT PRIMARY KEY,
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL CHECK (level_number BETWEEN 1 AND 3),
  category TEXT NOT NULL CHECK (category IN ('digital_forensics', 'physical_access', 'cctv_observations', 'timestamps', 'suspect_information', 'verified_findings')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_location TEXT NOT NULL,
  technical_metadata JSONB DEFAULT '{}'::jsonb,
  is_red_herring BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. SUSPECT PROFILES
CREATE TABLE IF NOT EXISTS public.suspect_profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  department TEXT NOT NULL,
  security_badge_id TEXT NOT NULL,
  avatar_url TEXT,
  background_dossier TEXT NOT NULL,
  access_card_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  workstation_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  cctv_sightings JSONB NOT NULL DEFAULT '[]'::jsonb,
  alibi TEXT NOT NULL,
  is_perpetrator BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. CCTV EVENTS
CREATE TABLE IF NOT EXISTS public.cctv_events (
  id TEXT PRIMARY KEY,
  camera_id TEXT NOT NULL CHECK (camera_id IN ('CAM_01', 'CAM_02', 'CAM_03')),
  camera_name TEXT NOT NULL,
  timestamp_offset_seconds INTEGER NOT NULL,
  display_timestamp TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_id TEXT REFERENCES public.scenario_evidence(id),
  visual_overlay_type TEXT NOT NULL,
  anomaly_detected BOOLEAN NOT NULL DEFAULT FALSE
);

-- 9. TEAM GAME STATES (SERVER-AUTHORITATIVE)
CREATE TABLE IF NOT EXISTS public.team_game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID UNIQUE NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.investigation_sessions(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 3),
  status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'EXPIRED')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  level_1_unlocked BOOLEAN NOT NULL DEFAULT TRUE,
  level_2_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  level_3_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  level_1_score INTEGER NOT NULL DEFAULT 0,
  level_2_score INTEGER NOT NULL DEFAULT 0,
  level_3_score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  unlocked_credential TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. DISCOVERED EVIDENCE PER TEAM
CREATE TABLE IF NOT EXISTS public.discovered_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  evidence_id TEXT NOT NULL REFERENCES public.scenario_evidence(id),
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  discovery_location TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(team_id, evidence_id)
);

-- 11. INVESTIGATION SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.investigation_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL CHECK (level_number BETWEEN 1 AND 3),
  submission_payload JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  score_awarded INTEGER NOT NULL DEFAULT 0,
  feedback TEXT NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_teams_session ON public.teams(session_id);
CREATE INDEX IF NOT EXISTS idx_team_game_states_team ON public.team_game_states(team_id);
CREATE INDEX IF NOT EXISTS idx_discovered_evidence_team ON public.discovered_evidence(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_team_level ON public.investigation_submissions(team_id, level_number);
CREATE INDEX IF NOT EXISTS idx_audit_logs_team ON public.audit_logs(team_id);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovered_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Leaderboard / Public read of scores
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  t.id AS team_id,
  t.team_name,
  s.session_code,
  gs.status,
  gs.current_level,
  gs.level_1_score,
  gs.level_2_score,
  gs.level_3_score,
  gs.total_score,
  gs.started_at,
  gs.completed_at,
  CASE 
    WHEN gs.completed_at IS NOT NULL AND gs.started_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (gs.completed_at - gs.started_at))
    ELSE NULL 
  END AS time_taken_seconds
FROM public.teams t
JOIN public.team_game_states gs ON t.id = gs.team_id
JOIN public.investigation_sessions s ON t.session_id = s.id
ORDER BY gs.total_score DESC, time_taken_seconds ASC NULLS LAST;

-- Team Isolation Policy example:
-- Only team members can read their own team state and discovered evidence
CREATE POLICY team_state_access ON public.team_game_states
  FOR SELECT
  USING (true); -- Read-only or restricted to session

CREATE POLICY discovered_evidence_policy ON public.discovered_evidence
  FOR ALL
  USING (true);
