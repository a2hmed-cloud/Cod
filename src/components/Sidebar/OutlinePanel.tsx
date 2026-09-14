import React, { useState, useMemo } from 'react';
import {
  Code2,
  Box,
  Layers,
  Variable,
  Package,
  Search,
  Hash,
  FunctionSquare,
  ListTree
} from 'lucide-react';
import { CodeSymbol, FileNode } from '../../types';

interface OutlinePanelProps {
  activeFile: FileNode | null;
  onNavigateToLine: (line: number) => void;
}

export const OutlinePanel: React.FC<OutlinePanelProps> = ({
  activeFile,
  onNavigateToLine,
}) => {
  const [filter, setFilter] = useState('');

  const symbols: CodeSymbol[] = useMemo(() => {
    if (!activeFile || !activeFile.content) return [];

    const lines = activeFile.content.split('\n');
    const result: CodeSymbol[] = [];

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();

      // 1. Function / Method declarations
      const fnMatch = trimmed.match(/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)/);
      if (fnMatch) {
        result.push({
          id: `sym-${lineNum}-${fnMatch[1]}`,
          name: fnMatch[1],
          kind: 'function',
          line: lineNum,
          column: lineText.indexOf(fnMatch[1]) + 1,
          detail: 'Function',
        });
        return;
      }

      // 2. React Components / Arrow functions
      const arrowFnMatch = trimmed.match(/(?:export\s+)?const\s+([A-Z][a-zA-Z0-9_$]*)\s*(?::\s*React\.FC[^=]*)?=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>/);
      if (arrowFnMatch) {
        result.push({
          id: `sym-${lineNum}-${arrowFnMatch[1]}`,
          name: arrowFnMatch[1],
          kind: 'function',
          line: lineNum,
          column: lineText.indexOf(arrowFnMatch[1]) + 1,
          detail: 'Component',
        });
        return;
      }

      // 3. Class declarations
      const classMatch = trimmed.match(/(?:export\s+)?class\s+([a-zA-Z0-9_$]+)/);
      if (classMatch) {
        result.push({
          id: `sym-${lineNum}-${classMatch[1]}`,
          name: classMatch[1],
          kind: 'class',
          line: lineNum,
          column: lineText.indexOf(classMatch[1]) + 1,
          detail: 'Class',
        });
        return;
      }

      // 4. Interface declarations
      const interfaceMatch = trimmed.match(/(?:export\s+)?interface\s+([a-zA-Z0-9_$]+)/);
      if (interfaceMatch) {
        result.push({
          id: `sym-${lineNum}-${interfaceMatch[1]}`,
          name: interfaceMatch[1],
          kind: 'interface',
          line: lineNum,
          column: lineText.indexOf(interfaceMatch[1]) + 1,
          detail: 'Interface',
        });
        return;
      }

      // 5. Type declarations
      const typeMatch = trimmed.match(/(?:export\s+)?type\s+([a-zA-Z0-9_$]+)\s*=/);
      if (typeMatch) {
        result.push({
          id: `sym-${lineNum}-${typeMatch[1]}`,
          name: typeMatch[1],
          kind: 'type',
          line: lineNum,
          column: lineText.indexOf(typeMatch[1]) + 1,
          detail: 'Type Alias',
        });
        return;
      }

      // 6. Python functions (def ...)
      const pyFnMatch = trimmed.match(/^def\s+([a-zA-Z0-9_$]+)\s*\(/);
      if (pyFnMatch) {
        result.push({
          id: `sym-${lineNum}-${pyFnMatch[1]}`,
          name: pyFnMatch[1],
          kind: 'function',
          line: lineNum,
          column: lineText.indexOf(pyFnMatch[1]) + 1,
          detail: 'Python Function',
        });
        return;
      }

      // 7. Python class
      const pyClassMatch = trimmed.match(/^class\s+([a-zA-Z0-9_$]+)/);
      if (pyClassMatch) {
        result.push({
          id: `sym-${lineNum}-${pyClassMatch[1]}`,
          name: pyClassMatch[1],
          kind: 'class',
          line: lineNum,
          column: lineText.indexOf(pyClassMatch[1]) + 1,
          detail: 'Python Class',
        });
        return;
      }

      // 8. Exported constants
      const constMatch = trimmed.match(/^export\s+const\s+([a-zA-Z0-9_$]+)/);
      if (constMatch) {
        result.push({
          id: `sym-${lineNum}-${constMatch[1]}`,
          name: constMatch[1],
          kind: 'constant',
          line: lineNum,
          column: lineText.indexOf(constMatch[1]) + 1,
          detail: 'Exported Constant',
        });
      }
    });

    return result;
  }, [activeFile]);

  const filteredSymbols = symbols.filter((s) =>
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    (s.detail && s.detail.toLowerCase().includes(filter.toLowerCase()))
  );

  const getSymbolIcon = (kind: CodeSymbol['kind']) => {
    switch (kind) {
      case 'function':
        return <FunctionSquare size={14} className="text-[#6699ff] shrink-0" />;
      case 'class':
        return <Box size={14} className="text-[#5dd8ff] shrink-0" />;
      case 'interface':
        return <Layers size={14} className="text-[#27c93f] shrink-0" />;
      case 'type':
        return <Code2 size={14} className="text-[#bf5af2] shrink-0" />;
      case 'constant':
        return <Hash size={14} className="text-[#ffd15d] shrink-0" />;
      default:
        return <Variable size={14} className="text-white/60 shrink-0" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent text-[#f5f5f7] select-none">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ListTree size={15} className="text-[#007aff]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Outline
          </span>
        </div>
        <span className="text-[11px] text-white/40 font-mono">
          {activeFile ? activeFile.name : 'No file open'}
        </span>
      </div>

      {/* Filter search */}
      <div className="p-2 border-b border-white/5">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2 text-white/30" />
          <input
            type="text"
            placeholder="Filter symbols..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-7 pr-2 py-1 rounded-md bg-[#16161b] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#007aff]"
          />
        </div>
      </div>

      {/* Symbols List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {!activeFile ? (
          <div className="p-6 text-center text-xs text-white/40">
            Select a file to inspect its symbols.
          </div>
        ) : filteredSymbols.length === 0 ? (
          <div className="p-6 text-center text-xs text-white/40">
            {filter ? 'No matching symbols found.' : 'No declared functions, classes, or types found.'}
          </div>
        ) : (
          filteredSymbols.map((sym) => (
            <button
              key={sym.id}
              onClick={() => onNavigateToLine(sym.line)}
              className="w-full px-2.5 py-1.5 rounded-md flex items-center justify-between text-xs hover:bg-white/10 text-white/80 hover:text-white transition-colors group"
            >
              <div className="flex items-center space-x-2 truncate">
                {getSymbolIcon(sym.kind)}
                <span className="font-mono text-xs truncate group-hover:text-white">
                  {sym.name}
                </span>
                <span className="text-[10px] text-white/30 truncate">
                  {sym.detail}
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/40 group-hover:text-[#007aff]">
                :{sym.line}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
