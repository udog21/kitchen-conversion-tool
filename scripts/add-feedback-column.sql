-- Migration: Add feedback JSONB column to sessions table
-- This allows storing feedback submissions directly in the session record

-- Add feedback column (JSONB)
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS feedback JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN sessions.feedback IS 'Feedback submission: {submitted_at, message, page, rating?, contact_email?}';

-- Create index for JSONB queries (optional but recommended for analytics)
CREATE INDEX IF NOT EXISTS idx_sessions_feedback ON sessions USING GIN (feedback);

-- Example queries you can run after this migration:
-- 
-- Find all sessions with feedback:
-- SELECT 
--   session_id,
--   feedback->>'message' as message,
--   feedback->>'rating' as rating,
--   feedback->>'submitted_at' as submitted_at
-- FROM sessions
-- WHERE feedback IS NOT NULL;
--
-- Count feedback by rating:
-- SELECT 
--   feedback->>'rating' as rating,
--   COUNT(*) as count
-- FROM sessions
-- WHERE feedback IS NOT NULL
--   AND feedback->>'rating' IS NOT NULL
-- GROUP BY feedback->>'rating'
-- ORDER BY rating;

