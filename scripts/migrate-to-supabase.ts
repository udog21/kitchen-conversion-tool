#!/usr/bin/env tsx
/**
 * Migrate analytics data directly to Supabase using database connection
 * Handles large datasets by inserting in batches
 * 
 * Usage:
 *   tsx scripts/migrate-to-supabase.ts <input-file.json> [--batch-size=100] [--clear-first]
 * 
 * Options:
 *   --batch-size=N: Number of records per batch (default: 100)
 *   --clear-first: Clear existing data before inserting
 */

import { readFileSync } from 'fs';
import { config } from 'dotenv';
config(); // Loads .env file from current directory
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { conversionEvents, tabVisits } from '../shared/schema.js';

interface ConversionEvent {
  id?: string;
  tab_name: string;
  conversion_type?: string | null;
  input_value: any;
  output_value?: any | null;
  created_at: string;
  session_id?: string | null;
  user_context?: any | null;
}

interface TabVisit {
  id?: string;
  tab_name: string;
  visited_at: string;
  session_id?: string | null;
  user_context?: any | null;
}

async function migrateConversionEvents(
  sql: ReturnType<typeof postgres>,
  events: ConversionEvent[],
  batchSize: number
): Promise<void> {
  console.log(`\nMigrating ${events.length} conversion events in batches of ${batchSize}...`);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(events.length / batchSize);

    try {
      // Insert each record in the batch
      for (const event of batch) {
        await sql`
          INSERT INTO conversion_events (
            tab_name, conversion_type, input_value, output_value, 
            created_at, session_id, user_context
          )
          VALUES (
            ${event.tab_name},
            ${event.conversion_type ?? null},
            ${JSON.stringify(event.input_value)}::jsonb,
            ${event.output_value ? JSON.stringify(event.output_value) : null}::jsonb,
            ${new Date(event.created_at)},
            ${event.session_id ?? null},
            ${event.user_context ? JSON.stringify(event.user_context) : null}::jsonb
          )
          ON CONFLICT DO NOTHING
        `;
      }

      inserted += batch.length;
      process.stdout.write(
        `\r  Batch ${batchNum}/${totalBatches}: ${inserted}/${events.length} inserted`
      );
    } catch (error: any) {
      errors++;
      console.error(`\n  Error in batch ${batchNum}: ${error.message}`);
      // Continue with next batch
    }
  }

  console.log(`\n✓ Conversion events: ${inserted} inserted, ${errors} errors`);
}

async function migrateTabVisits(
  sql: ReturnType<typeof postgres>,
  visits: TabVisit[],
  batchSize: number
): Promise<void> {
  if (visits.length === 0) {
    console.log('\nNo tab visits to migrate.');
    return;
  }

  console.log(`\nMigrating ${visits.length} tab visits in batches of ${batchSize}...`);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < visits.length; i += batchSize) {
    const batch = visits.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(visits.length / batchSize);

    try {
      // Insert each record in the batch
      for (const visit of batch) {
        await sql`
          INSERT INTO tab_visits (
            tab_name, visited_at, session_id, user_context
          )
          VALUES (
            ${visit.tab_name},
            ${new Date(visit.visited_at)},
            ${visit.session_id ?? null},
            ${visit.user_context ? JSON.stringify(visit.user_context) : null}::jsonb
          )
          ON CONFLICT DO NOTHING
        `;
      }

      inserted += batch.length;
      process.stdout.write(
        `\r  Batch ${batchNum}/${totalBatches}: ${inserted}/${visits.length} inserted`
      );
    } catch (error: any) {
      errors++;
      console.error(`\n  Error in batch ${batchNum}: ${error.message}`);
      // Continue with next batch
    }
  }

  console.log(`\n✓ Tab visits: ${inserted} inserted, ${errors} errors`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: tsx scripts/migrate-to-supabase.ts <input-file.json> [--batch-size=N] [--clear-first]');
    console.error('\nOptions:');
    console.error('  --batch-size=N    Number of records per batch (default: 100)');
    console.error('  --clear-first     Clear existing data before inserting');
    process.exit(1);
  }

  const inputFile = args[0];
  const batchSizeArg = args.find((arg) => arg.startsWith('--batch-size='));
  const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 100;
  const clearFirst = args.includes('--clear-first');

  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is required');
    console.error('Set it in your .env file or environment');
    process.exit(1);
  }

  console.log('Reading data from:', inputFile);
  console.log('Batch size:', batchSize);
  console.log('Clear existing data:', clearFirst ? 'Yes' : 'No');

  try {
    // Read and parse JSON file
    const jsonData = JSON.parse(readFileSync(inputFile, 'utf-8'));

    // Handle different JSON structures
    let conversionEventsData: ConversionEvent[] = [];
    let tabVisitsData: TabVisit[] = [];

    if (Array.isArray(jsonData)) {
      // Single array - determine type by checking first element
      if (jsonData.length > 0) {
        const first = jsonData[0];
        if ('tab_name' in first && 'input_value' in first) {
          conversionEventsData = jsonData as ConversionEvent[];
        } else if ('tab_name' in first && 'visited_at' in first) {
          tabVisitsData = jsonData as TabVisit[];
        }
      }
    } else if (typeof jsonData === 'object') {
      // Object with keys
      conversionEventsData = jsonData.conversion_events || jsonData.conversionEvents || [];
      tabVisitsData = jsonData.tab_visits || jsonData.tabVisits || [];
    }

    console.log(`\nFound:`);
    console.log(`  - Conversion events: ${conversionEventsData.length}`);
    console.log(`  - Tab visits: ${tabVisitsData.length}`);

    if (conversionEventsData.length === 0 && tabVisitsData.length === 0) {
      console.error('No data found to migrate');
      process.exit(1);
    }

    // Connect to Supabase
    console.log('\nConnecting to Supabase...');
    const sql = postgres(process.env.DATABASE_URL, {
      max: 1, // Single connection for migration
      idle_timeout: 20,
      connect_timeout: 10,
    });

    // Clear existing data if requested
    if (clearFirst) {
      console.log('\nClearing existing data...');
      if (conversionEventsData.length > 0) {
        await sql`TRUNCATE TABLE conversion_events CASCADE`;
        console.log('  ✓ Cleared conversion_events');
      }
      if (tabVisitsData.length > 0) {
        await sql`TRUNCATE TABLE tab_visits CASCADE`;
        console.log('  ✓ Cleared tab_visits');
      }
    }

    // Migrate conversion events
    if (conversionEventsData.length > 0) {
      await migrateConversionEvents(sql, conversionEventsData, batchSize);
    }

    // Migrate tab visits
    if (tabVisitsData.length > 0) {
      await migrateTabVisits(sql, tabVisitsData, batchSize);
    }

    // Verify
    console.log('\nVerifying migration...');
    const eventCount = await sql`SELECT COUNT(*) FROM conversion_events`;
    const visitCount = await sql`SELECT COUNT(*) FROM tab_visits`;
    console.log(`  Conversion events in database: ${eventCount[0].count}`);
    console.log(`  Tab visits in database: ${visitCount[0].count}`);

    // Close connection
    await sql.end();

    console.log('\n✓ Migration complete!');
  } catch (error: any) {
    console.error('\nError:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();

