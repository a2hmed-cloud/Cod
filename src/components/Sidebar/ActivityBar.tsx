import React from 'react';
import {
  Files,
  Search,
  GitBranch,
  PlayCircle,
  ListTree,
  AlertCircle,
  Settings,
  Grid,
  Sparkles
} from 'lucide-react';
import { ActivityBarTab } from '../../types';

interface ActivityBarProps {
  activeTab: ActivityBarTab;
  onSelectTab: (tab: ActivityBarTab) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenSettings: () => void;
  onOpenProjectManager?: () => void;
  onOpenProjectPicker?: () => void;
  gitChangesCount?: number;
  problemsCount?: number;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeTab,
  onSelectTab,
  isSidebarOpen = true,
  onToggleSidebar,
  onOpenSettings,
  onOpenProjectManager,
  onOpenProjectPicker,
  gitChangesCount = 0,
  problemsCount = 0,
}) => {
  const handleTabClick = (tab: ActivityBarTab) => {
    if (activeTab === tab) {
      if (onToggleSidebar) {
        onToggleSidebar();
      } else {
        onSelectTab(tab);
      }
    } else {
      onSelectTab(tab);
      if (!isSidebarOpen && onToggleSidebar) {
        onToggleSidebar();
      }
    }
  };

  const navItems: { id: ActivityBarTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'explorer',
      label: 'Explorer (Files)',
      icon: <Files size={18} strokeWidth={1.8} />,
    },
    {
      id: 'search',
      label: 'Search in Workspace (⌘⇧F)',
      icon: <Search size={18} strokeWidth={1.8} />,
    },
    {
      id: 'git',
      label: 'Source Control (Git)',
      icon: <GitBranch size={18} strokeWidth={1.8} />,
      badge: gitChangesCount > 0 ? gitChangesCount : undefined,
    },
    {
      id: 'run',
      label: 'Run & Debug (⌘R)',
      icon: <PlayCircle size={18} strokeWidth={1.8} />,
    },
    {
      id: 'outline',
      label: 'Code Outline & Symbols',
      icon: <ListTree size={18} strokeWidth={1.8} />,
    },
    {
      id: 'problems',
      label: 'Problems & Diagnostics',
      icon: <AlertCircle size={18} strokeWidth={1.8} />,
      badge: problemsCount > 0 ? problemsCount : undefined,
    },
  ];

  return (
    <div
      id="activity-bar"
      className="w-12 shrink-0 bg-[#16161b]/95 border-r border-white/10 flex flex-col items-center justify-between py-2 select-none z-20 backdrop-blur-md"
    >
      {/* Top Navigator Icons */}
      <div className="flex flex-col items-center space-y-1 w-full">
        {navItems.map((item) => {
          const isActive = isSidebarOpen && activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              title={item.label}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}

              {/* Active left indicator indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-[#007aff]" />
              )}

              {/* Badge count */}
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-1 px-1 min-w-[15px] h-[15px] rounded-full bg-[#007aff] text-white text-[9px] font-bold flex items-center justify-center shadow">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Icons: Projects & Settings */}
      <div className="flex flex-col items-center space-y-1 w-full border-t border-white/10 pt-2">
        <button
          onClick={onOpenProjectPicker || onOpenProjectManager}
          title="Project Manager (All Workspaces)"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <Grid size={17} strokeWidth={1.8} />
        </button>

        <button
          onClick={onOpenSettings}
          title="Studio Settings (⌘,)"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings size={17} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
};
