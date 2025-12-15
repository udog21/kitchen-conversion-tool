-- Migration: Add preference change history columns to sessions table
-- This adds JSONB arrays to track all preference changes within a session
-- while keeping the final values in the existing columns for quick access

-- Add display_mode_changes column (JSONB array of {value, changed_at})
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS display_mode_changes JSONB DEFAULT NULL;

-- Add measure_sys_changes column (JSONB array of {value, changed_at})
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS measure_sys_changes JSONB DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN sessions.display_mode_changes IS 'Array of display mode changes: [{value: "light", changed_at: "2025-01-15T10:00:00Z"}, ...]';
COMMENT ON COLUMN sessions.measure_sys_changes IS 'Array of measurement system changes: [{value: "US", changed_at: "2025-01-15T10:00:00Z"}, ...]';

-- Create indexes for JSONB queries (optional but recommended for analytics)
CREATE INDEX IF NOT EXISTS idx_sessions_display_mode_changes ON sessions USING GIN (display_mode_changes);
CREATE INDEX IF NOT EXISTS idx_sessions_measure_sys_changes ON sessions USING GIN (measure_sys_changes);

-- Example queries you can run after this migration:
-- 
-- Count sessions with multiple display mode changes:
-- SELECT 
--   session_id,
--   jsonb_array_length(display_mode_changes) as change_count,
--   display_mode_set_to as final_value
-- FROM sessions
-- WHERE display_mode_changes IS NOT NULL
--   AND jsonb_array_length(display_mode_changes) > 1;
--
-- Get first and last change for each session:
-- SELECT 
--   session_id,
--   display_mode_changes->0->>'value' as first_value,
--   display_mode_changes->0->>'changed_at' as first_changed_at,
--   display_mode_changes->-1->>'value' as last_value,
--   display_mode_changes->-1->>'changed_at' as last_changed_at
-- FROM sessions
-- WHERE display_mode_changes IS NOT NULL
--   AND jsonb_array_length(display_mode_changes) > 0;

