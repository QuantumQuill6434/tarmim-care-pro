-- ============================================================
-- FIX: Run this in Supabase SQL Editor to fix the infinite
-- redirect loop caused by recursive RLS policies.
-- ============================================================

-- STEP 1: Create a SECURITY DEFINER helper function.
-- This runs WITHOUT RLS, breaking the self-referential loop.
CREATE OR REPLACE FUNCTION public.get_my_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- STEP 2: Drop the broken recursive policies
DROP POLICY IF EXISTS "Clinic members see their clinic"  ON clinics;
DROP POLICY IF EXISTS "Profiles: read same clinic"       ON profiles;
DROP POLICY IF EXISTS "Profiles: update own"             ON profiles;
DROP POLICY IF EXISTS "Branches: read same clinic"       ON branches;
DROP POLICY IF EXISTS "Branches: insert own clinic"      ON branches;
DROP POLICY IF EXISTS "Branches: update own clinic"      ON branches;
DROP POLICY IF EXISTS "Items: read same clinic"          ON handover_items;
DROP POLICY IF EXISTS "Items: insert same clinic"        ON handover_items;
DROP POLICY IF EXISTS "Items: update same clinic"        ON handover_items;
DROP POLICY IF EXISTS "Items: delete same clinic"        ON handover_items;
DROP POLICY IF EXISTS "Comments: read same clinic"       ON item_comments;
DROP POLICY IF EXISTS "Comments: insert same clinic"     ON item_comments;
DROP POLICY IF EXISTS "Logs: read same clinic"           ON item_activity_logs;
DROP POLICY IF EXISTS "Logs: insert same clinic"         ON item_activity_logs;

-- STEP 3: Re-create all policies using get_my_clinic_id() — no recursion

-- CLINICS
CREATE POLICY "Clinic: read own"
  ON clinics FOR SELECT
  USING (id = public.get_my_clinic_id());

-- PROFILES: allow reading own profile + teammates
CREATE POLICY "Profiles: read own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Profiles: read teammates"
  ON profiles FOR SELECT
  USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Profiles: insert own"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Profiles: update own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- BRANCHES
CREATE POLICY "Branches: read same clinic"
  ON branches FOR SELECT
  USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Branches: insert own clinic"
  ON branches FOR INSERT
  WITH CHECK (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Branches: update own clinic"
  ON branches FOR UPDATE
  USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Branches: delete own clinic"
  ON branches FOR DELETE
  USING (clinic_id = public.get_my_clinic_id());

-- HANDOVER ITEMS
CREATE POLICY "Items: read same clinic"
  ON handover_items FOR SELECT
  USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Items: insert same clinic"
  ON handover_items FOR INSERT
  WITH CHECK (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Items: update same clinic"
  ON handover_items FOR UPDATE
  USING (clinic_id = public.get_my_clinic_id());

CREATE POLICY "Items: delete same clinic"
  ON handover_items FOR DELETE
  USING (clinic_id = public.get_my_clinic_id());

-- ITEM COMMENTS
CREATE POLICY "Comments: read same clinic"
  ON item_comments FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM handover_items WHERE clinic_id = public.get_my_clinic_id()
    )
  );

CREATE POLICY "Comments: insert same clinic"
  ON item_comments FOR INSERT
  WITH CHECK (
    item_id IN (
      SELECT id FROM handover_items WHERE clinic_id = public.get_my_clinic_id()
    )
  );

-- ACTIVITY LOGS
CREATE POLICY "Logs: read same clinic"
  ON item_activity_logs FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM handover_items WHERE clinic_id = public.get_my_clinic_id()
    )
  );

CREATE POLICY "Logs: insert same clinic"
  ON item_activity_logs FOR INSERT
  WITH CHECK (
    item_id IN (
      SELECT id FROM handover_items WHERE clinic_id = public.get_my_clinic_id()
    )
  );

-- ─── 4. UPDATED AUTO-CREATE PROFILE + CLINIC ON SIGN UP ────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  target_clinic_id UUID;
  clinic_name   TEXT;
  user_role     TEXT;
  user_branch_id UUID;
BEGIN
  -- Parse from user metadata
  IF NEW.raw_user_meta_data->>'clinic_id' IS NOT NULL AND (NEW.raw_user_meta_data->>'clinic_id') <> '' THEN
    target_clinic_id := (NEW.raw_user_meta_data->>'clinic_id')::UUID;
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'receptionist');
    IF NEW.raw_user_meta_data->>'branch_id' IS NOT NULL AND (NEW.raw_user_meta_data->>'branch_id') <> '' THEN
      user_branch_id := (NEW.raw_user_meta_data->>'branch_id')::UUID;
    ELSE
      user_branch_id := NULL;
    END IF;
  ELSE
    -- Owner Sign Up
    clinic_name := COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'My Clinic');
    INSERT INTO public.clinics (name, owner_id)
    VALUES (clinic_name, NEW.id)
    RETURNING id INTO target_clinic_id;
    
    user_role := 'owner';
    user_branch_id := NULL;
  END IF;

  -- Create the profile row
  INSERT INTO public.profiles (id, clinic_id, email, name, role, branch_id)
  VALUES (
    NEW.id,
    target_clinic_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    user_role,
    user_branch_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
