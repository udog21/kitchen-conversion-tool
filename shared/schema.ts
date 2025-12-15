import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamptz, jsonb, integer, boolean } from "drizzle-orm/pg-core";
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
  source: text("source"),
});

export const substitutionRecipes = pgTable("substitution_recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  baseAmount: decimal("base_amount", { precision: 10, scale: 4 }).notNull(),
  baseUnit: text("base_unit").notNull(),
  substitutes: jsonb("substitutes").notNull(), // Array of {amount, unit, ingredient}
  instructions: text("instructions").notNull(),
  fidelity: text("fidelity").notNull(), // "direct" | "near"
  specialInstructions: text("special_instructions"),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 100 }).notNull().unique(),
  deviceId: varchar("device_id", { length: 100 }),
  startedAt: timestamptz("started_at").defaultNow().notNull(),
  tabVisitCount: integer("tab_visit_count").default(0),
  uniqueTabsVisited: text("unique_tabs_visited").array(),
  conversionEventCount: integer("conversion_event_count").default(0),
  firstTab: varchar("first_tab", { length: 50 }),
  lastTab: varchar("last_tab", { length: 50 }),
  isReturningDevice: boolean("is_returning_device").default(false),
  deviceContext: jsonb("device_context"),
  timezone: varchar("timezone", { length: 50 }),
  displayModeSetTo: varchar("display_mode_set_to", { length: 10 }),
  displayModeChanges: jsonb("display_mode_changes"), // Array of {value, changed_at}
  measureSysSetTo: varchar("measure_sys_set_to", { length: 20 }),
  measureSysChanges: jsonb("measure_sys_changes"), // Array of {value, changed_at}
  createdAt: timestamptz("created_at").defaultNow().notNull(),
  updatedAt: timestamptz("updated_at").defaultNow().notNull(),
});

export const conversionEvents = pgTable("conversion_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tabName: varchar("tab_name", { length: 50 }).notNull(),
  conversionType: varchar("conversion_type", { length: 50 }),
  inputValue: jsonb("input_value").notNull(),
  outputValue: jsonb("output_value"),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
  sessionId: varchar("session_id", { length: 100 }),
  deviceId: varchar("device_id", { length: 100 }),
  timezone: varchar("timezone", { length: 50 }),
  userContext: jsonb("user_context"),
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

export const insertSubstitutionRecipeSchema = createInsertSchema(substitutionRecipes).omit({
  id: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  startedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversionEventSchema = createInsertSchema(conversionEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ConversionRatio = typeof conversionRatios.$inferSelect;
export type InsertConversionRatio = z.infer<typeof insertConversionRatioSchema>;
export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type SubstitutionRecipe = typeof substitutionRecipes.$inferSelect;
export type InsertSubstitutionRecipe = z.infer<typeof insertSubstitutionRecipeSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type ConversionEvent = typeof conversionEvents.$inferSelect;
export type InsertConversionEvent = z.infer<typeof insertConversionEventSchema>;