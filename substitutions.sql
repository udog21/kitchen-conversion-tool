-- Data Migration
-- Generated from: substitutions.json
-- Generated at: 2025-11-06T03:07:18.971Z
-- Records: 0 conversion events, 0 tab visits, 0 conversion ratios, 0 ingredients, 20 substitutions

-- IMPORTANT: Review this SQL before running in Supabase!
-- If you want to clear existing data first, uncomment the following lines:
-- TRUNCATE TABLE substitution_recipes CASCADE;

-- Substitution Recipes (20 records)
-- Note: Transformed from exported format to match schema
INSERT INTO substitution_recipes (id, name, base_amount, base_unit, substitutes, instructions, fidelity, special_instructions) VALUES
  ('04ed54f2-3a0a-477b-a213-082e11993bd1', 'Butter → Vegetable oil', 3/4, 'unit', '[{"amount":"3/4 amount","unit":"unit","ingredient":"Vegetable oil"}]'::jsonb, 'Reduce liquid slightly', 'near', 'Reduce liquid slightly'),
  ('165aff18-377a-4fbe-b4da-c26092056c64', 'Vanilla extract → Almond extract', 1/2, 'unit', '[{"amount":"1/2 amount","unit":"unit","ingredient":"Almond extract"}]'::jsonb, 'Stronger flavor', 'near', 'Stronger flavor'),
  ('19ccd0e6-0929-4acf-b748-c9b6cbcd6bee', 'Sour cream → Greek yogurt', 1, 'unit', '[{"amount":"1:1","unit":"unit","ingredient":"Greek yogurt"}]'::jsonb, 'Plain yogurt works best', 'near', 'Plain yogurt works best'),
  ('1f4fab84-88f1-4be3-9205-3e5cd03285a2', 'Heavy cream → Milk + butter', 3/4, 'cup', '[{"amount":"3/4 cup milk + 1/4 cup butter","unit":"unit","ingredient":"Milk + butter"}]'::jsonb, 'Mix well', 'near', 'Mix well'),
  ('1f620c3b-9191-411e-b6b1-cce10eef17a7', 'Sugar (granulated) → Honey', 3/4, 'unit', '[{"amount":"3/4 amount","unit":"unit","ingredient":"Honey"}]'::jsonb, 'Reduce liquid by 1/4 cup', 'near', 'Reduce liquid by 1/4 cup'),
  ('213175ea-7dc5-4342-a410-8513f773ad00', 'Eggs → Flax eggs', 1, 'tbsp', '[{"amount":"1 tbsp ground flax + 3 tbsp water","unit":"unit","ingredient":"Flax eggs"}]'::jsonb, 'Let sit 5 minutes per egg', 'near', 'Let sit 5 minutes per egg'),
  ('24c324e6-4ba3-43a5-9fc3-bf04dbdaa6d0', 'Brown sugar (packed) → Sugar + molasses', 1, 'cup', '[{"amount":"1 cup sugar + 1-2 tbsp molasses","unit":"unit","ingredient":"Sugar + molasses"}]'::jsonb, 'Mix thoroughly', 'near', 'Mix thoroughly'),
  ('50be2b4b-c6ea-4c3f-950f-75a45dc3c884', 'Baking powder → Baking soda + cream of tartar', 1/4, 'tsp', '[{"amount":"1/4 tsp soda + 1/2 tsp cream of tartar","unit":"unit","ingredient":"Baking soda + cream of tartar"}]'::jsonb, 'For 1 tsp baking powder', 'near', 'For 1 tsp baking powder'),
  ('53339252-25c3-4da3-b5b2-fc1ccd3d80fa', 'Buttermilk → Milk + lemon juice', 1, 'cup', '[{"amount":"1 cup milk + 1 tbsp lemon juice","unit":"unit","ingredient":"Milk + lemon juice"}]'::jsonb, 'Let sit 5 minutes', 'near', 'Let sit 5 minutes'),
  ('7942b980-f351-45e3-aa88-05a0d3d9b430', 'Lemon juice → White vinegar', 1, 'unit', '[{"amount":"1:1","unit":"unit","ingredient":"White vinegar"}]'::jsonb, 'For acidity in baking', 'near', 'For acidity in baking'),
  ('7d08e879-a576-45aa-a5e7-89e388ad7ff1', 'Honey → Maple syrup', 1, 'unit', '[{"amount":"1:1","unit":"unit","ingredient":"Maple syrup"}]'::jsonb, 'Similar consistency', 'near', 'Similar consistency'),
  ('96bc00ad-5790-404f-9e6b-3c7fb45af1aa', 'Butter → Applesauce', 1/2, 'unit', '[{"amount":"1/2 amount","unit":"unit","ingredient":"Applesauce"}]'::jsonb, 'For healthier baking', 'near', 'For healthier baking'),
  ('9b2e6bb7-ca3c-4575-b0f0-af1694c2f61c', 'Cream cheese → Greek yogurt', 1, 'unit', '[{"amount":"1:1","unit":"unit","ingredient":"Greek yogurt"}]'::jsonb, 'Strain yogurt for thickness', 'near', 'Strain yogurt for thickness'),
  ('a1a5c7e0-9e14-4beb-8ebe-5aa27978553c', 'Milk (whole) → Buttermilk', 1, 'unit', '[{"amount":"1:1","unit":"unit","ingredient":"Buttermilk"}]'::jsonb, 'Add 1/4 tsp baking soda', 'near', 'Add 1/4 tsp baking soda'),
  ('a3f31cab-eb56-4a05-947d-933543231cc4', 'All-purpose flour → Cake flour', 1, 'cup', '[{"amount":"1 cup + 2 tbsp","unit":"unit","ingredient":"Cake flour"}]'::jsonb, 'For lighter texture', 'near', 'For lighter texture'),
  ('aa01aecf-b8a7-471b-b77a-ec3222655471', 'Sugar (granulated) → Brown sugar', 1, 'unit', '[{"amount":"1:1","unit":"unit","ingredient":"Brown sugar"}]'::jsonb, 'May affect color and flavor', 'near', 'May affect color and flavor'),
  ('b9a4c3b1-d1c7-4cbd-b5ff-d56ae993abea', 'Eggs → Applesauce', 1/4, 'cup', '[{"amount":"1/4 cup per egg","unit":"unit","ingredient":"Applesauce"}]'::jsonb, 'For binding in baking', 'near', 'For binding in baking'),
  ('cfdfe35a-6e72-4023-b12e-036c9841e6d2', 'Cake flour → All-purpose flour', 1, 'cup', '[{"amount":"1 cup - 2 tbsp","unit":"unit","ingredient":"All-purpose flour"}]'::jsonb, 'Add 2 tbsp cornstarch', 'near', 'Add 2 tbsp cornstarch'),
  ('d59bbb96-61f8-49fe-8dbf-f6c681fa478f', 'Eggs → Chia eggs', 1, 'tbsp', '[{"amount":"1 tbsp chia seeds + 3 tbsp water","unit":"unit","ingredient":"Chia eggs"}]'::jsonb, 'Let sit 15 minutes per egg', 'near', 'Let sit 15 minutes per egg'),
  ('f38f5b27-0dc0-490e-afe3-cd92ed8625c2', 'Maple syrup → Honey', 1, 'unit', '[{"amount":"1:1","unit":"unit","ingredient":"Honey"}]'::jsonb, 'Flavor will be different', 'near', 'Flavor will be different');

