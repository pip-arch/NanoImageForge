import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEditSessionSchema, insertEditHistorySchema } from "@shared/schema";
import { ObjectStorageService } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  const objectStorage = new ObjectStorageService();

  // Public file serving endpoint
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    try {
      const file = await objectStorage.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorage.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Object upload endpoint
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const uploadURL = await objectStorage.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Serve private objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorage.getObjectEntityFile(req.path);
      objectStorage.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      res.status(404).json({ error: "Object not found" });
    }
  });

  // Edit Sessions API
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertEditSessionSchema.parse(req.body);
      const session = await storage.createEditSession(validatedData);
      res.json(session);
    } catch (error) {
      console.error("Error creating edit session:", error);
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllEditSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getEditSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const updates = req.body;
      const session = await storage.updateEditSession(req.params.id, updates);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Process image with fal.ai
  app.post("/api/process", async (req, res) => {
    const { sessionId, prompt, imageUrl, settings = {} } = req.body;

    if (!sessionId || !prompt || !imageUrl) {
      return res.status(400).json({ error: "Missing required fields: sessionId, prompt, imageUrl" });
    }

    try {
      // Update session to processing
      await storage.updateEditSession(sessionId, {
        status: 'processing',
        prompt,
        processingStartedAt: new Date(),
      });

      // Call fal.ai API
      const falApiKey = process.env.FAL_API_KEY;
      if (!falApiKey) {
        throw new Error("FAL_API_KEY not configured");
      }

      const startTime = Date.now();

      const response = await fetch("https://fal.run/fal-ai/nano-banana/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${falApiKey}`,
        },
        body: JSON.stringify({
          image_url: imageUrl,
          prompt: prompt,
          ...settings
        }),
      });

      if (!response.ok) {
        throw new Error(`fal.ai API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      if (!result.image || !result.image.url) {
        throw new Error("Invalid response from fal.ai API");
      }

      // Update session with result
      const updatedSession = await storage.updateEditSession(sessionId, {
        status: 'completed',
        currentImageUrl: result.image.url,
        processingCompletedAt: new Date(),
      });

      // Add to edit history
      await storage.addEditHistory({
        sessionId,
        imageUrl: result.image.url,
        prompt,
        processingTime,
      });

      res.json({
        success: true,
        session: updatedSession,
        result: result.image.url,
        processingTime,
      });

    } catch (error) {
      console.error("Error processing image:", error);
      
      // Update session to error state
      await storage.updateEditSession(sessionId, {
        status: 'error',
        processingCompletedAt: new Date(),
      });

      res.status(500).json({ 
        error: "Failed to process image",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Templates API
  app.get("/api/templates", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const templates = category 
        ? await storage.getTemplatesByCategory(category)
        : await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  // Edit History API
  app.get("/api/sessions/:sessionId/history", async (req, res) => {
    try {
      const history = await storage.getEditHistoryForSession(req.params.sessionId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching edit history:", error);
      res.status(500).json({ error: "Failed to fetch edit history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
