import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/apiRouter';
import { apiErrorHandler } from './server/middleware/errorHandler';
import { ensurePostgresRunning } from './server/db/client';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic security and parsing middlewares
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Ensure PostgreSQL is active
  ensurePostgresRunning();

  // API Routes
  app.use('/api', apiRouter);

  // Central API Error Handler
  app.use('/api', apiErrorHandler);

  // Development vs Production Asset Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Cod Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Cod Server Fatal Error]', err);
  process.exit(1);
});
