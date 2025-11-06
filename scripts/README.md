# Database Seeding Scripts

## seed-database.sql

This SQL script seeds the Supabase database with initial data:

- **Conversion Ratios**: All unit conversion ratios for US, UK_METRIC, UK_IMPERIAL, AU_NZ, CA, and EU systems
- **Ingredients**: Common cooking ingredients with their densities
- **Substitution Recipes**: Ingredient substitution recipes

## How to Use

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `seed-database.sql`
4. Click **Run** to execute the script
5. The database will be populated with all seed data

## Important Notes

- This script is **idempotent** - running it multiple times will create duplicate entries
- If you need to re-seed, you should first clear the tables:
  ```sql
  TRUNCATE TABLE conversion_ratios, ingredients, substitution_recipes;
  ```
- After seeding, the application code will fetch data directly from the database - no auto-seeding occurs

## Verification

After running the script, verify the data was inserted:

```sql
SELECT COUNT(*) FROM conversion_ratios;  -- Should be ~300+ rows
SELECT COUNT(*) FROM ingredients;         -- Should be 15 rows
SELECT COUNT(*) FROM substitution_recipes; -- Should be 6 rows
```

