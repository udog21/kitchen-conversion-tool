import { type User, type InsertUser, type ConversionRatio, type InsertConversionRatio, type Ingredient, type InsertIngredient, type SubstitutionRecipe, type InsertSubstitutionRecipe, type TabVisit, type InsertTabVisit, type ConversionEvent, type InsertConversionEvent, users, conversionRatios, ingredients, substitutionRecipes, tabVisits, conversionEvents } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getConversionRatio(fromUnit: string, toUnit: string, system?: string): Promise<ConversionRatio | undefined>;
  getAllConversionRatios(): Promise<ConversionRatio[]>;
  createConversionRatio(ratio: InsertConversionRatio): Promise<ConversionRatio>;
  getIngredient(name: string): Promise<Ingredient | undefined>;
  getAllIngredients(): Promise<Ingredient[]>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  getAllSubstitutionRecipes(): Promise<SubstitutionRecipe[]>;
  createSubstitutionRecipe(recipe: InsertSubstitutionRecipe): Promise<SubstitutionRecipe>;
  trackTabVisit(visit: InsertTabVisit): Promise<TabVisit>;
  trackConversionEvent(event: InsertConversionEvent): Promise<ConversionEvent>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversionRatios: Map<string, ConversionRatio>;
  private ingredients: Map<string, Ingredient>;
  private substitutionRecipes: Map<string, SubstitutionRecipe>;
  private tabVisitsData: TabVisit[];
  private conversionEventsData: ConversionEvent[];

  constructor() {
    this.users = new Map();
    this.conversionRatios = new Map();
    this.ingredients = new Map();
    this.substitutionRecipes = new Map();
    this.tabVisitsData = [];
    this.conversionEventsData = [];
    this.seedConversionRatios();
    this.seedIngredients();
    this.seedSubstitutionRecipes();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getConversionRatio(fromUnit: string, toUnit: string, system: string = "US"): Promise<ConversionRatio | undefined> {
    const key = `${system}-${fromUnit}-${toUnit}`;
    return this.conversionRatios.get(key);
  }

  async getAllConversionRatios(): Promise<ConversionRatio[]> {
    return Array.from(this.conversionRatios.values());
  }

  async createConversionRatio(insertRatio: InsertConversionRatio): Promise<ConversionRatio> {
    const id = randomUUID();
    const ratio: ConversionRatio = { ...insertRatio, id };
    const key = `${insertRatio.system}-${insertRatio.fromUnit}-${insertRatio.toUnit}`;
    this.conversionRatios.set(key, ratio);
    return ratio;
  }

  async seedConversionRatios(): Promise<void> {
    // System definitions based on CSV data (cup, tablespoon, teaspoon in mL)
    const systems = {
      US: {
        teaspoon: 4.93,
        tablespoon: 14.79,
        cup: 236.6,
        pint: 473,
        quart: 946.353,
        gallon: 3785,
        mL: 1,
        liter: 1000,
      },
      UK_METRIC: {
        teaspoon: 5,
        tablespoon: 15,
        cup: 240,
        mL: 1,
        liter: 1000,
      },
      UK_IMPERIAL: {
        teaspoon: 5,
        tablespoon: 15,
        cup: 284,
        pint: 568,
        quart: 1136.5,
        gallon: 4546,
        mL: 1,
        liter: 1000,
      },
      AU_NZ: {
        teaspoon: 5,
        tablespoon: 20,
        cup: 250,
        pint: 500,
        quart: 1000,
        gallon: 4000,
        mL: 1,
        liter: 1000,
      },
      CA: {
        teaspoon: 5,
        tablespoon: 15,
        cup: 250,
        pint: 500,
        quart: 1000,
        gallon: 4000,
        mL: 1,
        liter: 1000,
      },
      EU: {
        teaspoon: 5,
        tablespoon: 15,
        cup: 250,
        pint: 500,
        quart: 1000,
        gallon: 4000,
        mL: 1,
        liter: 1000,
      },
    };

    for (const [systemName, conversionsToMl] of Object.entries(systems)) {
      const units = Object.keys(conversionsToMl);
      
      for (const fromUnit of units) {
        for (const toUnit of units) {
          if (fromUnit !== toUnit) {
            const fromMl = conversionsToMl[fromUnit as keyof typeof conversionsToMl];
            const toMl = conversionsToMl[toUnit as keyof typeof conversionsToMl];
            const ratio = fromMl / toMl;
            
            await this.createConversionRatio({
              fromUnit,
              toUnit,
              ratio: ratio.toString(),
              system: systemName,
            });
          }
        }
      }
    }
  }

  async getIngredient(name: string): Promise<Ingredient | undefined> {
    return this.ingredients.get(name.toLowerCase());
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values());
  }

  async createIngredient(insertIngredient: InsertIngredient): Promise<Ingredient> {
    const id = randomUUID();
    const ingredient: Ingredient = { 
      ...insertIngredient, 
      id,
      source: insertIngredient.source ?? null
    };
    this.ingredients.set(ingredient.name.toLowerCase(), ingredient);
    return ingredient;
  }

  async seedIngredients(): Promise<void> {
    // Common ingredients with their densities (grams per mL)
    const commonIngredients = [
      { name: "Water", density: "1.0000", category: "Liquids" },
      { name: "All-purpose flour", density: "0.5000", category: "Dry Goods" },
      { name: "Sugar (granulated)", density: "0.8000", category: "Sweeteners" },
      { name: "Brown sugar (packed)", density: "0.9000", category: "Sweeteners" },
      { name: "Butter", density: "0.9110", category: "Fats" },
      { name: "Vegetable oil", density: "0.9200", category: "Fats" },
      { name: "Milk (whole)", density: "1.0300", category: "Liquids" },
      { name: "Heavy cream", density: "0.9940", category: "Liquids" },
      { name: "Honey", density: "1.4200", category: "Sweeteners" },
      { name: "Maple syrup", density: "1.3200", category: "Sweeteners" },
      { name: "Salt (table)", density: "2.1600", category: "Seasonings" },
      { name: "Baking powder", density: "0.9000", category: "Leavening" },
      { name: "Baking soda", density: "2.2000", category: "Leavening" },
      { name: "Cocoa powder", density: "0.4000", category: "Dry Goods" },
      { name: "Rice (uncooked)", density: "0.7500", category: "Grains" },
    ];

    for (const ingredient of commonIngredients) {
      await this.createIngredient(ingredient);
    }
  }

  async getAllSubstitutionRecipes(): Promise<SubstitutionRecipe[]> {
    return Array.from(this.substitutionRecipes.values());
  }

  async createSubstitutionRecipe(insertRecipe: InsertSubstitutionRecipe): Promise<SubstitutionRecipe> {
    const id = randomUUID();
    const recipe: SubstitutionRecipe = { 
      ...insertRecipe, 
      id,
      specialInstructions: insertRecipe.specialInstructions ?? null 
    };
    this.substitutionRecipes.set(insertRecipe.name.toLowerCase(), recipe);
    return recipe;
  }

  async seedSubstitutionRecipes(): Promise<void> {
    const recipes: InsertSubstitutionRecipe[] = [
      {
        name: "baking powder",
        baseAmount: "1",
        baseUnit: "teaspoon",
        substitutes: [
          { amount: 0.25, unit: "teaspoon", ingredient: "baking soda" },
          { amount: 0.5, unit: "teaspoon", ingredient: "cream of tartar" },
        ],
        instructions: "Mix ingredients thoroughly.",
        fidelity: "direct",
      },
      {
        name: "buttermilk",
        baseAmount: "1",
        baseUnit: "cup",
        substitutes: [
          { amount: 1, unit: "cup", ingredient: "whole milk" },
          { amount: 1, unit: "tablespoon", ingredient: "lemon juice" },
        ],
        instructions: "Mix ingredients thoroughly.",
        fidelity: "direct",
      },
      {
        name: "cake flour",
        baseAmount: "1",
        baseUnit: "cup",
        substitutes: [
          { amount: 0.875, unit: "cup", ingredient: "all-purpose flour" },
          { amount: 2, unit: "tablespoon", ingredient: "cornstarch" },
        ],
        instructions: "Mix ingredients thoroughly.",
        fidelity: "direct",
      },
      {
        name: "light brown sugar",
        baseAmount: "1",
        baseUnit: "cup",
        substitutes: [
          { amount: 1, unit: "cup", ingredient: "white sugar" },
          { amount: 1, unit: "tablespoon", ingredient: "molasses" },
        ],
        instructions: "Mix ingredients thoroughly.",
        fidelity: "direct",
      },
      {
        name: "powdered sugar",
        baseAmount: "1",
        baseUnit: "cup",
        substitutes: [
          { amount: 1, unit: "cup", ingredient: "granulated sugar" },
          { amount: 1, unit: "tablespoon", ingredient: "cornstarch" },
        ],
        instructions: "Mix ingredients thoroughly.",
        fidelity: "direct",
        specialInstructions: "Blend until fine.",
      },
      {
        name: "self-raising flour",
        baseAmount: "1",
        baseUnit: "cup",
        substitutes: [
          { amount: 1, unit: "cup", ingredient: "all-purpose flour" },
          { amount: 1.5, unit: "teaspoon", ingredient: "baking powder" },
          { amount: 0.25, unit: "teaspoon", ingredient: "salt" },
        ],
        instructions: "Mix ingredients thoroughly.",
        fidelity: "direct",
      },
    ];

    for (const recipe of recipes) {
      await this.createSubstitutionRecipe(recipe);
    }
  }

  async trackTabVisit(visit: InsertTabVisit): Promise<TabVisit> {
    const id = randomUUID();
    const tabVisit: TabVisit = {
      ...visit,
      id,
      visitedAt: new Date(),
      sessionId: visit.sessionId ?? null,
      userContext: visit.userContext ?? null,
    };
    this.tabVisitsData.push(tabVisit);
    return tabVisit;
  }

  async trackConversionEvent(event: InsertConversionEvent): Promise<ConversionEvent> {
    const id = randomUUID();
    const conversionEvent: ConversionEvent = {
      ...event,
      id,
      createdAt: new Date(),
      sessionId: event.sessionId ?? null,
      conversionType: event.conversionType ?? null,
      outputValue: event.outputValue ?? null,
      userContext: event.userContext ?? null,
    };
    this.conversionEventsData.push(conversionEvent);
    return conversionEvent;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private db;
  private sql;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    // Create postgres connection with connection pooling
    // max: 10 connections in the pool
    // idle_timeout: 20 seconds
    // connect_timeout: 10 seconds
    this.sql = postgres(process.env.DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    this.db = drizzle(this.sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async getConversionRatio(fromUnit: string, toUnit: string, system: string = "US"): Promise<ConversionRatio | undefined> {
    const result = await this.db
      .select()
      .from(conversionRatios)
      .where(and(
        eq(conversionRatios.fromUnit, fromUnit),
        eq(conversionRatios.toUnit, toUnit),
        eq(conversionRatios.system, system)
      ))
      .limit(1);
    return result[0];
  }

  async getAllConversionRatios(): Promise<ConversionRatio[]> {
    return await this.db.select().from(conversionRatios);
  }

  async createConversionRatio(ratio: InsertConversionRatio): Promise<ConversionRatio> {
    const result = await this.db.insert(conversionRatios).values(ratio).returning();
    return result[0];
  }

  async seedConversionRatios(): Promise<void> {
    // Check if ratios already exist
    const existing = await this.db.select().from(conversionRatios).limit(1);
    if (existing.length > 0) {
      return; // Already seeded
    }

    // System definitions based on CSV data (cup, tablespoon, teaspoon in mL)
    const systems = {
      US: {
        teaspoon: 4.93,
        tablespoon: 14.79,
        cup: 236.6,
        pint: 473,
        quart: 946.353,
        gallon: 3785,
        mL: 1,
        liter: 1000,
      },
      UK_METRIC: {
        teaspoon: 5,
        tablespoon: 15,
        cup: 240,
        mL: 1,
        liter: 1000,
      },
      UK_IMPERIAL: {
        teaspoon: 5,
        tablespoon: 15,
        cup: 284,
        pint: 568,
        quart: 1136.5,
        gallon: 4546,
        mL: 1,
        liter: 1000,
      },
      AU_NZ: {
        teaspoon: 5,
        tablespoon: 20,
        cup: 250,
        pint: 500,
        quart: 1000,
        gallon: 4000,
        mL: 1,
        liter: 1000,
      },
      CA: {
        teaspoon: 5,
        tablespoon: 15,
        cup: 250,
        pint: 500,
        quart: 1000,
        gallon: 4000,
        mL: 1,
        liter: 1000,
      },
      EU: {
        teaspoon: 5,
        tablespoon: 15,
        cup: 250,
        pint: 500,
        quart: 1000,
        gallon: 4000,
        mL: 1,
        liter: 1000,
      },
    };

    const ratiosToInsert: InsertConversionRatio[] = [];
    
    for (const [systemName, conversionsToMl] of Object.entries(systems)) {
      const units = Object.keys(conversionsToMl);
      
      for (const fromUnit of units) {
        for (const toUnit of units) {
          if (fromUnit !== toUnit) {
            const fromMl = conversionsToMl[fromUnit as keyof typeof conversionsToMl];
            const toMl = conversionsToMl[toUnit as keyof typeof conversionsToMl];
            const ratio = fromMl / toMl;
            
            ratiosToInsert.push({
              fromUnit,
              toUnit,
              ratio: ratio.toString(),
              system: systemName,
            });
          }
        }
      }
    }

    // Insert all ratios in batches
    const batchSize = 50;
    for (let i = 0; i < ratiosToInsert.length; i += batchSize) {
      const batch = ratiosToInsert.slice(i, i + batchSize);
      await this.db.insert(conversionRatios).values(batch);
    }
  }

  async getIngredient(name: string): Promise<Ingredient | undefined> {
    const result = await this.db
      .select()
      .from(ingredients)
      .where(eq(ingredients.name, name))
      .limit(1);
    return result[0];
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    return await this.db.select().from(ingredients);
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const result = await this.db.insert(ingredients).values(ingredient).returning();
    return result[0];
  }

  async seedIngredients(): Promise<void> {
    // Check if ingredients already exist
    const existing = await this.db.select().from(ingredients).limit(1);
    if (existing.length > 0) {
      return; // Already seeded
    }

    // Common ingredients with their densities (grams per mL)
    const commonIngredients: InsertIngredient[] = [
      { name: "Water", density: "1.0000", category: "Liquids" },
      { name: "All-purpose flour", density: "0.5000", category: "Dry Goods" },
      { name: "Sugar (granulated)", density: "0.8000", category: "Sweeteners" },
      { name: "Brown sugar (packed)", density: "0.9000", category: "Sweeteners" },
      { name: "Butter", density: "0.9110", category: "Fats" },
      { name: "Vegetable oil", density: "0.9200", category: "Fats" },
      { name: "Milk (whole)", density: "1.0300", category: "Liquids" },
      { name: "Heavy cream", density: "0.9940", category: "Liquids" },
      { name: "Honey", density: "1.4200", category: "Sweeteners" },
      { name: "Maple syrup", density: "1.3200", category: "Sweeteners" },
      { name: "Salt (table)", density: "2.1600", category: "Seasonings" },
      { name: "Baking powder", density: "0.9000", category: "Leavening" },
      { name: "Baking soda", density: "2.2000", category: "Leavening" },
      { name: "Cocoa powder", density: "0.4000", category: "Dry Goods" },
      { name: "Rice (uncooked)", density: "0.7500", category: "Grains" },
    ];

    // Insert all ingredients in batches
    const batchSize = 10;
    for (let i = 0; i < commonIngredients.length; i += batchSize) {
      const batch = commonIngredients.slice(i, i + batchSize);
      await this.db.insert(ingredients).values(batch);
    }
  }

  async getAllSubstitutionRecipes(): Promise<SubstitutionRecipe[]> {
    return await this.db.select().from(substitutionRecipes);
  }

  async createSubstitutionRecipe(recipe: InsertSubstitutionRecipe): Promise<SubstitutionRecipe> {
    const result = await this.db.insert(substitutionRecipes).values(recipe).returning();
    return result[0];
  }

  async seedSubstitutionRecipes(): Promise<void> {
    // Check if recipes already exist
    const existing = await this.db.select().from(substitutionRecipes).limit(1);
    if (existing.length > 0) {
      return; // Already seeded
    }

    const recipes: InsertSubstitutionRecipe[] = [
      {
        name: "baking powder",
        baseAmount: "1",
        baseUnit: "teaspoon",
        substitutes: [
          { amount: 0.25, unit: "teaspoon", ingredient: "baking soda" },
          { amount: 0.5, unit: "teaspoon", ingredient: "cream of tartar" },
        ],
        instructions: "Mix ingredients thoroughly.",
        fidelity: "direct",
      },
      {
        name: "buttermilk",
        baseAmount: "1",
        baseUnit: "cup",
        substitutes: [
          { amount: 1, unit: "cup", ingredient: "whole milk" },
          { amount: 1, unit: "tablespoon", ingredient: "lemon juice" },
        ],
        instructions: "Mix ingredients thoroughly.",
        fidelity: "direct",
      },
      {
        name: "cake flour",
        baseAmount: "1",
        baseUnit: "cup",
        substitutes: [
          { amount: 0.875, unit: "cup", ingredient: "all-purpose flour" },
          { amount: 2, unit: "tablespoon", ingredient: "cornstarch" },
        ],
        instructions: "Mix ingredients thoroughly.",
        fidelity: "direct",
      },
      {
        name: "light brown sugar",
        baseAmount: "1",
        baseUnit: "cup",
        substitutes: [
          { amount: 1, unit: "cup", ingredient: "white sugar" },
          { amount: 1, unit: "tablespoon", ingredient: "molasses" },
        ],
        instructions: "Mix ingredients thoroughly.",
        fidelity: "direct",
      },
      {
        name: "powdered sugar",
        baseAmount: "1",
        baseUnit: "cup",
        substitutes: [
          { amount: 1, unit: "cup", ingredient: "granulated sugar" },
          { amount: 1, unit: "tablespoon", ingredient: "cornstarch" },
        ],
        instructions: "Mix ingredients thoroughly.",
        fidelity: "direct",
        specialInstructions: "Blend until fine.",
      },
      {
        name: "self-raising flour",
        baseAmount: "1",
        baseUnit: "cup",
        substitutes: [
          { amount: 1, unit: "cup", ingredient: "all-purpose flour" },
          { amount: 1.5, unit: "teaspoon", ingredient: "baking powder" },
          { amount: 0.25, unit: "teaspoon", ingredient: "salt" },
        ],
        instructions: "Mix ingredients thoroughly.",
        fidelity: "direct",
      },
    ];

    // Insert all recipes in batches
    const batchSize = 10;
    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = recipes.slice(i, i + batchSize);
      await this.db.insert(substitutionRecipes).values(batch);
    }
  }

  async trackTabVisit(visit: InsertTabVisit): Promise<TabVisit> {
    const result = await this.db.insert(tabVisits).values(visit).returning();
    return result[0];
  }

  async trackConversionEvent(event: InsertConversionEvent): Promise<ConversionEvent> {
    const result = await this.db.insert(conversionEvents).values(event).returning();
    return result[0];
  }
}

// Use database storage in production, memory storage for testing
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
