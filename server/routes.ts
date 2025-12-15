import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertConversionEventSchema } from "@shared/schema";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve ads.txt from public directory
  app.get("/ads.txt", (req, res) => {
    const adsFilePath = path.resolve(import.meta.dirname, "..", "public", "ads.txt");
    if (fs.existsSync(adsFilePath)) {
      res.type("text/plain").sendFile(adsFilePath);
    } else {
      res.status(404).send("Not found");
    }
  });

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

  // Substitution recipes endpoints
  app.get("/api/substitution-recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllSubstitutionRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching substitution recipes:", error);
      res.status(500).json({ error: "Failed to fetch substitution recipes" });
    }
  });

  // Analytics endpoints
  app.post("/api/analytics/session/create", async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(validatedData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ error: "Failed to create session" });
    }
  });

  app.post("/api/analytics/session/update", async (req, res) => {
    try {
      const { sessionId, ...updates } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required" });
      }
      const session = await storage.updateSession(sessionId, updates);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(400).json({ error: "Failed to update session" });
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
