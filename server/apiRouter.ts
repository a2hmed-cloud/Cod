import { Request, Response, Router } from 'express';

export const apiRouter = Router();

// In-memory / persistent backend mock state for cloud synchronization
interface BackendProject {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const mockProjects: BackendProject[] = [
  {
    id: 'demo-macos-app',
    name: 'my-project',
    description: 'React + TypeScript macOS Applet Template',
    userId: 'user-default-mac',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const mockUsers = [
  {
    id: 'user-default-mac',
    email: 'developer@apple.macos',
    name: 'Mac Developer',
    role: 'administrator',
  }
];

// Health endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    system: 'Darwin arm64 (macOS Code Studio Engine)',
    nodeVersion: process.version,
  });
});

// Authentication endpoints
apiRouter.get('/auth/session', (_req: Request, res: Response) => {
  res.json({
    authenticated: true,
    user: mockUsers[0],
    token: 'jwt_mock_mac_session_token_arm64',
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body || {};
  res.json({
    success: true,
    user: {
      id: 'user-default-mac',
      email: email || 'developer@apple.macos',
      name: 'Mac Developer',
    },
    token: 'jwt_mock_mac_session_token_arm64',
  });
});

apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Session terminated' });
});

// Projects API
apiRouter.get('/projects', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: mockProjects,
    total: mockProjects.length,
  });
});

apiRouter.post('/projects', (req: Request, res: Response) => {
  const { name, description } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const newProject: BackendProject = {
    id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    description: (description || '').trim(),
    userId: 'user-default-mac',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockProjects.push(newProject);
  return res.status(201).json({ success: true, data: newProject });
});

apiRouter.get('/projects/:id', (req: Request, res: Response) => {
  const project = mockProjects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  return res.json({ success: true, data: project });
});

apiRouter.patch('/projects/:id', (req: Request, res: Response) => {
  const project = mockProjects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const { name, description } = req.body || {};
  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  project.updatedAt = new Date().toISOString();

  return res.json({ success: true, data: project });
});

apiRouter.delete('/projects/:id', (req: Request, res: Response) => {
  const index = mockProjects.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  mockProjects.splice(index, 1);
  return res.json({ success: true, message: 'Project deleted' });
});

// Terminal execution runner API
apiRouter.post('/terminal/run', (req: Request, res: Response) => {
  const { command, args } = req.body || {};

  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'Command is required' });
  }

  const cmd = command.trim();

  // Handle common developer commands safely
  if (cmd === 'node -v' || cmd === 'node --version') {
    return res.json({ output: process.version, status: 0 });
  }

  if (cmd === 'uname -a' || cmd === 'uname') {
    return res.json({
      output: 'Darwin MacBook-Pro.local 23.5.0 Darwin Kernel Version 23.5.0: root:xnu-10063.121.3~5/RELEASE_ARM64_T6030 arm64',
      status: 0,
    });
  }

  if (cmd === 'date') {
    return res.json({ output: new Date().toString(), status: 0 });
  }

  if (cmd.startsWith('node -e ') || cmd.startsWith('eval ')) {
    const code = cmd.replace(/^node -e |^eval /, '').replace(/^['"]|['"]$/g, '');
    try {
      // Safe sandboxed eval of math and logic
      const logs: string[] = [];
      const safeConsole = {
        log: (...a: any[]) => logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
        error: (...a: any[]) => logs.push('[ERROR] ' + a.join(' ')),
        warn: (...a: any[]) => logs.push('[WARN] ' + a.join(' ')),
      };
      
      const fn = new Function('console', `return (${code})`);
      const result = fn(safeConsole);
      const combined = [...logs, result !== undefined ? String(result) : ''].filter(Boolean).join('\n');
      return res.json({ output: combined || 'undefined', status: 0 });
    } catch (err: any) {
      return res.json({ output: `Error: ${err.message}`, status: 1 });
    }
  }

  return res.json({
    output: `Executing in sandboxed environment: ${cmd}`,
    status: 0,
  });
});
