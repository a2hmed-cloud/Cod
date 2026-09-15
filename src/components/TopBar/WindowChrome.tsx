import React, { useState } from 'react';
import {
  Sidebar,
  Terminal,
  Play,
  Settings,
  Search,
  Sun,
  Moon,
  Laptop,
  FolderCode,
  ChevronDown,
  Plus,
  Download,
  Maximize2,
  Minimize2,
  GitBranch,
  User,
  Database,
  CloudCheck,
  CloudOff
} from 'lucide-react';
import { AppSettings, Project } from '../../types';
import { AuthUser } from '../../services/api';
import { SyncStatus } from '../../services/syncEngine';

interface WindowChromeProps {
  project: Project;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onExportProject: () => void;
  onOpenProjectPicker?: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  onRunPreview: () => void;
  onToggleWindowMode: () => void;
  onCloseWindow: () => void;
  onMinimizeWindow: () => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: () => void;
  syncStatus?: SyncStatus;
}

export const WindowChrome: React.FC<WindowChromeProps> = ({
  project,
  projects,
  onSelectProject,
  onCreateProject,
  onExportProject,
  onOpenProjectPicker,
  settings,
  onUpdateSettings,
  onToggleSidebar,
  isSidebarOpen,
  onToggleTerminal,
  isTerminalOpen,
  onOpenCommandPalette,
  onOpenSettings,
  onRunPreview,
  onToggleWindowMode,
  onCloseWindow,
  onMinimizeWindow,
  currentUser,
  onOpenAuth,
  syncStatus = 'local-only',
}) => {
  const [trafficHovered, setTrafficHovered] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  const nextTheme = () => {
    if (settings.theme === 'dark') {
      onUpdateSettings({ theme: 'light', editorTheme: 'macos-light' });
    } else if (settings.theme === 'light') {
      onUpdateSettings({ theme: 'system', editorTheme: 'macos-dark' });
    } else {
      onUpdateSettings({ theme: 'dark', editorTheme: 'macos-dark' });
    }
  };

  const isLight = settings.theme === 'light';

  return (
    <header
      id="window-chrome-titlebar"
      className={`h-11 select-none flex items-center justify-between px-3 border-b transition-colors duration-200 ${
        isLight
          ? 'bg-[#f6f6f8]/95 border-[#000000]/10 text-[#1d1d1f]'
          : 'bg-[#1e1e24]/95 border-[#ffffff]/10 text-[#f5f5f7]'
      } backdrop-blur-xl relative z-30`}
    >
      {/* Left Section: macOS Traffic Lights & Sidebar Toggle */}
      <div className="flex items-center space-x-3.5">
        {/* macOS Authentic Traffic Lights */}
        <div
          id="macos-traffic-lights"
          className="flex items-center space-x-2 py-1 pr-1 group"
          onMouseEnter={() => setTrafficHovered(true)}
          onMouseLeave={() => setTrafficHovered(false)}
        >
          {/* Close (Red) */}
          <button
            id="traffic-light-close"
            onClick={onCloseWindow}
            title="Close Window"
            aria-label="Close"
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center transition-all duration-100 hover:brightness-95 active:brightness-90 cursor-pointer shadow-xs"
          >
            {trafficHovered && (
              <span className="text-[8px] leading-none font-bold text-[#4d0000] select-none">
                ×
              </span>
            )}
          </button>

          {/* Minimize (Yellow) */}
          <button
            id="traffic-light-minimize"
            onClick={onMinimizeWindow}
            title="Minimize Window"
            aria-label="Minimize"
            className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center transition-all duration-100 hover:brightness-95 active:brightness-90 cursor-pointer shadow-xs"
          >
            {trafficHovered && (
              <span className="text-[8px] leading-none font-bold text-[#5c3e00] select-none">
                −
              </span>
            )}
          </button>

          {/* Maximize / Fullscreen (Green) */}
          <button
            id="traffic-light-maximize"
            onClick={onToggleWindowMode}
            title="Toggle Desktop / Fullscreen Window"
            aria-label="Zoom"
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center transition-all duration-100 hover:brightness-95 active:brightness-90 cursor-pointer shadow-xs"
          >
            {trafficHovered && (
              <span className="text-[7px] leading-none font-bold text-[#0d4f16] select-none">
                +
              </span>
            )}
          </button>
        </div>

        {/* Thin vertical separator */}
        <div className={`h-4 w-[1px] ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

        {/* Sidebar Toggle Button */}
        <button
          id="btn-toggle-sidebar"
          onClick={() => onToggleSidebar?.()}
          title={isSidebarOpen ? 'Hide Sidebar (⌘B)' : 'Show Sidebar (⌘B)'}
          className={`p-1.5 rounded-md transition-all duration-150 ${
            isSidebarOpen
              ? isLight
                ? 'bg-black/5 text-[#007aff]'
                : 'bg-white/10 text-[#5dd8ff]'
              : isLight
                ? 'text-black/60 hover:bg-black/5'
                : 'text-white/60 hover:bg-white/5'
          }`}
        >
          <Sidebar size={15} />
        </button>
      </div>

      {/* Center Section: Project Title with Proxy Icon & Quick Search */}
      <div className="flex items-center space-x-2">
        {/* Project Selector Popover */}
        <div className="relative">
          <button
            id="btn-project-dropdown"
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 ${
              isLight
                ? 'hover:bg-black/5 text-[#1d1d1f]'
                : 'hover:bg-white/5 text-[#f5f5f7]'
            }`}
          >
            <FolderCode size={14} className="text-[#007aff]" />
            <span className="tracking-tight max-w-[140px] truncate">{project.name}</span>
            <ChevronDown size={12} className="opacity-60" />
          </button>

          {projectDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProjectDropdownOpen(false)}
              />
              <div
                id="project-dropdown-menu"
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 rounded-lg p-1.5 z-50 border shadow-xl ${
                  isLight
                    ? 'bg-[#ffffff]/98 border-black/10 text-[#1d1d1f]'
                    : 'bg-[#22222a]/98 border-white/10 text-[#f5f5f7]'
                } backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100`}
              >
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Switch Project
                </div>
                <div className="max-h-44 overflow-y-auto space-y-0.5">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p.id);
                        setProjectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                        p.id === project.id
                          ? 'bg-[#007aff] text-white font-medium'
                          : isLight
                            ? 'hover:bg-black/5 text-[#1d1d1f]'
                            : 'hover:bg-white/10 text-[#f5f5f7]'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {p.id === project.id && <span className="text-[10px]">Active</span>}
                    </button>
                  ))}
                </div>

                <div className={`h-[1px] my-1 ${isLight ? 'bg-black/5' : 'bg-white/10'}`} />

                {onOpenProjectPicker && (
                  <button
                    onClick={() => {
                      onOpenProjectPicker();
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center space-x-2 ${
                      isLight ? 'hover:bg-black/5 text-[#007aff]' : 'hover:bg-white/10 text-[#5dd8ff]'
                    }`}
                  >
                    <FolderCode size={13} />
                    <span>Manage All Projects...</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onCreateProject();
                    setProjectDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center space-x-2 ${
                    isLight ? 'hover:bg-black/5 text-neutral-600' : 'hover:bg-white/10 text-neutral-300'
                  }`}
                >
                  <Plus size={13} />
                  <span>Create New Project</span>
                </button>

                <button
                  onClick={() => {
                    onExportProject();
                    setProjectDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center space-x-2 ${
                    isLight ? 'hover:bg-black/5 text-neutral-600' : 'hover:bg-white/10 text-neutral-300'
                  }`}
                >
                  <Download size={13} />
                  <span>Export Project as ZIP</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Git Branch Badge */}
        <div
          className={`hidden sm:flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
            isLight ? 'bg-black/5 text-black/60' : 'bg-white/10 text-white/60'
          }`}
        >
          <GitBranch size={10} />
          <span>main</span>
        </div>

        {/* Global Spotlight / Command Palette Button */}
        <button
          id="btn-command-palette-trigger"
          onClick={onOpenCommandPalette}
          title="Command Palette (⌘K or Ctrl+Shift+P)"
          className={`hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-md text-xs transition-all duration-150 border ${
            isLight
              ? 'bg-black/5 hover:bg-black/10 border-black/5 text-black/70'
              : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70'
          }`}
        >
          <Search size={12} className="opacity-70" />
          <span className="text-[11px]">Search commands...</span>
          <kbd
            className={`text-[9px] px-1 py-0.5 rounded font-mono font-medium ${
              isLight ? 'bg-white text-black/60 shadow-xs' : 'bg-white/10 text-white/60'
            }`}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Section: Run Action, Terminal, Theme & Settings */}
      <div className="flex items-center space-x-2">
        {/* Run / Preview Button */}
        <button
          id="btn-run-preview"
          onClick={onRunPreview}
          title="Run / Preview App"
          className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#27c93f] hover:bg-[#22b337] active:scale-95 text-white font-medium text-xs rounded-md shadow-xs transition-all duration-150 cursor-pointer"
        >
          <Play size={11} fill="currentColor" />
          <span className="hidden sm:inline text-[11px]">Run</span>
        </button>

        {/* Terminal Toggle */}
        <button
          id="btn-toggle-terminal"
          onClick={onToggleTerminal}
          title={isTerminalOpen ? 'Hide Terminal (Ctrl+`)' : 'Show Terminal (Ctrl+`)'}
          className={`p-1.5 rounded-md transition-all duration-150 ${
            isTerminalOpen
              ? isLight
                ? 'bg-black/5 text-[#007aff]'
                : 'bg-white/10 text-[#5dd8ff]'
              : isLight
                ? 'text-black/60 hover:bg-black/5'
                : 'text-white/60 hover:bg-white/5'
          }`}
        >
          <Terminal size={15} />
        </button>

        {/* Theme Toggle (Dark / Light / System) */}
        <button
          id="btn-toggle-theme"
          onClick={nextTheme}
          title={`Theme: ${settings.theme.toUpperCase()} (Click to toggle)`}
          className={`p-1.5 rounded-md transition-all duration-150 ${
            isLight
              ? 'text-black/60 hover:bg-black/5'
              : 'text-white/60 hover:bg-white/5'
          }`}
        >
          {settings.theme === 'dark' ? (
            <Moon size={15} className="text-[#5dd8ff]" />
          ) : settings.theme === 'light' ? (
            <Sun size={15} className="text-[#ff9500]" />
          ) : (
            <Laptop size={15} className="text-[#af52de]" />
          )}
        </button>

        {/* Window Mode Toggle (Desktop Wallpaper vs Fullscreen) */}
        <button
          id="btn-window-mode"
          onClick={onToggleWindowMode}
          title={
            settings.windowMode === 'desktop'
              ? 'Switch to Fullscreen Window'
              : 'Switch to macOS Desktop Mode'
          }
          className={`p-1.5 rounded-md hidden lg:block transition-all duration-150 ${
            isLight ? 'text-black/60 hover:bg-black/5' : 'text-white/60 hover:bg-white/5'
          }`}
        >
          {settings.windowMode === 'desktop' ? (
            <Maximize2 size={14} />
          ) : (
            <Minimize2 size={14} />
          )}
        </button>

        {/* Settings Button */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          title="macOS Studio Preferences (⌘,)"
          className={`p-1.5 rounded-md transition-all duration-150 ${
            isLight
              ? 'text-black/60 hover:bg-black/5'
              : 'text-white/60 hover:bg-white/5'
          }`}
        >
          <Settings size={15} />
        </button>

        <div className={`h-4 w-px mx-0.5 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

        {/* Cloud Sync Status Indicator */}
        <button
          id="btn-cloud-sync-status"
          onClick={onOpenAuth}
          title={`Sync Status: ${syncStatus.toUpperCase()} (Click to open Database & Sync panel)`}
          className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
            isLight
              ? 'hover:bg-black/5 text-black/70'
              : 'hover:bg-white/5 text-white/70'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              syncStatus === 'synced'
                ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                : syncStatus === 'syncing'
                  ? 'bg-[#007aff] animate-ping'
                  : syncStatus === 'offline'
                    ? 'bg-amber-500'
                    : syncStatus === 'error'
                      ? 'bg-red-500'
                      : 'bg-zinc-400'
            }`}
          />
          <span className="hidden xl:inline capitalize">
            {syncStatus === 'synced'
              ? 'Postgres Synced'
              : syncStatus === 'syncing'
                ? 'Syncing...'
                : syncStatus === 'offline'
                  ? 'Offline'
                  : syncStatus === 'error'
                    ? 'Sync Error'
                    : 'Local DB'}
          </span>
        </button>

        {/* Account / User Profile Button */}
        <button
          id="btn-user-account"
          onClick={onOpenAuth}
          title={currentUser ? `Signed in as ${currentUser.name} (${currentUser.email})` : 'Sign In / Register Account'}
          className={`flex items-center space-x-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
            currentUser
              ? isLight
                ? 'bg-[#007aff]/10 text-[#007aff] hover:bg-[#007aff]/15'
                : 'bg-[#007aff]/20 text-[#5dd8ff] hover:bg-[#007aff]/30'
              : isLight
                ? 'bg-black/5 hover:bg-black/10 text-black/70'
                : 'bg-white/10 hover:bg-white/15 text-white/80'
          }`}
        >
          {currentUser ? (
            <>
              <span className="w-4 h-4 rounded-full bg-[#007aff] text-white text-[9px] font-bold flex items-center justify-center">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden md:inline max-w-[80px] truncate">{currentUser.name}</span>
            </>
          ) : (
            <>
              <User size={13} />
              <span className="hidden md:inline">Sign In</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
