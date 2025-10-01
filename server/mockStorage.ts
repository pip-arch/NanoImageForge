/**
 * Mock storage for local development without database
 * WARNING: Data is stored in memory only - will be lost on restart
 */

import type { 
  IStorage, 
  EditSession, 
  InsertEditSession, 
  EditHistory, 
  InsertEditHistory, 
  Template, 
  InsertTemplate,
  User,
  UpsertUser 
} from "./storage.js";

export class MockStorage implements IStorage {
  private editSessions: Map<string, EditSession> = new Map();
  private editHistories: Map<string, EditHistory[]> = new Map();
  private templates: Map<string, Template> = new Map();
  private users: Map<string, User> = new Map();
  private idCounter = 0;

  constructor() {
    console.log('📝 Using mock storage (in-memory, data will not persist)');
    this.seedDefaultTemplates();
    this.seedDefaultUser();
  }

  private generateId(): string {
    return `mock-id-${++this.idCounter}-${Date.now()}`;
  }

  private seedDefaultUser() {
    const devUser: User = {
      id: 'dev-user-123',
      email: 'dev@localhost',
      firstName: 'Dev',
      lastName: 'User',
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(devUser.id, devUser);
  }

  private seedDefaultTemplates() {
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
    ];

    defaultTemplates.forEach(template => {
      const fullTemplate: Template = {
        id: this.generateId(),
        ...template,
        thumbnailUrl: null,
        isActive: true,
        createdAt: new Date(),
      };
      this.templates.set(fullTemplate.id, fullTemplate);
    });
  }

  // Edit Sessions
  async createEditSession(insertSession: InsertEditSession): Promise<EditSession> {
    const session: EditSession = {
      id: this.generateId(),
      ...insertSession,
      userId: insertSession.userId || 'dev-user-123',
      currentImageUrl: null,
      status: 'idle',
      settings: insertSession.settings || {},
      processingStartedAt: null,
      processingCompletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.editSessions.set(session.id, session);
    return session;
  }

  async getEditSession(id: string, userId?: string): Promise<EditSession | undefined> {
    const session = this.editSessions.get(id);
    if (!session) return undefined;
    if (userId && session.userId !== userId) return undefined;
    return session;
  }

  async updateEditSession(id: string, updates: Partial<EditSession>, userId?: string): Promise<EditSession | undefined> {
    const session = this.editSessions.get(id);
    if (!session) return undefined;
    if (userId && session.userId !== userId) return undefined;

    const updated: EditSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };
    this.editSessions.set(id, updated);
    return updated;
  }

  async getAllEditSessions(userId?: string): Promise<EditSession[]> {
    const sessions = Array.from(this.editSessions.values());
    if (userId) {
      return sessions.filter(s => s.userId === userId);
    }
    return sessions;
  }

  async getSessionsByBatchId(batchId: string, userId?: string): Promise<EditSession[]> {
    const sessions = Array.from(this.editSessions.values()).filter(s => s.batchId === batchId);
    if (userId) {
      return sessions.filter(s => s.userId === userId);
    }
    return sessions;
  }

  // Edit History
  async addEditHistory(insertHistory: InsertEditHistory): Promise<EditHistory> {
    const history: EditHistory = {
      id: this.generateId(),
      ...insertHistory,
      createdAt: new Date(),
    };
    
    const sessionHistories = this.editHistories.get(insertHistory.sessionId) || [];
    sessionHistories.push(history);
    this.editHistories.set(insertHistory.sessionId, sessionHistories);
    
    return history;
  }

  async getEditHistoryForSession(sessionId: string): Promise<EditHistory[]> {
    return this.editHistories.get(sessionId) || [];
  }

  // Templates
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const template: Template = {
      id: this.generateId(),
      ...insertTemplate,
      thumbnailUrl: insertTemplate.thumbnailUrl || null,
      isActive: true,
      createdAt: new Date(),
    };
    this.templates.set(template.id, template);
    return template;
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(t => t.category === category && t.isActive);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id!);
    const user: User = {
      id: userData.id || this.generateId(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }
}

