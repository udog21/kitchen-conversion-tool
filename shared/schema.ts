import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversionRatios = pgTable("conversion_ratios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUnit: text("from_unit").notNull(),
  toUnit: text("to_unit").notNull(),
  ratio: decimal("ratio", { precision: 10, scale: 6 }).notNull(),
  system: text("system").notNull(), // US, UK_METRIC, UK_IMPERIAL, AU_NZ, CA, EU
});

export const ingredients = pgTable("ingredients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  density: decimal("density", { precision: 8, scale: 4 }).notNull(), // grams per mL
  category: text("category").notNull(),
});

export const substitutions = pgTable("substitutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalIngredient: text("original_ingredient").notNull(),
  substituteIngredient: text("substitute_ingredient").notNull(),
  ratio: text("ratio").notNull(), // e.g., "1:1", "3/4 cup", "1 tbsp + 1 tsp"
  notes: text("notes"), // Optional additional guidance
  category: text("category").notNull(), // e.g., "Baking", "Dairy", "Sweeteners"
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConversionRatioSchema = createInsertSchema(conversionRatios).omit({
  id: true,
});

export const insertIngredientSchema = createInsertSchema(ingredients).omit({
  id: true,
});

export const insertSubstitutionSchema = createInsertSchema(substitutions).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ConversionRatio = typeof conversionRatios.$inferSelect;
export type InsertConversionRatio = z.infer<typeof insertConversionRatioSchema>;
export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Substitution = typeof substitutions.$inferSelect;
export type InsertSubstitution = z.infer<typeof insertSubstitutionSchema>;