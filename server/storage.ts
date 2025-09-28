import { type EditSession, type InsertEditSession, type EditHistory, type InsertEditHistory, type Template, type InsertTemplate } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Edit Sessions
  createEditSession(session: InsertEditSession): Promise<EditSession>;
  getEditSession(id: string): Promise<EditSession | undefined>;
  updateEditSession(id: string, updates: Partial<EditSession>): Promise<EditSession | undefined>;
  getAllEditSessions(): Promise<EditSession[]>;
  
  // Edit History
  addEditHistory(history: InsertEditHistory): Promise<EditHistory>;
  getEditHistoryForSession(sessionId: string): Promise<EditHistory[]>;
  
  // Templates
  createTemplate(template: InsertTemplate): Promise<Template>;
  getAllTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
}

export class MemStorage implements IStorage {
  private editSessions: Map<string, EditSession> = new Map();
  private editHistory: Map<string, EditHistory> = new Map();
  private templates: Map<string, Template> = new Map();

  constructor() {
    // Add some default templates
    this.seedTemplates();
  }

  private async seedTemplates() {
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
      }
    ];

    for (const template of defaultTemplates) {
      await this.createTemplate(template);
    }
  }

  // Edit Sessions
  async createEditSession(insertSession: InsertEditSession): Promise<EditSession> {
    const id = randomUUID();
    const session: EditSession = {
      ...insertSession,
      id,
      currentImageUrl: null,
      status: 'idle',
      processingStartedAt: null,
      processingCompletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      prompt: insertSession.prompt || null,
      settings: insertSession.settings || {},
    };
    this.editSessions.set(id, session);
    return session;
  }

  async getEditSession(id: string): Promise<EditSession | undefined> {
    return this.editSessions.get(id);
  }

  async updateEditSession(id: string, updates: Partial<EditSession>): Promise<EditSession | undefined> {
    const session = this.editSessions.get(id);
    if (!session) return undefined;

    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };
    this.editSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getAllEditSessions(): Promise<EditSession[]> {
    return Array.from(this.editSessions.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Edit History
  async addEditHistory(insertHistory: InsertEditHistory): Promise<EditHistory> {
    const id = randomUUID();
    const history: EditHistory = {
      ...insertHistory,
      id,
      createdAt: new Date(),
      processingTime: insertHistory.processingTime || null,
    };
    this.editHistory.set(id, history);
    return history;
  }

  async getEditHistoryForSession(sessionId: string): Promise<EditHistory[]> {
    return Array.from(this.editHistory.values())
      .filter(h => h.sessionId === sessionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Templates
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = {
      ...insertTemplate,
      id,
      isActive: true,
      createdAt: new Date(),
      description: insertTemplate.description || null,
      thumbnailUrl: insertTemplate.thumbnailUrl || null,
      settings: insertTemplate.settings || {},
    };
    this.templates.set(id, template);
    return template;
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return Array.from(this.templates.values())
      .filter(t => t.isActive && t.category === category);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }
}

export const storage = new MemStorage();
