import JSZip from 'jszip';
import { AppSettings, FileNode, GitCommit, Project, ProjectType } from '../types';
import {
  STUDYFLOW_PROJECT,
  MY_WEBSITE_PROJECT,
  PYTHON_DATA_PROJECT,
  DEFAULT_DEMO_PROJECT,
  createTemplateProject
} from './demoProject';

const DB_NAME = 'macos_code_studio_db';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_SETTINGS = 'settings';

export const DEFAULT_SETTINGS: AppSettings = {
  editor: {
    fontSize: 14,
    fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
    minimap: true,
    bracketMatching: true,
    cursorStyle: 'line',
    cursorBlinking: 'smooth',
    formatOnSave: true,
    autoComplete: true,
    smoothScrolling: true,
  },
  appearance: {
    themeMode: 'dark',
    editorTheme: 'midnight',
    accentColor: '#007AFF',
    compactMode: false,
    translucency: true,
  },
  interface: {
    showSidebar: true,
    showTerminal: true,
    sidebarWidth: 260,
    terminalHeight: 200,
    reducedMotion: false,
    mobileToolbar: true,
  },
  project: {
    autoSave: true,
    autoSaveDelay: 1000,
    backendSync: true,
  },
  theme: 'dark',
  editorTheme: 'midnight',
  fontSize: 14,
  fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
  tabSize: 2,
  wordWrap: 'on',
  minimap: true,
  lineNumbers: 'on',
  bracketPairColorization: true,
  cursorBlinking: 'smooth',
  cursorStyle: 'line',
  autoSave: true,
  compactMode: false,
  windowMode: 'desktop',
  reducedMotion: false,
  mobileToolbar: true,
  terminalFontSize: 13,
};

