import React, { useState } from 'react';
import { Search, Replace, X, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { FileNode, SearchResult } from '../../types';
import { getAllFilesFlat } from '../../services/storage';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileNode[];
  onSelectResult: (fileId: string, line: number) => void;
  isLight: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  isOpen,
  onClose,
  files,
  onSelectResult,
  isLight,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const performSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const flatFiles = getAllFilesFlat(files);
    const matches: SearchResult[] = [];

    flatFiles.forEach((file) => {
      if (!file.content) return;
      const lines = file.content.split('\n');
      lines.forEach((lineText, lineIdx) => {
        let isMatch = false;
        let col = -1;

        if (matchCase) {
          col = lineText.indexOf(query);
          isMatch = col !== -1;
        } else {
          col = lineText.toLowerCase().indexOf(query.toLowerCase());
          isMatch = col !== -1;
        }

        if (isMatch) {
          matches.push({
            fileId: file.id,
            filePath: file.path,
            fileName: file.name,
            line: lineIdx + 1,
            lineNumber: lineIdx + 1,
            column: col + 1,
            lineContent: lineText.trim(),
            matchLength: query.length,
          });
        }
      });
    });

    setResults(matches);
    setSearched(true);
  };

  return (
    <div
      id="search-panel-container"
      className={`border-b select-none p-3 transition-colors duration-150 ${
        isLight
          ? 'bg-[#f6f6f8] border-black/10 text-neutral-800'
          : 'bg-[#18181f] border-white/5 text-neutral-200'
      }`}
    >
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
          Find in Files
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100"
        >
          <X size={13} />
        </button>
      </div>

      {/* Input row */}
      <div className="flex items-center space-x-2">
        <div
          className={`flex-1 flex items-center px-2.5 py-1 rounded-md border text-xs ${
            isLight
              ? 'bg-white border-black/10 focus-within:border-[#007aff]'
              : 'bg-white/5 border-white/10 focus-within:border-[#007aff]'
          }`}
        >
          <Search size={13} className="opacity-40 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search query in all project files..."
            value={searchQuery}
            onChange={(e) => performSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs"
            autoFocus
          />
          <button
            onClick={() => {
              setMatchCase(!matchCase);
              performSearch(searchQuery);
            }}
            title="Match Case"
            className={`px-1 rounded text-[10px] font-mono font-semibold transition-colors ${
              matchCase
                ? 'bg-[#007aff] text-white'
                : 'bg-black/5 dark:bg-white/10 opacity-60'
            }`}
          >
            Aa
          </button>
        </div>
      </div>

      {/* Results summary */}
      {searched && (
        <div className="mt-2 text-[11px] opacity-60">
          {results.length} results found across files
        </div>
      )}

      {/* Results List */}
      {results.length > 0 && (
        <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
          {results.map((r, idx) => (
            <div
              key={idx}
              onClick={() => onSelectResult(r.fileId, r.line)}
              className={`px-2 py-1.5 rounded-md text-xs cursor-pointer flex items-start space-x-2 ${
                isLight ? 'hover:bg-black/5' : 'hover:bg-white/5'
              }`}
            >
              <FileText size={13} className="text-[#007aff] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium truncate">{r.fileName}</span>
                  <span className="text-[10px] opacity-50">
                    Line {r.line}:{r.column}
                  </span>
                </div>
                <div className="text-[11px] font-mono opacity-80 truncate text-[#a1a1a6]">
                  {r.lineContent}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
