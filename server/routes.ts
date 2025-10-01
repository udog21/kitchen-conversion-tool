import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTabVisitSchema, insertConversionEventSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Conversion ratios endpoints
  app.get("/api/conversions", async (req, res) => {
    try {
      const ratios = await storage.getAllConversionRatios();
      res.json(ratios);
    } catch (error) {
      console.error("Error fetching conversion ratios:", error);
      res.status(500).json({ error: "Failed to fetch conversion ratios" });
    }
  });

  // Get conversions for a specific system
  app.get("/api/conversions/:system", async (req, res) => {
    try {
      const { system } = req.params;
      const allRatios = await storage.getAllConversionRatios();
      
      // Filter ratios by system
      const systemRatios = allRatios.filter((ratio: any) => ratio.system === system);
      
      res.json(systemRatios);
    } catch (error) {
      console.error("Error fetching conversion ratios:", error);
      res.status(500).json({ error: "Failed to fetch conversion ratios" });
    }
  });

  app.get("/api/conversions/:system/:fromUnit/:toUnit", async (req, res) => {
    try {
      const { system, fromUnit, toUnit } = req.params;
      const ratio = await storage.getConversionRatio(fromUnit, toUnit, system);
      
      if (!ratio) {
        return res.status(404).json({ error: "Conversion ratio not found" });
      }
      
      res.json(ratio);
    } catch (error) {
      console.error("Error fetching conversion ratio:", error);
      res.status(500).json({ error: "Failed to fetch conversion ratio" });
    }
  });

  // Ingredients endpoints
  app.get("/api/ingredients", async (req, res) => {
    try {
      const ingredients = await storage.getAllIngredients();
      res.json(ingredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  app.get("/api/ingredients/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const ingredient = await storage.getIngredient(decodeURIComponent(name));
      
      if (!ingredient) {
        return res.status(404).json({ error: "Ingredient not found" });
      }
      
      res.json(ingredient);
    } catch (error) {
      console.error("Error fetching ingredient:", error);
      res.status(500).json({ error: "Failed to fetch ingredient" });
    }
  });

  // Substitutions endpoints
  app.get("/api/substitutions", async (req, res) => {
    try {
      const substitutions = await storage.getAllSubstitutions();
      res.json(substitutions);
    } catch (error) {
      console.error("Error fetching substitutions:", error);
      res.status(500).json({ error: "Failed to fetch substitutions" });
    }
  });

  app.get("/api/substitutions/:ingredient", async (req, res) => {
    try {
      const { ingredient } = req.params;
      const substitutions = await storage.getSubstitutionsFor(decodeURIComponent(ingredient));
      res.json(substitutions);
    } catch (error) {
      console.error("Error fetching substitutions:", error);
      res.status(500).json({ error: "Failed to fetch substitutions" });
    }
  });

  // Analytics endpoints
  app.post("/api/analytics/tab-visit", async (req, res) => {
    try {
      const validatedData = insertTabVisitSchema.parse(req.body);
      const tabVisit = await storage.trackTabVisit(validatedData);
      res.json(tabVisit);
    } catch (error) {
      console.error("Error tracking tab visit:", error);
      res.status(400).json({ error: "Failed to track tab visit" });
    }
  });

  app.post("/api/analytics/conversion-event", async (req, res) => {
    try {
      const validatedData = insertConversionEventSchema.parse(req.body);
      const conversionEvent = await storage.trackConversionEvent(validatedData);
      res.json(conversionEvent);
    } catch (error) {
      console.error("Error tracking conversion event:", error);
      res.status(400).json({ error: "Failed to track conversion event" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
