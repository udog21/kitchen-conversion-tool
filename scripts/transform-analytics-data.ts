#!/usr/bin/env tsx
/**
 * Transform exported JSON data from Replit/Neon to SQL INSERT statements for Supabase
 * 
 * Usage:
 *   tsx scripts/transform-analytics-data.ts <input-file.json> <output-file.sql> [--preserve-ids]
 * 
 * Options:
 *   --preserve-ids: Keep original IDs instead of generating new ones
 */

import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'path';

interface ConversionEvent {
  id?: string;
  tab_name: string;
  conversion_type?: string | null;
  input_value: any; // JSONB
  output_value?: any | null; // JSONB
  created_at: string;
  session_id?: string | null;
  user_context?: any | null; // JSONB
}

interface TabVisit {
  id?: string;
  tab_name: string;
  visited_at: string;
  session_id?: string | null;
  user_context?: any | null; // JSONB
}

function escapeSqlString(str: string | null | undefined): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function formatJsonb(value: any): string {
  if (value === null || value === undefined) return 'NULL';
  // Convert to JSON string and escape single quotes for SQL
  const jsonString = JSON.stringify(value);
  return `'${jsonString.replace(/'/g, "''")}'::jsonb`;
}

function formatTimestamp(timestamp: string): string {
  if (!timestamp) return 'NULL';
  // Ensure it's in ISO format
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'NULL';
  return `'${date.toISOString()}'::timestamp`;
}

function generateConversionEventsSQL(events: ConversionEvent[], preserveIds: boolean): string {
  if (events.length === 0) return '-- No conversion events to import\n';

  let sql = `-- Conversion Events (${events.length} records)\n`;
  sql += `INSERT INTO conversion_events (`;
  
  if (preserveIds) {
    sql += `id, `;
  }
  
  sql += `tab_name, conversion_type, input_value, output_value, created_at, session_id, user_context) VALUES\n`;

  const values = events.map((event, index) => {
    const parts: string[] = [];
    
    if (preserveIds && event.id) {
      parts.push(escapeSqlString(event.id));
    }
    
    parts.push(
      escapeSqlString(event.tab_name),
      escapeSqlString(event.conversion_type),
      formatJsonb(event.input_value),
      formatJsonb(event.output_value),
      formatTimestamp(event.created_at),
      escapeSqlString(event.session_id),
      formatJsonb(event.user_context)
    );
    
    const comma = index < events.length - 1 ? ',' : ';';
    return `  (${parts.join(', ')})${comma}`;
  });

  sql += values.join('\n');
  sql += '\n\n';
  
  return sql;
}

function generateTabVisitsSQL(visits: TabVisit[], preserveIds: boolean): string {
  if (visits.length === 0) return '-- No tab visits to import\n';

  let sql = `-- Tab Visits (${visits.length} records)\n`;
  sql += `INSERT INTO tab_visits (`;
  
  if (preserveIds) {
    sql += `id, `;
  }
  
  sql += `tab_name, visited_at, session_id, user_context) VALUES\n`;

  const values = visits.map((visit, index) => {
    const parts: string[] = [];
    
    if (preserveIds && visit.id) {
      parts.push(escapeSqlString(visit.id));
    }
    
    parts.push(
      escapeSqlString(visit.tab_name),
      formatTimestamp(visit.visited_at),
      escapeSqlString(visit.session_id),
      formatJsonb(visit.user_context)
    );
    
    const comma = index < visits.length - 1 ? ',' : ';';
    return `  (${parts.join(', ')})${comma}`;
  });

  sql += values.join('\n');
  sql += '\n\n';
  
  return sql;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: tsx scripts/transform-analytics-data.ts <input-file.json> <output-file.sql> [--preserve-ids]');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1];
  const preserveIds = args.includes('--preserve-ids');

  console.log(`Reading data from: ${inputFile}`);
  console.log(`Output SQL file: ${outputFile}`);
  console.log(`Preserve IDs: ${preserveIds ? 'Yes' : 'No (generating new UUIDs)'}`);

  try {
    // Read and parse JSON file
    const jsonData = JSON.parse(readFileSync(inputFile, 'utf-8'));
    
    // Handle different JSON structures
    let conversionEvents: ConversionEvent[] = [];
    let tabVisits: TabVisit[] = [];

    if (Array.isArray(jsonData)) {
      // Single array - determine type by checking first element
      if (jsonData.length > 0) {
        const first = jsonData[0];
        if ('tab_name' in first && 'input_value' in first) {
          conversionEvents = jsonData as ConversionEvent[];
        } else if ('tab_name' in first && 'visited_at' in first) {
          tabVisits = jsonData as TabVisit[];
        }
      }
    } else if (typeof jsonData === 'object') {
      // Object with keys
      conversionEvents = jsonData.conversion_events || jsonData.conversionEvents || [];
      tabVisits = jsonData.tab_visits || jsonData.tabVisits || [];
    }

    // Generate SQL
    let sql = `-- Analytics Data Migration\n`;
    sql += `-- Generated from: ${inputFile}\n`;
    sql += `-- Generated at: ${new Date().toISOString()}\n`;
    sql += `-- Records: ${conversionEvents.length} conversion events, ${tabVisits.length} tab visits\n\n`;
    
    sql += `-- IMPORTANT: Review this SQL before running in Supabase!\n`;
    sql += `-- If you want to clear existing data first, uncomment the following lines:\n`;
    sql += `-- TRUNCATE TABLE conversion_events CASCADE;\n`;
    sql += `-- TRUNCATE TABLE tab_visits CASCADE;\n\n`;

    // Add conversion events
    if (conversionEvents.length > 0) {
      sql += generateConversionEventsSQL(conversionEvents, preserveIds);
    }

    // Add tab visits
    if (tabVisits.length > 0) {
      sql += generateTabVisitsSQL(tabVisits, preserveIds);
    }

    // Write to file
    writeFileSync(outputFile, sql, 'utf-8');

    console.log(`\n✓ Successfully generated SQL file!`);
    console.log(`  - Conversion events: ${conversionEvents.length}`);
    console.log(`  - Tab visits: ${tabVisits.length}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Review ${outputFile}`);
    console.log(`  2. Open Supabase SQL Editor`);
    console.log(`  3. Copy and paste the SQL content`);
    console.log(`  4. Run the migration`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

