-- ============================================================================
-- Add timezone and preference tracking columns
-- ============================================================================
-- This migration:
-- 1. Adds timezone column to sessions and conversion_events
-- 2. Adds display_mode_set_to and measure_sys_set_to columns to sessions
-- 3. Backfills timezone from existing user_context/device_context JSONB data
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Add timezone column to sessions table
-- ============================================================================

ALTER TABLE sessions 
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);

-- ============================================================================
-- STEP 2: Add preference columns to sessions table
-- ============================================================================

ALTER TABLE sessions 
  ADD COLUMN IF NOT EXISTS display_mode_set_to VARCHAR(10),
  ADD COLUMN IF NOT EXISTS measure_sys_set_to VARCHAR(20);

-- ============================================================================
-- STEP 3: Add timezone column to conversion_events table
-- ============================================================================

ALTER TABLE conversion_events 
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);

-- ============================================================================
-- STEP 4: Backfill timezone from existing JSONB data
-- ============================================================================

-- Backfill sessions.timezone from device_context
UPDATE sessions
SET timezone = device_context->'timing'->>'timezone'
WHERE timezone IS NULL 
  AND device_context IS NOT NULL 
  AND device_context->'timing'->>'timezone' IS NOT NULL;

-- Backfill conversion_events.timezone from user_context
UPDATE conversion_events
SET timezone = user_context->'timing'->>'timezone'
WHERE timezone IS NULL 
  AND user_context IS NOT NULL 
  AND user_context->'timing'->>'timezone' IS NOT NULL;

-- ============================================================================
-- STEP 5: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sessions_timezone ON sessions(timezone);
CREATE INDEX IF NOT EXISTS idx_conversion_events_timezone ON conversion_events(timezone);
CREATE INDEX IF NOT EXISTS idx_sessions_display_mode ON sessions(display_mode_set_to);
CREATE INDEX IF NOT EXISTS idx_sessions_measure_sys ON sessions(measure_sys_set_to);

COMMIT;

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Check column additions
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('sessions', 'conversion_events')
  AND column_name IN ('timezone', 'display_mode_set_to', 'measure_sys_set_to')
ORDER BY table_name, column_name;

-- Check backfill results
SELECT 
  'sessions' as table_name,
  COUNT(*) as total_rows,
  COUNT(timezone) as rows_with_timezone,
  COUNT(*) - COUNT(timezone) as rows_without_timezone
FROM sessions

UNION ALL

SELECT 
  'conversion_events' as table_name,
  COUNT(*) as total_rows,
  COUNT(timezone) as rows_with_timezone,
  COUNT(*) - COUNT(timezone) as rows_without_timezone
FROM conversion_events;

-- Sample of backfilled timezone data
SELECT 
  session_id,
  timezone,
  display_mode_set_to,
  measure_sys_set_to,
  created_at
FROM sessions
WHERE timezone IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

