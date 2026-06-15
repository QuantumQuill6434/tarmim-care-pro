-- ============================================================
-- Tarmim Care Pro — Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- ─── 1. CREATE ALL TABLES FIRST ────────────────────────────
-- (Policies are added after, to avoid forward-reference errors)

CREATE TABLE IF NOT EXISTS clinics (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  owner_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id  UUID REFERENCES clinics(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'receptionist')),
  branch_id  UUID NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS branches (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  code       TEXT NOT NULL,
  location   TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS handover_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  branch_id      UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  details        TEXT NOT NULL DEFAULT '',
  category       TEXT NOT NULL CHECK (category IN (
                   'Callback','Follow-up','Cash / payment','Complaint',
                   'Supplies','Insurance admin','Urgent','Other'
                 )),
  priority       TEXT NOT NULL CHECK (priority IN ('Low','Medium','High')),
  status         TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','In Progress','Completed')),
  shift_name     TEXT NOT NULL,
  follow_up_date DATE NULL,
  created_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  completed_at   TIMESTAMPTZ NULL,
  completed_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id    UUID NOT NULL REFERENCES handover_items(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item_activity_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id    UUID NOT NULL REFERENCES handover_items(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action     TEXT NOT NULL CHECK (action IN (
               'created','status_changed','comment_added','assigned','details_updated'
             )),
  details    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES ────────────

ALTER TABLE clinics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_activity_logs ENABLE ROW LEVEL SECURITY;

-- ─── 3. ADD ALL POLICIES ───────────────────────────────────
-- Now that both tables exist, policies can reference each other safely.

-- CLINICS
CREATE POLICY "Clinic members see their clinic"
  ON clinics FOR SELECT
  USING (
    id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
  );

-- PROFILES
CREATE POLICY "Profiles: read same clinic"
  ON profiles FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Profiles: update own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- BRANCHES
CREATE POLICY "Branches: read same clinic"
  ON branches FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Branches: insert own clinic"
  ON branches FOR INSERT
  WITH CHECK (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Branches: update own clinic"
  ON branches FOR UPDATE
  USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

-- HANDOVER ITEMS
CREATE POLICY "Items: read same clinic"
  ON handover_items FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Items: insert same clinic"
  ON handover_items FOR INSERT
  WITH CHECK (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Items: update same clinic"
  ON handover_items FOR UPDATE
  USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

-- ITEM COMMENTS
CREATE POLICY "Comments: read same clinic"
  ON item_comments FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM handover_items
      WHERE clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Comments: insert same clinic"
  ON item_comments FOR INSERT
  WITH CHECK (
    item_id IN (
      SELECT id FROM handover_items
      WHERE clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ACTIVITY LOGS
CREATE POLICY "Logs: read same clinic"
  ON item_activity_logs FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM handover_items
      WHERE clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Logs: insert same clinic"
  ON item_activity_logs FOR INSERT
  WITH CHECK (
    item_id IN (
      SELECT id FROM handover_items
      WHERE clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ─── 4. AUTO-CREATE PROFILE + CLINIC ON SIGN UP ────────────
-- This trigger fires automatically when a new user registers via Supabase Auth.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_clinic_id UUID;
  clinic_name   TEXT;
BEGIN
  clinic_name := COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'My Clinic');

  -- Create the clinic row
  INSERT INTO public.clinics (name, owner_id)
  VALUES (clinic_name, NEW.id)
  RETURNING id INTO new_clinic_id;

  -- Create the owner profile row
  INSERT INTO public.profiles (id, clinic_id, email, name, role, branch_id)
  VALUES (
    NEW.id,
    new_clinic_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'owner',
    NULL
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
