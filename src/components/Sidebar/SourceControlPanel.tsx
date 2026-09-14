import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit as GitCommitIcon,
  Check,
  Plus,
  Minus,
  RotateCcw,
  FileCode,
  Clock,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { GitChange, GitCommit, Project } from '../../types';
import { FileIcon } from '../Common/FileIcon';

interface SourceControlPanelProps {
  project: Project;
  gitChanges: GitChange[];
  onStageChange: (fileId: string, staged: boolean) => void;
  onStageAll: () => void;
  onUnstageAll: () => void;
  onDiscardChange: (fileId: string) => void;
  onCommit: (message: string) => Promise<void>;
  onOpenFile: (fileId: string) => void;
}

export const SourceControlPanel: React.FC<SourceControlPanelProps> = ({
  project,
  gitChanges,
  onStageChange,
  onStageAll,
  onUnstageAll,
  onDiscardChange,
  onCommit,
  onOpenFile,
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const stagedChanges = gitChanges.filter((c) => c.staged);
  const unstagedChanges = gitChanges.filter((c) => !c.staged);

  const handleCommitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    setIsCommitting(true);
    try {
      await onCommit(commitMessage.trim());
      setCommitMessage('');
    } finally {
      setIsCommitting(false);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="h-full flex flex-col bg-transparent text-[#f5f5f7] select-none">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitBranch size={15} className="text-[#007aff]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Source Control
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-white/60 font-mono">
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
            main
          </span>
        </div>
      </div>

      {/* Commit Input Box */}
      <form onSubmit={handleCommitSubmit} className="p-3 border-b border-white/10 space-y-2">
        <textarea
          rows={2}
          placeholder="Commit message (⌘Enter to commit)..."
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleCommitSubmit(e);
            }
          }}
          className="w-full p-2 rounded-lg bg-[#141418] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#007aff] resize-none"
        />

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={!commitMessage.trim() || isCommitting}
            className="flex-1 py-1.5 rounded-lg bg-[#007aff] hover:bg-[#0062cc] disabled:opacity-40 disabled:hover:bg-[#007aff] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <Check size={14} />
            <span>{isCommitting ? 'Committing...' : 'Commit to main'}</span>
          </button>
        </div>
      </form>

      {/* Changes list */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {/* Staged Changes Section */}
        <div className="p-2">
          <div className="flex items-center justify-between px-1 py-1 text-[11px] text-white/50 font-medium uppercase tracking-wider">
            <span>Staged Changes ({stagedChanges.length})</span>
            {stagedChanges.length > 0 && (
              <button
                onClick={onUnstageAll}
                title="Unstage All Changes"
                className="hover:text-white"
              >
                <Minus size={13} />
              </button>
            )}
          </div>

          <div className="space-y-0.5 mt-1">
            {stagedChanges.length === 0 ? (
              <div className="px-2 py-1 text-[11px] text-white/30 italic">No staged changes</div>
            ) : (
              stagedChanges.map((change) => (
                <div
                  key={change.fileId}
                  className="group px-2 py-1 rounded-md flex items-center justify-between text-xs hover:bg-white/10 transition-colors"
                >
                  <div
                    className="flex items-center space-x-2 truncate flex-1 cursor-pointer"
                    onClick={() => onOpenFile(change.fileId)}
                  >
                    <FileIcon name={change.fileName} />
                    <span className="truncate text-white/90 group-hover:text-white font-mono text-[11px]">
                      {change.fileName}
                    </span>
                    <span className="text-[10px] text-white/40 truncate">{change.filePath}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-bold text-[#32d74b] uppercase mr-1">
                      {change.status === 'modified' ? 'M' : change.status === 'added' ? 'A' : 'D'}
                    </span>
                    <button
                      onClick={() => onStageChange(change.fileId, false)}
                      title="Unstage change"
                      className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white"
                    >
                      <Minus size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unstaged Changes Section */}
        <div className="p-2">
          <div className="flex items-center justify-between px-1 py-1 text-[11px] text-white/50 font-medium uppercase tracking-wider">
            <span>Changes ({unstagedChanges.length})</span>
            {unstagedChanges.length > 0 && (
              <button
                onClick={onStageAll}
                title="Stage All Changes"
                className="hover:text-white"
              >
                <Plus size={13} />
              </button>
            )}
          </div>

          <div className="space-y-0.5 mt-1">
            {unstagedChanges.length === 0 ? (
              <div className="px-2 py-2 text-[11px] text-white/30 italic">
                Working tree clean. No local modifications.
              </div>
            ) : (
              unstagedChanges.map((change) => (
                <div
                  key={change.fileId}
                  className="group px-2 py-1 rounded-md flex items-center justify-between text-xs hover:bg-white/10 transition-colors"
                >
                  <div
                    className="flex items-center space-x-2 truncate flex-1 cursor-pointer"
                    onClick={() => onOpenFile(change.fileId)}
                  >
                    <FileIcon name={change.fileName} />
                    <span className="truncate text-white/90 group-hover:text-white font-mono text-[11px]">
                      {change.fileName}
                    </span>
                    <span className="text-[10px] text-white/40 truncate">{change.filePath}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-bold text-[#ffd15d] uppercase mr-1">
                      {change.status === 'modified' ? 'M' : change.status === 'added' ? 'A' : 'D'}
                    </span>
                    <button
                      onClick={() => onDiscardChange(change.fileId)}
                      title="Discard change"
                      className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-red-400"
                    >
                      <RotateCcw size={12} />
                    </button>
                    <button
                      onClick={() => onStageChange(change.fileId, true)}
                      title="Stage change"
                      className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Commit History Collapsible */}
        <div className="p-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-1 py-1 text-[11px] text-white/50 font-medium uppercase tracking-wider hover:text-white"
          >
            <div className="flex items-center space-x-1">
              {showHistory ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span>Commit History ({project.gitCommits?.length || 0})</span>
            </div>
            <Clock size={12} />
          </button>

          {showHistory && (
            <div className="space-y-1.5 mt-2">
              {(!project.gitCommits || project.gitCommits.length === 0) ? (
                <div className="px-2 py-1 text-[11px] text-white/30 italic">No commits yet</div>
              ) : (
                project.gitCommits.map((cmt) => (
                  <div
                    key={cmt.id}
                    className="p-2 rounded-lg bg-white/[0.03] border border-white/5 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-[#007aff] font-semibold">{cmt.id.substring(0, 7)}</span>
                      <span className="text-white/40">{formatTime(cmt.timestamp)}</span>
                    </div>
                    <p className="text-white/90 text-xs font-medium">{cmt.message}</p>
                    <div className="text-[10px] text-white/40">
                      {cmt.author || 'Developer'} • {cmt.filesCount} files
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
