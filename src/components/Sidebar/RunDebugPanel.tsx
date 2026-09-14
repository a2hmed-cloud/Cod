import React, { useState } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Terminal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Sliders,
  Cpu
} from 'lucide-react';
import { FileNode, Project } from '../../types';

interface RunDebugPanelProps {
  project: Project;
  activeFile: FileNode | null;
  onRunFile: (file: FileNode, env: string, args: string) => Promise<void>;
  isRunning: boolean;
  onStopRun: () => void;
  runOutput: { type: 'stdout' | 'stderr' | 'system'; text: string; time: string }[];
  onClearRunOutput: () => void;
}

export const RunDebugPanel: React.FC<RunDebugPanelProps> = ({
  project,
  activeFile,
  onRunFile,
  isRunning,
  onStopRun,
  runOutput,
  onClearRunOutput,
}) => {
  const [selectedEnv, setSelectedEnv] = useState<'node' | 'browser' | 'python'>('node');
  const [cliArgs, setCliArgs] = useState('');

  const handleRun = async () => {
    if (!activeFile) return;
    await onRunFile(activeFile, selectedEnv, cliArgs);
  };

  const copyLogs = () => {
    const text = runOutput.map((o) => `[${o.time}] ${o.text}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col bg-transparent text-[#f5f5f7] select-none">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Play size={15} className="text-[#32d74b]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Run & Debug
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
          macOS Sandbox
        </span>
      </div>

      {/* Configuration Form */}
      <div className="p-3 border-b border-white/10 space-y-3">
        <div>
          <label className="block text-[11px] text-white/50 mb-1">Runtime Environment</label>
          <select
            value={selectedEnv}
            onChange={(e) => setSelectedEnv(e.target.value as any)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#141418] border border-white/10 text-xs text-white focus:outline-none focus:border-[#007aff]"
          >
            <option value="node">Node.js ES2024 Runtime</option>
            <option value="browser">Web DOM Environment</option>
            <option value="python">Python 3.12 Interpreter</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-white/50 mb-1">Target Entry File</label>
          <div className="px-2.5 py-1.5 rounded-lg bg-[#141418] border border-white/10 text-xs font-mono text-white/90 truncate">
            {activeFile ? activeFile.path : 'No file currently active'}
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-white/50 mb-1">Command Arguments / Flags</label>
          <input
            type="text"
            placeholder="e.g. --verbose --port=3000"
            value={cliArgs}
            onChange={(e) => setCliArgs(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#141418] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#007aff]"
          />
        </div>

        {/* Action Controls */}
        <div className="flex space-x-2 pt-1">
          {isRunning ? (
            <button
              onClick={onStopRun}
              className="flex-1 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Square size={13} fill="currentColor" />
              <span>Stop Process</span>
            </button>
          ) : (
            <button
              onClick={handleRun}
              disabled={!activeFile}
              className="flex-1 py-1.5 rounded-lg bg-[#32d74b]/20 hover:bg-[#32d74b]/30 text-[#32d74b] border border-[#32d74b]/30 disabled:opacity-40 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Play size={13} fill="currentColor" />
              <span>Run Program (⌘R)</span>
            </button>
          )}
        </div>
      </div>

      {/* Output Header */}
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between bg-black/10">
        <div className="flex items-center space-x-2 text-[11px] text-white/60">
          <Terminal size={13} />
          <span>Debug Console Output</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={copyLogs}
            title="Copy Logs"
            className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={onClearRunOutput}
            title="Clear Console"
            className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Output Console */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1 bg-[#121216]">
        {runOutput.length === 0 ? (
          <div className="text-white/30 italic text-center py-6">
            Press "Run Program" to execute {activeFile ? activeFile.name : 'a file'} and view live logs.
          </div>
        ) : (
          runOutput.map((log, i) => (
            <div
              key={i}
              className={`leading-relaxed break-words ${
                log.type === 'stderr'
                  ? 'text-red-400'
                  : log.type === 'system'
                  ? 'text-[#007aff]'
                  : 'text-white/90'
              }`}
            >
              <span className="text-white/30 mr-2 select-none">[{log.time}]</span>
              <span>{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
