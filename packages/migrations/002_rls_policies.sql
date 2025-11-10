-- DevCaddy Row Level Security Policies
-- Implements security policies for annotation_status and annotation tables

-- Enable Row Level Security on annotation_status table
ALTER TABLE annotation_status ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on annotation table
ALTER TABLE annotation ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read annotation statuses
CREATE POLICY "annotation_status_select_policy"
  ON annotation_status
  FOR SELECT
  USING (true);

-- Policy: Reviewers (client mode) can insert annotations
CREATE POLICY "reviewers_can_insert_annotations"
  ON annotation
  FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'type')::text = 'reviewer'
    OR (auth.jwt() ->> 'type')::text = 'developer'
  );

-- Policy: Reviewers can view their own annotations
CREATE POLICY "reviewers_can_view_own_annotations"
  ON annotation
  FOR SELECT
  USING (
    (auth.jwt() ->> 'type')::text = 'reviewer'
    AND created_by = auth.uid()::text
  );

-- Policy: Developers can view all annotations
CREATE POLICY "developers_can_view_all_annotations"
  ON annotation
  FOR SELECT
  USING (
    (auth.jwt() ->> 'type')::text = 'developer'
  );

-- Policy: Reviewers can update their own annotations
CREATE POLICY "reviewers_can_update_own_annotations"
  ON annotation
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'type')::text = 'reviewer'
    AND created_by = auth.uid()::text
  )
  WITH CHECK (
    (auth.jwt() ->> 'type')::text = 'reviewer'
    AND created_by = auth.uid()::text
  );

-- Policy: Developers can update all annotations
CREATE POLICY "developers_can_update_all_annotations"
  ON annotation
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'type')::text = 'developer'
  )
  WITH CHECK (
    (auth.jwt() ->> 'type')::text = 'developer'
  );

-- Policy: Reviewers can delete their own annotations
CREATE POLICY "reviewers_can_delete_own_annotations"
  ON annotation
  FOR DELETE
  USING (
    (auth.jwt() ->> 'type')::text = 'reviewer'
    AND created_by = auth.uid()::text
  );

-- Policy: Developers can delete all annotations
CREATE POLICY "developers_can_delete_all_annotations"
  ON annotation
  FOR DELETE
  USING (
    (auth.jwt() ->> 'type')::text = 'developer'
  );

-- Note: These policies assume JWT tokens contain:
-- - type: 'reviewer' | 'developer'
-- - uid: user identifier (used for created_by field)
--
-- For local development (developer mode):
-- JWT should have type='developer'
--
-- For magic link access (client mode):
-- JWT should have type='reviewer' and uid matching the user
