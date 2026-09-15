import { apiClient, setStoredToken, getStoredToken, ApiError } from './client';
import { Project, FileNode, AppSettings, GitCommit } from '../../types';

export { ApiError, getStoredToken, setStoredToken };

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  message?: string;
}

export const authApi = {
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', { email, password, name });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setStoredToken(null);
    }
  },

  async getMe(): Promise<AuthUser | null> {
    if (!getStoredToken()) return null;
    try {
      const res = await apiClient.get<{ user: AuthUser }>('/auth/me');
      return res.user;
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setStoredToken(null);
        return null;
      }
      throw err;
    }
  },
};

export const projectsApi = {
  async list(): Promise<Array<{
    id: string;
    name: string;
    description?: string;
    type?: string;
    tags?: string[];
    createdAt: number;
    updatedAt: number;
    lastOpenedAt?: number | null;
    filesCount: number;
    commitsCount: number;
  }>> {
    const res = await apiClient.get<{ projects: any[] }>('/projects');
    return res.projects;
  },

  async get(id: string): Promise<{
    project: Project;
    folders: any[];
    files: any[];
    commits: GitCommit[];
  }> {
    return apiClient.get<{
      project: Project;
      folders: any[];
      files: any[];
      commits: GitCommit[];
    }>(`/projects/${id}`);
  },

  async create(data: {
    id?: string;
    name: string;
    description?: string;
    type?: string;
    tags?: string[];
    rootFiles?: FileNode[];
  }): Promise<{ project: Project }> {
    return apiClient.post<{ project: Project }>('/projects', data);
  },

  async update(id: string, data: Partial<Project>): Promise<{ project: Project }> {
    return apiClient.patch<{ project: Project }>(`/projects/${id}`, data);
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/projects/${id}`);
  },

  async duplicate(id: string): Promise<{ project: Project }> {
    return apiClient.post<{ project: Project }>(`/projects/${id}/duplicate`);
  },

  async syncProject(id: string, clientProject: Partial<Project>, rootFiles: FileNode[]): Promise<{
    success: boolean;
    syncedAt: number;
  }> {
    return apiClient.post(`/projects/${id}/sync`, {
      project: clientProject,
      rootFiles,
    });
  },

  async listCommits(projectId: string): Promise<{ commits: GitCommit[] }> {
    return apiClient.get<{ commits: GitCommit[] }>(`/projects/${projectId}/commits`);
  },

  async createCommit(projectId: string, data: {
    message: string;
    authorName?: string;
    snapshot: any;
    filesCount: number;
  }): Promise<{ commit: GitCommit }> {
    return apiClient.post<{ commit: GitCommit }>(`/projects/${projectId}/commits`, data);
  },
};

export const filesApi = {
  async update(fileId: string, data: { name?: string; path?: string; content?: string; language?: string }): Promise<any> {
    return apiClient.patch(`/files/${fileId}`, data);
  },

  async delete(fileId: string): Promise<any> {
    return apiClient.delete(`/files/${fileId}`);
  },
};

export const foldersApi = {
  async update(folderId: string, data: { name?: string; path?: string }): Promise<any> {
    return apiClient.patch(`/folders/${folderId}`, data);
  },

  async delete(folderId: string): Promise<any> {
    return apiClient.delete(`/folders/${folderId}`);
  },
};

export const settingsApi = {
  async get(): Promise<AppSettings | null> {
    try {
      const res = await apiClient.get<{ settings: any }>('/settings');
      return res.settings;
    } catch {
      return null;
    }
  },

  async update(data: any): Promise<any> {
    return apiClient.patch('/settings', data);
  },
};

export const terminalApi = {
  async execute(command: string, args?: any): Promise<{
    success: boolean;
    status: number;
    stdout: string;
    stderr: string;
  }> {
    return apiClient.post('/terminal/execute', { command, args });
  },
};

export const healthApi = {
  async check(): Promise<{
    status: string;
    database: string;
    engine?: string;
    orm?: string;
    uptime?: number;
  }> {
    return apiClient.get('/health');
  },
};
