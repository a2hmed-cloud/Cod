import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

export const terminalRouter = Router();

const terminalExecSchema = z.object({
  command: z.string().trim().min(1, 'Command cannot be empty'),
  args: z.any().optional(),
});

// POST /api/terminal/execute
terminalRouter.post('/execute', validateBody(terminalExecSchema), (req: Request, res: Response) => {
  const { command } = req.body;
  const cmd = command.trim();
  const timestamp = new Date().toLocaleTimeString();

  // Real safe environment queries
  if (cmd === 'node -v' || cmd === 'node --version') {
    return res.json({
      success: true,
      status: 0,
      stdout: process.version,
      stderr: '',
    });
  }

  if (cmd === 'date') {
    return res.json({
      success: true,
      status: 0,
      stdout: new Date().toString(),
      stderr: '',
    });
  }

  if (cmd.startsWith('echo ')) {
    return res.json({
      success: true,
      status: 0,
      stdout: cmd.substring(5),
      stderr: '',
    });
  }

  // Truthful rejection of arbitrary process execution in browser/cloud sandbox
  return res.status(200).json({
    success: false,
    status: 126,
    stdout: '',
    stderr: `[${timestamp}] Security Notice: Host command execution ('${cmd}') is restricted in this cloud container sandbox.\n` +
      `Process spawning is disabled for security isolation.\n` +
      `Use built-in project workspace tools, File Explorer, and PostgreSQL sync to manage and inspect code.`,
  });
});
