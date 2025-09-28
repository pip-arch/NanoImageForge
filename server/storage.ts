import { type EditSession, type InsertEditSession, type EditHistory, type InsertEditHistory, type Template, type InsertTemplate, editSessions, editHistory, templates } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Edit Sessions
  createEditSession(session: InsertEditSession): Promise<EditSession>;
  getEditSession(id: string): Promise<EditSession | undefined>;
  updateEditSession(id: string, updates: Partial<EditSession>): Promise<EditSession | undefined>;
  getAllEditSessions(): Promise<EditSession[]>;
  getSessionsByBatchId(batchId: string): Promise<EditSession[]>;
  
  // Edit History
  addEditHistory(history: InsertEditHistory): Promise<EditHistory>;
  getEditHistoryForSession(sessionId: string): Promise<EditHistory[]>;
  
  // Templates
  createTemplate(template: InsertTemplate): Promise<Template>;
  getAllTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Seed templates on initialization
    this.seedTemplates();
  }

  private async seedTemplates() {
    try {
      // Check if templates already exist
      const existingTemplates = await this.getAllTemplates();
      if (existingTemplates.length > 0) {
        return; // Templates already seeded
      }

      const defaultTemplates: InsertTemplate[] = [
        {
          name: "Professional Headshot",
          description: "Studio lighting, clean background, business professional",
          category: "professional",
          prompt: "Transform into a professional headshot with studio lighting, clean white or gray background, business attire, professional lighting setup",
          settings: { quality: "high", style: "professional" }
        },
        {
          name: "Product Showcase",
          description: "Clean backgrounds, perfect lighting, e-commerce ready",
          category: "product",
          prompt: "Create a product photography setup with clean white background, professional lighting, shadow removal, e-commerce ready format",
          settings: { quality: "ultra", background: "white" }
        },
        {
          name: "Social Media",
          description: "Instagram-ready, square format, trending styles",
          category: "social",
          prompt: "Optimize for social media with vibrant colors, trendy aesthetic, square aspect ratio, engaging composition",
          settings: { format: "square", style: "vibrant" }
        },
        {
          name: "Artistic Style",
          description: "Creative artistic transformations",
          category: "artistic",
          prompt: "Apply artistic style transformation with enhanced colors, creative composition, artistic filters",
          settings: { style: "artistic", enhancement: "creative" }
        },
        {
          name: "Outfit Change",
          description: "Change clothing style while preserving person",
          category: "advanced",
          prompt: "person wearing [OUTFIT_DESCRIPTION] instead of current clothes, maintaining the same pose and background",
          settings: { model: "flux-image-to-image", strength: 0.8, advanced: true }
        },
        {
          name: "Pose Alteration",
          description: "Modify body pose and positioning",
          category: "advanced", 
          prompt: "person in [POSE_DESCRIPTION], maintaining facial features and clothing style",
          settings: { model: "leffa-pose-transfer", advanced: true }
        },
        {
          name: "Scene Enhancement",
          description: "Sophisticated scene and context modifications",
          category: "advanced",
          prompt: "transform the scene to [SCENE_DESCRIPTION] while preserving the main subject",
          settings: { model: "flux-kontext-pro", quality: "ultra", advanced: true }
        }
      ];

      for (const template of defaultTemplates) {
        await this.createTemplate(template);
      }
    } catch (error) {
      console.log('Template seeding will be skipped until database is ready');
    }
  }

  // Edit Sessions
  async createEditSession(insertSession: InsertEditSession): Promise<EditSession> {
    const [session] = await db
      .insert(editSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getEditSession(id: string): Promise<EditSession | undefined> {
    const [session] = await db
      .select()
      .from(editSessions)
      .where(eq(editSessions.id, id));
    return session || undefined;
  }

  async updateEditSession(id: string, updates: Partial<EditSession>): Promise<EditSession | undefined> {
    const [updated] = await db
      .update(editSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(editSessions.id, id))
      .returning();
    return updated || undefined;
  }

  async getAllEditSessions(): Promise<EditSession[]> {
    return await db
      .select()
      .from(editSessions)
      .orderBy(editSessions.createdAt);
  }

  async getSessionsByBatchId(batchId: string): Promise<EditSession[]> {
    return await db
      .select()
      .from(editSessions)
      .where(eq(editSessions.batchId, batchId))
      .orderBy(editSessions.createdAt);
  }

  // Edit History
  async addEditHistory(insertHistory: InsertEditHistory): Promise<EditHistory> {
    const [history] = await db
      .insert(editHistory)
      .values(insertHistory)
      .returning();
    return history;
  }

  async getEditHistoryForSession(sessionId: string): Promise<EditHistory[]> {
    return await db
      .select()
      .from(editHistory)
      .where(eq(editHistory.sessionId, sessionId))
      .orderBy(editHistory.createdAt);
  }

  // Templates
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async getAllTemplates(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.isActive, true))
      .orderBy(templates.createdAt);
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.category, category))
      .orderBy(templates.createdAt);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id));
    return template || undefined;
  }
}

export const storage = new DatabaseStorage();