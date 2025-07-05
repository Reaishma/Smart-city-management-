import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertTrafficDataSchema,
  insertEnergyDataSchema,
  insertEnvironmentalDataSchema,
  insertPopulationDataSchema,
  insertSystemAlertSchema,
  insertSystemActivitySchema,
  insertPredictionSchema,
} from "@shared/schema";
import { startDataSimulation } from "./services/dataSimulation";
import { generatePredictions } from "./services/predictiveAnalytics";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Traffic data routes
  app.get('/api/traffic', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const data = await storage.getTrafficData(limit);
      res.json(data);
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      res.status(500).json({ message: "Failed to fetch traffic data" });
    }
  });

  app.get('/api/traffic/range', isAuthenticated, async (req, res) => {
    try {
      const { startTime, endTime } = req.query;
      if (!startTime || !endTime) {
        return res.status(400).json({ message: "Start time and end time are required" });
      }
      const data = await storage.getTrafficDataByTimeRange(
        new Date(startTime as string),
        new Date(endTime as string)
      );
      res.json(data);
    } catch (error) {
      console.error("Error fetching traffic data by range:", error);
      res.status(500).json({ message: "Failed to fetch traffic data" });
    }
  });

  app.post('/api/traffic', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTrafficDataSchema.parse(req.body);
      const data = await storage.createTrafficData(validatedData);
      res.json(data);
    } catch (error) {
      console.error("Error creating traffic data:", error);
      res.status(500).json({ message: "Failed to create traffic data" });
    }
  });

  // Energy data routes
  app.get('/api/energy', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const data = await storage.getEnergyData(limit);
      res.json(data);
    } catch (error) {
      console.error("Error fetching energy data:", error);
      res.status(500).json({ message: "Failed to fetch energy data" });
    }
  });

  app.get('/api/energy/range', isAuthenticated, async (req, res) => {
    try {
      const { startTime, endTime } = req.query;
      if (!startTime || !endTime) {
        return res.status(400).json({ message: "Start time and end time are required" });
      }
      const data = await storage.getEnergyDataByTimeRange(
        new Date(startTime as string),
        new Date(endTime as string)
      );
      res.json(data);
    } catch (error) {
      console.error("Error fetching energy data by range:", error);
      res.status(500).json({ message: "Failed to fetch energy data" });
    }
  });

  app.post('/api/energy', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEnergyDataSchema.parse(req.body);
      const data = await storage.createEnergyData(validatedData);
      res.json(data);
    } catch (error) {
      console.error("Error creating energy data:", error);
      res.status(500).json({ message: "Failed to create energy data" });
    }
  });

  // Environmental data routes
  app.get('/api/environmental', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const data = await storage.getEnvironmentalData(limit);
      res.json(data);
    } catch (error) {
      console.error("Error fetching environmental data:", error);
      res.status(500).json({ message: "Failed to fetch environmental data" });
    }
  });

  app.get('/api/environmental/range', isAuthenticated, async (req, res) => {
    try {
      const { startTime, endTime } = req.query;
      if (!startTime || !endTime) {
        return res.status(400).json({ message: "Start time and end time are required" });
      }
      const data = await storage.getEnvironmentalDataByTimeRange(
        new Date(startTime as string),
        new Date(endTime as string)
      );
      res.json(data);
    } catch (error) {
      console.error("Error fetching environmental data by range:", error);
      res.status(500).json({ message: "Failed to fetch environmental data" });
    }
  });

  app.post('/api/environmental', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEnvironmentalDataSchema.parse(req.body);
      const data = await storage.createEnvironmentalData(validatedData);
      res.json(data);
    } catch (error) {
      console.error("Error creating environmental data:", error);
      res.status(500).json({ message: "Failed to create environmental data" });
    }
  });

  // Population data routes
  app.get('/api/population', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const data = await storage.getPopulationData(limit);
      res.json(data);
    } catch (error) {
      console.error("Error fetching population data:", error);
      res.status(500).json({ message: "Failed to fetch population data" });
    }
  });

  app.get('/api/population/range', isAuthenticated, async (req, res) => {
    try {
      const { startTime, endTime } = req.query;
      if (!startTime || !endTime) {
        return res.status(400).json({ message: "Start time and end time are required" });
      }
      const data = await storage.getPopulationDataByTimeRange(
        new Date(startTime as string),
        new Date(endTime as string)
      );
      res.json(data);
    } catch (error) {
      console.error("Error fetching population data by range:", error);
      res.status(500).json({ message: "Failed to fetch population data" });
    }
  });

  app.post('/api/population', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPopulationDataSchema.parse(req.body);
      const data = await storage.createPopulationData(validatedData);
      res.json(data);
    } catch (error) {
      console.error("Error creating population data:", error);
      res.status(500).json({ message: "Failed to create population data" });
    }
  });

  // System alerts routes
  app.get('/api/alerts', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const data = await storage.getSystemAlerts(limit);
      res.json(data);
    } catch (error) {
      console.error("Error fetching system alerts:", error);
      res.status(500).json({ message: "Failed to fetch system alerts" });
    }
  });

  app.get('/api/alerts/unresolved', isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getUnresolvedAlerts();
      res.json(data);
    } catch (error) {
      console.error("Error fetching unresolved alerts:", error);
      res.status(500).json({ message: "Failed to fetch unresolved alerts" });
    }
  });

  app.post('/api/alerts', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSystemAlertSchema.parse(req.body);
      const data = await storage.createSystemAlert(validatedData);
      res.json(data);
    } catch (error) {
      console.error("Error creating system alert:", error);
      res.status(500).json({ message: "Failed to create system alert" });
    }
  });

  app.patch('/api/alerts/:id/resolve', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.resolveAlert(id);
      res.json({ message: "Alert resolved successfully" });
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // System activity routes
  app.get('/api/activity', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const data = await storage.getSystemActivity(limit);
      res.json(data);
    } catch (error) {
      console.error("Error fetching system activity:", error);
      res.status(500).json({ message: "Failed to fetch system activity" });
    }
  });

  app.post('/api/activity', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSystemActivitySchema.parse(req.body);
      const data = await storage.createSystemActivity(validatedData);
      res.json(data);
    } catch (error) {
      console.error("Error creating system activity:", error);
      res.status(500).json({ message: "Failed to create system activity" });
    }
  });

  // Predictions routes
  app.get('/api/predictions', isAuthenticated, async (req, res) => {
    try {
      const module = req.query.module as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const data = await storage.getPredictions(module, limit);
      res.json(data);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  app.get('/api/predictions/latest', isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getLatestPredictions();
      res.json(data);
    } catch (error) {
      console.error("Error fetching latest predictions:", error);
      res.status(500).json({ message: "Failed to fetch latest predictions" });
    }
  });

  app.post('/api/predictions', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPredictionSchema.parse(req.body);
      const data = await storage.createPrediction(validatedData);
      res.json(data);
    } catch (error) {
      console.error("Error creating prediction:", error);
      res.status(500).json({ message: "Failed to create prediction" });
    }
  });

  // Data export routes
  app.get('/api/export/:module', isAuthenticated, async (req, res) => {
    try {
      const module = req.params.module;
      const { startTime, endTime } = req.query;
      
      if (!startTime || !endTime) {
        return res.status(400).json({ message: "Start time and end time are required" });
      }

      let data;
      switch (module) {
        case 'traffic':
          data = await storage.getTrafficDataByTimeRange(
            new Date(startTime as string),
            new Date(endTime as string)
          );
          break;
        case 'energy':
          data = await storage.getEnergyDataByTimeRange(
            new Date(startTime as string),
            new Date(endTime as string)
          );
          break;
        case 'environmental':
          data = await storage.getEnvironmentalDataByTimeRange(
            new Date(startTime as string),
            new Date(endTime as string)
          );
          break;
        case 'population':
          data = await storage.getPopulationDataByTimeRange(
            new Date(startTime as string),
            new Date(endTime as string)
          );
          break;
        default:
          return res.status(400).json({ message: "Invalid module" });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${module}_data_${Date.now()}.json`);
      res.json(data);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Generate predictions endpoint
  app.post('/api/predictions/generate', isAuthenticated, async (req, res) => {
    try {
      await generatePredictions();
      res.json({ message: "Predictions generated successfully" });
    } catch (error) {
      console.error("Error generating predictions:", error);
      res.status(500).json({ message: "Failed to generate predictions" });
    }
  });

  const httpServer = createServer(app);

  // Start data simulation
  startDataSimulation();

  return httpServer;
}
