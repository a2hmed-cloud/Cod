import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FilePlus,
  FolderPlus,
  Save,
  Terminal,
  Sidebar,
  Sun,
  Moon,
  Settings,
  Download,
  Code,
  FileText,
  Play
} from 'lucide-react';
import { FileNode } from '../../types';

interface CommandItem {
  id: string;
  category: 'File' | 'View' | 'Theme' | 'Project';
  title: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onSaveFile: () => void;
  onToggleSidebar: () => void;
  onToggleTerminal: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onExportProject: () => void;
  onRunPreview: () => void;
  files: FileNode[];
  onSelectFile: (file: FileNode) => void;
  isLight: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewFile,
  onNewFolder,
  onSaveFile,
  onToggleSidebar,
  onToggleTerminal,
  onToggleTheme,
  onOpenSettings,
  onExportProject,
  onRunPreview,
  files,
  onSelectFile,
  isLight,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const baseCommands: CommandItem[] = [
    {
      id: 'cmd-run',
      category: 'Project',
      title: 'Run / Preview Project',
      shortcut: '⌘R',
      icon: <Play size={14} className="text-[#32d74b]" />,
      action: () => {
        onRunPreview();
        onClose();
      },
    },
    {
      id: 'cmd-new-file',
      category: 'File',
      title: 'New File',
      shortcut: '⌘N',
      icon: <FilePlus size={14} className="text-[#007aff]" />,
      action: () => {
        onNewFile();
        onClose();
      },
    },
    {
      id: 'cmd-new-folder',
      category: 'File',
      title: 'New Folder',
      shortcut: '⇧⌘N',
      icon: <FolderPlus size={14} className="text-[#6bb5ff]" />,
      action: () => {
        onNewFolder();
        onClose();
      },
    },
    {
      id: 'cmd-save',
      category: 'File',
      title: 'Save Current File',
      shortcut: '⌘S',
      icon: <Save size={14} className="text-[#32d74b]" />,
      action: () => {
        onSaveFile();
        onClose();
      },
    },
    {
      id: 'cmd-toggle-sidebar',
      category: 'View',
      title: 'Toggle Sidebar',
      shortcut: '⌘B',
      icon: <Sidebar size={14} className="text-[#ff9500]" />,
      action: () => {
        onToggleSidebar?.();
        onClose();
      },
    },
    {
      id: 'cmd-toggle-terminal',
      category: 'View',
      title: 'Toggle Terminal',
      shortcut: 'Ctrl+`',
      icon: <Terminal size={14} className="text-[#af52de]" />,
      action: () => {
        onToggleTerminal();
        onClose();
      },
    },
    {
      id: 'cmd-toggle-theme',
      category: 'Theme',
      title: 'Switch Color Theme (Dark / Light / System)',
      shortcut: '⌘T',
      icon: isLight ? <Moon size={14} className="text-[#5dd8ff]" /> : <Sun size={14} className="text-[#ff9500]" />,
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: 'cmd-export-zip',
      category: 'Project',
      title: 'Export Project as ZIP',
      shortcut: '⇧⌘E',
      icon: <Download size={14} className="text-[#5dd8ff]" />,
      action: () => {
        onExportProject();
        onClose();
      },
    },
    {
      id: 'cmd-settings',
      category: 'View',
      title: 'Open Preferences / Settings',
      shortcut: '⌘,',
      icon: <Settings size={14} className="text-[#8e8e93]" />,
      action: () => {
        onOpenSettings();
        onClose();
      },
    },
  ];

  // Also include project files in search
  const fileCommands: CommandItem[] = files.map((f) => ({
    id: `file-${f.id}`,
    category: 'File',
    title: `Go to File: ${f.name} (${f.path})`,
    icon: <FileText size={14} className="text-[#5dd8ff]" />,
    action: () => {
      onSelectFile(f);
      onClose();
    },
  }));

  const allItems = [...baseCommands, ...fileCommands];

  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="command-palette-dialog"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden flex flex-col transition-all duration-150 animate-in zoom-in-95 duration-100 ${
          isLight
            ? 'bg-[#ffffff]/95 border-black/10 text-neutral-800 shadow-black/20'
            : 'bg-[#1e1e24]/95 border-white/10 text-neutral-100 shadow-black/60'
        } backdrop-blur-2xl`}
      >
        {/* Search Input Bar (Raycast / Spotlight style) */}
        <div className="flex items-center px-3.5 py-3 border-b border-black/5 dark:border-white/5 space-x-3">
          <Search size={16} className="opacity-50 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search files..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:opacity-40"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 opacity-60">
            ESC
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="max-h-[360px] overflow-y-auto p-1.5 space-y-0.5">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs opacity-50">
              No matching commands or files found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  id={`palette-item-${idx}`}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors duration-100 ${
                    isSelected
                      ? 'bg-[#007aff] text-white font-medium'
                      : isLight
                        ? 'hover:bg-black/5 text-neutral-800'
                        : 'hover:bg-white/5 text-neutral-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className={isSelected ? 'text-white' : ''}>{item.icon}</span>
                    <span className="truncate">{item.title}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span
                      className={`text-[10px] uppercase font-semibold tracking-wider ${
                        isSelected ? 'text-white/80' : 'opacity-40'
                      }`}
                    >
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-black/5 dark:bg-white/10 opacity-60'
                        }`}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
