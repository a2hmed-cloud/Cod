import { Router } from 'express';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { projectsRouter } from './routes/projects';
import { filesRouter } from './routes/files';
import { foldersRouter } from './routes/folders';
import { settingsRouter } from './routes/settings';
import { terminalRouter } from './routes/terminal';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/files', filesRouter);
apiRouter.use('/folders', foldersRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/terminal', terminalRouter);
