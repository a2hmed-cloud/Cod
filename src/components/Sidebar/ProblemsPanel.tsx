import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Search,
  CheckCircle2,
  FileCode
} from 'lucide-react';
import { EditorDiagnostic } from '../../types';
import { FileIcon } from '../Common/FileIcon';

interface ProblemsPanelProps {
  diagnostics: EditorDiagnostic[];
  onSelectProblem: (diagnostic: EditorDiagnostic) => void;
}

export const ProblemsPanel: React.FC<ProblemsPanelProps> = ({
  diagnostics,
  onSelectProblem,
}) => {
  const [filter, setFilter] = useState('');

  const filtered = diagnostics.filter(
    (d) =>
      d.message.toLowerCase().includes(filter.toLowerCase()) ||
      d.fileName.toLowerCase().includes(filter.toLowerCase())
  );

  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');
  const infos = diagnostics.filter((d) => d.severity === 'info');

  return (
    <div className="h-full flex flex-col bg-transparent text-[#f5f5f7] select-none">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle size={15} className="text-[#ff5f56]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Problems
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="flex items-center space-x-1 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>{errors.length}</span>
          </span>
          <span className="flex items-center space-x-1 text-yellow-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span>{warnings.length}</span>
          </span>
        </div>
      </div>

      {/* Filter search */}
      <div className="p-2 border-b border-white/5">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2 text-white/30" />
          <input
            type="text"
            placeholder="Filter problems..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-7 pr-2 py-1 rounded-md bg-[#16161b] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#007aff]"
          />
        </div>
      </div>

      {/* Problems List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {diagnostics.length === 0 ? (
          <div className="text-center py-10 text-white/40 space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-[#32d74b]" />
            <p className="text-xs font-medium text-white/80">No problems detected in workspace</p>
            <p className="text-[11px] text-white/40">IntelliSense analysis is running cleanly.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-white/40">
            No problems match your filter.
          </div>
        ) : (
          filtered.map((diag) => (
            <button
              key={diag.id}
              onClick={() => onSelectProblem(diag)}
              className="w-full p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 text-left transition-colors group flex items-start space-x-2.5"
            >
              <div className="shrink-0 mt-0.5">
                {diag.severity === 'error' ? (
                  <AlertCircle size={14} className="text-[#ff5f56]" />
                ) : diag.severity === 'warning' ? (
                  <AlertTriangle size={14} className="text-[#ffd15d]" />
                ) : (
                  <Info size={14} className="text-[#5dd8ff]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-white/90 leading-tight group-hover:text-white font-sans">
                  {diag.message}
                </p>
                <div className="flex items-center space-x-2 text-[10px] text-white/40 font-mono mt-1.5">
                  <span className="text-[#007aff] truncate">{diag.fileName}</span>
                  <span>[{diag.line}, {diag.column}]</span>
                  {diag.source && <span>({diag.source})</span>}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
