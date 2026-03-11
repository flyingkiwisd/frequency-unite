-- ============================================================
-- Frequency Unite — Database Schema
-- Run this FIRST to create all tables, then run seed.sql
-- ============================================================

-- ─── Reference Tables (read-only for authenticated users) ───

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  short_role TEXT NOT NULL,
  avatar TEXT NOT NULL,
  color TEXT NOT NULL,
  role_one_sentence TEXT NOT NULL,
  domains TEXT[] NOT NULL DEFAULT '{}',
  kpis TEXT[] NOT NULL DEFAULT '{}',
  non_negotiables TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('active','part-time','advisory','hiring')),
  tier TEXT NOT NULL CHECK (tier IN ('core-team','board','node-lead','member')),
  hours_per_week TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nodes
CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  gradient TEXT NOT NULL,
  purpose TEXT NOT NULL,
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  leads TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('active','building','pilot','planned')),
  priority TEXT NOT NULL CHECK (priority IN ('critical','high','medium')),
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- OKRs
CREATE TABLE IF NOT EXISTS okrs (
  id TEXT PRIMARY KEY,
  objective TEXT NOT NULL,
  quarter TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('on-track','at-risk','behind')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- OKR Key Results (child of OKRs)
CREATE TABLE IF NOT EXISTS okr_key_results (
  id SERIAL PRIMARY KEY,
  okr_id TEXT NOT NULL REFERENCES okrs(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  owner TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- KPIs
CREATE TABLE IF NOT EXISTS kpis (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  target TEXT NOT NULL,
  trend TEXT NOT NULL CHECK (trend IN ('up','down','flat')),
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Governance Decisions
CREATE TABLE IF NOT EXISTS governance_decisions (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  decided_by TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('high','medium','low')),
  category TEXT NOT NULL CHECK (category IN ('governance','financial','membership','strategy','node')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  capacity TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed','upcoming','planning')),
  highlights TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo','in-progress','done','blocked')),
  priority TEXT NOT NULL CHECK (priority IN ('critical','high','medium','low')),
  deadline DATE NOT NULL,
  node TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat Channels
CREATE TABLE IF NOT EXISTS chat_channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  unread INTEGER NOT NULL DEFAULT 0,
  last_message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL REFERENCES chat_channels(id),
  sender TEXT NOT NULL,
  sender_avatar TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  reactions JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Roadmap Phases
CREATE TABLE IF NOT EXISTS roadmap_phases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  timeline TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','upcoming','planned')),
  milestones TEXT[] NOT NULL DEFAULT '{}',
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ─── User-Editable Tables (per-user via RLS) ───

-- OKR Edits (user overrides for progress, status, notes, confidence)
CREATE TABLE IF NOT EXISTS okr_edits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Roadmap Progress
CREATE TABLE IF NOT EXISTS roadmap_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Accountability Data
CREATE TABLE IF NOT EXISTS accountability_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Notes
CREATE TABLE IF NOT EXISTS user_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Node Updates
CREATE TABLE IF NOT EXISTS node_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Bookmarked Activities
CREATE TABLE IF NOT EXISTS bookmarked_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Steward Journal
CREATE TABLE IF NOT EXISTS steward_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Steward Alignment
CREATE TABLE IF NOT EXISTS steward_alignment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);


-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- ─── Enable RLS on ALL tables ───

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountability_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarked_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE steward_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE steward_alignment ENABLE ROW LEVEL SECURITY;


-- ─── Reference Tables: SELECT only for authenticated users ───

CREATE POLICY "Authenticated users can read team_members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to UPDATE their own team_members row (registration flow)
CREATE POLICY "Users can update own team_members row"
  ON team_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Authenticated users can read nodes"
  ON nodes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read okrs"
  ON okrs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read okr_key_results"
  ON okr_key_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read kpis"
  ON kpis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read governance_decisions"
  ON governance_decisions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read chat_channels"
  ON chat_channels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read chat_messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read roadmap_phases"
  ON roadmap_phases FOR SELECT
  TO authenticated
  USING (true);


-- ─── User-Editable Tables: Full CRUD for own rows ───

-- okr_edits
CREATE POLICY "Users can read own okr_edits"
  ON okr_edits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own okr_edits"
  ON okr_edits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own okr_edits"
  ON okr_edits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own okr_edits"
  ON okr_edits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- roadmap_progress
CREATE POLICY "Users can read own roadmap_progress"
  ON roadmap_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmap_progress"
  ON roadmap_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmap_progress"
  ON roadmap_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmap_progress"
  ON roadmap_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- accountability_data
CREATE POLICY "Users can read own accountability_data"
  ON accountability_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accountability_data"
  ON accountability_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accountability_data"
  ON accountability_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own accountability_data"
  ON accountability_data FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- user_notes
CREATE POLICY "Users can read own user_notes"
  ON user_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_notes"
  ON user_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_notes"
  ON user_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own user_notes"
  ON user_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- node_updates
CREATE POLICY "Users can read own node_updates"
  ON node_updates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own node_updates"
  ON node_updates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own node_updates"
  ON node_updates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own node_updates"
  ON node_updates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- bookmarked_activities
CREATE POLICY "Users can read own bookmarked_activities"
  ON bookmarked_activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarked_activities"
  ON bookmarked_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarked_activities"
  ON bookmarked_activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarked_activities"
  ON bookmarked_activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- steward_journal
CREATE POLICY "Users can read own steward_journal"
  ON steward_journal FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own steward_journal"
  ON steward_journal FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own steward_journal"
  ON steward_journal FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own steward_journal"
  ON steward_journal FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- steward_alignment
CREATE POLICY "Users can read own steward_alignment"
  ON steward_alignment FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own steward_alignment"
  ON steward_alignment FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own steward_alignment"
  ON steward_alignment FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own steward_alignment"
  ON steward_alignment FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
