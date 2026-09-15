import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

export const projectsRouter = Router();

// Validation schemas
const createProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Project name is required').max(100),
  description: z.string().optional(),
  type: z.string().default('react'),
  tags: z.array(z.string()).default([]),
  rootFiles: z.array(z.any()).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  tags: z.array(z.string()).optional(),
  lastOpenedAt: z.number().or(z.string()).optional(),
});

const createFileSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'File name is required'),
  path: z.string().trim().min(1, 'File path is required'),
  content: z.string().default(''),
  language: z.string().default('plaintext'),
  folderId: z.string().nullable().optional(),
});

const updateFileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  path: z.string().trim().min(1).optional(),
  content: z.string().optional(),
  language: z.string().optional(),
});

const createFolderSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Folder name is required'),
  path: z.string().trim().min(1, 'Folder path is required'),
  parentId: z.string().nullable().optional(),
});

const updateFolderSchema = z.object({
  name: z.string().trim().min(1).optional(),
  path: z.string().trim().min(1).optional(),
});

const createCommitSchema = z.object({
  message: z.string().trim().min(1, 'Commit message is required'),
  authorName: z.string().optional(),
  snapshot: z.any(),
  filesCount: z.number().default(0),
});

// Helper for project authorization
export async function checkProjectAccess(
  projectId: string,
  userId: string,
  requiredRole: 'viewer' | 'editor' | 'owner' = 'viewer'
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId },
      },
    },
  });

  if (!project) {
    throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
  }

  const isOwner = project.ownerId === userId;
  if (isOwner) {
    return project;
  }

  const member = project.members[0];
  if (!member) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied to this project');
  }

  if (requiredRole === 'owner') {
    throw new AppError(403, 'FORBIDDEN', 'Only the project owner can perform this operation');
  }

  if (requiredRole === 'editor' && member.role === 'viewer') {
    throw new AppError(403, 'FORBIDDEN', 'Editor permissions required');
  }

  return project;
}

