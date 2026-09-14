import React from 'react';
import { X, Plus } from 'lucide-react';
import { EditorTab } from '../../types';
import { FileIcon } from '../Common/FileIcon';

interface TabBarProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string, e: React.MouseEvent) => void;
  onNewFile: () => void;
  isLight: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewFile,
  isLight,
}) => {
  return (
    <div
      id="editor-tab-bar"
      className={`h-9 flex items-center select-none overflow-x-auto no-scrollbar border-b transition-colors duration-150 ${
        isLight
          ? 'bg-[#e8e8ec] border-black/10'
          : 'bg-[#141419] border-white/5'
      }`}
    >
      <div className="flex items-center h-full min-w-0 flex-nowrap">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              id={`tab-item-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center space-x-2 h-full px-3 text-xs border-r cursor-pointer transition-all duration-100 min-w-[110px] max-w-[200px] shrink-0 ${
                isActive
                  ? isLight
                    ? 'bg-[#fbfbfd] text-[#1d1d1f] font-medium border-r-black/10'
                    : 'bg-[#1e1e24] text-[#f5f5f7] font-medium border-r-white/10'
                  : isLight
                    ? 'hover:bg-black/5 text-black/60 border-r-black/5'
                    : 'hover:bg-white/5 text-white/50 border-r-white/5'
              }`}
            >
              {/* Active Tab Top Indicator Bar (macOS Safari style) */}
              {isActive && (
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] ${
                    isLight ? 'bg-[#007aff]' : 'bg-[#5dd8ff]'
                  }`}
                />
              )}

              {/* File Icon */}
              <FileIcon name={tab.name} size={13} />

              {/* Tab Title */}
              <span className="truncate text-[12px] flex-1">{tab.name}</span>

              {/* Dirty / Close Icon */}
              <div className="flex items-center justify-center w-4 h-4">
                {tab.isDirty ? (
                  <span
                    onClick={(e) => onCloseTab(tab.id, e)}
                    className="w-2 h-2 rounded-full bg-[#007aff] group-hover:hidden"
                    title="Unsaved changes"
                  />
                ) : null}

                <button
                  onClick={(e) => onCloseTab(tab.id, e)}
                  title="Close Tab (⌘W)"
                  className={`p-0.5 rounded transition-all duration-100 ${
                    tab.isDirty ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'
                  } ${
                    isLight
                      ? 'hover:bg-black/10 text-black/60 hover:text-black'
                      : 'hover:bg-white/20 text-white/60 hover:text-white'
                  }`}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Tab Button */}
      <button
        id="btn-tab-new"
        onClick={onNewFile}
        title="New File"
        className={`p-1.5 ml-1 rounded-md transition-colors ${
          isLight
            ? 'hover:bg-black/5 text-black/50 hover:text-black'
            : 'hover:bg-white/5 text-white/40 hover:text-white'
        }`}
      >
        <Plus size={13} />
      </button>
    </div>
  );
};
