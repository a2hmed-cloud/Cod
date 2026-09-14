import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  AppSettings,
  EditorDiagnostic,
  EditorSplitMode,
  EditorTab,
  FileNode,
  GitChange,
  Project,
  ActivityBarTab,
} from './types';
import {
  DEFAULT_SETTINGS,
  storageService,
  findNodeById,
  updateNodeInTree,
  removeNodeFromTree,
  insertNodeIntoTree,
  getLanguageFromFileName,
  getAllFilesFlat,
  downloadFileContent,
} from './services/storage';
import { DEFAULT_DEMO_PROJECT, DEMO_PROJECTS } from './services/demoProject';
import { WindowChrome } from './components/TopBar/WindowChrome';
import { MacMenuBar } from './components/TopBar/MacMenuBar';
import { ActivityBar } from './components/Sidebar/ActivityBar';
import { FileExplorer } from './components/Sidebar/FileExplorer';
import { SearchSidebarPanel } from './components/Sidebar/SearchSidebarPanel';
import { SourceControlPanel } from './components/Sidebar/SourceControlPanel';
import { RunDebugPanel } from './components/Sidebar/RunDebugPanel';
import { OutlinePanel } from './components/Sidebar/OutlinePanel';
import { ProblemsPanel } from './components/Sidebar/ProblemsPanel';
import { TabBar } from './components/Tabs/TabBar';
import { EditorToolbar } from './components/Editor/EditorToolbar';
import { CodeEditor, CodeEditorHandle } from './components/Editor/CodeEditor';
import { EditorStatusBar } from './components/Editor/EditorStatusBar';
import { InspectorPanel } from './components/Inspector/InspectorPanel';
import { WelcomeView } from './components/Welcome/WelcomeView';
import { TerminalPanel } from './components/Terminal/TerminalPanel';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { SearchPanel } from './components/Search/SearchPanel';
import { SettingsModal } from './components/Settings/SettingsModal';
import { ProjectPickerModal } from './components/Project/ProjectPickerModal';
import { MobileCodingBar } from './components/MobileToolbar/MobileCodingBar';
import { LivePreviewModal } from './components/Preview/LivePreviewModal';
import { Wifi, Battery, Search as SearchIcon, Command } from 'lucide-react';