// IndexedDB Helper
class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // Projects CRUD
  async getAllProjects(): Promise<Project[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PROJECTS, 'readonly');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list: Project[] = req.result || [];
          if (list.length === 0) {
            // Seed multiple initial projects
            const initialList = [STUDYFLOW_PROJECT, MY_WEBSITE_PROJECT, PYTHON_DATA_PROJECT];
            initialList.forEach((p) => this.saveProject(p));
            resolve(initialList);
          } else {
            // Sort by lastOpenedAt or updatedAt
            list.sort((a, b) => (b.lastOpenedAt || b.updatedAt || 0) - (a.lastOpenedAt || a.updatedAt || 0));
            resolve(list);
          }
        };
        req.onerror = () => {
          resolve(this.getProjectsFromLocalStorage());
        };
      });
    } catch {
      return this.getProjectsFromLocalStorage();
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PROJECTS, 'readonly');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      const projects = this.getProjectsFromLocalStorage();
      return projects.find((p) => p.id === id) || null;
    }
  }

  async saveProject(project: Project): Promise<void> {
    project.updatedAt = Date.now();
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      store.put(project);
    } catch {
      // fallback localStorage
      const projects = this.getProjectsFromLocalStorage();
      const idx = projects.findIndex((p) => p.id === project.id);
      if (idx >= 0) {
        projects[idx] = project;
      } else {
        projects.push(project);
      }
      localStorage.setItem('macos_code_studio_projects', JSON.stringify(projects));
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      store.delete(id);
    } catch {
      const projects = this.getProjectsFromLocalStorage().filter((p) => p.id !== id);
      localStorage.setItem('macos_code_studio_projects', JSON.stringify(projects));
    }
  }

  async duplicateProject(projectOrId: Project | string): Promise<Project | null> {
    const project = typeof projectOrId === 'string' ? await this.getProject(projectOrId) : projectOrId;
    if (!project) return null;

    const newName = `${project.name} Copy`;
    const newId = `proj-${Date.now()}`;
    const duplicated: Project = {
      ...project,
      id: newId,
      name: newName,
      rootPath: `~/Projects/${newName}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
      gitCommits: [
        {
          id: 'dup-commit',
          message: `Duplicated from ${project.name}`,
          timestamp: Date.now(),
          filesCount: project.rootFiles.length,
          author: 'Developer <dev@macos.studio>',
        },
      ],
    };
    await this.saveProject(duplicated);
    return duplicated;
  }

  async updateProjectLastOpened(id: string): Promise<void> {
    const project = await this.getProject(id);
    if (project) {
      project.lastOpenedAt = Date.now();
      await this.saveProject(project);
    }
  }

  async renameProject(id: string, newName: string): Promise<void> {
    const project = await this.getProject(id);
    if (project) {
      project.name = newName.trim();
      project.rootPath = `~/Projects/${newName.trim()}`;
      project.updatedAt = Date.now();
      await this.saveProject(project);
    }
  }

  async createNewProject(name: string, type: ProjectType = 'typescript', description?: string): Promise<Project> {
    const proj = createTemplateProject(name, type, description);
    await this.saveProject(proj);
    return proj;
  }

  async commitGitChanges(
    projectId: string,
    message: string,
    changedFiles: number | string[]
  ): Promise<Project | null> {
    const project = await this.getProject(projectId);
    if (!project) return null;

    const count = typeof changedFiles === 'number' ? changedFiles : changedFiles.length;
    const commit: GitCommit = {
      id: Math.random().toString(16).substring(2, 9),
      message: message.trim() || 'Working tree commit',
      timestamp: Date.now(),
      filesCount: count,
      author: 'Developer <dev@macos.studio>',
    };
    project.gitCommits = [commit, ...(project.gitCommits || [])];
    project.updatedAt = Date.now();
    await this.saveProject(project);
    return project;
  }

  private getProjectsFromLocalStorage(): Project[] {
    try {
      const data = localStorage.getItem('macos_code_studio_projects');
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return [STUDYFLOW_PROJECT, MY_WEBSITE_PROJECT, PYTHON_DATA_PROJECT];
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_SETTINGS, 'readonly');
        const store = tx.objectStore(STORE_SETTINGS);
        const req = store.get('app_settings');
        req.onsuccess = () => resolve(req.result ? { ...DEFAULT_SETTINGS, ...req.result } : DEFAULT_SETTINGS);
        req.onerror = () => resolve(this.getSettingsFromLocalStorage());
      });
    } catch {
      return this.getSettingsFromLocalStorage();
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = tx.objectStore(STORE_SETTINGS);
      store.put(settings, 'app_settings');
    } catch {
      // fallback
    }
    try {
      localStorage.setItem('macos_code_studio_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  private getSettingsFromLocalStorage(): AppSettings {
    try {
      const data = localStorage.getItem('macos_code_studio_settings');
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  }

  // ZIP Export
  async exportProjectAsZip(project: Project): Promise<Blob> {
    const zip = new JSZip();

    const addFilesToZip = (nodes: FileNode[], currentPath: string = '') => {
      for (const node of nodes) {
        const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;
        if (node.type === 'folder' && node.children) {
          const folder = zip.folder(nodePath);
          if (folder) {
            addFilesToZip(node.children, nodePath);
          }
        } else if (node.type === 'file') {
          zip.file(nodePath, node.content || '');
        }
      }
    };

    addFilesToZip(project.rootFiles);
    return await zip.generateAsync({ type: 'blob' });
  }
}

export const storageService = new StorageService();

// File Tree Helpers
export function findNodeById(nodes: FileNode[], id: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function updateNodeInTree(nodes: FileNode[], id: string, updater: (node: FileNode) => FileNode): FileNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return updater(node);
    }
    if (node.children) {
      return {
        ...node,
        children: updateNodeInTree(node.children, id, updater),
      };
    }
    return node;
  });
}

export function removeNodeFromTree(nodes: FileNode[], id: string): FileNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.children) {
        return {
          ...node,
          children: removeNodeFromTree(node.children, id),
        };
      }
      return node;
    });
}

export function insertNodeIntoTree(nodes: FileNode[], parentId: string | null, newNode: FileNode): FileNode[] {
  if (!parentId) {
    return [...nodes, newNode];
  }

  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        isExpanded: true,
        children: [...(node.children || []), newNode],
      };
    }
    if (node.children) {
      return {
        ...node,
        children: insertNodeIntoTree(node.children, parentId, newNode),
      };
    }
    return node;
  });
}

export function getAllFilesFlat(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  const traverse = (list: FileNode[]) => {
    for (const item of list) {
      if (item.type === 'file') {
        result.push(item);
      }
      if (item.children) {
        traverse(item.children);
      }
    }
  };
  traverse(nodes);
  return result;
}

export function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
    case 'scss':
    case 'less':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'kt':
    case 'kts':
      return 'kotlin';
    case 'c':
      return 'c';
    case 'cpp':
    case 'h':
    case 'hpp':
      return 'cpp';
    case 'sql':
      return 'sql';
    case 'sh':
    case 'bash':
    case 'zsh':
      return 'shell';
    case 'yaml':
    case 'yml':
      return 'yaml';
    default:
      return 'plaintext';
  }
}

export function downloadFileContent(fileName: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

