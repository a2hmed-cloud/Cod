import React from 'react';
import {
  GitBranch,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  FileCode,
  Sparkles
} from 'lucide-react';
import { EditorDiagnostic } from '../../types';

interface EditorStatusBarProps {
  cursorPosition: { line: number; column: number };
  totalLines: number;
  language: string;
  tabSize: number;
  diagnostics: EditorDiagnostic[];
  onOpenProblems: () => void;
  onOpenTerminal: () => void;
  isTerminalOpen: boolean;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  cursorPosition,
  totalLines,
  language,
  tabSize,
  diagnostics,
  onOpenProblems,
  onOpenTerminal,
  isTerminalOpen,
}) => {
  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');

  return (
    <div
      id="editor-status-bar"
      className="h-6 shrink-0 bg-[#141418] border-t border-white/10 px-3 flex items-center justify-between text-[11px] font-mono select-none text-white/60 z-10"
    >
      {/* Left side metrics */}
      <div className="flex items-center space-x-3">
        {/* Git Branch */}
        <div className="flex items-center space-x-1 hover:text-white cursor-pointer">
          <GitBranch size={11} className="text-[#007aff]" />
          <span>main</span>
        </div>

        {/* Problems & Diagnostics Trigger */}
        <button
          onClick={onOpenProblems}
          className="flex items-center space-x-1.5 hover:text-white transition-colors"
          title="Toggle Problems View"
        >
          {errors.length > 0 ? (
            <span className="flex items-center space-x-1 text-red-400">
              <AlertCircle size={11} />
              <span>{errors.length}</span>
            </span>
          ) : warnings.length > 0 ? (
            <span className="flex items-center space-x-1 text-yellow-400">
              <AlertTriangle size={11} />
              <span>{warnings.length}</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-[#32d74b]">
              <CheckCircle2 size={11} />
              <span>0 Problems</span>
            </span>
          )}
        </button>

        {/* Terminal Toggle */}
        <button
          onClick={onOpenTerminal}
          className={`flex items-center space-x-1 hover:text-white transition-colors ${
            isTerminalOpen ? 'text-[#007aff]' : ''
          }`}
          title="Toggle Terminal Drawer (`)"
        >
          <Terminal size={11} />
          <span>Terminal</span>
        </button>
      </div>

      {/* Right side formatting & position */}
      <div className="flex items-center space-x-3 text-[11px]">
        {/* Cursor Position */}
        <span className="hover:text-white cursor-default">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>

        {/* Lines */}
        <span className="text-white/40 hidden sm:inline">
          {totalLines} {totalLines === 1 ? 'line' : 'lines'}
        </span>

        {/* Spaces Indentation */}
        <span className="hover:text-white cursor-default hidden sm:inline">
          Spaces: {tabSize}
        </span>

        {/* Encoding */}
        <span className="hover:text-white cursor-default hidden md:inline">
          UTF-8
        </span>

        {/* End of line */}
        <span className="hover:text-white cursor-default hidden md:inline">
          LF
        </span>

        {/* Language */}
        <span className="text-white font-medium hover:text-[#007aff] cursor-pointer flex items-center space-x-1">
          <FileCode size={11} className="text-[#007aff]" />
          <span className="capitalize">{language || 'Plain Text'}</span>
        </span>
      </div>
    </div>
  );
};
