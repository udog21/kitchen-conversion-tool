# Analytics Data Migration Guide

This guide explains how to migrate `conversion_events` and `tab_visits` data from Replit/Neon to Supabase.

## Prerequisites

- Exported JSON data from Replit for `conversion_events` and `tab_visits` tables
- Access to Supabase SQL Editor
- Node.js installed (for running the transformation script)

## Step 1: Export Data from Replit

1. Open your Replit project
2. Navigate to your database (Neon dashboard or Replit database tool)
3. Export both tables as **JSON** format:
   - `conversion_events`
   - `tab_visits`
4. Save the exported files (e.g., `conversion_events.json`, `tab_visits.json`)

**Important:** Use JSON format, not CSV, because:
- JSON preserves JSONB field structures (input_value, output_value, user_context)
- CSV would require complex escaping and could lose nested JSON structure
- JSON maintains data types and null values correctly

## Step 2: Prepare Data Files

You can either:

**Option A: Separate files**
- Keep `conversion_events.json` and `tab_visits.json` as separate files

**Option B: Combined file**
- Combine both into a single JSON file:
  ```json
  {
    "conversion_events": [...],
    "tab_visits": [...]
  }
  ```

**Option C: Single array**
- If you only have one table, use the array directly:
  ```json
  [...]
  ```

## Step 3: Transform to SQL

Use the transformation script to convert JSON to SQL INSERT statements:

```bash
# For separate files (run twice)
tsx scripts/transform-analytics-data.ts conversion_events.json conversion_events.sql
tsx scripts/transform-analytics-data.ts tab_visits.json tab_visits.sql

# For combined file
tsx scripts/transform-analytics-data.ts combined-data.json migration.sql

# If you want to preserve original IDs (not recommended)
tsx scripts/transform-analytics-data.ts data.json output.sql --preserve-ids
```

**Options:**
- Default: Generates new UUIDs for all records (recommended)
- `--preserve-ids`: Keeps original IDs from Replit (only use if you need exact ID matching)

## Step 4: Review Generated SQL

Open the generated `.sql` file and review:

1. **Check record counts** - Verify the number of records matches your export
2. **Check JSONB fields** - Ensure `input_value`, `output_value`, and `user_context` are properly formatted
3. **Check timestamps** - Verify `created_at` and `visited_at` are in ISO format
4. **Check nullable fields** - Ensure NULL values are handled correctly

## Step 5: Import to Supabase

**Option A: Direct Database Connection (Recommended for Large Datasets)**

If your SQL file is too large for Supabase's SQL Editor (>5000 rows), use the direct migration script:

```bash
# Basic usage
npm run migrate:direct conversion_events.json

# With custom batch size (default: 100)
npm run migrate:direct conversion_events.json --batch-size=200

# Clear existing data before inserting
npm run migrate:direct conversion_events.json --clear-first
```

This script:
- Connects directly to Supabase using your `DATABASE_URL`
- Inserts data in batches to avoid timeouts
- Shows progress as it migrates
- Handles JSONB fields correctly
- Verifies the migration at the end

**Option B: SQL Editor (For Smaller Datasets)**

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. **Optional:** If you want to clear existing data first, add these lines at the top:
   ```sql
   TRUNCATE TABLE conversion_events CASCADE;
   TRUNCATE TABLE tab_visits CASCADE;
   ```
4. Copy and paste the SQL content from your generated file
5. Click **Run** to execute

**Note:** SQL Editor has size limits. For large datasets (>5000 records), use Option A.

## Step 6: Verify Migration

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check record counts
SELECT COUNT(*) as conversion_events_count FROM conversion_events;
SELECT COUNT(*) as tab_visits_count FROM tab_visits;

-- Check date ranges
SELECT 
  MIN(created_at) as earliest_conversion,
  MAX(created_at) as latest_conversion
FROM conversion_events;

SELECT 
  MIN(visited_at) as earliest_visit,
  MAX(visited_at) as latest_visit
FROM tab_visits;

-- Spot-check a few records
SELECT * FROM conversion_events ORDER BY created_at DESC LIMIT 5;
SELECT * FROM tab_visits ORDER BY visited_at DESC LIMIT 5;

-- Verify JSONB fields
SELECT 
  tab_name,
  jsonb_typeof(input_value) as input_type,
  jsonb_typeof(output_value) as output_type,
  jsonb_typeof(user_context) as context_type
FROM conversion_events 
LIMIT 10;
```

## Troubleshooting

### Issue: JSON parse error
**Solution:** Ensure your exported JSON file is valid. You can validate it with:
```bash
node -e "JSON.parse(require('fs').readFileSync('your-file.json', 'utf-8'))"
```

### Issue: SQL syntax errors
**Solution:** Check for:
- Unescaped single quotes in text fields
- Invalid JSONB formatting
- Date format issues

### Issue: Duplicate key errors
**Solution:** 
- If using `--preserve-ids`, ensure IDs don't conflict with existing data
- Recommended: Don't use `--preserve-ids` and let Supabase generate new UUIDs

### Issue: JSONB field errors
**Solution:** Ensure the exported JSON contains valid JSON objects/arrays for JSONB fields, not strings

## Data Structure Reference

### conversion_events
- `tab_name` (varchar, required)
- `conversion_type` (varchar, nullable)
- `input_value` (jsonb, required)
- `output_value` (jsonb, nullable)
- `created_at` (timestamp, auto-generated or preserved)
- `session_id` (varchar, nullable)
- `user_context` (jsonb, nullable)

### tab_visits
- `tab_name` (varchar, required)
- `visited_at` (timestamp, auto-generated or preserved)
- `session_id` (varchar, nullable)
- `user_context` (jsonb, nullable)

## Notes

- **Timestamps**: Original timestamps are preserved to maintain historical accuracy
- **IDs**: By default, new UUIDs are generated (recommended for clean migration)
- **JSONB**: All JSONB fields are properly escaped and formatted for PostgreSQL
- **Batch Size**: The script generates all INSERT statements in one file. For very large datasets (>100k records), consider splitting into batches

