import { projectsApi, getStoredToken } from './api';
import { Project, FileNode } from '../types';
import { storageService } from './storage';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'local-only';

export interface SyncListener {
  (status: SyncStatus, error?: string): void;
}

class SyncEngine {
  private listeners: Set<SyncListener> = new Set();
  private currentStatus: SyncStatus = 'local-only';
  private syncDebounceTimers: Map<string, any> = new Map();
  private pendingProjects: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  public getStatus(): SyncStatus {
    return this.currentStatus;
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.currentStatus);
    return () => this.listeners.delete(listener);
  }

  private setStatus(status: SyncStatus, error?: string) {
    this.currentStatus = status;
    this.listeners.forEach((l) => l(status, error));
  }

  private handleNetworkChange(isOnline: boolean) {
    if (!isOnline) {
      this.setStatus('offline');
    } else if (getStoredToken()) {
      this.syncAllPending();
    } else {
      this.setStatus('local-only');
    }
  }

  /**
   * Schedules a debounced sync for a specific project.
   */
  public queueSync(project: Project, rootFiles: FileNode[], delayMs = 1500) {
    const token = getStoredToken();
    if (!token) {
      this.setStatus('local-only');
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setStatus('offline');
      return;
    }

    this.pendingProjects.add(project.id);
    this.setStatus('syncing');

    if (this.syncDebounceTimers.has(project.id)) {
      clearTimeout(this.syncDebounceTimers.get(project.id));
    }

    const timer = setTimeout(async () => {
      this.syncDebounceTimers.delete(project.id);
      await this.performSync(project, rootFiles);
    }, delayMs);

    this.syncDebounceTimers.set(project.id, timer);
  }

  /**
   * Immediately synchronizes a project with PostgreSQL.
   */
  public async performSync(project: Project, rootFiles: FileNode[]): Promise<boolean> {
    const token = getStoredToken();
    if (!token) {
      this.setStatus('local-only');
      return false;
    }

    this.setStatus('syncing');
    try {
      await projectsApi.syncProject(project.id, project, rootFiles);
      this.pendingProjects.delete(project.id);
      this.setStatus('synced');
      return true;
    } catch (err: any) {
      console.warn('[SyncEngine] Failed to sync project to server:', err?.message || err);
      if (err?.statusCode === 401) {
        this.setStatus('local-only', 'Session expired. Log in to sync to cloud.');
      } else {
        this.setStatus('error', err?.message || 'Synchronization failed');
      }
      return false;
    }
  }

  /**
   * Syncs all pending projects.
   */
  public async syncAllPending() {
    const token = getStoredToken();
    if (!token || this.pendingProjects.size === 0) return;

    for (const projectId of this.pendingProjects) {
      const p = await storageService.getProject(projectId);
      if (p) {
        await this.performSync(p, p.rootFiles);
      }
    }
  }
}

export const syncEngine = new SyncEngine();
