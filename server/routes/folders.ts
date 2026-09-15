import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

export const foldersRouter = Router();

const updateFolderSchema = z.object({
  name: z.string().trim().min(1).optional(),
  path: z.string().trim().min(1).optional(),
});

async function checkFolderAccess(folderId: string, userId: string, requireEditor = true) {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      project: {
        include: {
          members: { where: { userId } },
        },
      },
    },
  });

  if (!folder) {
    throw new AppError(404, 'FOLDER_NOT_FOUND', 'Folder not found');
  }

  const isOwner = folder.project.ownerId === userId;
  if (!isOwner) {
    const member = folder.project.members[0];
    if (!member) {
      throw new AppError(403, 'FORBIDDEN', 'Access denied to this folder');
    }
    if (requireEditor && member.role === 'viewer') {
      throw new AppError(403, 'FORBIDDEN', 'Editor permissions required');
    }
  }

  return folder;
}

// PATCH /api/folders/:id
foldersRouter.patch('/:id', requireAuth, validateBody(updateFolderSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folder = await checkFolderAccess(req.params.id, req.user!.id, true);
    const { name, path } = req.body;

    const updated = await prisma.folder.update({
      where: { id: folder.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(path !== undefined ? { path: path.trim() } : {}),
      },
    });

    await prisma.project.update({
      where: { id: folder.projectId },
      data: { updatedAt: new Date() },
    });

    res.json({ folder: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/folders/:id
foldersRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folder = await checkFolderAccess(req.params.id, req.user!.id, true);

    await prisma.folder.delete({
      where: { id: folder.id },
    });

    await prisma.project.update({
      where: { id: folder.projectId },
      data: { updatedAt: new Date() },
    });

    res.json({ success: true, message: 'Folder deleted successfully' });
  } catch (err) {
    next(err);
  }
});
