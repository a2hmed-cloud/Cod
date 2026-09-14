import React, { useState } from 'react';
import {
  Folder,
  Plus,
  Search,
  MoreVertical,
  Download,
  Copy,
  Edit2,
  Trash2,
  ExternalLink,
  Code2,
  FileCode,
  Layers,
  Clock,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { Project, ProjectType } from '../../types';

interface ProjectPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, type: ProjectType, description?: string) => Promise<void>;
  onDuplicateProject: (project: Project) => Promise<void>;
  onRenameProject: (projectId: string, newName: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onExportProject: (project: Project) => Promise<void>;
}

export const ProjectPickerModal: React.FC<ProjectPickerModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onDuplicateProject,
  onRenameProject,
  onDeleteProject,
  onExportProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<ProjectType>('typescript');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');

  if (!isOpen) return null;

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    await onCreateProject(newProjectName.trim(), newProjectType, newProjectDesc.trim());
    setNewProjectName('');
    setNewProjectDesc('');
    setIsCreating(false);
  };

  const handleStartRename = (project: Project) => {
    setRenamingProjectId(project.id);
    setRenamingName(project.name);
    setActiveMenuProjectId(null);
  };

  const handleSaveRename = async (projectId: string) => {
    if (renamingName.trim()) {
      await onRenameProject(projectId, renamingName.trim());
    }
    setRenamingProjectId(null);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTypeBadge = (type?: ProjectType) => {
    switch (type) {
      case 'react':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#007aff]/15 text-[#5dd8ff] border border-[#007aff]/30">React</span>;
      case 'python':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">Python</span>;
      case 'nodejs':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/15 text-green-300 border border-green-500/30">Node.js</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">TypeScript</span>;
    }
  };

  return (
    <div
      id="project-picker-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        setActiveMenuProjectId(null);
        onClose();
      }}
    >
      <div
        id="project-picker-window"
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-[#1e1e24]/95 border border-white/15 shadow-2xl overflow-hidden backdrop-blur-xl text-[#f5f5f7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS Window Chrome Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#19191d]/80 select-none">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 flex items-center justify-center"
              title="Close"
            />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            <span className="text-xs font-semibold text-white/80 ml-3 tracking-wide">
              macOS Studio — Project Manager
            </span>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#007aff] hover:bg-[#0062cc] text-white text-xs font-medium transition-all shadow-sm active:scale-95"
          >
            <Plus size={14} />
            <span>{isCreating ? 'Cancel' : 'New Project'}</span>
          </button>
        </div>

        {/* New Project Creator View */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-5 border-b border-white/10 bg-white/5 space-y-4 animate-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Sparkles size={16} className="text-[#007aff]" />
                <span>Create New Workspace</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Next Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141418] border border-white/15 text-xs text-white focus:outline-none focus:border-[#007aff]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1">Template / Language</label>
                <select
                  value={newProjectType}
                  onChange={(e) => setNewProjectType(e.target.value as ProjectType)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141418] border border-white/15 text-xs text-white focus:outline-none focus:border-[#007aff]"
                >
                  <option value="typescript">TypeScript & Data Structures</option>
                  <option value="react">React Web App (Tailwind)</option>
                  <option value="nodejs">Node.js Express API</option>
                  <option value="python">Python Script & Analytics</option>
                  <option value="blank">Empty Workspace</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Description (Optional)</label>
              <input
                type="text"
                placeholder="Brief summary of what this project builds..."
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141418] border border-white/15 text-xs text-white focus:outline-none focus:border-[#007aff]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#007aff] hover:bg-[#0062cc] text-white text-xs font-semibold"
              >
                Create Workspace
              </button>
            </div>
          </form>
        )}

        {/* Search Toolbar */}
        <div className="p-4 border-b border-white/10 flex items-center space-x-3 bg-black/20">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-2.5 text-white/40" />
            <input
              type="text"
              placeholder="Search projects by name, description, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#141418] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#007aff]"
            />
          </div>
          <span className="text-xs text-white/40 font-mono">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {/* Projects List View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-white/5">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Folder size={36} className="mx-auto text-white/20 mb-3" />
              <h4 className="text-sm font-semibold text-white/80">No projects found</h4>
              <p className="text-xs text-white/40 mt-1">Try another search or create a new workspace above.</p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isCurrent = project.id === currentProjectId;
              const isRenaming = renamingProjectId === project.id;
              const isMenuOpen = activeMenuProjectId === project.id;

              return (
                <div
                  key={project.id}
                  className={`group relative p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-[#007aff]/10 border-[#007aff]/40 shadow-sm'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div
                    className="flex items-center space-x-3.5 flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      onSelectProject(project.id);
                      onClose();
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/15 flex items-center justify-center shrink-0">
                      <Folder size={20} className="text-[#007aff]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        {isRenaming ? (
                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={renamingName}
                              onChange={(e) => setRenamingName(e.target.value)}
                              className="px-2 py-0.5 rounded bg-[#141418] border border-[#007aff] text-xs text-white focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(project.id);
                                if (e.key === 'Escape') setRenamingProjectId(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveRename(project.id)}
                              className="p-1 text-[#32d74b] hover:bg-white/10 rounded"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#007aff] transition-colors">
                            {project.name}
                          </h4>
                        )}

                        {getTypeBadge(project.type)}

                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-medium border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-white/50 mt-1 font-mono truncate">
                        <span className="truncate">{project.rootPath || `~/Projects/${project.name}`}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1 shrink-0">
                          <Clock size={11} />
                          <span>{formatDate(project.lastOpenedAt || project.updatedAt)}</span>
                        </span>
                        <span>•</span>
                        <span>{project.rootFiles?.length || 0} files</span>
                      </div>

                      {project.description && (
                        <p className="text-xs text-white/60 mt-1 truncate">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        onSelectProject(project.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center space-x-1.5 transition-colors"
                      title="Open Project"
                    >
                      <ExternalLink size={12} />
                      <span>Open</span>
                    </button>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuProjectId(isMenuOpen ? null : project.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        title="Project Options"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-0 top-8 z-30 w-44 rounded-xl bg-[#24242d] border border-white/15 shadow-2xl py-1 text-xs text-white/90 animate-in fade-in-50 zoom-in-95"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleStartRename(project)}
                            className="w-full px-3 py-1.5 text-left flex items-center space-x-2 hover:bg-[#007aff] hover:text-white transition-colors"
                          >
                            <Edit2 size={13} />
                            <span>Rename Project</span>
                          </button>
                          <button
                            onClick={async () => {
                              setActiveMenuProjectId(null);
                              await onDuplicateProject(project);
                            }}
                            className="w-full px-3 py-1.5 text-left flex items-center space-x-2 hover:bg-[#007aff] hover:text-white transition-colors"
                          >
                            <Copy size={13} />
                            <span>Duplicate Project</span>
                          </button>
                          <button
                            onClick={async () => {
                              setActiveMenuProjectId(null);
                              await onExportProject(project);
                            }}
                            className="w-full px-3 py-1.5 text-left flex items-center space-x-2 hover:bg-[#007aff] hover:text-white transition-colors"
                          >
                            <Download size={13} />
                            <span>Export as ZIP</span>
                          </button>
                          <div className="border-t border-white/10 my-1" />
                          <button
                            onClick={async () => {
                              setActiveMenuProjectId(null);
                              if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
                                await onDeleteProject(project.id);
                              }
                            }}
                            className="w-full px-3 py-1.5 text-left flex items-center space-x-2 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 size={13} />
                            <span>Delete Project</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#19191d]/80 flex items-center justify-between text-[11px] text-white/50">
          <span>Tip: Switch projects anytime with <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white/70">⌘P</kbd> or click the project name.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white font-medium text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
