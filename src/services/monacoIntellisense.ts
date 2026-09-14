import type { Monaco } from '@monaco-editor/react';

export function setupMonacoIntellisense(monaco: Monaco) {
  // Configure JS/TS Compiler Options for rich IntelliSense
  if (monaco.languages.typescript) {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2022,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ['node_modules/@types'],
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      experimentalDecorators: true,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2022,
      allowNonTsExtensions: true,
      allowJs: true,
    });

    // Add global React and DOM declaration definitions for instant Intellisense
    const reactTypes = `
      declare namespace React {
        function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
        function useEffect(effect: () => void | (() => void), deps?: any[]): void;
        function useRef<T>(initialValue: T): { current: T };
        function useMemo<T>(factory: () => T, deps: any[] | undefined): T;
        function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
        interface FC<P = {}> { (props: P): any; }
      }
      declare var console: {
        log(...args: any[]): void;
        error(...args: any[]): void;
        warn(...args: any[]): void;
        info(...args: any[]): void;
        table(data: any): void;
        time(label?: string): void;
        timeEnd(label?: string): void;
        clear(): void;
        dir(obj: any): void;
        trace(): void;
      };
      declare var Math: {
        abs(x: number): number;
        floor(x: number): number;
        ceil(x: number): number;
        round(x: number): number;
        max(...values: number[]): number;
        min(...values: number[]): number;
        random(): number;
        sqrt(x: number): number;
        pow(x: number, y: number): number;
        PI: number;
        E: number;
      };
      declare var JSON: {
        parse(text: string): any;
        stringify(value: any, replacer?: any, space?: any): string;
      };
    `;

    monaco.languages.typescript.typescriptDefaults.addExtraLib(reactTypes, 'ts:react-global.d.ts');
    monaco.languages.typescript.javascriptDefaults.addExtraLib(reactTypes, 'js:react-global.d.ts');
  }

  // Register custom Completion Provider for JS/TS to ensure autocomplete triggers on every keystroke
  const registerJsCompletions = (lang: string) => {
    monaco.languages.registerCompletionItemProvider(lang, {
      triggerCharacters: ['.', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '<', '/', '"', "'"],
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        const lineContent = model.getLineContent(position.lineNumber);
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions: any[] = [];

        // Check if typing console.
        if (textUntilPosition.endsWith('console.') || lineContent.slice(0, position.column - 1).trim().endsWith('console.')) {
          return {
            suggestions: [
              { label: 'log', kind: monaco.languages.CompletionItemKind.Method, insertText: 'log($1)', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'console.log(...args: any[])', range },
              { label: 'error', kind: monaco.languages.CompletionItemKind.Method, insertText: 'error($1)', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'console.error(...args: any[])', range },
              { label: 'warn', kind: monaco.languages.CompletionItemKind.Method, insertText: 'warn($1)', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'console.warn(...args: any[])', range },
              { label: 'info', kind: monaco.languages.CompletionItemKind.Method, insertText: 'info($1)', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'console.info(...args: any[])', range },
              { label: 'table', kind: monaco.languages.CompletionItemKind.Method, insertText: 'table($1)', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'console.table(data: any)', range },
              { label: 'time', kind: monaco.languages.CompletionItemKind.Method, insertText: 'time($1)', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'console.time(label?: string)', range },
              { label: 'timeEnd', kind: monaco.languages.CompletionItemKind.Method, insertText: 'timeEnd($1)', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'console.timeEnd(label?: string)', range },
              { label: 'clear', kind: monaco.languages.CompletionItemKind.Method, insertText: 'clear()', detail: 'console.clear()', range },
            ]
          };
        }

        // Global JS/TS keywords and built-ins
        const keywords = ['console', 'const', 'continue', 'confirm', 'function', 'return', 'import', 'export', 'default', 'interface', 'type', 'async', 'await', 'class', 'constructor', 'useState', 'useEffect', 'useRef', 'useMemo', 'useCallback'];
        
        keywords.forEach(kw => {
          suggestions.push({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            range
          });
        });

        // Snippets
        suggestions.push({
          label: 'clg',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'console.log($1);',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Log to console',
          range
        });

        suggestions.push({
          label: 'rfc',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'export default function ${1:ComponentName}() {\n  return (\n    <div>\n      $0\n    </div>\n  );\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'React Functional Component',
          range
        });

        return { suggestions };
      }
    });
  };

  registerJsCompletions('javascript');
  registerJsCompletions('typescript');
  registerJsCompletions('javascriptreact');
  registerJsCompletions('typescriptreact');
}
