import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

export const settingsRouter = Router();

const updateSettingsSchema = z.object({
  themeMode: z.string().optional(),
  editorTheme: z.string().optional(),
  fontSize: z.number().min(8).max(40).optional(),
  fontFamily: z.string().optional(),
  tabSize: z.number().min(1).max(8).optional(),
  wordWrap: z.string().optional(),
  lineNumbers: z.string().optional(),
  minimap: z.boolean().optional(),
  autoSave: z.boolean().optional(),
  autoSaveDelay: z.number().optional(),
  rawSettings: z.any().optional(),
});

// GET /api/settings
settingsRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          themeMode: 'dark',
          editorTheme: 'midnight',
          fontSize: 14,
          autoSave: true,
        },
      });
    }

    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/settings
settingsRouter.patch('/', requireAuth, validateBody(updateSettingsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const data = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: {
        ...data,
      },
    });

    res.json({ settings });
  } catch (err) {
    next(err);
  }
});
