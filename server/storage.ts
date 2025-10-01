import { type User, type InsertUser, type ConversionRatio, type InsertConversionRatio, type Ingredient, type InsertIngredient, type Substitution, type InsertSubstitution, type TabVisit, type InsertTabVisit, type ConversionEvent, type InsertConversionEvent, users, conversionRatios, ingredients, substitutions, tabVisits, conversionEvents } from "@shared/schema";
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
  getConversionRatio(fromUnit: string, toUnit: string, system?: string): Promise<ConversionRatio | undefined>;
  getAllConversionRatios(): Promise<ConversionRatio[]>;
  createConversionRatio(ratio: InsertConversionRatio): Promise<ConversionRatio>;
  seedConversionRatios(): Promise<void>;
  getIngredient(name: string): Promise<Ingredient | undefined>;
  getAllIngredients(): Promise<Ingredient[]>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  seedIngredients(): Promise<void>;
  getSubstitutionsFor(originalIngredient: string): Promise<Substitution[]>;
  getAllSubstitutions(): Promise<Substitution[]>;
  createSubstitution(substitution: InsertSubstitution): Promise<Substitution>;
  seedSubstitutions(): Promise<void>;
  trackTabVisit(visit: InsertTabVisit): Promise<TabVisit>;
  trackConversionEvent(event: InsertConversionEvent): Promise<ConversionEvent>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversionRatios: Map<string, ConversionRatio>;
  private ingredients: Map<string, Ingredient>;
  private substitutions: Map<string, Substitution[]>;
  private tabVisitsData: TabVisit[];
  private conversionEventsData: ConversionEvent[];

  constructor() {
    this.users = new Map();
    this.conversionRatios = new Map();
    this.ingredients = new Map();
    this.substitutions = new Map();
    this.tabVisitsData = [];
    this.conversionEventsData = [];
    this.seedConversionRatios();
    this.seedIngredients();
    this.seedSubstitutions();
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

  async getSubstitutionsFor(originalIngredient: string): Promise<Substitution[]> {
    return this.substitutions.get(originalIngredient.toLowerCase()) || [];
  }

  async getAllSubstitutions(): Promise<Substitution[]> {
    const allSubstitutions: Substitution[] = [];
    for (const substitutionList of Array.from(this.substitutions.values())) {
      allSubstitutions.push(...substitutionList);
    }
    return allSubstitutions;
  }

  async createSubstitution(insertSubstitution: InsertSubstitution): Promise<Substitution> {
    const id = randomUUID();
    const substitution: Substitution = { 
      ...insertSubstitution, 
      id, 
      notes: insertSubstitution.notes ?? null 
    };
    const key = insertSubstitution.originalIngredient.toLowerCase();
    
    if (!this.substitutions.has(key)) {
      this.substitutions.set(key, []);
    }
    this.substitutions.get(key)!.push(substitution);
    return substitution;
  }

  async seedSubstitutions(): Promise<void> {
    // Common cooking substitutions
    const commonSubstitutions = [
      // Baking substitutions
      { originalIngredient: "Butter", substituteIngredient: "Vegetable oil", ratio: "3/4 amount", notes: "Reduce liquid slightly", category: "Baking" },
      { originalIngredient: "Butter", substituteIngredient: "Applesauce", ratio: "1/2 amount", notes: "For healthier baking", category: "Baking" },
      { originalIngredient: "Sugar (granulated)", substituteIngredient: "Brown sugar", ratio: "1:1", notes: "May affect color and flavor", category: "Baking" },
      { originalIngredient: "Sugar (granulated)", substituteIngredient: "Honey", ratio: "3/4 amount", notes: "Reduce liquid by 1/4 cup", category: "Baking" },
      { originalIngredient: "All-purpose flour", substituteIngredient: "Cake flour", ratio: "1 cup + 2 tbsp", notes: "For lighter texture", category: "Baking" },
      { originalIngredient: "Cake flour", substituteIngredient: "All-purpose flour", ratio: "1 cup - 2 tbsp", notes: "Add 2 tbsp cornstarch", category: "Baking" },
      { originalIngredient: "Baking powder", substituteIngredient: "Baking soda + cream of tartar", ratio: "1/4 tsp soda + 1/2 tsp cream of tartar", notes: "For 1 tsp baking powder", category: "Baking" },
      
      // Dairy substitutions
      { originalIngredient: "Milk (whole)", substituteIngredient: "Buttermilk", ratio: "1:1", notes: "Add 1/4 tsp baking soda", category: "Dairy" },
      { originalIngredient: "Heavy cream", substituteIngredient: "Milk + butter", ratio: "3/4 cup milk + 1/4 cup butter", notes: "Mix well", category: "Dairy" },
      { originalIngredient: "Sour cream", substituteIngredient: "Greek yogurt", ratio: "1:1", notes: "Plain yogurt works best", category: "Dairy" },
      { originalIngredient: "Cream cheese", substituteIngredient: "Greek yogurt", ratio: "1:1", notes: "Strain yogurt for thickness", category: "Dairy" },
      
      // Egg substitutions
      { originalIngredient: "Eggs", substituteIngredient: "Applesauce", ratio: "1/4 cup per egg", notes: "For binding in baking", category: "Baking" },
      { originalIngredient: "Eggs", substituteIngredient: "Flax eggs", ratio: "1 tbsp ground flax + 3 tbsp water", notes: "Let sit 5 minutes per egg", category: "Baking" },
      { originalIngredient: "Eggs", substituteIngredient: "Chia eggs", ratio: "1 tbsp chia seeds + 3 tbsp water", notes: "Let sit 15 minutes per egg", category: "Baking" },
      
      // Sweetener substitutions
      { originalIngredient: "Honey", substituteIngredient: "Maple syrup", ratio: "1:1", notes: "Similar consistency", category: "Sweeteners" },
      { originalIngredient: "Maple syrup", substituteIngredient: "Honey", ratio: "1:1", notes: "Flavor will be different", category: "Sweeteners" },
      { originalIngredient: "Brown sugar (packed)", substituteIngredient: "Sugar + molasses", ratio: "1 cup sugar + 1-2 tbsp molasses", notes: "Mix thoroughly", category: "Sweeteners" },
      
      // Spice and flavor substitutions
      { originalIngredient: "Vanilla extract", substituteIngredient: "Almond extract", ratio: "1/2 amount", notes: "Stronger flavor", category: "Flavorings" },
      { originalIngredient: "Lemon juice", substituteIngredient: "White vinegar", ratio: "1:1", notes: "For acidity in baking", category: "Acids" },
      { originalIngredient: "Buttermilk", substituteIngredient: "Milk + lemon juice", ratio: "1 cup milk + 1 tbsp lemon juice", notes: "Let sit 5 minutes", category: "Dairy" },
    ];

    for (const substitution of commonSubstitutions) {
      await this.createSubstitution(substitution);
    }
  }

  async trackTabVisit(visit: InsertTabVisit): Promise<TabVisit> {
    const id = randomUUID();
    const tabVisit: TabVisit = {
      ...visit,
      id,
      visitedAt: new Date(),
      sessionId: visit.sessionId ?? null,
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
    };
    this.conversionEventsData.push(conversionEvent);
    return conversionEvent;
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
      await this.seedSubstitutions();
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

  async getConversionRatio(fromUnit: string, toUnit: string, system: string = "US"): Promise<ConversionRatio | undefined> {
    await this.ensureInitialized();
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

  async getSubstitutionsFor(originalIngredient: string): Promise<Substitution[]> {
    await this.ensureInitialized();
    return await this.db
      .select()
      .from(substitutions)
      .where(eq(substitutions.originalIngredient, originalIngredient));
  }

  async getAllSubstitutions(): Promise<Substitution[]> {
    await this.ensureInitialized();
    return await this.db.select().from(substitutions);
  }

  async createSubstitution(substitution: InsertSubstitution): Promise<Substitution> {
    const result = await this.db.insert(substitutions).values(substitution).returning();
    return result[0];
  }

  async seedSubstitutions(): Promise<void> {
    // Check if substitutions already exist
    const existing = await this.db.select().from(substitutions).limit(1);
    if (existing.length > 0) {
      return; // Already seeded
    }

    // Common cooking substitutions
    const commonSubstitutions: InsertSubstitution[] = [
      // Baking substitutions
      { originalIngredient: "Butter", substituteIngredient: "Vegetable oil", ratio: "3/4 amount", notes: "Reduce liquid slightly", category: "Baking" },
      { originalIngredient: "Butter", substituteIngredient: "Applesauce", ratio: "1/2 amount", notes: "For healthier baking", category: "Baking" },
      { originalIngredient: "Sugar (granulated)", substituteIngredient: "Brown sugar", ratio: "1:1", notes: "May affect color and flavor", category: "Baking" },
      { originalIngredient: "Sugar (granulated)", substituteIngredient: "Honey", ratio: "3/4 amount", notes: "Reduce liquid by 1/4 cup", category: "Baking" },
      { originalIngredient: "All-purpose flour", substituteIngredient: "Cake flour", ratio: "1 cup + 2 tbsp", notes: "For lighter texture", category: "Baking" },
      { originalIngredient: "Cake flour", substituteIngredient: "All-purpose flour", ratio: "1 cup - 2 tbsp", notes: "Add 2 tbsp cornstarch", category: "Baking" },
      { originalIngredient: "Baking powder", substituteIngredient: "Baking soda + cream of tartar", ratio: "1/4 tsp soda + 1/2 tsp cream of tartar", notes: "For 1 tsp baking powder", category: "Baking" },
      
      // Dairy substitutions
      { originalIngredient: "Milk (whole)", substituteIngredient: "Buttermilk", ratio: "1:1", notes: "Add 1/4 tsp baking soda", category: "Dairy" },
      { originalIngredient: "Heavy cream", substituteIngredient: "Milk + butter", ratio: "3/4 cup milk + 1/4 cup butter", notes: "Mix well", category: "Dairy" },
      { originalIngredient: "Sour cream", substituteIngredient: "Greek yogurt", ratio: "1:1", notes: "Plain yogurt works best", category: "Dairy" },
      { originalIngredient: "Cream cheese", substituteIngredient: "Greek yogurt", ratio: "1:1", notes: "Strain yogurt for thickness", category: "Dairy" },
      
      // Egg substitutions
      { originalIngredient: "Eggs", substituteIngredient: "Applesauce", ratio: "1/4 cup per egg", notes: "For binding in baking", category: "Baking" },
      { originalIngredient: "Eggs", substituteIngredient: "Flax eggs", ratio: "1 tbsp ground flax + 3 tbsp water", notes: "Let sit 5 minutes per egg", category: "Baking" },
      { originalIngredient: "Eggs", substituteIngredient: "Chia eggs", ratio: "1 tbsp chia seeds + 3 tbsp water", notes: "Let sit 15 minutes per egg", category: "Baking" },
      
      // Sweetener substitutions
      { originalIngredient: "Honey", substituteIngredient: "Maple syrup", ratio: "1:1", notes: "Similar consistency", category: "Sweeteners" },
      { originalIngredient: "Maple syrup", substituteIngredient: "Honey", ratio: "1:1", notes: "Flavor will be different", category: "Sweeteners" },
      { originalIngredient: "Brown sugar (packed)", substituteIngredient: "Sugar + molasses", ratio: "1 cup sugar + 1-2 tbsp molasses", notes: "Mix thoroughly", category: "Sweeteners" },
      
      // Spice and flavor substitutions
      { originalIngredient: "Vanilla extract", substituteIngredient: "Almond extract", ratio: "1/2 amount", notes: "Stronger flavor", category: "Flavorings" },
      { originalIngredient: "Lemon juice", substituteIngredient: "White vinegar", ratio: "1:1", notes: "For acidity in baking", category: "Acids" },
      { originalIngredient: "Buttermilk", substituteIngredient: "Milk + lemon juice", ratio: "1 cup milk + 1 tbsp lemon juice", notes: "Let sit 5 minutes", category: "Dairy" },
    ];

    // Insert all substitutions in batches
    const batchSize = 10;
    for (let i = 0; i < commonSubstitutions.length; i += batchSize) {
      const batch = commonSubstitutions.slice(i, i + batchSize);
      await this.db.insert(substitutions).values(batch);
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
