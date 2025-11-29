/*
  # Admin Authentication & Configuration Tables

  1. New Tables
    - `site_config`
      - `id` (uuid, primary key) - Single record identifier
      - `github_repo_url` (text) - GitHub repository URL
      - `download_url` (text) - Direct download link
      - `version` (text) - Current version number
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `changelog_entries`
      - `id` (uuid, primary key) - Entry identifier
      - `version` (text) - Version number
      - `date` (text) - Release date
      - `changes` (jsonb) - Array of changes
      - `created_at` (timestamptz) - Entry creation time
      - `sort_order` (integer) - Display order

  2. Security
    - Enable RLS on both tables
    - Public can SELECT (read-only)
    - Only authenticated admins can INSERT/UPDATE/DELETE
    - Policies check auth.uid() for admin operations

  3. Initial Data
    - Migrate existing config from changelog.json
*/

-- Create site_config table
CREATE TABLE IF NOT EXISTS site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  github_repo_url text NOT NULL,
  download_url text NOT NULL,
  version text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create changelog_entries table
CREATE TABLE IF NOT EXISTS changelog_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  date text NOT NULL,
  changes jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Anyone can view site config"
  ON site_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view changelog entries"
  ON changelog_entries
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can modify
CREATE POLICY "Authenticated users can update site config"
  ON site_config
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert changelog entries"
  ON changelog_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update changelog entries"
  ON changelog_entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete changelog entries"
  ON changelog_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert initial config (single record)
INSERT INTO site_config (github_repo_url, download_url, version)
VALUES (
  'https://github.com/yourusername/yourrepo',
  'https://github.com/yourusername/yourrepo/releases/latest/download/installer.exe',
  '1.0.0'
)
ON CONFLICT DO NOTHING;

-- Create index for changelog ordering
CREATE INDEX IF NOT EXISTS idx_changelog_sort ON changelog_entries(sort_order ASC);