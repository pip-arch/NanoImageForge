import type { Express, RequestHandler } from "express";
import session from "express-session";
import MemoryStore from "memorystore";

/**
 * Simple development-only authentication for local testing
 * WARNING: DO NOT USE IN PRODUCTION
 */

export function setupDevAuth(app: Express) {
  console.log('\n⚠️  DEVELOPMENT MODE: Using mock authentication');
  console.log('⚠️  This is NOT secure and should ONLY be used for local testing\n');

  // Simple memory-based session for development
  const MemoryStoreSession = MemoryStore(session);
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // false for local development
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));

  // Mock authentication endpoint for dev
  app.post('/api/dev-login', (req, res) => {
    const session = req.session as any;
    session.user = {
      claims: {
        sub: 'dev-user-123',
        email: 'dev@localhost',
      },
      id: 'dev-user-123',
      email: 'dev@localhost',
      firstName: 'Dev',
      lastName: 'User',
      profileImageUrl: null,
    };
    res.json({ success: true, user: session.user });
  });

  // Auto-login for development
  app.get('/api/auth/user', (req, res) => {
    const session = req.session as any;
    if (!session.user) {
      // Auto-create dev user
      session.user = {
        claims: {
          sub: 'dev-user-123',
          email: 'dev@localhost',
        },
        id: 'dev-user-123',
        email: 'dev@localhost',
        firstName: 'Dev',
        lastName: 'User',
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    res.json(session.user);
  });
}

/**
 * Development-only authentication middleware
 * Automatically authenticates all requests
 */
export const isDevAuthenticated: RequestHandler = (req: any, res, next) => {
  // Auto-authenticate for development
  if (!req.session.user) {
    req.session.user = {
      claims: {
        sub: 'dev-user-123',
        email: 'dev@localhost',
      },
      id: 'dev-user-123',
      email: 'dev@localhost',
      firstName: 'Dev',
      lastName: 'User',
      profileImageUrl: null,
    };
  }
  
  req.user = req.session.user;
  next();
};

