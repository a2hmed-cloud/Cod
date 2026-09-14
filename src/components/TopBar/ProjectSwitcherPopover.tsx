import React, { useState, useRef, useEffect } from 'react';
import { Folder, Check, Plus, Grid, Search, ExternalLink } from 'lucide-react';
import { Project } from '../../types';

interface ProjectSwitcherPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenProjectManager: () => void;
  onOpenNewProject: () => void;
}

export const ProjectSwitcherPopover: React.FC<ProjectSwitcherPopoverProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onOpenProjectManager,
  onOpenNewProject,
}) => {
  const [filter, setFilter] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      ref={popoverRef}
      className="absolute top-10 left-1/2 -translate-x-1/2 z-50 w-72 rounded-xl bg-[#22222a]/95 border border-white/20 shadow-2xl p-1.5 backdrop-blur-xl text-[#f5f5f7] animate-in fade-in-50 zoom-in-95 duration-100"
    >
      <div className="relative px-2 py-1.5 mb-1 border-b border-white/10">
        <Search size={13} className="absolute left-4 top-3 text-white/40" />
        <input
          type="text"
          placeholder="Filter workspaces..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-7 pr-2 py-1 rounded-md bg-[#16161b] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#007aff]"
          autoFocus
        />
      </div>

      <div className="max-h-56 overflow-y-auto space-y-0.5 py-1">
        {filtered.map((proj) => {
          const isSelected = proj.id === currentProjectId;
          return (
            <button
              key={proj.id}
              onClick={() => {
                onSelectProject(proj.id);
                onClose();
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between text-xs transition-colors ${
                isSelected
                  ? 'bg-[#007aff] text-white font-medium'
                  : 'hover:bg-white/10 text-white/80 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Folder size={14} className={isSelected ? 'text-white' : 'text-[#007aff]'} />
                <span className="truncate">{proj.name}</span>
              </div>
              {isSelected && <Check size={14} className="shrink-0 text-white" />}
            </button>
          );
        })}
      </div>

      <div className="border-t border-white/10 pt-1 mt-1 space-y-0.5">
        <button
          onClick={() => {
            onClose();
            onOpenNewProject();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center space-x-2 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Plus size={14} className="text-[#007aff]" />
          <span>New Workspace...</span>
        </button>
        <button
          onClick={() => {
            onClose();
            onOpenProjectManager();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center space-x-2 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Grid size={14} className="text-white/60" />
          <span>Manage All Workspaces...</span>
        </button>
      </div>
    </div>
  );
};
