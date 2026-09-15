import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let prismaInstance: PrismaClient | null = null;

export function ensurePostgresRunning(): void {
  try {
    execSync('su - postgres -c "/usr/lib/postgresql/15/bin/pg_isready -h 127.0.0.1 -p 5432"', {
      stdio: 'ignore',
      timeout: 3000,
    });
  } catch {
    try {
      execSync('mkdir -p /var/run/postgresql && chown -R postgres:postgres /var/run/postgresql', {
        stdio: 'ignore',
        timeout: 3000,
      });
      execSync('su - postgres -c "/usr/lib/postgresql/15/bin/pg_ctl -D /data/postgres -l /data/postgres/logfile start"', {
        stdio: 'ignore',
        timeout: 5000,
      });
    } catch (err: any) {
      console.warn('[PostgreSQL] Could not start postgres automatically:', err?.message);
    }
  }
}

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    ensurePostgresRunning();
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prismaInstance;
}

export const prisma = getPrisma();
