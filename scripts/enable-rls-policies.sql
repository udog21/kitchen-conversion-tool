-- Enable Row Level Security (RLS) for all tables
-- This script enables RLS and creates policies for public access
-- 
-- Note: If policies already exist, you may need to drop them first:
-- DROP POLICY IF EXISTS "Allow public inserts to conversion_events" ON conversion_events;
-- (Repeat for each policy)

-- Enable RLS on all tables
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_ratios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE substitution_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ANALYTICS TABLES (Allow public writes for analytics data)
-- ============================================================================

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Allow public inserts to conversion_events" ON conversion_events;
DROP POLICY IF EXISTS "Allow public reads from conversion_events" ON conversion_events;
DROP POLICY IF EXISTS "Allow public inserts to sessions" ON sessions;
DROP POLICY IF EXISTS "Allow public reads from sessions" ON sessions;
DROP POLICY IF EXISTS "Allow public updates to sessions" ON sessions;

-- Conversion Events: Allow public INSERT and SELECT
CREATE POLICY "Allow public inserts to conversion_events" 
ON conversion_events 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow public reads from conversion_events" 
ON conversion_events 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Sessions: Allow public INSERT, SELECT, and UPDATE
CREATE POLICY "Allow public inserts to sessions" 
ON sessions 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow public reads from sessions" 
ON sessions 
FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public updates to sessions" 
ON sessions 
FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PUBLIC DATA TABLES (Allow public reads only)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public reads from conversion_ratios" ON conversion_ratios;
DROP POLICY IF EXISTS "Allow public reads from ingredients" ON ingredients;
DROP POLICY IF EXISTS "Allow public reads from substitution_recipes" ON substitution_recipes;

-- Conversion Ratios: Allow public SELECT only
CREATE POLICY "Allow public reads from conversion_ratios" 
ON conversion_ratios 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Ingredients: Allow public SELECT only
CREATE POLICY "Allow public reads from ingredients" 
ON ingredients 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Substitution Recipes: Allow public SELECT only
CREATE POLICY "Allow public reads from substitution_recipes" 
ON substitution_recipes 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- ============================================================================
-- USERS TABLE (Restricted - for future authentication)
-- ============================================================================
-- Users table is restricted - no public access
-- When authentication is added, create policies for authenticated users only
-- Example:
-- CREATE POLICY "Users can read own profile" 
-- ON users 
-- FOR SELECT 
-- TO authenticated 
-- USING (auth.uid()::text = id);

