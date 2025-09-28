import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEditSessionSchema, insertEditHistorySchema } from "@shared/schema";
import { ObjectStorageService } from "./objectStorage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Import required functions for signed URL generation
function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit`
    );
  }

  const { signed_url: signedURL } = await response.json();
  return signedURL;
}

// Helper function to get reference pose images for pose transfer
function getPoseReferenceImage(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  
  // Map common pose descriptions to reference pose images
  const poseReferences = {
    'standing': 'https://picsum.photos/400/600?random=1', // Standing pose reference
    'sitting': 'https://picsum.photos/400/600?random=2', // Sitting pose reference  
    'walking': 'https://picsum.photos/400/600?random=3', // Walking pose reference
    'running': 'https://picsum.photos/400/600?random=4', // Running pose reference
    'dancing': 'https://picsum.photos/400/600?random=5', // Dancing pose reference
    'waving': 'https://picsum.photos/400/600?random=6', // Waving pose reference
    'arms crossed': 'https://picsum.photos/400/600?random=7', // Arms crossed reference
    'hands up': 'https://picsum.photos/400/600?random=8', // Hands up reference
  };
  
  // Find matching pose reference
  for (const [poseKey, referenceUrl] of Object.entries(poseReferences)) {
    if (promptLower.includes(poseKey)) {
      return referenceUrl;
    }
  }
  
  // Default to standing pose if no specific pose is detected
  return poseReferences.standing;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  const objectStorage = new ObjectStorageService();

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
  app.post("/api/objects/upload", isAuthenticated, async (req: any, res) => {
    try {
      const uploadURL = await objectStorage.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Proxy endpoint for fal.ai to access private images
  app.get("/api/proxy-image", async (req, res) => {
    try {
      const objectPath = req.query.path as string;
      if (!objectPath || !objectPath.startsWith('/objects/')) {
        return res.status(400).json({ error: "Invalid object path" });
      }

      console.log('Proxy request for object path:', objectPath);
      const objectFile = await objectStorage.getObjectEntityFile(objectPath);
      
      // Stream the file directly to the response
      await objectStorage.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error proxying image:", error);
      if (error.name === 'ObjectNotFoundError') {
        return res.status(404).json({ error: "Image not found" });
      }
      return res.status(500).json({ error: "Failed to proxy image" });
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
  app.post("/api/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEditSessionSchema.parse({ ...req.body, userId });
      const session = await storage.createEditSession(validatedData);
      res.json(session);
    } catch (error) {
      console.error("Error creating edit session:", error);
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.get("/api/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getAllEditSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const session = await storage.getEditSession(req.params.id, userId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Get sessions by batch ID
  app.get("/api/sessions/batch/:batchId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { batchId } = req.params;
      const sessions = await storage.getSessionsByBatchId(batchId, userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching batch sessions:", error);
      res.status(500).json({ error: "Failed to fetch batch sessions" });
    }
  });

  app.patch("/api/sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      const session = await storage.updateEditSession(req.params.id, updates, userId);
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
  app.post("/api/process", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { sessionId, prompt, imageUrl, settings = {} } = req.body;

    if (!sessionId || !prompt || !imageUrl) {
      return res.status(400).json({ error: "Missing required fields: sessionId, prompt, imageUrl" });
    }

    try {
      // Verify session belongs to user and update to processing
      const session = await storage.updateEditSession(sessionId, {
        status: 'processing',
        prompt,
        processingStartedAt: new Date(),
      }, userId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found or access denied" });
      }

      // Call fal.ai API
      const falApiKey = process.env.FAL_API_KEY;
      if (!falApiKey) {
        throw new Error("FAL_API_KEY not configured");
      }

      // Convert image URL to publicly accessible URL for fal.ai
      let publicImageUrl = imageUrl;
      
      console.log('Processing image URL:', { imageUrl, type: typeof imageUrl });
      
      if (imageUrl.startsWith('/objects/')) {
        // Standard object path - generate signed URL
        try {
          const objectFile = await objectStorage.getObjectEntityFile(imageUrl);
          const { bucketName, objectName } = parseObjectPath(imageUrl);
          
          const signedUrl = await signObjectURL({
            bucketName,
            objectName,
            method: "GET",
            ttlSec: 3600,
          });
          
          publicImageUrl = signedUrl;
          console.log('Generated signed URL for object path:', { imageUrl, publicImageUrl });
        } catch (error) {
          console.error('Failed to generate signed URL for object path:', error);
          const baseUrl = req.protocol + '://' + req.get('host');
          publicImageUrl = `${baseUrl}${imageUrl}`;
        }
      } else if (imageUrl.startsWith('https://')) {
        // External URL - create a proxy endpoint for fal.ai to access
        try {
          const normalizedPath = await objectStorage.normalizeObjectEntityPath(imageUrl);
          console.log('Normalized object path:', { imageUrl, normalizedPath });
          
          if (normalizedPath.startsWith('/objects/')) {
            // Create a public proxy URL that fal.ai can access
            const baseUrl = req.protocol + '://' + req.get('host');
            publicImageUrl = `${baseUrl}/api/proxy-image?path=${encodeURIComponent(normalizedPath)}`;
            console.log('Generated proxy URL for fal.ai:', { normalizedPath, publicImageUrl });
          } else {
            // If normalization didn't work, use the original URL
            publicImageUrl = imageUrl;
            console.log('Using original URL as it could not be normalized:', imageUrl);
          }
        } catch (error) {
          console.error('Failed to normalize and create proxy URL:', error);
          // Use the original URL as fallback
          publicImageUrl = imageUrl;
          console.log('Using original URL as fallback:', imageUrl);
        }
      } else {
        console.log('Image URL is already a full URL:', imageUrl);
      }

      console.log('Processing image with fal.ai:', {
        originalImageUrl: imageUrl,
        publicImageUrl,
        prompt,
        settings
      });

      // Determine which model to use based on settings
      const modelType = settings.model || 'nano-banana';
      let endpoint, requestBody;
      
      const startTime = Date.now();

      switch (modelType) {
        case 'flux-image-to-image':
          endpoint = 'https://fal.run/fal-ai/flux/dev/image-to-image';
          requestBody = {
            image_url: publicImageUrl,
            prompt: prompt,
            strength: settings.strength || 0.8
          };
          break;
        
        case 'leffa-pose-transfer':
          endpoint = 'https://fal.run/fal-ai/leffa/pose-transfer';
          // For pose transfer, we need a reference pose image
          const referenceImageUrl = getPoseReferenceImage(prompt);
          requestBody = {
            person_image_url: publicImageUrl,  // The person whose pose we want to change
            pose_image_url: referenceImageUrl, // The reference pose to apply
            prompt: prompt
          };
          break;
        
        case 'flux-kontext-pro':
          endpoint = 'https://fal.run/fal-ai/flux/kontext-pro';
          requestBody = {
            image_url: publicImageUrl,
            prompt: prompt,
            strength: settings.strength || 0.7
          };
          break;
        
        default:
          // Default to nano-banana for basic editing
          endpoint = 'https://fal.run/fal-ai/nano-banana/edit';
          requestBody = {
            image_urls: [publicImageUrl],
            prompt: prompt
          };
          break;
      }

      console.log('fal.ai request details:', {
        model: modelType,
        endpoint,
        requestBody: JSON.stringify(requestBody, null, 2)
      });
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${falApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('fal.ai API response status:', response.status);
      console.log('fal.ai API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('fal.ai API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`fal.ai API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('fal.ai API raw response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('fal.ai API parsed response:', result);
      } catch (parseError) {
        console.error('Failed to parse fal.ai response as JSON:', parseError);
        throw new Error(`Invalid response from fal.ai API: ${responseText}`);
      }
      const processingTime = Date.now() - startTime;

      // Extract the image URL from the response
      let processedImageUrl;
      if (result.images && Array.isArray(result.images) && result.images.length > 0) {
        processedImageUrl = result.images[0].url;
      } else if (result.image && result.image.url) {
        processedImageUrl = result.image.url;
      } else {
        console.error('Invalid fal.ai response structure:', result);
        throw new Error("Invalid response from fal.ai API - no image URL found");
      }

      console.log('Extracted image URL from fal.ai response:', processedImageUrl);

      // Update session with result
      const updatedSession = await storage.updateEditSession(sessionId, {
        status: 'completed',
        currentImageUrl: processedImageUrl,
        processingCompletedAt: new Date(),
      });

      // Add to edit history
      await storage.addEditHistory({
        sessionId,
        imageUrl: processedImageUrl,
        prompt,
        processingTime,
      });

      res.json({
        success: true,
        session: updatedSession,
        result: processedImageUrl,
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
  app.get("/api/sessions/:sessionId/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // First verify the session belongs to the user
      const session = await storage.getEditSession(req.params.sessionId, userId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
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
