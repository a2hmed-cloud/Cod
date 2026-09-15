import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db/client';
import { validateBody } from '../middleware/validate';
import { requireAuth, JWT_SECRET } from '../middleware/auth';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Simple in-memory rate-limiter for auth attempts
const authAttempts = new Map<string, { count: number; resetAt: number }>();
function authRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = authAttempts.get(ip);

  if (entry) {
    if (now < entry.resetAt) {
      if (entry.count >= 15) {
        res.status(429).json({
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many authentication attempts. Please try again in 1 minute.',
          },
        });
        return;
      }
      entry.count += 1;
    } else {
      authAttempts.set(ip, { count: 1, resetAt: now + 60000 });
    }
  } else {
    authAttempts.set(ip, { count: 1, resetAt: now + 60000 });
  }
  next();
}

// POST /api/auth/register
authRouter.post('/register', authRateLimiter, validateBody(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).json({
        error: {
          code: 'EMAIL_IN_USE',
          message: 'An account with this email address already exists.',
        },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        settings: {
          create: {
            themeMode: 'dark',
            editorTheme: 'midnight',
            fontSize: 14,
            autoSave: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user,
      token,
      message: 'Account created successfully',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
authRouter.post('/login', authRateLimiter, validateBody(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
      message: 'Logged in successfully',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        settings: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account not found',
        },
      });
      return;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});
