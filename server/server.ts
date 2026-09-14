import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// In-Memory Database Store for backend demo sync
const db = {
  users: [
    { id: 'usr-1', email: 'developer@apple.com', name: 'Mac Developer', token: 'demo-jwt-token-12345' }
  ],
  projects: [] as any[],
  files: [] as any[],
  folders: [] as any[],
  settings: {}
};

// CORS / Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logger middleware
app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// --- AUTH ROUTES ---
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const newUser = {
    id: `usr-${Date.now()}`,
    email,
    name: name || email.split('@')[0],
    token: `token-${Date.now()}`
  };
  db.users.push(newUser);
  return res.status(201).json({ user: newUser, token: newUser.token });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.users.find(u => u.email === email) || db.users[0];
  return res.json({ user, token: user.token });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  return res.json({ user: db.users[0] });
});

// --- PROJECTS ROUTES ---
app.get('/api/projects', (_req: Request, res: Response) => {
  return res.json({ projects: db.projects });
});

app.post('/api/projects', (req: Request, res: Response) => {
  const project = req.body;
  if (!project.id || !project.name) {
    return res.status(400).json({ error: 'Invalid project data' });
  }
  const existing = db.projects.findIndex(p => p.id === project.id);
  if (existing >= 0) {
    db.projects[existing] = project;
  } else {
    db.projects.push(project);
  }
  return res.status(201).json({ project });
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const files = db.files.filter(f => f.path.startsWith(`/${project.name}`) || f.id.startsWith(project.id));
  const folders = db.folders.filter(f => f.path.startsWith(`/${project.name}`) || f.id.startsWith(project.id));
  return res.json({ project, files, folders });
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  db.projects = db.projects.filter(p => p.id !== req.params.id);
  return res.json({ success: true, message: 'Project deleted' });
});

// --- FILES ROUTES ---
app.post('/api/files', (req: Request, res: Response) => {
  const file = req.body;
  const idx = db.files.findIndex(f => f.id === file.id);
  if (idx >= 0) {
    db.files[idx] = file;
  } else {
    db.files.push(file);
  }
  return res.status(201).json({ file });
});

app.patch('/api/files/:id', (req: Request, res: Response) => {
  const idx = db.files.findIndex(f => f.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'File not found' });
  db.files[idx] = { ...db.files[idx], ...req.body, updatedAt: Date.now() };
  return res.json({ file: db.files[idx] });
});

app.delete('/api/files/:id', (req: Request, res: Response) => {
  db.files = db.files.filter(f => f.id !== req.params.id);
  return res.json({ success: true });
});

// --- TERMINAL EXECUTION ROUTE ---
app.post('/api/terminal/execute', (req: Request, res: Response) => {
  const { command, code, language } = req.body;
  const timestamp = new Date().toLocaleTimeString();

  if (command === 'npm run dev' || command === 'npm dev') {
    return res.json({
      success: true,
      stdout: `[${timestamp}] > my-project@1.0.0 dev\n[${timestamp}] > vite\n\n  VITE v6.0.0 ready in 185 ms\n  ➜  Local:   http://localhost:3000/\n  ➜  Network: use --host to expose`,
      stderr: ''
    });
  }

  if (command === 'npm build' || command === 'npm run build') {
    return res.json({
      success: true,
      stdout: `[${timestamp}] > my-project@1.0.0 build\n[${timestamp}] > tsc && vite build\n\nvite v6.0.0 building for production...\ntranspiling modules...\n✓ 8 modules transformed.\ndist/index.html   0.45 kB │ gzip: 0.28 kB\ndist/assets/index-81a9f0e1.js   142.30 kB │ gzip: 42.10 kB\n✓ built in 1.12s`,
      stderr: ''
    });
  }

  if (language === 'python' || command?.startsWith('python')) {
    return res.json({
      success: true,
      stdout: `[${timestamp}] Python 3.11.4 Executed Successfully:\n[Output]: Hello from macOS Code Studio Python Runtime!`,
      stderr: ''
    });
  }

  return res.json({
    success: true,
    stdout: `[${timestamp}] Process exited with code 0 for command: ${command || 'Execution'}`,
    stderr: ''
  });
});

export default app;
