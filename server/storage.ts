import { type User, type InsertUser, type ConversionRatio, type InsertConversionRatio, users, conversionRatios } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversionRatios: Map<string, ConversionRatio>;

  constructor() {
    this.users = new Map();
    this.conversionRatios = new Map();
    this.seedConversionRatios();
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
}

// Use database storage in production, memory storage for testing
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
