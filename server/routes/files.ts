import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

export const filesRouter = Router();

const updateFileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  path: z.string().trim().min(1).optional(),
  content: z.string().optional(),
  language: z.string().optional(),
});

async function checkFileAccess(fileId: string, userId: string, requireEditor = true) {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      project: {
        include: {
          members: { where: { userId } },
        },
      },
    },
  });

  if (!file) {
    throw new AppError(404, 'FILE_NOT_FOUND', 'File not found');
  }

  const isOwner = file.project.ownerId === userId;
  if (!isOwner) {
    const member = file.project.members[0];
    if (!member) {
      throw new AppError(403, 'FORBIDDEN', 'Access denied to this file');
    }
    if (requireEditor && member.role === 'viewer') {
      throw new AppError(403, 'FORBIDDEN', 'Editor permissions required');
    }
  }

  return file;
}

// GET /api/files/:id
filesRouter.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await checkFileAccess(req.params.id, req.user!.id, false);
    res.json({ file });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/files/:id
filesRouter.patch('/:id', requireAuth, validateBody(updateFileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await checkFileAccess(req.params.id, req.user!.id, true);
    const { name, path, content, language } = req.body;

    const updated = await prisma.file.update({
      where: { id: file.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(path !== undefined ? { path: path.trim() } : {}),
        ...(content !== undefined ? { content, size: content.length } : {}),
        ...(language !== undefined ? { language } : {}),
      },
    });

    await prisma.project.update({
      where: { id: file.projectId },
      data: { updatedAt: new Date() },
    });

    res.json({ file: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/files/:id
filesRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await checkFileAccess(req.params.id, req.user!.id, true);

    await prisma.file.delete({
      where: { id: file.id },
    });

    await prisma.project.update({
      where: { id: file.projectId },
      data: { updatedAt: new Date() },
    });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (err) {
    next(err);
  }
});
