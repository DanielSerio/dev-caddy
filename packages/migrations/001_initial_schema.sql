-- DevCaddy Initial Schema Migration
-- Creates annotation table with simplified status handling
--
-- Note: We don't use a separate annotation_status table because:
-- 1. Status values are fixed and never change (new, in-progress, in-review, hold, resolved)
-- 2. TypeScript constants (ANNOTATION_STATUS) are the source of truth
-- 3. Simpler for users to set up - no need to seed reference data
-- 4. CHECK constraint provides data validation

-- Create annotation table
CREATE TABLE IF NOT EXISTS annotation (
  id SERIAL PRIMARY KEY,
  page VARCHAR(500) NOT NULL,
  element_tag VARCHAR(50) NOT NULL,
  compressed_element_tree TEXT NOT NULL,
  element_id VARCHAR(255),
  element_test_id VARCHAR(255),
  element_role VARCHAR(50),
  element_unique_classes VARCHAR(500),
  element_parent_selector VARCHAR(500),
  element_nth_child INTEGER,
  content TEXT NOT NULL,
  -- Status IDs: 1=new, 2=in-progress, 3=in-review, 4=hold, 5=resolved
  -- Defined in TypeScript as ANNOTATION_STATUS constant
  status_id INTEGER NOT NULL CHECK (status_id >= 1 AND status_id <= 5),
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Add helpful comment on status_id column
COMMENT ON COLUMN annotation.status_id IS 'Status: 1=new, 2=in-progress, 3=in-review, 4=hold, 5=resolved. Use ANNOTATION_STATUS constants from TypeScript.';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_annotation_page ON annotation(page);
CREATE INDEX IF NOT EXISTS idx_annotation_status ON annotation(status_id);
CREATE INDEX IF NOT EXISTS idx_annotation_created_by ON annotation(created_by);
CREATE INDEX IF NOT EXISTS idx_annotation_updated_by ON annotation(updated_by);
CREATE INDEX IF NOT EXISTS idx_annotation_created_at ON annotation(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on annotation changes
CREATE TRIGGER update_annotation_updated_at
  BEFORE UPDATE ON annotation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to set/unset resolved_at based on status
CREATE OR REPLACE FUNCTION manage_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is changing to 'resolved' (status_id = 5), set resolved_at
  IF NEW.status_id = 5 THEN
    IF OLD.status_id IS NULL OR OLD.status_id != 5 THEN
      NEW.resolved_at = NOW();
    END IF;
  -- If status is changing away from 'resolved', clear resolved_at
  ELSIF OLD.status_id = 5 AND NEW.status_id != 5 THEN
    NEW.resolved_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for resolved_at management
CREATE TRIGGER manage_annotation_resolved_at
  BEFORE INSERT OR UPDATE ON annotation
  FOR EACH ROW
  EXECUTE FUNCTION manage_resolved_at();
