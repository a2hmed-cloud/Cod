import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Replace,
  FileCode,
  CaseSensitive,
  WholeWord,
  Regex,
  Check,
  RotateCcw
} from 'lucide-react';
import { FileNode, SearchResult } from '../../types';
import { getAllFilesFlat } from '../../services/storage';
import { FileIcon } from '../Common/FileIcon';

interface SearchSidebarPanelProps {
  files: FileNode[];
  onSelectResult: (fileId: string, line: number, column: number) => void;
  onReplaceInFile?: (fileId: string, search: string, replace: string) => void;
  onReplaceAll?: (search: string, replace: string) => void;
}

export const SearchSidebarPanel: React.FC<SearchSidebarPanelProps> = ({
  files,
  onSelectResult,
  onReplaceInFile,
  onReplaceAll,
}) => {
  const [query, setQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const flatFiles = getAllFilesFlat(files);

  // Compute search results
  const results: SearchResult[] = [];
  if (query.trim()) {
    try {
      flatFiles.forEach((file) => {
        if (!file.content) return;
        const lines = file.content.split('\n');

        let regex: RegExp;
        if (useRegex) {
          regex = new RegExp(query, matchCase ? 'g' : 'gi');
        } else {
          const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const pattern = matchWholeWord ? `\\b${escaped}\\b` : escaped;
          regex = new RegExp(pattern, matchCase ? 'g' : 'gi');
        }

        lines.forEach((lineText, lineIdx) => {
          let match: RegExpExecArray | null;
          regex.lastIndex = 0;
          while ((match = regex.exec(lineText)) !== null) {
            results.push({
              fileId: file.id,
              filePath: file.path,
              fileName: file.name,
              line: lineIdx + 1,
              lineNumber: lineIdx + 1,
              column: match.index + 1,
              lineContent: lineText,
              matchLength: match[0].length,
            });
            if (!regex.global) break;
          }
        });
      });
    } catch {
      // invalid regex, ignore
    }
  }

  // Group by file
  const groupedResults = results.reduce<Record<string, { file: FileNode; items: SearchResult[] }>>(
    (acc, res) => {
      if (!acc[res.fileId]) {
        const file = flatFiles.find((f) => f.id === res.fileId);
        if (file) {
          acc[res.fileId] = { file, items: [] };
        }
      }
      if (acc[res.fileId]) {
        acc[res.fileId].items.push(res);
      }
      return acc;
    },
    {}
  );

  const toggleFile = (fileId: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const handleReplaceAll = () => {
    if (!query || !onReplaceAll) return;
    onReplaceAll(query, replaceQuery);
  };

  return (
    <div className="h-full flex flex-col bg-transparent text-[#f5f5f7] select-none">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search size={15} className="text-[#007aff]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Search
          </span>
        </div>
        <button
          onClick={() => setShowReplace(!showReplace)}
          className={`p-1 rounded text-xs transition-colors ${
            showReplace ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
          }`}
          title="Toggle Replace"
        >
          <Replace size={13} />
        </button>
      </div>

      {/* Inputs area */}
      <div className="p-3 border-b border-white/10 space-y-2">
        {/* Search input with modifiers */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search (⌘⇧F)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-2.5 pr-18 py-1.5 rounded-lg bg-[#141418] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#007aff]"
          />
          <div className="absolute right-1.5 flex items-center space-x-0.5">
            <button
              onClick={() => setMatchCase(!matchCase)}
              className={`p-1 rounded text-[10px] font-bold ${
                matchCase ? 'bg-[#007aff] text-white' : 'text-white/40 hover:text-white'
              }`}
              title="Match Case (⌥⌘C)"
            >
              <CaseSensitive size={12} />
            </button>
            <button
              onClick={() => setMatchWholeWord(!matchWholeWord)}
              className={`p-1 rounded text-[10px] font-bold ${
                matchWholeWord ? 'bg-[#007aff] text-white' : 'text-white/40 hover:text-white'
              }`}
              title="Match Whole Word (⌥⌘W)"
            >
              <WholeWord size={12} />
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              className={`p-1 rounded text-[10px] font-bold ${
                useRegex ? 'bg-[#007aff] text-white' : 'text-white/40 hover:text-white'
              }`}
              title="Use Regular Expression (⌥⌘R)"
            >
              <Regex size={12} />
            </button>
          </div>
        </div>

        {/* Replace input */}
        {showReplace && (
          <div className="flex items-center space-x-1.5 animate-in fade-in-50 duration-100">
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#141418] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#007aff]"
            />
            <button
              onClick={handleReplaceAll}
              disabled={!query || results.length === 0}
              className="px-2.5 py-1.5 rounded-lg bg-[#007aff] hover:bg-[#0062cc] disabled:opacity-30 text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
              title="Replace All in Project"
            >
              <Check size={12} />
              <span>All</span>
            </button>
          </div>
        )}

        {/* Results summary */}
        {query && (
          <div className="text-[11px] text-white/50 px-0.5 pt-0.5">
            {results.length} {results.length === 1 ? 'result' : 'results'} in{' '}
            {Object.keys(groupedResults).length} files
          </div>
        )}
      </div>

      {/* Results Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Object.entries(groupedResults).map(([fileId, group]) => {
          const isCollapsed = expandedFiles.has(fileId);
          return (
            <div key={fileId} className="rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden">
              {/* File header */}
              <button
                onClick={() => toggleFile(fileId)}
                className="w-full px-2 py-1.5 flex items-center justify-between text-xs hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center space-x-1.5 truncate flex-1 text-left">
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  <FileIcon name={group.file.name} size={14} />
                  <span className="font-semibold text-white/90 truncate">{group.file.name}</span>
                  <span className="text-[10px] text-white/40 truncate">{group.file.path}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 ml-2">
                  {group.items.length}
                </span>
              </button>

              {/* Matches in file */}
              {!isCollapsed && (
                <div className="divide-y divide-white/5 bg-black/20">
                  {group.items.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectResult(item.fileId, item.line, item.column)}
                      className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-start space-x-2 text-[11px] font-mono transition-colors"
                    >
                      <span className="text-[#007aff] shrink-0">{item.line}:</span>
                      <span className="text-white/80 truncate">{item.lineContent}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {query && results.length === 0 && (
          <div className="text-center py-8 text-xs text-white/30 italic">
            No results found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
};
