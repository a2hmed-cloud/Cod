import React from 'react';
import {
  FileText,
  Clock,
  HardDrive,
  Code2,
  Sliders,
  Type,
  WrapText,
  MapPin,
  X,
  FileCode,
  Sparkles
} from 'lucide-react';
import { AppSettings, FileNode } from '../../types';
import { FileIcon } from '../Common/FileIcon';

interface InspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: FileNode | null;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  isOpen,
  onClose,
  activeFile,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const content = activeFile?.content || '';
  const lines = content.split('\n');
  const lineCount = lines.length;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const sizeBytes = new Blob([content]).size;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const formatDate = (ts?: number) => {
    if (!ts) return 'Unknown';
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <aside
      id="editor-inspector-panel"
      className="w-64 shrink-0 bg-[#17171d]/95 border-l border-white/10 flex flex-col select-none text-[#f5f5f7] z-20 backdrop-blur-md"
    >
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText size={15} className="text-[#007aff]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Inspector
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* File Overview */}
        <div>
          <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">
            Target File
          </h4>
          {activeFile ? (
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center space-x-2">
                <FileIcon name={activeFile.name} size={16} />
                <span className="font-semibold text-xs text-white truncate">
                  {activeFile.name}
                </span>
              </div>
              <div className="text-[11px] font-mono text-white/50 break-all leading-tight">
                {activeFile.path}
              </div>
              <div className="text-[11px] text-white/40 flex items-center space-x-1 pt-1">
                <Clock size={11} />
                <span>Modified {formatDate(activeFile.updatedAt)}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/30 italic">No file selected</div>
          )}
        </div>

        {/* Code Metrics */}
        {activeFile && (
          <div>
            <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">
              Statistics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/40 block">Lines</span>
                <span className="font-mono font-bold text-white text-sm">{lineCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/40 block">Words</span>
                <span className="font-mono font-bold text-white text-sm">{wordCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/40 block">Characters</span>
                <span className="font-mono font-bold text-white text-sm">{charCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/40 block">Size</span>
                <span className="font-mono font-bold text-[#007aff] text-sm">{formatBytes(sizeBytes)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Preferences */}
        <div>
          <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">
            Editor Options
          </h4>
          <div className="space-y-2 text-xs">
            {/* Font Size */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-white/80">Font Size</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onUpdateSettings({ fontSize: Math.max(10, (settings.fontSize || 13) - 1) })}
                  className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono text-xs">{settings.fontSize || 13}</span>
                <button
                  onClick={() => onUpdateSettings({ fontSize: Math.min(24, (settings.fontSize || 13) + 1) })}
                  className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Tab Size */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-white/80">Indentation</span>
              <div className="flex space-x-1">
                {[2, 4].map((size) => (
                  <button
                    key={size}
                    onClick={() => onUpdateSettings({ tabSize: size })}
                    className={`px-2 py-0.5 rounded text-xs font-mono ${
                      (settings.tabSize || 2) === size
                        ? 'bg-[#007aff] text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/15'
                    }`}
                  >
                    {size} spaces
                  </button>
                ))}
              </div>
            </div>

            {/* Word wrap */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-white/80">Word Wrap</span>
              <input
                type="checkbox"
                checked={settings.wordWrap === 'on'}
                onChange={(e) => onUpdateSettings({ wordWrap: e.target.checked ? 'on' : 'off' })}
                className="w-4 h-4 rounded accent-[#007aff]"
              />
            </div>

            {/* Minimap */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-white/80">Minimap</span>
              <input
                type="checkbox"
                checked={!!settings.minimap}
                onChange={(e) => onUpdateSettings({ minimap: e.target.checked })}
                className="w-4 h-4 rounded accent-[#007aff]"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
