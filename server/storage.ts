import { type User, type InsertUser, type ConversionRatio, type InsertConversionRatio, type Ingredient, type InsertIngredient, users, conversionRatios, ingredients } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getConversionRatio(fromUnit: string, toUnit: string): Promise<ConversionRatio | undefined>;
  getAllConversionRatios(): Promise<ConversionRatio[]>;
  createConversionRatio(ratio: InsertConversionRatio): Promise<ConversionRatio>;
  seedConversionRatios(): Promise<void>;
  getIngredient(name: string): Promise<Ingredient | undefined>;
  getAllIngredients(): Promise<Ingredient[]>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  seedIngredients(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversionRatios: Map<string, ConversionRatio>;
  private ingredients: Map<string, Ingredient>;

  constructor() {
    this.users = new Map();
    this.conversionRatios = new Map();
    this.ingredients = new Map();
    this.seedConversionRatios();
    this.seedIngredients();
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

  async getConversionRatio(fromUnit: string, toUnit: string): Promise<ConversionRatio | undefined> {
    const key = `${fromUnit}-${toUnit}`;
    return this.conversionRatios.get(key);
  }

  async getAllConversionRatios(): Promise<ConversionRatio[]> {
    return Array.from(this.conversionRatios.values());
  }

  async createConversionRatio(insertRatio: InsertConversionRatio): Promise<ConversionRatio> {
    const id = randomUUID();
    const ratio: ConversionRatio = { ...insertRatio, id };
    const key = `${insertRatio.fromUnit}-${insertRatio.toUnit}`;
    this.conversionRatios.set(key, ratio);
    return ratio;
  }

  async seedConversionRatios(): Promise<void> {
    // Conversion ratios to mL (base unit)
    const conversionsToMl = {
      "teaspoon": 4.92892,
      "tablespoon": 14.7868,
      "cup": 236.588,
      "pint": 473.176,
      "quart": 946.353,
      "gallon": 3785.41,
      "mL/cc": 1,
      "liter": 1000,
    };

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
          });
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
    const ingredient: Ingredient = { ...insertIngredient, id };
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
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private db;
  private initialized = false;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.seedConversionRatios();
      await this.seedIngredients();
      this.initialized = true;
    }
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

  async getConversionRatio(fromUnit: string, toUnit: string): Promise<ConversionRatio | undefined> {
    await this.ensureInitialized();
    const result = await this.db
      .select()
      .from(conversionRatios)
      .where(and(
        eq(conversionRatios.fromUnit, fromUnit),
        eq(conversionRatios.toUnit, toUnit)
      ))
      .limit(1);
    return result[0];
  }

  async getAllConversionRatios(): Promise<ConversionRatio[]> {
    await this.ensureInitialized();
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

    // Conversion ratios to mL (base unit)
    const conversionsToMl = {
      "teaspoon": 4.92892,
      "tablespoon": 14.7868,
      "cup": 236.588,
      "pint": 473.176,
      "quart": 946.353,
      "gallon": 3785.41,
      "mL/cc": 1,
      "liter": 1000,
    };

    const units = Object.keys(conversionsToMl);
    const ratiosToInsert: InsertConversionRatio[] = [];
    
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
          });
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
    await this.ensureInitialized();
    const result = await this.db
      .select()
      .from(ingredients)
      .where(eq(ingredients.name, name))
      .limit(1);
    return result[0];
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    await this.ensureInitialized();
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
}

// Use database storage in production, memory storage for testing
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