// GET /api/projects - List user's projects
projectsRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        _count: {
          select: { files: true, folders: true, commits: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        type: p.type,
        tags: p.tags,
        ownerId: p.ownerId,
        createdAt: p.createdAt.getTime(),
        updatedAt: p.updatedAt.getTime(),
        lastOpenedAt: p.lastOpenedAt ? p.lastOpenedAt.getTime() : null,
        filesCount: p._count.files,
        commitsCount: p._count.commits,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects - Create project
projectsRouter.post('/', requireAuth, validateBody(createProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id, name, description, type, tags, rootFiles } = req.body;

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          ...(id ? { id } : {}),
          name: name.trim(),
          description: description?.trim() || null,
          type: type || 'react',
          tags: tags || [],
          ownerId: userId,
          lastOpenedAt: new Date(),
        },
      });

      // Populate initial files if provided (e.g. from template)
      if (Array.isArray(rootFiles) && rootFiles.length > 0) {
        const flatFiles: any[] = [];
        const flatFolders: any[] = [];

        const traverse = (nodes: any[], parentId: string | null = null) => {
          for (const node of nodes) {
            if (node.type === 'folder') {
              const folderId = node.id || `fld-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
              flatFolders.push({
                id: folderId,
                name: node.name,
                path: node.path,
                parentId,
                projectId: created.id,
              });
              if (node.children) {
                traverse(node.children, folderId);
              }
            } else if (node.type === 'file') {
              flatFiles.push({
                id: node.id || `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                name: node.name,
                path: node.path,
                content: node.content || '',
                language: node.language || 'plaintext',
                size: (node.content || '').length,
                folderId: parentId,
                projectId: created.id,
              });
            }
          }
        };

        traverse(rootFiles);

        for (const folder of flatFolders) {
          await tx.folder.create({ data: folder });
        }
        for (const file of flatFiles) {
          await tx.file.create({ data: file });
        }
      }

      return created;
    });

    res.status(201).json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        type: project.type,
        tags: project.tags,
        createdAt: project.createdAt.getTime(),
        updatedAt: project.updatedAt.getTime(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id - Get project with files and folders
projectsRouter.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    const project = await checkProjectAccess(projectId, userId, 'viewer');

    const [folders, files, commits] = await Promise.all([
      prisma.folder.findMany({ where: { projectId }, orderBy: { path: 'asc' } }),
      prisma.file.findMany({ where: { projectId }, orderBy: { path: 'asc' } }),
      prisma.commit.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);

    res.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        type: project.type,
        tags: project.tags,
        ownerId: project.ownerId,
        createdAt: project.createdAt.getTime(),
        updatedAt: project.updatedAt.getTime(),
        lastOpenedAt: project.lastOpenedAt ? project.lastOpenedAt.getTime() : null,
      },
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        path: f.path,
        parentId: f.parentId,
        createdAt: f.createdAt.getTime(),
      })),
      files: files.map((f) => ({
        id: f.id,
        name: f.name,
        path: f.path,
        content: f.content,
        language: f.language,
        size: f.size,
        folderId: f.folderId,
        createdAt: f.createdAt.getTime(),
        updatedAt: f.updatedAt.getTime(),
      })),
      commits: commits.map((c) => ({
        id: c.id,
        author: c.authorName,
        message: c.message,
        timestamp: c.createdAt.getTime(),
        filesCount: c.filesCount,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/projects/:id - Update project metadata
projectsRouter.patch('/:id', requireAuth, validateBody(updateProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    await checkProjectAccess(projectId, userId, 'editor');

    const { name, description, type, tags, lastOpenedAt } = req.body;

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(lastOpenedAt !== undefined ? { lastOpenedAt: new Date(lastOpenedAt) } : {}),
      },
    });

    res.json({
      project: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        type: updated.type,
        tags: updated.tags,
        updatedAt: updated.updatedAt.getTime(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id - Delete project
projectsRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    await checkProjectAccess(projectId, userId, 'owner');

    await prisma.project.delete({
      where: { id: projectId },
    });

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/duplicate - Duplicate project
projectsRouter.post('/:id/duplicate', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const sourceId = req.params.id;

    const source = await checkProjectAccess(sourceId, userId, 'viewer');
    const [folders, files] = await Promise.all([
      prisma.folder.findMany({ where: { projectId: sourceId } }),
      prisma.file.findMany({ where: { projectId: sourceId } }),
    ]);

    const newProject = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name: `${source.name} Copy`,
          description: source.description,
          type: source.type,
          tags: source.tags,
          ownerId: userId,
          lastOpenedAt: new Date(),
        },
      });

      const folderIdMap = new Map<string, string>();
      for (const f of folders) {
        const newFolder = await tx.folder.create({
          data: {
            projectId: created.id,
            name: f.name,
            path: f.path,
          },
        });
        folderIdMap.set(f.id, newFolder.id);
      }

      // Update parentId references for folders
      for (const f of folders) {
        if (f.parentId && folderIdMap.has(f.parentId)) {
          const newFolderId = folderIdMap.get(f.id)!;
          const newParentId = folderIdMap.get(f.parentId)!;
          await tx.folder.update({
            where: { id: newFolderId },
            data: { parentId: newParentId },
          });
        }
      }

      for (const f of files) {
        await tx.file.create({
          data: {
            projectId: created.id,
            folderId: f.folderId ? folderIdMap.get(f.folderId) || null : null,
            name: f.name,
            path: f.path,
            content: f.content,
            language: f.language,
            size: f.size,
          },
        });
      }

      return created;
    });

    res.status(201).json({
      project: {
        id: newProject.id,
        name: newProject.name,
        type: newProject.type,
        createdAt: newProject.createdAt.getTime(),
        updatedAt: newProject.updatedAt.getTime(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/files - List files
projectsRouter.get('/:id/files', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    await checkProjectAccess(projectId, userId, 'viewer');
    const files = await prisma.file.findMany({
      where: { projectId },
      orderBy: { path: 'asc' },
    });

    res.json({ files });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/files - Create file
projectsRouter.post('/:id/files', requireAuth, validateBody(createFileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    await checkProjectAccess(projectId, userId, 'editor');

    const { id, name, path, content, language, folderId } = req.body;

    const file = await prisma.file.create({
      data: {
        ...(id ? { id } : {}),
        projectId,
        name: name.trim(),
        path: path.trim(),
        content: content || '',
        language: language || 'plaintext',
        size: (content || '').length,
        folderId: folderId || null,
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ file });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/folders - List folders
projectsRouter.get('/:id/folders', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    await checkProjectAccess(projectId, userId, 'viewer');
    const folders = await prisma.folder.findMany({
      where: { projectId },
      orderBy: { path: 'asc' },
    });

    res.json({ folders });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/folders - Create folder
projectsRouter.post('/:id/folders', requireAuth, validateBody(createFolderSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    await checkProjectAccess(projectId, userId, 'editor');

    const { id, name, path, parentId } = req.body;

    const folder = await prisma.folder.create({
      data: {
        ...(id ? { id } : {}),
        projectId,
        name: name.trim(),
        path: path.trim(),
        parentId: parentId || null,
      },
    });

    res.status(201).json({ folder });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/commits - Create commit record
projectsRouter.post('/:id/commits', requireAuth, validateBody(createCommitSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    await checkProjectAccess(projectId, userId, 'editor');

    const { message, authorName, snapshot, filesCount } = req.body;

    const commit = await prisma.commit.create({
      data: {
        projectId,
        authorId: userId,
        authorName: authorName || req.user!.name,
        message: message.trim(),
        snapshot: snapshot || {},
        filesCount: Number(filesCount) || 0,
      },
    });

    res.status(201).json({
      commit: {
        id: commit.id,
        author: commit.authorName,
        message: commit.message,
        timestamp: commit.createdAt.getTime(),
        filesCount: commit.filesCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/commits - List commits
projectsRouter.get('/:id/commits', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    await checkProjectAccess(projectId, userId, 'viewer');

    const commits = await prisma.commit.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      commits: commits.map((c) => ({
        id: c.id,
        author: c.authorName,
        message: c.message,
        timestamp: c.createdAt.getTime(),
        filesCount: c.filesCount,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/sync - Full project synchronization endpoint
projectsRouter.post('/:id/sync', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;
    const { project: clientProject, rootFiles } = req.body || {};

    let project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { where: { userId } } },
    });

    // If project doesn't exist yet on server, create it for this user!
    if (!project) {
      project = await prisma.project.create({
        data: {
          id: projectId,
          name: clientProject?.name || 'Untitled Project',
          description: clientProject?.description || null,
          type: clientProject?.type || 'react',
          tags: clientProject?.tags || [],
          ownerId: userId,
          lastOpenedAt: new Date(),
        },
        include: { members: { where: { userId } } },
      });
    } else {
      // Check authorization
      const isOwner = project.ownerId === userId;
      const isMember = project.members.length > 0;
      if (!isOwner && !isMember) {
        throw new AppError(403, 'FORBIDDEN', 'Access denied to this project');
      }
    }

    // If rootFiles provided, sync files into PostgreSQL atomically
    if (Array.isArray(rootFiles)) {
      await prisma.$transaction(async (tx) => {
        // Collect flat list of client files and folders
        const clientFiles: any[] = [];
        const clientFolders: any[] = [];

        const traverse = (nodes: any[], parentId: string | null = null) => {
          for (const node of nodes) {
            if (node.type === 'folder') {
              clientFolders.push({
                id: node.id,
                name: node.name,
                path: node.path,
                parentId,
              });
              if (node.children) {
                traverse(node.children, node.id);
              }
            } else if (node.type === 'file') {
              clientFiles.push({
                id: node.id,
                name: node.name,
                path: node.path,
                content: node.content || '',
                language: node.language || 'plaintext',
                folderId: parentId,
              });
            }
          }
        };
        traverse(rootFiles);

        // Upsert folders
        for (const f of clientFolders) {
          await tx.folder.upsert({
            where: { id: f.id },
            create: {
              id: f.id,
              projectId,
              name: f.name,
              path: f.path,
              parentId: f.parentId,
            },
            update: {
              name: f.name,
              path: f.path,
              parentId: f.parentId,
            },
          });
        }

        // Upsert files
        for (const f of clientFiles) {
          await tx.file.upsert({
            where: { id: f.id },
            create: {
              id: f.id,
              projectId,
              name: f.name,
              path: f.path,
              content: f.content,
              language: f.language,
              size: f.content.length,
              folderId: f.folderId,
            },
            update: {
              name: f.name,
              path: f.path,
              content: f.content,
              language: f.language,
              size: f.content.length,
              folderId: f.folderId,
            },
          });
        }

        // Update project timestamp
        await tx.project.update({
          where: { id: projectId },
          data: {
            updatedAt: new Date(),
            ...(clientProject?.name ? { name: clientProject.name } : {}),
            ...(clientProject?.description !== undefined ? { description: clientProject.description } : {}),
          },
        });
      });
    }

    res.json({
      success: true,
      projectId,
      syncedAt: Date.now(),
      message: 'Project synchronized with PostgreSQL database',
    });
  } catch (err) {
    next(err);
  }
});
