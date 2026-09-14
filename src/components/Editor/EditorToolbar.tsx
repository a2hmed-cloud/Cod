import React, { useState } from 'react';
import {
  Save,
  Undo2,
  Redo2,
  Columns2,
  Rows2,
  Play,
  Search,
  Sliders,
  ChevronRight,
  Maximize2,
  Minimize2,
  WrapText,
  MapPin,
  Check,
  PanelRight,
  Sparkles,
  AlignLeft,
  X
} from 'lucide-react';
import { EditorSplitMode, FileNode } from '../../types';
import { FileIcon } from '../Common/FileIcon';

interface EditorToolbarProps {
  activeFile: FileNode | null;
  projectName: string;
  isDirty: boolean;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onFormat: () => void;
  onFind: () => void;
  onRun: () => void;
  splitMode: EditorSplitMode;
  onSetSplitMode: (mode: EditorSplitMode) => void;
  wordWrap: boolean;
  onToggleWordWrap: () => void;
  showMinimap: boolean;
  onToggleMinimap: () => void;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeFile,
  projectName,
  isDirty,
  onSave,
  onUndo,
  onRedo,
  onFormat,
  onFind,
  onRun,
  splitMode,
  onSetSplitMode,
  wordWrap,
  onToggleWordWrap,
  showMinimap,
  onToggleMinimap,
  inspectorOpen,
  onToggleInspector,
}) => {
  const [showSplitMenu, setShowSplitMenu] = useState(false);

  // Compute breadcrumb path segments
  const pathParts = activeFile?.path.split('/').filter(Boolean) || [];

  return (
    <div
      id="editor-toolbar"
      className="h-8 shrink-0 bg-[#19191e]/90 border-b border-white/10 px-3 flex items-center justify-between text-xs select-none backdrop-blur-md text-[#f5f5f7] z-10"
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center space-x-1 min-w-0 text-white/50 text-[11px] font-mono truncate">
        <span className="text-white/70 font-semibold">{projectName}</span>
        {pathParts.map((part, index) => (
          <React.Fragment key={index}>
            <ChevronRight size={11} className="text-white/30 shrink-0" />
            <span
              className={`truncate ${
                index === pathParts.length - 1
                  ? 'text-white font-medium flex items-center space-x-1.5'
                  : 'hover:text-white/80 cursor-default'
              }`}
            >
              {index === pathParts.length - 1 && activeFile && (
                <FileIcon name={activeFile.name} size={13} className="inline mr-1" />
              )}
              <span>{part}</span>
            </span>
          </React.Fragment>
        ))}

        {isDirty && (
          <span
            className="w-2 h-2 rounded-full bg-[#007aff] ml-1.5 shrink-0"
            title="Unsaved changes (⌘S to save)"
          />
        )}
      </div>

      {/* Right: Functional Action Toolbar Buttons */}
      <div className="flex items-center space-x-0.5">
        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          title="Undo (⌘Z)"
          className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Undo2 size={13} />
        </button>
        <button
          onClick={onRedo}
          title="Redo (⌘⇧Z)"
          className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Redo2 size={13} />
        </button>

        <div className="h-3.5 w-px bg-white/15 mx-1" />

        {/* Format Code */}
        <button
          onClick={onFormat}
          title="Format Document (⌥⇧F)"
          className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <AlignLeft size={13} />
        </button>

        {/* Find */}
        <button
          onClick={onFind}
          title="Find in File (⌘F)"
          className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Search size={13} />
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          title="Save File (⌘S)"
          className={`p-1 rounded-md transition-colors ${
            isDirty
              ? 'text-[#007aff] hover:bg-[#007aff]/20 font-bold'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Save size={13} />
        </button>

        {/* Run Code */}
        <button
          onClick={onRun}
          title="Run File (⌘R)"
          className="p-1 rounded-md text-[#32d74b] hover:bg-[#32d74b]/20 transition-colors"
        >
          <Play size={13} fill="currentColor" />
        </button>

        <div className="h-3.5 w-px bg-white/15 mx-1" />

        {/* Split Editor Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSplitMenu(!showSplitMenu)}
            title="Split Editor"
            className={`p-1 rounded-md transition-colors ${
              splitMode !== 'none'
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Columns2 size={13} />
          </button>

          {showSplitMenu && (
            <div
              className="absolute right-0 top-7 z-30 w-36 rounded-lg bg-[#22222a] border border-white/15 shadow-xl p-1 text-xs space-y-0.5 animate-in fade-in-50 zoom-in-95"
              onClick={() => setShowSplitMenu(false)}
            >
              <button
                onClick={() => onSetSplitMode(splitMode === 'vertical' ? 'none' : 'vertical')}
                className={`w-full px-2 py-1 text-left rounded flex items-center justify-between hover:bg-white/10 ${
                  splitMode === 'vertical' ? 'text-[#007aff] font-semibold' : 'text-white/80'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Columns2 size={12} />
                  <span>Split Right</span>
                </div>
                {splitMode === 'vertical' && <Check size={12} />}
              </button>

              <button
                onClick={() => onSetSplitMode(splitMode === 'horizontal' ? 'none' : 'horizontal')}
                className={`w-full px-2 py-1 text-left rounded flex items-center justify-between hover:bg-white/10 ${
                  splitMode === 'horizontal' ? 'text-[#007aff] font-semibold' : 'text-white/80'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Rows2 size={12} />
                  <span>Split Down</span>
                </div>
                {splitMode === 'horizontal' && <Check size={12} />}
              </button>

              {splitMode !== 'none' && (
                <>
                  <div className="border-t border-white/10 my-0.5" />
                  <button
                    onClick={() => onSetSplitMode('none')}
                    className="w-full px-2 py-1 text-left rounded flex items-center space-x-1.5 text-red-400 hover:bg-red-500/20"
                  >
                    <X size={12} />
                    <span>Close Split</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Word Wrap Toggle */}
        <button
          onClick={onToggleWordWrap}
          title={wordWrap ? 'Disable Word Wrap' : 'Enable Word Wrap (⌥Z)'}
          className={`p-1 rounded-md transition-colors ${
            wordWrap
              ? 'bg-white/15 text-[#007aff]'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <WrapText size={13} />
        </button>

        {/* Minimap Toggle */}
        <button
          onClick={onToggleMinimap}
          title={showMinimap ? 'Hide Minimap' : 'Show Minimap'}
          className={`p-1 rounded-md transition-colors ${
            showMinimap
              ? 'bg-white/15 text-[#007aff]'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <MapPin size={13} />
        </button>

        {/* Inspector Panel Toggle */}
        <button
          onClick={onToggleInspector}
          title={inspectorOpen ? 'Hide Inspector' : 'Show File Inspector'}
          className={`p-1 rounded-md transition-colors ${
            inspectorOpen
              ? 'bg-white/15 text-[#007aff]'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <PanelRight size={13} />
        </button>
      </div>
    </div>
  );
};
