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

interface ConversionRatio {
  id?: string;
  from_unit: string;
  to_unit: string;
  ratio: string;
  system: string;
}

interface Ingredient {
  id?: string;
  name: string;
  density: string;
  category: string;
  source?: string | null;
}

// Exported JSON structure (different from schema)
interface ExportedSubstitution {
  id?: string;
  original_ingredient: string;
  substitute_ingredient: string;
  ratio: string;
  notes?: string | null;
  category?: string | null;
}

// Schema structure
interface SubstitutionRecipe {
  id?: string;
  name: string;
  base_amount: string;
  base_unit: string;
  substitutes: any; // JSONB
  instructions: string;
  fidelity: string;
  special_instructions?: string | null;
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

function formatDecimal(value: string | null | undefined): string {
  if (value === null || value === undefined) return 'NULL';
  // Convert fractions to decimals (e.g., "3/4" -> "0.75")
  const fractionMatch = value.trim().match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseFloat(fractionMatch[1]);
    const denominator = parseFloat(fractionMatch[2]);
    const decimal = (numerator / denominator).toFixed(4);
    return decimal;
  }
  return value;
}

function generateConversionRatiosSQL(ratios: ConversionRatio[], preserveIds: boolean): string {
  if (ratios.length === 0) return '-- No conversion ratios to import\n';

  let sql = `-- Conversion Ratios (${ratios.length} records)\n`;
  sql += `INSERT INTO conversion_ratios (`;
  
  if (preserveIds) {
    sql += `id, `;
  }
  
  sql += `from_unit, to_unit, ratio, system) VALUES\n`;

  const values = ratios.map((ratio, index) => {
    const parts: string[] = [];
    
    if (preserveIds && ratio.id) {
      parts.push(escapeSqlString(ratio.id));
    }
    
    parts.push(
      escapeSqlString(ratio.from_unit),
      escapeSqlString(ratio.to_unit),
      formatDecimal(ratio.ratio),
      escapeSqlString(ratio.system)
    );
    
    const comma = index < ratios.length - 1 ? ',' : ';';
    return `  (${parts.join(', ')})${comma}`;
  });

  sql += values.join('\n');
  sql += '\n\n';
  
  return sql;
}

function generateIngredientsSQL(ingredients: Ingredient[], preserveIds: boolean): string {
  if (ingredients.length === 0) return '-- No ingredients to import\n';

  let sql = `-- Ingredients (${ingredients.length} records)\n`;
  sql += `INSERT INTO ingredients (`;
  
  if (preserveIds) {
    sql += `id, `;
  }
  
  sql += `name, density, category, source) VALUES\n`;

  const values = ingredients.map((ingredient, index) => {
    const parts: string[] = [];
    
    if (preserveIds && ingredient.id) {
      parts.push(escapeSqlString(ingredient.id));
    }
    
    parts.push(
      escapeSqlString(ingredient.name),
      formatDecimal(ingredient.density),
      escapeSqlString(ingredient.category),
      escapeSqlString(ingredient.source)
    );
    
    const comma = index < ingredients.length - 1 ? ',' : ';';
    return `  (${parts.join(', ')})${comma}`;
  });

  sql += values.join('\n');
  sql += '\n\n';
  
  return sql;
}

function parseFractionToDecimal(fraction: string): string {
  const fractionMatch = fraction.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseFloat(fractionMatch[1]);
    const denominator = parseFloat(fractionMatch[2]);
    return (numerator / denominator).toFixed(4);
  }
  // If it's already a decimal, return as is
  if (!isNaN(parseFloat(fraction))) {
    return parseFloat(fraction).toFixed(4);
  }
  return "1.0000"; // Default fallback
}

function transformSubstitutionToRecipe(exported: ExportedSubstitution): SubstitutionRecipe {
  // Transform exported format to schema format
  const name = `${exported.original_ingredient} → ${exported.substitute_ingredient}`;
  
  // Parse ratio to extract amount and unit if possible
  // Default to "1" and "unit" if ratio is complex
  let baseAmount = "1.0000";
  let baseUnit = "unit";
  
  // Try to extract amount from ratio (e.g., "1 cup", "3/4 amount", "1:1")
  const ratioMatch = exported.ratio.match(/^(\d+(?:\/\d+)?)\s*(cup|tbsp|tsp|tablespoon|teaspoon|pint|quart|gallon|liter|mL|oz|ounce|lb|pound|amount)?/i);
  if (ratioMatch) {
    baseAmount = parseFractionToDecimal(ratioMatch[1].trim());
    if (ratioMatch[2] && ratioMatch[2].toLowerCase() !== 'amount') {
      baseUnit = ratioMatch[2].toLowerCase();
    }
  } else if (exported.ratio.match(/^1:1$/)) {
    baseAmount = "1.0000";
    baseUnit = "unit";
  }
  
  // Create substitutes JSONB array
  const substitutes = [{
    amount: exported.ratio,
    unit: "unit",
    ingredient: exported.substitute_ingredient
  }];
  
  return {
    name,
    base_amount: baseAmount,
    base_unit: baseUnit,
    substitutes,
    instructions: exported.notes || `Substitute ${exported.original_ingredient} with ${exported.substitute_ingredient}`,
    fidelity: "near",
    special_instructions: exported.notes || null
  };
}

