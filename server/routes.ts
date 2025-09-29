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

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
