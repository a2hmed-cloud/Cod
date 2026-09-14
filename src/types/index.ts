export type FileType = 'file' | 'folder';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  isUnsaved?: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  createdAt: number;
}

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: FileType;
  parentId?: string | null;
  content?: string;
  language?: string;
  isOpen?: boolean;
  isExpanded?: boolean;
  children?: FileNode[];
  size?: number;
  updatedAt?: number;
}

export type ProjectType = 'typescript' | 'react' | 'nodejs' | 'python' | 'blank' | 'custom';

export interface GitCommit {
  id: string;
  message: string;
  timestamp: number;
  filesCount: number;
  author?: string;
}

export interface GitChange {
  fileId: string;
  filePath: string;
  fileName: string;
  status: 'modified' | 'added' | 'deleted';
  staged: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  type?: ProjectType;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  lastOpenedAt?: number;
  rootPath?: string;
  rootFiles: FileNode[];
  activeFileId?: string | null;
  gitCommits?: GitCommit[];
  baseFilesSnapshot?: Record<string, string>;
}

export interface FileTab {
  fileId: string;
  filePath: string;
  fileName: string;
  language: string;
  isUnsaved: boolean;
}

export interface EditorTab {
  id: string;
  fileId: string;
  name: string;
  path: string;
  language: string;
  isDirty?: boolean;
  savedContent?: string;
  paneId?: 'primary' | 'secondary';
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type EditorTheme = 'midnight' | 'graphite' | 'dracula' | 'xcode-dark' | 'xcode-light' | 'high-contrast' | 'macos-dark' | 'macos-light';

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: 'on' | 'off' | 'wordWrapColumn';
  lineNumbers: 'on' | 'off' | 'relative';
  minimap: boolean;
  bracketMatching: boolean;
  cursorStyle: 'line' | 'block' | 'underline';
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  formatOnSave: boolean;
  autoComplete: boolean;
  smoothScrolling: boolean;
}

export interface AppearanceSettings {
  themeMode: ThemeMode;
  editorTheme: EditorTheme;
  accentColor: string;
  compactMode: boolean;
  translucency: boolean;
}

export interface InterfaceSettings {
  showSidebar: boolean;
  showTerminal: boolean;
  sidebarWidth: number;
  terminalHeight: number;
  reducedMotion: boolean;
  mobileToolbar: boolean;
}

export interface ProjectSettings {
  autoSave: boolean;
  autoSaveDelay: number;
  backendSync: boolean;
}

export type EditorSplitMode = 'none' | 'vertical' | 'horizontal';

export interface AppSettings {
  // Nested structure
  editor: EditorSettings;
  appearance: AppearanceSettings;
  interface: InterfaceSettings;
  project: ProjectSettings;

  // Flat structure properties
  theme?: ThemeMode;
  editorTheme?: EditorTheme;
  fontSize?: number;
  fontFamily?: string;
  tabSize?: number;
  wordWrap?: 'on' | 'off';
  minimap?: boolean;
  lineNumbers?: 'on' | 'off' | 'relative';
  bracketPairColorization?: boolean;
  cursorBlinking?: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  cursorStyle?: 'line' | 'block' | 'underline';
  autoSave?: boolean;
  compactMode?: boolean;
  windowMode?: 'desktop' | 'fullscreen';
  reducedMotion?: boolean;
  mobileToolbar?: boolean;
  terminalFontSize?: number;
  splitMode?: EditorSplitMode;
  inspectorOpen?: boolean;
}

export type TerminalOutputType = 'command' | 'output' | 'error' | 'info' | 'success';

export interface TerminalLine {
  id: string;
  type: TerminalOutputType;
  text: string;
  timestamp?: number;
}

export interface TerminalLog {
  id: string;
  type: 'input' | 'output' | 'error' | 'info' | 'success';
  text: string;
  timestamp: number;
}

export interface TerminalSession {
  id: string;
  title: string;
  logs?: TerminalLog[];
  lines?: TerminalLine[];
  cwd: string;
}

export interface SearchResult {
  fileId: string;
  filePath: string;
  fileName: string;
  line?: number;
  lineNumber?: number;
  column?: number;
  lineContent: string;
  matchStart?: number;
  matchLength: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export type ModalType =
  | 'commandPalette'
  | 'settings'
  | 'search'
  | 'createProject'
  | 'projectPicker'
  | 'importExport'
  | 'about'
  | null;

export type ActivityBarTab = 'explorer' | 'search' | 'git' | 'run' | 'outline' | 'problems';

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface EditorDiagnostic {
  id: string;
  fileId: string;
  filePath: string;
  fileName: string;
  message: string;
  severity: DiagnosticSeverity;
  line: number;
  column: number;
  source?: string;
}

export interface CodeSymbol {
  id: string;
  name: string;
  kind: 'function' | 'class' | 'interface' | 'variable' | 'constant' | 'import' | 'method' | 'type';
  line: number;
  column: number;
  detail?: string;
}

export interface ClipboardItem {
  type: 'file' | 'folder';
  node: FileNode;
  isCut?: boolean;
}
