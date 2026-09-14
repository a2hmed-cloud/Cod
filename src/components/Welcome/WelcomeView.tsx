import React from 'react';
import {
  Folder,
  FilePlus,
  Command,
  Play,
  Columns2,
  Terminal,
  Grid,
  Sparkles,
  ArrowRight,
  Code2
} from 'lucide-react';
import { Project } from '../../types';

interface WelcomeViewProps {
  recentProjects: Project[];
  currentProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenProjectManager: () => void;
  onNewFile: () => void;
  onOpenCommandPalette: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  recentProjects,
  currentProjectId,
  onSelectProject,
  onOpenProjectManager,
  onNewFile,
  onOpenCommandPalette,
}) => {
  return (
    <div
      id="welcome-canvas"
      className="h-full w-full flex flex-col items-center justify-center p-8 overflow-y-auto bg-[#141418] text-[#f5f5f7] select-none"
    >
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Hero Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 border border-white/20">
            <Code2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-3">
            macOS Code Studio
          </h1>
          <p className="text-sm text-white/60">
            Professional Web IDE with Native Mac Fluidity & IntelliSense
          </p>
        </div>

        {/* Quick Actions & Recent Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Section */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Start & Create
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={onOpenProjectManager}
                className="w-full p-2.5 rounded-xl bg-white/[0.04] hover:bg-[#007aff] text-left flex items-center justify-between text-xs transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <Grid size={15} className="text-[#007aff] group-hover:text-white" />
                  <span className="font-medium text-white">Manage Workspaces & Projects</span>
                </div>
                <ArrowRight size={13} className="text-white/40 group-hover:text-white" />
              </button>

              <button
                onClick={onNewFile}
                className="w-full p-2.5 rounded-xl bg-white/[0.04] hover:bg-[#007aff] text-left flex items-center justify-between text-xs transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <FilePlus size={15} className="text-[#32d74b] group-hover:text-white" />
                  <span className="font-medium text-white">Create New File</span>
                </div>
                <span className="text-[11px] font-mono text-white/40 group-hover:text-white">⌘N</span>
              </button>

              <button
                onClick={onOpenCommandPalette}
                className="w-full p-2.5 rounded-xl bg-white/[0.04] hover:bg-[#007aff] text-left flex items-center justify-between text-xs transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <Command size={15} className="text-purple-400 group-hover:text-white" />
                  <span className="font-medium text-white">Command Palette</span>
                </div>
                <span className="text-[11px] font-mono text-white/40 group-hover:text-white">⌘K</span>
              </button>
            </div>
          </div>

          {/* Recent Workspaces */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Recent Workspaces
            </h3>
            <div className="space-y-1.5">
              {recentProjects.slice(0, 4).map((p) => {
                const isCurrent = p.id === currentProjectId;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors group ${
                      isCurrent
                        ? 'bg-[#007aff]/15 border border-[#007aff]/30 text-white'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/90 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Folder size={15} className="text-[#007aff] shrink-0" />
                      <span className="font-medium truncate">{p.name}</span>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                    ) : (
                      <span className="text-[10px] font-mono text-white/40 group-hover:text-white">
                        {p.rootFiles?.length || 0} files
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shortcuts Reference */}
        <div className="p-4 rounded-xl bg-black/20 border border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div>
              <span className="text-white/40 block text-[10px] uppercase">Command Palette</span>
              <kbd className="font-mono text-[11px] text-[#007aff] font-semibold">⌘K</kbd>
            </div>
            <div>
              <span className="text-white/40 block text-[10px] uppercase">Find in Files</span>
              <kbd className="font-mono text-[11px] text-[#007aff] font-semibold">⌘⇧F</kbd>
            </div>
            <div>
              <span className="text-white/40 block text-[10px] uppercase">Run Program</span>
              <kbd className="font-mono text-[11px] text-[#007aff] font-semibold">⌘R</kbd>
            </div>
            <div>
              <span className="text-white/40 block text-[10px] uppercase">Split Editor</span>
              <kbd className="font-mono text-[11px] text-[#007aff] font-semibold">⌘\</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