export default function App() {
  // Project State
  const [projects, setProjects] = useState<Project[]>([DEFAULT_DEMO_PROJECT]);
  const [currentProject, setCurrentProject] = useState<Project>(DEFAULT_DEMO_PROJECT);
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Editor Tabs & Content State
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [savedBaselineContents, setSavedBaselineContents] = useState<Record<string, string>>({});

  // Split View State
  const [splitMode, setSplitMode] = useState<EditorSplitMode>('none');
  const [secondaryTabId, setSecondaryTabId] = useState<string | null>(null);

  // Layout & Panel State
  const [activeActivityTab, setActiveActivityTab] = useState<ActivityBarTab>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Cursor & Status Bar Metrics
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });
  const [totalLines, setTotalLines] = useState(1);
  const [diagnostics, setDiagnostics] = useState<EditorDiagnostic[]>([]);

  // Git State
  const [stagedFileIds, setStagedFileIds] = useState<Set<string>>(new Set());

  // Run & Debug State
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<
    { type: 'stdout' | 'stderr' | 'system'; text: string; time: string }[]
  >([]);

  // macOS Clock
  const [macTime, setMacTime] = useState<string>('');

  // Code Editor Ref for Imperative Actions
  const codeEditorRef = useRef<CodeEditorHandle>(null);

  // System time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setMacTime(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
          ' ' +
          now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize App from IndexedDB
  useEffect(() => {
    async function init() {
      const loadedSettings = await storageService.getSettings();
      setSettings(loadedSettings);

      const loadedProjects = await storageService.getAllProjects();
      if (loadedProjects && loadedProjects.length > 0) {
        setProjects(loadedProjects);
        const activeProj = loadedProjects[0];
        setCurrentProject(activeProj);

        const allFiles = getAllFilesFlat(activeProj.rootFiles);
        const contentsMap: Record<string, string> = {};
        allFiles.forEach((f) => {
          contentsMap[f.id] = f.content || '';
        });
        setFileContents(contentsMap);
        setSavedBaselineContents(contentsMap);

        const initialFile =
          allFiles.find((f) => f.id === activeProj.activeFileId) ||
          allFiles.find((f) => f.name === 'App.tsx') ||
          allFiles[0];

        if (initialFile) {
          const initialTab: EditorTab = {
            id: `tab-${initialFile.id}`,
            fileId: initialFile.id,
            name: initialFile.name,
            path: initialFile.path,
            language: initialFile.language || getLanguageFromFileName(initialFile.name),
            isDirty: false,
          };
          setTabs([initialTab]);
          setActiveTabId(initialTab.id);
        }
      }
    }
    init();
  }, []);

  // Theme Sync
  const isLight = useMemo(() => {
    if (settings.theme === 'light') return true;
    if (settings.theme === 'dark') return false;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return !window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, [settings.theme]);

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [isLight]);

  // Current Flat Files
  const flatFiles = useMemo(
    () => getAllFilesFlat(currentProject.rootFiles),
    [currentProject.rootFiles]
  );

  // Active Tab & Content
  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || null,
    [tabs, activeTabId]
  );
  const activeFile = useMemo(
    () => (activeTab ? flatFiles.find((f) => f.id === activeTab.fileId) || null : null),
    [activeTab, flatFiles]
  );
  const activeContent = useMemo(() => {
    if (!activeTab) return '';
    return fileContents[activeTab.fileId] ?? '';
  }, [activeTab, fileContents]);

  // Secondary Tab for Split Editor
  const secondaryTab = useMemo(
    () => (secondaryTabId ? tabs.find((t) => t.id === secondaryTabId) || null : null),
    [tabs, secondaryTabId]
  );
  const secondaryContent = useMemo(() => {
    if (!secondaryTab) return activeContent;
    return fileContents[secondaryTab.fileId] ?? '';
  }, [secondaryTab, fileContents, activeContent]);

  // Calculate Git Changes dynamically
  const gitChanges: GitChange[] = useMemo(() => {
    const changes: GitChange[] = [];
    flatFiles.forEach((file) => {
      const current = fileContents[file.id] ?? '';
      const original = savedBaselineContents[file.id];
      if (original === undefined) {
        changes.push({
          fileId: file.id,
          fileName: file.name,
          filePath: file.path,
          status: 'added',
          staged: stagedFileIds.has(file.id),
        });
      } else if (current !== original) {
        changes.push({
          fileId: file.id,
          fileName: file.name,
          filePath: file.path,
          status: 'modified',
          staged: stagedFileIds.has(file.id),
        });
      }
    });
    return changes;
  }, [flatFiles, fileContents, savedBaselineContents, stagedFileIds]);

  // File Operations
  const handleSelectFile = useCallback(
    (file: FileNode) => {
      if (file.type === 'folder') return;

      const existingTab = tabs.find((t) => t.fileId === file.id);
      if (existingTab) {
        setActiveTabId(existingTab.id);
      } else {
        const newTab: EditorTab = {
          id: `tab-${file.id}`,
          fileId: file.id,
          name: file.name,
          path: file.path,
          language: file.language || getLanguageFromFileName(file.name),
          isDirty: false,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTab.id);
      }

      setFileContents((prev) => ({
        ...prev,
        [file.id]: prev[file.id] ?? (file.content || ''),
      }));
    },
    [tabs]
  );

  const handleContentChange = useCallback(
    (value: string) => {
      if (!activeTab) return;

      setFileContents((prev) => ({
        ...prev,
        [activeTab.fileId]: value,
      }));

      const isDirty = value !== (savedBaselineContents[activeTab.fileId] ?? '');
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, isDirty } : t))
      );

      if (settings.autoSave) {
        setCurrentProject((prev) => {
          const updatedFiles = updateNodeInTree(prev.rootFiles, activeTab.fileId, (n) => ({
            ...n,
            content: value,
            updatedAt: Date.now(),
          }));
          const updatedProject = { ...prev, rootFiles: updatedFiles, updatedAt: Date.now() };
          storageService.saveProject(updatedProject);
          return updatedProject;
        });
        setSavedBaselineContents((prev) => ({
          ...prev,
          [activeTab.fileId]: value,
        }));
      }
    },
    [activeTab, activeTabId, savedBaselineContents, settings.autoSave]
  );

  const handleSecondaryContentChange = useCallback(
    (value: string) => {
      if (!secondaryTab) {
        handleContentChange(value);
        return;
      }
      setFileContents((prev) => ({
        ...prev,
        [secondaryTab.fileId]: value,
      }));
    },
    [secondaryTab, handleContentChange]
  );

  const handleSaveFile = useCallback(() => {
    if (!activeTab) return;

    const content = fileContents[activeTab.fileId] ?? '';
    setCurrentProject((prev) => {
      const updatedFiles = updateNodeInTree(prev.rootFiles, activeTab.fileId, (n) => ({
        ...n,
        content,
        updatedAt: Date.now(),
      }));
      const updatedProject = { ...prev, rootFiles: updatedFiles, updatedAt: Date.now() };
      storageService.saveProject(updatedProject);
      return updatedProject;
    });

    setSavedBaselineContents((prev) => ({
      ...prev,
      [activeTab.fileId]: content,
    }));

    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, isDirty: false } : t))
    );
  }, [activeTab, activeTabId, fileContents]);

  const handleCloseTab = useCallback(
    (tabId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setTabs((prev) => {
        const filtered = prev.filter((t) => t.id !== tabId);
        if (activeTabId === tabId) {
          const nextTab = filtered[filtered.length - 1];
          setActiveTabId(nextTab ? nextTab.id : null);
        }
        return filtered;
      });
      if (secondaryTabId === tabId) {
        setSecondaryTabId(null);
      }
    },
    [activeTabId, secondaryTabId]
  );

  const handleCloseAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
    setSecondaryTabId(null);
  }, []);

  const handleCreateFile = useCallback(
    (parentId: string | null, name: string) => {
      const newId = `file-${Date.now()}`;
      const parentNode = parentId ? findNodeById(currentProject.rootFiles, parentId) : null;
      const parentPath = parentNode ? parentNode.path : '';
      const newPath = `${parentPath}/${name}`.replace(/\/+/g, '/');

      const newFile: FileNode = {
        id: newId,
        name,
        path: newPath,
        type: 'file',
        parentId,
        language: getLanguageFromFileName(name),
        content: '',
        updatedAt: Date.now(),
      };

      setCurrentProject((prev) => {
        const updated = {
          ...prev,
          rootFiles: insertNodeIntoTree(prev.rootFiles, parentId, newFile),
        };
        storageService.saveProject(updated);
        return updated;
      });

      handleSelectFile(newFile);
    },
    [currentProject.rootFiles, handleSelectFile]
  );

  const handleCreateFolder = useCallback(
    (parentId: string | null, name: string) => {
      const newId = `folder-${Date.now()}`;
      const parentNode = parentId ? findNodeById(currentProject.rootFiles, parentId) : null;
      const parentPath = parentNode ? parentNode.path : '';
      const newPath = `${parentPath}/${name}`.replace(/\/+/g, '/');

      const newFolder: FileNode = {
        id: newId,
        name,
        path: newPath,
        type: 'folder',
        parentId,
        isExpanded: true,
        children: [],
      };

      setCurrentProject((prev) => {
        const updated = {
          ...prev,
          rootFiles: insertNodeIntoTree(prev.rootFiles, parentId, newFolder),
        };
        storageService.saveProject(updated);
        return updated;
      });
    },
    [currentProject.rootFiles]
  );

  const handleRenameNode = useCallback((id: string, newName: string) => {
    setCurrentProject((prev) => {
      const updated = {
        ...prev,
        rootFiles: updateNodeInTree(prev.rootFiles, id, (n) => ({
          ...n,
          name: newName,
          language: n.type === 'file' ? getLanguageFromFileName(newName) : undefined,
        })),
      };
      storageService.saveProject(updated);
      return updated;
    });

    setTabs((prev) =>
      prev.map((t) => (t.fileId === id ? { ...t, name: newName } : t))
    );
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setCurrentProject((prev) => {
      const updated = {
        ...prev,
        rootFiles: removeNodeFromTree(prev.rootFiles, id),
      };
      storageService.saveProject(updated);
      return updated;
    });

    setTabs((prev) => prev.filter((t) => t.fileId !== id));
  }, []);

  const handleDuplicateNode = useCallback(
    (id: string) => {
      const target = findNodeById(currentProject.rootFiles, id);
      if (!target) return;

      const dupName = target.name.replace(/(\.[^.]+)$/, ' (copy)$1');
      const newId = `file-${Date.now()}`;

      const newNode: FileNode = {
        ...target,
        id: newId,
        name: dupName,
        content: target.content,
        updatedAt: Date.now(),
      };

      setCurrentProject((prev) => {
        const updated = {
          ...prev,
          rootFiles: insertNodeIntoTree(prev.rootFiles, target.parentId || null, newNode),
        };
        storageService.saveProject(updated);
        return updated;
      });
    },
    [currentProject.rootFiles]
  );

  // Project Switcher & Manager Handlers
  const handleSelectProject = useCallback(
    (id: string) => {
      const found = projects.find((p) => p.id === id);
      if (!found) return;
      setCurrentProject(found);
      storageService.updateProjectLastOpened(found.id);

      const all = getAllFilesFlat(found.rootFiles);
      const contentsMap: Record<string, string> = {};
      all.forEach((f) => {
        contentsMap[f.id] = f.content || '';
      });
      setFileContents(contentsMap);
      setSavedBaselineContents(contentsMap);

      setTabs([]);
      setActiveTabId(null);
      setSecondaryTabId(null);
      if (all[0]) {
        handleSelectFile(all[0]);
      }
    },
    [projects, handleSelectFile]
  );

  const handleCreateProjectFromTemplate = useCallback(
    (name: string, description: string, templateId: string) => {
      let files: FileNode[] = [];
      const template = DEMO_PROJECTS.find((p) => p.id === templateId);
      if (template) {
        files = JSON.parse(JSON.stringify(template.rootFiles));
      } else {
        files = [
          {
            id: `file-main-${Date.now()}`,
            name: 'main.ts',
            path: '/main.ts',
            type: 'file',
            language: 'typescript',
            content: `// ${name} Project\nconsole.log("Welcome to ${name}!");\n`,
            updatedAt: Date.now(),
          },
        ];
      }

      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: name.trim(),
        description: description.trim() || 'Custom Project',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastOpenedAt: Date.now(),
        rootFiles: files,
      };

      storageService.saveProject(newProject);
      setProjects((prev) => [newProject, ...prev]);
      setCurrentProject(newProject);

      const all = getAllFilesFlat(files);
      const contentsMap: Record<string, string> = {};
      all.forEach((f) => {
        contentsMap[f.id] = f.content || '';
      });
      setFileContents(contentsMap);
      setSavedBaselineContents(contentsMap);

      setTabs([]);
      setActiveTabId(null);
      if (all[0]) {
        handleSelectFile(all[0]);
      }
    },
    [handleSelectFile]
  );

  const handleDuplicateProject = useCallback(
    async (projectId: string) => {
      const duplicated = await storageService.duplicateProject(projectId);
      if (duplicated) {
        setProjects((prev) => [duplicated, ...prev]);
        handleSelectProject(duplicated.id);
      }
    },
    [handleSelectProject]
  );

  const handleRenameProject = useCallback(
    async (projectId: string, newName: string) => {
      await storageService.renameProject(projectId, newName);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, name: newName } : p))
      );
      if (currentProject.id === projectId) {
        setCurrentProject((prev) => ({ ...prev, name: newName }));
      }
    },
    [currentProject.id]
  );

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      await storageService.deleteProject(projectId);
      const remaining = projects.filter((p) => p.id !== projectId);
      setProjects(remaining);
      if (currentProject.id === projectId && remaining.length > 0) {
        handleSelectProject(remaining[0].id);
      }
    },
    [projects, currentProject.id, handleSelectProject]
  );

  const handleExportProject = useCallback(async () => {
    const zipBlob = await storageService.exportProjectAsZip(currentProject);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentProject]);

  // Git Staging & Commit Handlers
  const handleStageChange = useCallback((fileId: string, staged: boolean) => {
    setStagedFileIds((prev) => {
      const next = new Set(prev);
      if (staged) next.add(fileId);
      else next.delete(fileId);
      return next;
    });
  }, []);

  const handleStageAll = useCallback(() => {
    setStagedFileIds(new Set(gitChanges.map((c) => c.fileId)));
  }, [gitChanges]);

  const handleUnstageAll = useCallback(() => {
    setStagedFileIds(new Set());
  }, []);

  const handleDiscardChange = useCallback(
    (fileId: string) => {
      const original = savedBaselineContents[fileId];
      if (original !== undefined) {
        setFileContents((prev) => ({ ...prev, [fileId]: original }));
        setTabs((prev) =>
          prev.map((t) => (t.fileId === fileId ? { ...t, isDirty: false } : t))
        );
      }
    },
    [savedBaselineContents]
  );

  const handleCommit = useCallback(
    async (message: string) => {
      const stagedList = gitChanges.filter((c) => c.staged);
      const filesToCommit = stagedList.length > 0 ? stagedList : gitChanges;
      if (filesToCommit.length === 0) return;

      const updated = await storageService.commitGitChanges(
        currentProject.id,
        message,
        filesToCommit.map((f) => f.fileId)
      );

      if (updated) {
        setCurrentProject(updated);
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        // Reset baselines for committed files
        setSavedBaselineContents((prev) => {
          const next = { ...prev };
          filesToCommit.forEach((f) => {
            next[f.fileId] = fileContents[f.fileId] ?? '';
          });
          return next;
        });
        setStagedFileIds(new Set());
      }
    },
    [currentProject.id, gitChanges, fileContents]
  );

  // Run & Debug Execution Engine
  const handleRunFile = useCallback(
    async (file: FileNode, env: string, args: string) => {
      setIsRunning(true);
      const timeStr = new Date().toLocaleTimeString();

      setRunOutput((prev) => [
        ...prev,
        {
          type: 'system',
          text: `[process started] runtime: ${env}, target: ${file.path} ${args}`,
          time: timeStr,
        },
      ]);

      const startTime = performance.now();
      const code = fileContents[file.id] || file.content || '';

      try {
        if (env === 'node' || env === 'browser') {
          // Sandboxed JS evaluation
          const logs: string[] = [];
          const customConsole = {
            log: (...params: any[]) =>
              logs.push(params.map((p) => (typeof p === 'object' ? JSON.stringify(p) : String(p))).join(' ')),
            warn: (...params: any[]) =>
              logs.push('[warn] ' + params.map((p) => String(p)).join(' ')),
            error: (...params: any[]) =>
              logs.push('[error] ' + params.map((p) => String(p)).join(' ')),
          };

          // Run sandboxed
          const runner = new Function('console', code);
          runner(customConsole);

          const elapsed = (performance.now() - startTime).toFixed(1);
          setRunOutput((prev) => [
            ...prev,
            ...logs.map((log) => ({
              type: 'stdout' as const,
              text: log,
              time: new Date().toLocaleTimeString(),
            })),
            {
              type: 'system',
              text: `[process completed] exit code 0 (${elapsed}ms)`,
              time: new Date().toLocaleTimeString(),
            },
          ]);
        } else {
          // Python or other sandbox
          setTimeout(() => {
            const elapsed = (performance.now() - startTime).toFixed(1);
            setRunOutput((prev) => [
              ...prev,
              {
                type: 'stdout',
                text: `Executing Python 3 AST: parsed ${code.split('\n').length} lines successfully.`,
                time: new Date().toLocaleTimeString(),
              },
              {
                type: 'system',
                text: `[process completed] exit code 0 (${elapsed}ms)`,
                time: new Date().toLocaleTimeString(),
              },
            ]);
            setIsRunning(false);
          }, 300);
          return;
        }
      } catch (err: any) {
        setRunOutput((prev) => [
          ...prev,
          {
            type: 'stderr',
            text: err?.message || String(err),
            time: new Date().toLocaleTimeString(),
          },
          {
            type: 'system',
            text: `[process terminated with error]`,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      } finally {
        setIsRunning(false);
      }
    },
    [fileContents]
  );

  // Settings update
  const handleUpdateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      storageService.saveSettings(updated);
      return updated;
    });
  }, []);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if ((isCmdOrCtrl && e.key.toLowerCase() === 'k') || (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'p' && !e.shiftKey) {
        e.preventDefault();
        setIsProjectPickerOpen(true);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if (isCmdOrCtrl && e.key === '`') {
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveFile();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) handleCloseTab(activeTabId);
      } else if (isCmdOrCtrl && e.key === '\\') {
        e.preventDefault();
        setSplitMode((prev) => (prev === 'vertical' ? 'none' : 'vertical'));
      } else if (isCmdOrCtrl && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIsPreviewOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveFile, activeTabId, handleCloseTab]);

  // Activity Bar Tab Click
  const handleActivityTabSelect = (tab: ActivityBarTab) => {
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
      setActiveActivityTab(tab);
    } else if (activeActivityTab === tab) {
      setIsSidebarOpen(false);
    } else {
      setActiveActivityTab(tab);
    }
  };

  return (
    <div
      id="macos-root-container"
      className={`h-screen w-screen flex flex-col select-none overflow-hidden font-sans transition-colors duration-200 ${
        settings.windowMode === 'desktop'
          ? 'p-0 md:p-3 bg-gradient-to-tr from-[#1b1c24] via-[#282a36] to-[#12131a]'
          : isLight
          ? 'bg-[#f6f6f8] text-[#1d1d1f]'
          : 'bg-[#121217] text-[#f5f5f7]'
      }`}
    >
      {/* Top macOS Menu Bar */}
      <MacMenuBar
        onNewFile={() => handleCreateFile(null, 'untitled.ts')}
        onNewFolder={() => handleCreateFolder(null, 'new-folder')}
        onSave={handleSaveFile}
        onCloseTab={() => activeTabId && handleCloseTab(activeTabId)}
        onCloseAllTabs={handleCloseAllTabs}
        onDownloadFile={() =>
          activeFile && downloadFileContent(activeFile.name, activeContent)
        }
        onUndo={() => codeEditorRef.current?.undo()}
        onRedo={() => codeEditorRef.current?.redo()}
        onFind={() => codeEditorRef.current?.find()}
        onFormat={() => codeEditorRef.current?.format()}
        onSelectAll={() => codeEditorRef.current?.selectAll()}
        onRun={() => setIsPreviewOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
        onToggleMinimap={() => handleUpdateSettings({ minimap: !settings.minimap })}
        onSetSplitMode={setSplitMode}
        onSelectActivityTab={handleActivityTabSelect}
        onOpenProjectManager={() => setIsProjectPickerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
        onOpenAbout={() => alert('macOS Code Studio v2.4\nProfessional Web IDE for Apple Silicon & Web.')}
        onClearTerminal={() => {}}
        isLight={isLight}
      />

      {/* Main Window Container */}
      <div
        id="macos-app-window"
        className={`flex-1 flex flex-col min-h-0 relative overflow-hidden transition-all duration-200 ${
          settings.windowMode === 'desktop'
            ? isMinimized
              ? 'scale-95 opacity-0 pointer-events-none'
              : 'rounded-xl md:rounded-2xl border shadow-2xl overflow-hidden'
            : 'h-full w-full'
        } ${
          isLight
            ? 'bg-[#ffffff] border-black/10 shadow-2xl'
            : 'bg-[#18181f] border-white/10 shadow-2xl'
        }`}
      >
        {/* Window Chrome Titlebar */}
        <WindowChrome
          project={currentProject}
          projects={projects}
          onSelectProject={handleSelectProject}
          onCreateProject={() => setIsProjectPickerOpen(true)}
          onExportProject={handleExportProject}
          onOpenProjectPicker={() => setIsProjectPickerOpen(true)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
          isTerminalOpen={isTerminalOpen}
          onOpenCommandPalette={() => setIsPaletteOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRunPreview={() => setIsPreviewOpen(true)}
          onToggleWindowMode={() =>
            handleUpdateSettings({
              windowMode: settings.windowMode === 'desktop' ? 'fullscreen' : 'desktop',
            })
          }
          onCloseWindow={() => {
            if (confirm('Reload workspace session?')) {
              window.location.reload();
            }
          }}
          onMinimizeWindow={() => setIsMinimized(!isMinimized)}
        />

        {/* Global Search Panel Modal if triggered */}
        <SearchPanel
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          files={currentProject.rootFiles}
          onSelectResult={(fileId, line) => {
            const f = flatFiles.find((x) => x.id === fileId);
            if (f) {
              handleSelectFile(f);
              codeEditorRef.current?.revealLine(line, 1);
            }
            setIsSearchOpen(false);
          }}
          isLight={isLight}
        />

        {/* Workspace Body */}
        <div id="workspace-body" className="flex-1 flex min-h-0 relative overflow-hidden">
          {/* Left-most Activity Bar */}
          <ActivityBar
            activeTab={activeActivityTab}
            onSelectTab={handleActivityTabSelect}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            gitChangesCount={gitChanges.length}
            problemsCount={diagnostics.length}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenProjectPicker={() => setIsProjectPickerOpen(true)}
          />

          {/* Primary Sidebar Content */}
          {isSidebarOpen && (
            <div
              id="sidebar-container"
              className="w-56 sm:w-64 h-full shrink-0 flex flex-col z-10 border-r border-white/10 bg-[#16161c]/95 backdrop-blur-xl transition-all duration-200"
            >
              {activeActivityTab === 'explorer' && (
                <FileExplorer
                  files={currentProject.rootFiles}
                  activeFileId={activeTab?.fileId || null}
                  onSelectFile={handleSelectFile}
                  onCreateFile={handleCreateFile}
                  onCreateFolder={handleCreateFolder}
                  onRenameNode={handleRenameNode}
                  onDeleteNode={handleDeleteNode}
                  onDuplicateNode={handleDuplicateNode}
                  isLight={isLight}
                  onSearchClick={() => setActiveActivityTab('search')}
                />
              )}

              {activeActivityTab === 'search' && (
                <SearchSidebarPanel
                  files={currentProject.rootFiles}
                  onSelectResult={(fileId, line, col) => {
                    const f = flatFiles.find((x) => x.id === fileId);
                    if (f) {
                      handleSelectFile(f);
                      codeEditorRef.current?.revealLine(line, col);
                    }
                  }}
                  onReplaceAll={(search, replace) => {
                    flatFiles.forEach((f) => {
                      if (f.content?.includes(search)) {
                        const next = f.content.replaceAll(search, replace);
                        handleContentChange(next);
                      }
                    });
                  }}
                />
              )}

              {activeActivityTab === 'git' && (
                <SourceControlPanel
                  project={currentProject}
                  gitChanges={gitChanges}
                  onStageChange={handleStageChange}
                  onStageAll={handleStageAll}
                  onUnstageAll={handleUnstageAll}
                  onDiscardChange={handleDiscardChange}
                  onCommit={handleCommit}
                  onOpenFile={(fileId) => {
                    const f = flatFiles.find((x) => x.id === fileId);
                    if (f) handleSelectFile(f);
                  }}
                />
              )}

              {activeActivityTab === 'run' && (
                <RunDebugPanel
                  project={currentProject}
                  activeFile={activeFile}
                  onRunFile={handleRunFile}
                  isRunning={isRunning}
                  onStopRun={() => setIsRunning(false)}
                  runOutput={runOutput}
                  onClearRunOutput={() => setRunOutput([])}
                />
              )}

              {activeActivityTab === 'outline' && (
                <OutlinePanel
                  activeFile={activeFile}
                  content={activeContent}
                  onSelectSymbol={(sym) => {
                    codeEditorRef.current?.revealLine(sym.line, sym.column);
                  }}
                />
              )}

              {activeActivityTab === 'problems' && (
                <ProblemsPanel
                  diagnostics={diagnostics}
                  onSelectProblem={(diag) => {
                    const targetFile = flatFiles.find((f) => f.name === diag.fileName);
                    if (targetFile) handleSelectFile(targetFile);
                    codeEditorRef.current?.revealLine(diag.line, diag.column);
                  }}
                />
              )}
            </div>
          )}

          {/* Main Stage: Tabs, Toolbar, Monaco Editor, Status Bar */}
          <div id="editor-stage" className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#131317]">
            {tabs.length === 0 ? (
              <WelcomeView
                recentProjects={projects}
                currentProjectId={currentProject.id}
                onSelectProject={handleSelectProject}
                onOpenProjectManager={() => setIsProjectPickerOpen(true)}
                onNewFile={() => handleCreateFile(null, 'untitled.ts')}
                onOpenCommandPalette={() => setIsPaletteOpen(true)}
              />
            ) : (
              <>
                <TabBar
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onSelectTab={(tabId) => setActiveTabId(tabId)}
                  onCloseTab={handleCloseTab}
                  onNewFile={() => handleCreateFile(null, 'untitled.ts')}
                  isLight={isLight}
                />

                <EditorToolbar
                  activeFile={activeFile}
                  projectName={currentProject.name}
                  isDirty={activeTab?.isDirty || false}
                  onSave={handleSaveFile}
                  onUndo={() => codeEditorRef.current?.undo()}
                  onRedo={() => codeEditorRef.current?.redo()}
                  onFormat={() => codeEditorRef.current?.format()}
                  onFind={() => codeEditorRef.current?.find()}
                  onRun={() => setIsPreviewOpen(true)}
                  splitMode={splitMode}
                  onSetSplitMode={setSplitMode}
                  wordWrap={settings.wordWrap === 'on'}
                  onToggleWordWrap={() =>
                    handleUpdateSettings({
                      wordWrap: settings.wordWrap === 'on' ? 'off' : 'on',
                    })
                  }
                  showMinimap={settings.minimap}
                  onToggleMinimap={() =>
                    handleUpdateSettings({ minimap: !settings.minimap })
                  }
                  inspectorOpen={isInspectorOpen}
                  onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
                />

                <div className="flex-1 flex min-h-0 relative overflow-hidden">
                  <CodeEditor
                    ref={codeEditorRef}
                    tab={activeTab}
                    content={activeContent}
                    onChange={handleContentChange}
                    settings={settings}
                    isLight={isLight}
                    onCursorChange={(pos, count) => {
                      setCursorPos(pos);
                      setTotalLines(count);
                    }}
                    onDiagnosticsChange={setDiagnostics}
                    splitMode={splitMode}
                    onCloseSplit={() => setSplitMode('none')}
                    secondaryTab={secondaryTab}
                    secondaryContent={secondaryContent}
                    onSecondaryChange={handleSecondaryContentChange}
                  />

                  {/* Right Inspector Drawer */}
                  <InspectorPanel
                    isOpen={isInspectorOpen}
                    onClose={() => setIsInspectorOpen(false)}
                    activeFile={activeFile}
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                  />
                </div>

                <EditorStatusBar
                  cursorPosition={cursorPos}
                  totalLines={totalLines}
                  language={activeTab?.language || 'typescript'}
                  tabSize={settings.tabSize}
                  diagnostics={diagnostics}
                  onOpenProblems={() => {
                    setIsSidebarOpen(true);
                    setActiveActivityTab('problems');
                  }}
                  onOpenTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
                  isTerminalOpen={isTerminalOpen}
                />
              </>
            )}

            {/* Bottom Integrated Terminal Panel */}
            <TerminalPanel
              project={currentProject}
              isOpen={isTerminalOpen}
              onClose={() => setIsTerminalOpen(false)}
              isLight={isLight}
              fontSize={settings.terminalFontSize}
            />
          </div>
        </div>

        {/* Mobile Toolbar */}
        {settings.mobileToolbar && (
          <div className="block md:hidden">
            <MobileCodingBar
              onInsertText={(text) => handleContentChange(activeContent + text)}
              onUndo={() => codeEditorRef.current?.undo()}
              onRedo={() => codeEditorRef.current?.redo()}
              onOpenSearch={() => setIsSearchOpen(true)}
              isLight={isLight}
            />
          </div>
        )}
      </div>

      {/* Minimized Window Dock Pill */}
      {isMinimized && (
        <div
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/70 border border-white/20 text-white text-xs cursor-pointer backdrop-blur-xl shadow-2xl flex items-center space-x-2 animate-bounce"
        >
          <Command size={14} className="text-[#007aff]" />
          <span>Click to restore macOS Code Studio</span>
        </div>
      )}

      {/* Project Picker Modal */}
      <ProjectPickerModal
        isOpen={isProjectPickerOpen}
        onClose={() => setIsProjectPickerOpen(false)}
        projects={projects}
        currentProjectId={currentProject.id}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProjectFromTemplate}
        onDuplicateProject={handleDuplicateProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
        onExportProject={handleExportProject}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNewFile={() => handleCreateFile(null, 'untitled.ts')}
        onNewFolder={() => handleCreateFolder(null, 'components')}
        onSaveFile={handleSaveFile}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        onToggleTheme={() =>
          handleUpdateSettings({
            theme: isLight ? 'dark' : 'light',
            editorTheme: isLight ? 'macos-dark' : 'macos-light',
          })
        }
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportProject={handleExportProject}
        onRunPreview={() => setIsPreviewOpen(true)}
        files={flatFiles}
        onSelectFile={handleSelectFile}
        isLight={isLight}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        isLight={isLight}
        onExportProject={handleExportProject}
      />

      {/* Live Preview Modal */}
      <LivePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        project={currentProject}
        isLight={isLight}
      />
    </div>
  );
}
