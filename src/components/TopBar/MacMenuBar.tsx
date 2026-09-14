import React, { useState, useEffect, useRef } from 'react';
import {
  Apple,
  ChevronRight,
  Sparkles,
  Command,
  FileCode,
  Folder,
  Layers,
  Settings,
  HelpCircle,
  Play,
  Terminal,
  Columns2
} from 'lucide-react';
import { ActivityBarTab, EditorSplitMode } from '../../types';

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  divider?: boolean;
  submenu?: MenuItem[];
}

interface MenuDefinition {
  title: string | React.ReactNode;
  id: string;
  items: MenuItem[];
}

interface MacMenuBarProps {
  onNewFile: () => void;
  onNewFolder: () => void;
  onSave: () => void;
  onCloseTab: () => void;
  onCloseAllTabs: () => void;
  onDownloadFile: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onFind: () => void;
  onFormat: () => void;
  onSelectAll: () => void;
  onRun: () => void;
  onToggleSidebar: () => void;
  onToggleTerminal: () => void;
  onToggleInspector: () => void;
  onToggleMinimap: () => void;
  onSetSplitMode: (mode: EditorSplitMode) => void;
  onSelectActivityTab: (tab: ActivityBarTab) => void;
  onOpenProjectManager: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  onOpenAbout: () => void;
  onClearTerminal: () => void;
  isLight: boolean;
}