function generateSubstitutionRecipesSQL(exported: ExportedSubstitution[], preserveIds: boolean): string {
  if (exported.length === 0) return '-- No substitution recipes to import\n';

  // Transform to schema format
  const recipes = exported.map(transformSubstitutionToRecipe);

  let sql = `-- Substitution Recipes (${recipes.length} records)\n`;
  sql += `-- Note: Transformed from exported format to match schema\n`;
  sql += `INSERT INTO substitution_recipes (`;
  
  if (preserveIds) {
    sql += `id, `;
  }
  
  sql += `name, base_amount, base_unit, substitutes, instructions, fidelity, special_instructions) VALUES\n`;

  const values = recipes.map((recipe, index) => {
    const parts: string[] = [];
    
    if (preserveIds && exported[index].id) {
      parts.push(escapeSqlString(exported[index].id));
    }
    
    parts.push(
      escapeSqlString(recipe.name),
      formatDecimal(recipe.base_amount),
      escapeSqlString(recipe.base_unit),
      formatJsonb(recipe.substitutes),
      escapeSqlString(recipe.instructions),
      escapeSqlString(recipe.fidelity),
      escapeSqlString(recipe.special_instructions)
    );
    
    const comma = index < recipes.length - 1 ? ',' : ';';
    return `  (${parts.join(', ')})${comma}`;
  });

  sql += values.join('\n');
  sql += '\n\n';
  
  return sql;
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
    let conversionRatios: ConversionRatio[] = [];
    let ingredients: Ingredient[] = [];
    let substitutions: ExportedSubstitution[] = [];

    if (Array.isArray(jsonData)) {
      // Single array - determine type by checking first element
      if (jsonData.length > 0) {
        const first = jsonData[0];
        if ('tab_name' in first && 'input_value' in first) {
          conversionEvents = jsonData as ConversionEvent[];
        } else if ('tab_name' in first && 'visited_at' in first) {
          tabVisits = jsonData as TabVisit[];
        } else if ('from_unit' in first && 'to_unit' in first && 'ratio' in first) {
          conversionRatios = jsonData as ConversionRatio[];
        } else if ('name' in first && 'density' in first && 'category' in first) {
          ingredients = jsonData as Ingredient[];
        } else if ('original_ingredient' in first && 'substitute_ingredient' in first) {
          substitutions = jsonData as ExportedSubstitution[];
        }
      }
    } else if (typeof jsonData === 'object') {
      // Object with keys
      conversionEvents = jsonData.conversion_events || jsonData.conversionEvents || [];
      tabVisits = jsonData.tab_visits || jsonData.tabVisits || [];
      conversionRatios = jsonData.conversion_ratios || jsonData.conversionRatios || [];
      ingredients = jsonData.ingredients || [];
      substitutions = jsonData.substitutions || jsonData.substitution_recipes || [];
    }

    // Generate SQL
    let sql = `-- Data Migration\n`;
    sql += `-- Generated from: ${inputFile}\n`;
    sql += `-- Generated at: ${new Date().toISOString()}\n`;
    sql += `-- Records: ${conversionEvents.length} conversion events, ${tabVisits.length} tab visits, ${conversionRatios.length} conversion ratios, ${ingredients.length} ingredients, ${substitutions.length} substitutions\n\n`;
    
    sql += `-- IMPORTANT: Review this SQL before running in Supabase!\n`;
    sql += `-- If you want to clear existing data first, uncomment the following lines:\n`;
    
    const tablesToTruncate: string[] = [];
    if (conversionEvents.length > 0) tablesToTruncate.push('conversion_events');
    if (tabVisits.length > 0) tablesToTruncate.push('tab_visits');
    if (conversionRatios.length > 0) tablesToTruncate.push('conversion_ratios');
    if (ingredients.length > 0) tablesToTruncate.push('ingredients');
    if (substitutions.length > 0) tablesToTruncate.push('substitution_recipes');
    
    tablesToTruncate.forEach(table => {
      sql += `-- TRUNCATE TABLE ${table} CASCADE;\n`;
    });
    sql += '\n';

    // Add conversion events
    if (conversionEvents.length > 0) {
      sql += generateConversionEventsSQL(conversionEvents, preserveIds);
    }

    // Add tab visits
    if (tabVisits.length > 0) {
      sql += generateTabVisitsSQL(tabVisits, preserveIds);
    }

    // Add conversion ratios
    if (conversionRatios.length > 0) {
      sql += generateConversionRatiosSQL(conversionRatios, preserveIds);
    }

    // Add ingredients
    if (ingredients.length > 0) {
      sql += generateIngredientsSQL(ingredients, preserveIds);
    }

    // Add substitution recipes
    if (substitutions.length > 0) {
      sql += generateSubstitutionRecipesSQL(substitutions, preserveIds);
    }

    // Write to file
    writeFileSync(outputFile, sql, 'utf-8');

    console.log(`\n✓ Successfully generated SQL file!`);
    console.log(`  - Conversion events: ${conversionEvents.length}`);
    console.log(`  - Tab visits: ${tabVisits.length}`);
    console.log(`  - Conversion ratios: ${conversionRatios.length}`);
    console.log(`  - Ingredients: ${ingredients.length}`);
    console.log(`  - Substitution recipes: ${substitutions.length}`);
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

