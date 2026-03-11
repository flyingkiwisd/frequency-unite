-- ============================================================
-- Frequency Unite — Migration: Supabase Auth → Clerk Auth
-- ============================================================
-- Run this against your existing Supabase database to migrate
-- from UUID-based auth.users references to TEXT-based Clerk user IDs.
--
-- IMPORTANT: Back up your data before running this migration.
-- ============================================================

-- ─── Step 1: Update team_members.auth_user_id from UUID to TEXT ───

-- Drop the FK constraint and unique index
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_auth_user_id_fkey;
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_auth_user_id_key;

-- Change column type
ALTER TABLE team_members ALTER COLUMN auth_user_id TYPE TEXT USING auth_user_id::TEXT;

-- Re-add unique constraint (no FK — Clerk users aren't in auth.users)
ALTER TABLE team_members ADD CONSTRAINT team_members_auth_user_id_key UNIQUE (auth_user_id);

-- Clear old Supabase auth IDs (they won't match Clerk IDs)
UPDATE team_members SET auth_user_id = NULL;


-- ─── Step 2: Update all user-editable tables (user_id UUID → TEXT) ───

-- okr_edits
ALTER TABLE okr_edits DROP CONSTRAINT IF EXISTS okr_edits_user_id_fkey;
ALTER TABLE okr_edits ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- roadmap_progress
ALTER TABLE roadmap_progress DROP CONSTRAINT IF EXISTS roadmap_progress_user_id_fkey;
ALTER TABLE roadmap_progress ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- accountability_data
ALTER TABLE accountability_data DROP CONSTRAINT IF EXISTS accountability_data_user_id_fkey;
ALTER TABLE accountability_data ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- user_notes
ALTER TABLE user_notes DROP CONSTRAINT IF EXISTS user_notes_user_id_fkey;
ALTER TABLE user_notes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- node_updates
ALTER TABLE node_updates DROP CONSTRAINT IF EXISTS node_updates_user_id_fkey;
ALTER TABLE node_updates ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- bookmarked_activities
ALTER TABLE bookmarked_activities DROP CONSTRAINT IF EXISTS bookmarked_activities_user_id_fkey;
ALTER TABLE bookmarked_activities ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- steward_journal
ALTER TABLE steward_journal DROP CONSTRAINT IF EXISTS steward_journal_user_id_fkey;
ALTER TABLE steward_journal ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- steward_alignment
ALTER TABLE steward_alignment DROP CONSTRAINT IF EXISTS steward_alignment_user_id_fkey;
ALTER TABLE steward_alignment ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;


-- ─── Step 3: Drop ALL old RLS policies ───

-- team_members
DROP POLICY IF EXISTS "Authenticated users can read team_members" ON team_members;
DROP POLICY IF EXISTS "Users can update own team_members row" ON team_members;

-- Reference tables
DROP POLICY IF EXISTS "Authenticated users can read nodes" ON nodes;
DROP POLICY IF EXISTS "Authenticated users can read okrs" ON okrs;
DROP POLICY IF EXISTS "Authenticated users can read okr_key_results" ON okr_key_results;
DROP POLICY IF EXISTS "Authenticated users can read kpis" ON kpis;
DROP POLICY IF EXISTS "Authenticated users can read governance_decisions" ON governance_decisions;
DROP POLICY IF EXISTS "Authenticated users can read events" ON events;
DROP POLICY IF EXISTS "Authenticated users can read tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can read chat_channels" ON chat_channels;
DROP POLICY IF EXISTS "Authenticated users can read chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can read roadmap_phases" ON roadmap_phases;

-- User-editable tables (all old auth.uid() policies)
DROP POLICY IF EXISTS "Users can read own okr_edits" ON okr_edits;
DROP POLICY IF EXISTS "Users can insert own okr_edits" ON okr_edits;
DROP POLICY IF EXISTS "Users can update own okr_edits" ON okr_edits;
DROP POLICY IF EXISTS "Users can delete own okr_edits" ON okr_edits;

DROP POLICY IF EXISTS "Users can read own roadmap_progress" ON roadmap_progress;
DROP POLICY IF EXISTS "Users can insert own roadmap_progress" ON roadmap_progress;
DROP POLICY IF EXISTS "Users can update own roadmap_progress" ON roadmap_progress;
DROP POLICY IF EXISTS "Users can delete own roadmap_progress" ON roadmap_progress;

DROP POLICY IF EXISTS "Users can read own accountability_data" ON accountability_data;
DROP POLICY IF EXISTS "Users can insert own accountability_data" ON accountability_data;
DROP POLICY IF EXISTS "Users can update own accountability_data" ON accountability_data;
DROP POLICY IF EXISTS "Users can delete own accountability_data" ON accountability_data;

DROP POLICY IF EXISTS "Users can read own user_notes" ON user_notes;
DROP POLICY IF EXISTS "Users can insert own user_notes" ON user_notes;
DROP POLICY IF EXISTS "Users can update own user_notes" ON user_notes;
DROP POLICY IF EXISTS "Users can delete own user_notes" ON user_notes;

DROP POLICY IF EXISTS "Users can read own node_updates" ON node_updates;
DROP POLICY IF EXISTS "Users can insert own node_updates" ON node_updates;
DROP POLICY IF EXISTS "Users can update own node_updates" ON node_updates;
DROP POLICY IF EXISTS "Users can delete own node_updates" ON node_updates;

DROP POLICY IF EXISTS "Users can read own bookmarked_activities" ON bookmarked_activities;
DROP POLICY IF EXISTS "Users can insert own bookmarked_activities" ON bookmarked_activities;
DROP POLICY IF EXISTS "Users can update own bookmarked_activities" ON bookmarked_activities;
DROP POLICY IF EXISTS "Users can delete own bookmarked_activities" ON bookmarked_activities;

DROP POLICY IF EXISTS "Users can read own steward_journal" ON steward_journal;
DROP POLICY IF EXISTS "Users can insert own steward_journal" ON steward_journal;
DROP POLICY IF EXISTS "Users can update own steward_journal" ON steward_journal;
DROP POLICY IF EXISTS "Users can delete own steward_journal" ON steward_journal;

DROP POLICY IF EXISTS "Users can read own steward_alignment" ON steward_alignment;
DROP POLICY IF EXISTS "Users can insert own steward_alignment" ON steward_alignment;
DROP POLICY IF EXISTS "Users can update own steward_alignment" ON steward_alignment;
DROP POLICY IF EXISTS "Users can delete own steward_alignment" ON steward_alignment;


-- ─── Step 4: Create NEW Clerk-compatible RLS policies ───
-- Uses (auth.jwt() ->> 'sub') instead of auth.uid()
-- Reference tables readable by authenticated + anon

-- team_members
CREATE POLICY "Anyone can read team_members"
  ON team_members FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can claim unclaimed team_members row"
  ON team_members FOR UPDATE
  TO authenticated
  USING (auth_user_id IS NULL OR auth_user_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (auth_user_id = (auth.jwt() ->> 'sub'));

-- Reference tables
CREATE POLICY "Anyone can read nodes"
  ON nodes FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Anyone can read okrs"
  ON okrs FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Anyone can read okr_key_results"
  ON okr_key_results FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Anyone can read kpis"
  ON kpis FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Anyone can read governance_decisions"
  ON governance_decisions FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Anyone can read events"
  ON events FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Anyone can read tasks"
  ON tasks FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Anyone can read chat_channels"
  ON chat_channels FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Anyone can read chat_messages"
  ON chat_messages FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Anyone can read roadmap_phases"
  ON roadmap_phases FOR SELECT TO authenticated, anon USING (true);

-- User-editable tables (Clerk JWT: auth.jwt() ->> 'sub')
-- okr_edits
CREATE POLICY "Users can read own okr_edits"
  ON okr_edits FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can insert own okr_edits"
  ON okr_edits FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can update own okr_edits"
  ON okr_edits FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can delete own okr_edits"
  ON okr_edits FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

-- roadmap_progress
CREATE POLICY "Users can read own roadmap_progress"
  ON roadmap_progress FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can insert own roadmap_progress"
  ON roadmap_progress FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can update own roadmap_progress"
  ON roadmap_progress FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can delete own roadmap_progress"
  ON roadmap_progress FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

-- accountability_data
CREATE POLICY "Users can read own accountability_data"
  ON accountability_data FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can insert own accountability_data"
  ON accountability_data FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can update own accountability_data"
  ON accountability_data FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can delete own accountability_data"
  ON accountability_data FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

-- user_notes
CREATE POLICY "Users can read own user_notes"
  ON user_notes FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can insert own user_notes"
  ON user_notes FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can update own user_notes"
  ON user_notes FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can delete own user_notes"
  ON user_notes FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

-- node_updates
CREATE POLICY "Users can read own node_updates"
  ON node_updates FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can insert own node_updates"
  ON node_updates FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can update own node_updates"
  ON node_updates FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can delete own node_updates"
  ON node_updates FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

-- bookmarked_activities
CREATE POLICY "Users can read own bookmarked_activities"
  ON bookmarked_activities FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can insert own bookmarked_activities"
  ON bookmarked_activities FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can update own bookmarked_activities"
  ON bookmarked_activities FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can delete own bookmarked_activities"
  ON bookmarked_activities FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

-- steward_journal
CREATE POLICY "Users can read own steward_journal"
  ON steward_journal FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can insert own steward_journal"
  ON steward_journal FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can update own steward_journal"
  ON steward_journal FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can delete own steward_journal"
  ON steward_journal FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

-- steward_alignment
CREATE POLICY "Users can read own steward_alignment"
  ON steward_alignment FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can insert own steward_alignment"
  ON steward_alignment FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can update own steward_alignment"
  ON steward_alignment FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users can delete own steward_alignment"
  ON steward_alignment FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);


-- ============================================================
-- Migration complete!
-- Next steps:
-- 1. Set up Clerk JWT template with Supabase's JWT_SECRET
-- 2. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to env
-- 3. Deploy the updated Next.js app
-- ============================================================
