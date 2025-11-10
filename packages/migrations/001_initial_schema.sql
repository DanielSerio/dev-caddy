-- DevCaddy Initial Schema Migration
-- Creates annotation_status and annotation tables

-- Create annotation_status table
CREATE TABLE IF NOT EXISTS annotation_status (
  id SERIAL PRIMARY KEY,
  status_name VARCHAR(50) UNIQUE NOT NULL
);

-- Insert default annotation statuses
INSERT INTO annotation_status (status_name) VALUES
  ('new'),
  ('in-progress'),
  ('in-review'),
  ('hold'),
  ('resolved')
ON CONFLICT (status_name) DO NOTHING;

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
  status_id INTEGER NOT NULL REFERENCES annotation_status(id) ON DELETE RESTRICT,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_annotation_page ON annotation(page);
CREATE INDEX IF NOT EXISTS idx_annotation_status ON annotation(status_id);
CREATE INDEX IF NOT EXISTS idx_annotation_created_by ON annotation(created_by);
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
  -- If status is changing to 'resolved', set resolved_at
  IF NEW.status_id = (SELECT id FROM annotation_status WHERE status_name = 'resolved') THEN
    IF OLD.status_id IS NULL OR OLD.status_id != NEW.status_id THEN
      NEW.resolved_at = NOW();
    END IF;
  -- If status is changing away from 'resolved', clear resolved_at
  ELSIF OLD.status_id = (SELECT id FROM annotation_status WHERE status_name = 'resolved') THEN
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