export const MacMenuBar: React.FC<MacMenuBarProps> = ({
  onNewFile,
  onNewFolder,
  onSave,
  onCloseTab,
  onCloseAllTabs,
  onDownloadFile,
  onUndo,
  onRedo,
  onFind,
  onFormat,
  onSelectAll,
  onRun,
  onToggleSidebar,
  onToggleTerminal,
  onToggleInspector,
  onToggleMinimap,
  onSetSplitMode,
  onSelectActivityTab,
  onOpenProjectManager,
  onOpenSettings,
  onOpenCommandPalette,
  onOpenAbout,
  onClearTerminal,
  isLight,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const menus: MenuDefinition[] = [
    {
      id: 'apple',
      title: <Apple size={13} className="fill-current text-white/90" />,
      items: [
        { label: 'About macOS Code Studio', action: onOpenAbout },
        { divider: true, label: '' },
        { label: 'System Preferences...', shortcut: '⌘,', action: onOpenSettings },
        { label: 'Command Palette...', shortcut: '⌘K', action: onOpenCommandPalette },
        { divider: true, label: '' },
        { label: 'Lock Workspace', shortcut: '⌃⌘Q' },
      ],
    },
    {
      id: 'project',
      title: 'Project',
      items: [
        { label: 'Manage All Projects...', shortcut: '⌘P', action: onOpenProjectManager },
        { label: 'New Workspace...', action: onOpenProjectManager },
        { divider: true, label: '' },
        { label: 'Export Workspace as ZIP...', action: () => {} },
        { label: 'Project Settings...', action: onOpenSettings },
      ],
    },
    {
      id: 'file',
      title: 'File',
      items: [
        { label: 'New File', shortcut: '⌘N', action: onNewFile },
        { label: 'New Folder', action: onNewFolder },
        { divider: true, label: '' },
        { label: 'Save File', shortcut: '⌘S', action: onSave },
        { label: 'Download File Content', action: onDownloadFile },
        { divider: true, label: '' },
        { label: 'Close Active Tab', shortcut: '⌘W', action: onCloseTab },
        { label: 'Close All Tabs', shortcut: '⌥⌘W', action: onCloseAllTabs },
      ],
    },
    {
      id: 'edit',
      title: 'Edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z', action: onUndo },
        { label: 'Redo', shortcut: '⌘⇧Z', action: onRedo },
        { divider: true, label: '' },
        { label: 'Cut', shortcut: '⌘X' },
        { label: 'Copy', shortcut: '⌘C' },
        { label: 'Paste', shortcut: '⌘V' },
        { divider: true, label: '' },
        { label: 'Find in File', shortcut: '⌘F', action: onFind },
        { label: 'Format Document', shortcut: '⌥⇧F', action: onFormat },
      ],
    },
    {
      id: 'selection',
      title: 'Selection',
      items: [
        { label: 'Select All', shortcut: '⌘A', action: onSelectAll },
        { label: 'Expand Selection', shortcut: '⌃⇧→' },
        { label: 'Shrink Selection', shortcut: '⌃⇧←' },
      ],
    },
    {
      id: 'view',
      title: 'View',
      items: [
        { label: 'Explorer', shortcut: '⌘⇧E', action: () => onSelectActivityTab('explorer') },
        { label: 'Search in Workspace', shortcut: '⌘⇧F', action: () => onSelectActivityTab('search') },
        { label: 'Source Control (Git)', shortcut: '⌘⇧G', action: () => onSelectActivityTab('git') },
        { label: 'Run & Debug', shortcut: '⌘⇧D', action: () => onSelectActivityTab('run') },
        { label: 'Code Outline', action: () => onSelectActivityTab('outline') },
        { label: 'Problems & Diagnostics', action: () => onSelectActivityTab('problems') },
        { divider: true, label: '' },
        { label: 'Toggle Primary Sidebar', shortcut: '⌘B', action: onToggleSidebar },
        { label: 'Toggle Integrated Terminal', shortcut: '⌘`', action: onToggleTerminal },
        { label: 'Toggle Right Inspector', action: onToggleInspector },
        { label: 'Toggle Minimap', action: onToggleMinimap },
        { divider: true, label: '' },
        { label: 'Split Editor Right', shortcut: '⌘\\', action: () => onSetSplitMode('vertical') },
        { label: 'Split Editor Down', action: () => onSetSplitMode('horizontal') },
      ],
    },
    {
      id: 'run',
      title: 'Run',
      items: [
        { label: 'Start Debugging / Run File', shortcut: '⌘R', action: onRun },
        { label: 'Run Without Debugging', shortcut: '⌃F5', action: onRun },
      ],
    },
    {
      id: 'terminal',
      title: 'Terminal',
      items: [
        { label: 'Toggle Terminal', shortcut: '⌘`', action: onToggleTerminal },
        { label: 'Clear Terminal Output', shortcut: '⌘K', action: onClearTerminal },
      ],
    },
    {
      id: 'help',
      title: 'Help',
      items: [
        { label: 'Keyboard Shortcuts Reference', shortcut: '⌘/', action: onOpenCommandPalette },
        { label: 'About macOS Code Studio', action: onOpenAbout },
      ],
    },
  ];

  const handleMenuTrigger = (menuId: string) => {
    setActiveMenuId(activeMenuId === menuId ? null : menuId);
  };

  const handleMenuHover = (menuId: string) => {
    if (activeMenuId !== null) {
      setActiveMenuId(menuId);
    }
  };

  return (
    <div
      ref={menuBarRef}
      id="macos-menubar"
      className="h-6 shrink-0 bg-[#19191e]/95 border-b border-white/10 px-3 flex items-center justify-between text-xs select-none text-[#f5f5f7] z-40 backdrop-blur-xl"
    >
      {/* Left Application Menus */}
      <div className="flex items-center space-x-1">
        {menus.map((menu) => {
          const isOpen = activeMenuId === menu.id;
          return (
            <div key={menu.id} className="relative">
              <button
                onClick={() => handleMenuTrigger(menu.id)}
                onMouseEnter={() => handleMenuHover(menu.id)}
                className={`px-2 py-0.5 rounded text-[12px] font-medium transition-colors ${
                  isOpen
                    ? 'bg-[#007aff] text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {menu.title}
              </button>

              {/* Menu Dropdown Popup */}
              {isOpen && (
                <div
                  className="absolute left-0 top-6 z-50 min-w-56 rounded-xl bg-[#22222a]/95 border border-white/20 shadow-2xl py-1 text-xs text-white/90 backdrop-blur-2xl animate-in fade-in-50 zoom-in-95 duration-75"
                  onClick={() => setActiveMenuId(null)}
                >
                  {menu.items.map((item, idx) => {
                    if (item.divider) {
                      return <div key={idx} className="h-px bg-white/10 my-1 mx-1" />;
                    }
                    return (
                      <button
                        key={idx}
                        disabled={item.disabled}
                        onClick={() => {
                          if (item.action) item.action();
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-1 text-left flex items-center justify-between hover:bg-[#007aff] hover:text-white transition-colors disabled:opacity-30 rounded-md mx-0.5"
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-[11px] font-mono text-white/40 group-hover:text-white ml-4">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right side macOS status indicators */}
      <div className="flex items-center space-x-3 text-[11px] text-white/60 font-medium">
        <span className="hover:text-white cursor-pointer" onClick={onOpenCommandPalette}>
          ⌘K Palette
        </span>
        <span className="hover:text-white cursor-pointer" onClick={onOpenSettings}>
          Settings
        </span>
      </div>
    </div>
  );
};
