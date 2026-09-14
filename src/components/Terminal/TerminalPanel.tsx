import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Trash2,
  Copy,
  ChevronDown,
  Maximize2,
  Minimize2,
  Check,
  AlertCircle,
  Code
} from 'lucide-react';
import { Project, TerminalLine } from '../../types';
import { getAllFilesFlat } from '../../services/storage';

interface TerminalPanelProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  isLight: boolean;
  fontSize: number;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  project,
  isOpen,
  onClose,
  isLight,
  fontSize = 13,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'output' | 'problems'>('terminal');
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'info',
      text: 'Last login: ' + new Date().toLocaleDateString() + ' on ttys002 (macOS arm64)',
    },
    {
      id: 'init-2',
      type: 'info',
      text: 'macOS Code Studio Terminal Shell v2.4 (Type "help" for built-in commands)',
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines, isOpen]);

  if (!isOpen) return null;

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = inputVal.trim();
    if (!rawCmd) return;

    const cmdLine: TerminalLine = {
      id: `cmd-${Date.now()}`,
      type: 'command',
      text: `$ ${rawCmd}`,
    };

    setHistory((prev) => [...prev, rawCmd]);
    setHistoryIdx(-1);
    setInputVal('');

    const newLines = [...lines, cmdLine];
    const parts = rawCmd.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    if (cmd === 'clear') {
      setLines([]);
      return;
    }

    if (cmd === 'help') {
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `macOS Terminal Commands:
  help               - Display list of supported commands
  ls, dir            - List files in current project
  pwd                - Print working directory
  cat <file>         - Display file content
  node <file>        - Execute JS/TS file with real runtime output
  node -e "<code>"   - Evaluate JavaScript code expression
  eval <code>        - Sandboxed math/code evaluator
  echo <text>        - Echo text to terminal
  date               - Display current system time
  wc <file>          - Count lines and characters of a file
  git status         - Show working tree status
  clear              - Clear terminal window`,
      });
    } else if (cmd === 'ls' || cmd === 'dir') {
      const allFiles = getAllFilesFlat(project.rootFiles);
      const outputStr = allFiles.map((f) => `${f.path} (${f.content?.length || 0} bytes)`).join('\n');
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: outputStr || 'Project directory is empty',
      });
    } else if (cmd === 'pwd') {
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `/Users/developer/Projects/${project.name}`,
      });
    } else if (cmd === 'date') {
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: new Date().toString(),
      });
    } else if (cmd === 'echo') {
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: args,
      });
    } else if (cmd === 'git') {
      if (args.includes('status')) {
        newLines.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: `On branch main\nYour branch is up to date with 'origin/main'.\n\nNothing to commit, working tree clean`,
        });
      } else {
        newLines.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: `git ${args}: git version 2.44.0 (Apple Git-147)`,
        });
      }
    } else if (cmd === 'cat') {
      const allFiles = getAllFilesFlat(project.rootFiles);
      const target = allFiles.find((f) => f.name === args || f.path === args || f.path.endsWith('/' + args));
      if (target) {
        newLines.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: target.content || '(empty file)',
        });
      } else {
        newLines.push({
          id: `out-${Date.now()}`,
          type: 'error',
          text: `cat: ${args}: No such file or directory`,
        });
      }
    } else if (cmd === 'wc') {
      const allFiles = getAllFilesFlat(project.rootFiles);
      const target = allFiles.find((f) => f.name === args || f.path === args || f.path.endsWith('/' + args));
      if (target && target.content) {
        const lineCount = target.content.split('\n').length;
        const wordCount = target.content.trim().split(/\s+/).length;
        const byteCount = target.content.length;
        newLines.push({
          id: `out-${Date.now()}`,
          type: 'output',
          text: `  ${lineCount}  ${wordCount}  ${byteCount} ${target.name}`,
        });
      } else {
        newLines.push({
          id: `out-${Date.now()}`,
          type: 'error',
          text: `wc: ${args}: No such file or directory`,
        });
      }
    } else if (cmd === 'node' || cmd === 'eval' || cmd === 'run') {
      let codeToRun = '';
      if (cmd === 'node' && args.startsWith('-e ')) {
        codeToRun = args.replace(/^-e /, '').replace(/^['"]|['"]$/g, '');
      } else if (cmd === 'eval') {
        codeToRun = args;
      } else {
        const allFiles = getAllFilesFlat(project.rootFiles);
        const target = allFiles.find((f) => f.name === args || f.path === args || f.path.endsWith('/' + args));
        if (target && target.content) {
          codeToRun = target.content;
        } else {
          newLines.push({
            id: `out-${Date.now()}`,
            type: 'error',
            text: `Cannot find module '${args}'. Try running an existing file such as 'src/utils/calculator.ts' or 'node -e "console.log(1+1)"'`,
          });
          setLines(newLines);
          return;
        }
      }

      try {
        const capturedLogs: string[] = [];
        const sandboxConsole = {
          log: (...vals: any[]) => capturedLogs.push(vals.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(' ')),
          error: (...vals: any[]) => capturedLogs.push('[ERROR] ' + vals.map((v) => String(v)).join(' ')),
          warn: (...vals: any[]) => capturedLogs.push('[WARN] ' + vals.map((v) => String(v)).join(' ')),
          info: (...vals: any[]) => capturedLogs.push('[INFO] ' + vals.map((v) => String(v)).join(' ')),
        };

        const executable = codeToRun
          .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
          .replace(/export\s+(default\s+)?/g, '');

        const evalFn = new Function('console', `
          try {
            ${executable}
          } catch(err) {
            console.error(err.message);
          }
        `);

        evalFn(sandboxConsole);

        const combinedOutput = capturedLogs.length > 0 ? capturedLogs.join('\n') : '[Process completed with exit code 0]';
        newLines.push({
          id: `out-${Date.now()}`,
          type: 'success',
          text: combinedOutput,
        });
      } catch (err: any) {
        newLines.push({
          id: `out-${Date.now()}`,
          type: 'error',
          text: `Runtime Exception: ${err.message}`,
        });
      }
    } else {
      newLines.push({
        id: `out-${Date.now()}`,
        type: 'error',
        text: `zsh: command not found: ${cmd}. (Type "help" for supported commands)`,
      });
    }

    setLines(newLines);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setInputVal('');
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx]);
      }
    }
  };

  const copyOutput = () => {
    const text = lines.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      id="terminal-panel"
      className={`border-t select-text flex flex-col transition-all duration-200 ${
        isMaximized ? 'h-[65vh]' : 'h-48 sm:h-56'
      } ${
        isLight
          ? 'bg-[#f7f7fa] border-black/10 text-neutral-800'
          : 'bg-[#141418] border-white/10 text-[#d1d1d6]'
      }`}
    >
      {/* Terminal Title Bar / Tabs */}
      <div
        className={`h-8 flex items-center justify-between px-3 border-b select-none shrink-0 ${
          isLight ? 'bg-[#ececef] border-black/10' : 'bg-[#18181f] border-white/5'
        }`}
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-md transition-colors ${
              activeTab === 'terminal'
                ? isLight
                  ? 'bg-white text-[#007aff] font-medium shadow-xs'
                  : 'bg-white/10 text-[#5dd8ff] font-medium shadow-xs'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <TerminalIcon size={12} />
            <span>zsh — {project.name}</span>
          </button>

          <button
            onClick={() => setActiveTab('output')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-md transition-colors ${
              activeTab === 'output'
                ? isLight
                  ? 'bg-white text-[#007aff] font-medium shadow-xs'
                  : 'bg-white/10 text-[#5dd8ff] font-medium shadow-xs'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <Code size={12} />
            <span>Output</span>
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-md transition-colors ${
              activeTab === 'problems'
                ? isLight
                  ? 'bg-white text-[#007aff] font-medium shadow-xs'
                  : 'bg-white/10 text-[#5dd8ff] font-medium shadow-xs'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <AlertCircle size={12} />
            <span>Problems (0)</span>
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setLines([])}
            title="Clear Terminal Output"
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100"
          >
            <Trash2 size={13} />
          </button>

          <button
            onClick={copyOutput}
            title="Copy Terminal Text"
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
          </button>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? 'Restore Terminal' : 'Maximize Terminal'}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100"
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          <button
            onClick={onClose}
            title="Close Terminal (Ctrl+`)"
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      {activeTab === 'terminal' && (
        <div
          onClick={() => inputRef.current?.focus()}
          style={{ fontSize: `${fontSize}px` }}
          className="flex-1 overflow-y-auto p-3 font-mono cursor-text space-y-1"
        >
          {lines.map((line) => {
            let textColor = 'text-[#d1d1d6]';
            if (line.type === 'command') textColor = isLight ? 'text-[#007aff] font-bold' : 'text-[#5dd8ff] font-bold';
            if (line.type === 'error') textColor = 'text-[#ff453a]';
            if (line.type === 'success') textColor = 'text-[#32d74b]';
            if (line.type === 'info') textColor = 'text-[#8e8e93]';

            return (
              <div key={line.id} className={`whitespace-pre-wrap leading-relaxed ${textColor}`}>
                {line.text}
              </div>
            );
          })}

          <form onSubmit={handleCommandSubmit} className="flex items-center space-x-2 pt-1">
            <span className={isLight ? 'text-[#007aff] font-bold' : 'text-[#30d158] font-bold'}>
              ➜ {project.name} $
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none font-mono text-inherit p-0"
              autoFocus
              spellCheck={false}
            />
          </form>

          <div ref={terminalEndRef} />
        </div>
      )}

      {activeTab === 'output' && (
        <div className="flex-1 p-3 font-mono text-xs overflow-y-auto opacity-70">
          <div>[Build Engine] Vite 6.2.3 dev server running on port 3000</div>
          <div>[TypeScript] Compiler daemon active (target: ESNext)</div>
          <div>[IndexedDB] Local persistence transaction completed (status: OK)</div>
          <div>[Sandbox] Security policy enforced: direct OS shell access restricted in browser container</div>
        </div>
      )}

      {activeTab === 'problems' && (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-xs opacity-60 select-none">
          <Check size={24} className="text-[#32d74b] mb-2" />
          <span>No syntax or diagnostic problems detected in workspace.</span>
        </div>
      )}
    </div>
  );
};
