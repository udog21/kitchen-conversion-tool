import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  app.get("/api/conversions/:fromUnit/:toUnit", async (req, res) => {
    try {
      const { fromUnit, toUnit } = req.params;
      const ratio = await storage.getConversionRatio(fromUnit, toUnit);
      
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

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
