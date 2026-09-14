import type { Monaco } from '@monaco-editor/react';

let isIntelliSenseConfigured = false;

export function setupMonacoIntelliSense(monaco: Monaco) {
  if (isIntelliSenseConfigured) return;
  isIntelliSenseConfigured = true;

  // 1. Configure TypeScript / JavaScript language service defaults
  const tsDefaults = monaco.languages.typescript.typescriptDefaults;
  const jsDefaults = monaco.languages.typescript.javascriptDefaults;

  const compilerOptions = {
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types'],
  };

  tsDefaults.setCompilerOptions(compilerOptions);
  jsDefaults.setCompilerOptions(compilerOptions);

  tsDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  // Inject standard React & macOS environment type declarations into Monaco
  const extraLibs = `
    declare namespace console {
      function log(...data: any[]): void;
      function error(...data: any[]): void;
      function warn(...data: any[]): void;
      function info(...data: any[]): void;
      function table(tabularData?: any, properties?: string[]): void;
      function time(label?: string): void;
      function timeEnd(label?: string): void;
      function clear(): void;
      function count(label?: string): void;
      function dir(item?: any, options?: any): void;
      function trace(...data: any[]): void;
      function group(groupTitle?: string): void;
      function groupEnd(): void;
    }

    declare namespace Math {
      const E: number;
      const LN10: number;
      const LN2: number;
      const LOG10E: number;
      const LOG2E: number;
      const PI: number;
      const SQRT1_2: number;
      const SQRT2: number;
      function abs(x: number): number;
      function acos(x: number): number;
      function asin(x: number): number;
      function atan(x: number): number;
      function ceil(x: number): number;
      function cos(x: number): number;
      function floor(x: number): number;
      function log(x: number): number;
      function log10(x: number): number;
      function max(...values: number[]): number;
      function min(...values: number[]): number;
      function random(): number;
      function round(x: number): number;
      function sin(x: number): number;
      function sqrt(x: number): number;
    }

    declare namespace React {
      function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
      function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
      function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
      function useMemo<T>(factory: () => T, deps: readonly any[]): T;
      function useRef<T>(initialValue?: T): { current: T };
      function createContext<T>(defaultValue: T): any;
      function useContext<T>(context: any): T;
    }
  `;

  tsDefaults.addExtraLib(extraLibs, 'ts:apple-mac-types.d.ts');
  jsDefaults.addExtraLib(extraLibs, 'ts:apple-mac-types.d.ts');

  // 2. Custom Rich Completion Provider for JavaScript & TypeScript
  const registerJsTsCompletions = (lang: string) => {
    monaco.languages.registerCompletionItemProvider(lang, {
      triggerCharacters: ['.', 'c', 'u', 'i', 'r', 'p', 'f', 'm'],
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: any[] = [];

        // Check if user is typing after `console.`
        if (/console\.\w*$/.test(textUntilPosition)) {
          const consoleMethods = [
            { label: 'log', detail: '(method) console.log(...data: any[]): void', doc: 'Prints to stdout with newline.' },
            { label: 'error', detail: '(method) console.error(...data: any[]): void', doc: 'Prints error message with stack trace.' },
            { label: 'warn', detail: '(method) console.warn(...data: any[]): void', doc: 'Prints warning to stderr.' },
            { label: 'info', detail: '(method) console.info(...data: any[]): void', doc: 'Informational logging output.' },
            { label: 'table', detail: '(method) console.table(tabularData?: any): void', doc: 'Displays tabular data as a table.' },
            { label: 'time', detail: '(method) console.time(label?: string): void', doc: 'Starts a timer for benchmarking.' },
            { label: 'timeEnd', detail: '(method) console.timeEnd(label?: string): void', doc: 'Stops the named timer and prints elapsed duration.' },
            { label: 'clear', detail: '(method) console.clear(): void', doc: 'Clears the terminal or browser console.' },
            { label: 'count', detail: '(method) console.count(label?: string): void', doc: 'Maintains and prints an invocation count.' },
            { label: 'dir', detail: '(method) console.dir(item?: any): void', doc: 'Prints JSON-like interactive property list.' },
            { label: 'trace', detail: '(method) console.trace(...data: any[]): void', doc: 'Prints an interactive stack trace to point of call.' },
          ];

          consoleMethods.forEach((m) => {
            suggestions.push({
              label: m.label,
              kind: monaco.languages.CompletionItemKind.Method,
              detail: m.detail,
              documentation: { value: `**macOS IntelliSense**\n\n${m.doc}` },
              insertText: m.label,
              range,
              sortText: '0' + m.label,
            });
          });

          return { suggestions };
        }

        // Check if user is typing after `Math.`
        if (/Math\.\w*$/.test(textUntilPosition)) {
          const mathMethods = ['abs', 'ceil', 'floor', 'round', 'min', 'max', 'random', 'sqrt', 'sin', 'cos', 'tan', 'log', 'log10', 'PI'];
          mathMethods.forEach((m) => {
            suggestions.push({
              label: m,
              kind: m === 'PI' ? monaco.languages.CompletionItemKind.Constant : monaco.languages.CompletionItemKind.Method,
              detail: `Math.${m}`,
              documentation: `Standard JavaScript Math.${m} implementation.`,
              insertText: m,
              range,
              sortText: '0' + m,
            });
          });
          return { suggestions };
        }

        // Global symbols when typing keywords starting with 'con' or others
        const globalKeywords = [
          { label: 'console', kind: monaco.languages.CompletionItemKind.Variable, detail: 'Console debugging interface', insertText: 'console' },
          { label: 'const', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Block-scoped constant declaration', insertText: 'const ${1:name} = ${2:value};', isSnippet: true },
          { label: 'continue', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Continue loop execution', insertText: 'continue;' },
          { label: 'confirm', kind: monaco.languages.CompletionItemKind.Function, detail: 'Display modal confirmation dialog', insertText: 'confirm("${1:Are you sure?}")', isSnippet: true },
          { label: 'constructor', kind: monaco.languages.CompletionItemKind.Constructor, detail: 'Class constructor definition', insertText: 'constructor(${1:props}) {\n\t$0\n}', isSnippet: true },
          // React snippets
          { label: 'useState', kind: monaco.languages.CompletionItemKind.Function, detail: 'React useState Hook', insertText: 'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialValue});', isSnippet: true },
          { label: 'useEffect', kind: monaco.languages.CompletionItemKind.Function, detail: 'React useEffect Hook', insertText: 'useEffect(() => {\n\t$0\n\treturn () => {};\n}, [${1:deps}]);', isSnippet: true },
          { label: 'useCallback', kind: monaco.languages.CompletionItemKind.Function, detail: 'React useCallback Hook', insertText: 'useCallback((${1:params}) => {\n\t$0\n}, [${2:deps}]);', isSnippet: true },
          { label: 'useMemo', kind: monaco.languages.CompletionItemKind.Function, detail: 'React useMemo Hook', insertText: 'useMemo(() => {\n\treturn ${1:computedValue};\n}, [${2:deps}]);', isSnippet: true },
          { label: 'useRef', kind: monaco.languages.CompletionItemKind.Function, detail: 'React useRef Hook', insertText: 'const ${1:ref} = useRef(${2:null});', isSnippet: true },
          // Common functions & keywords
          { label: 'function', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Function declaration', insertText: 'function ${1:name}(${2:params}) {\n\t$0\n}', isSnippet: true },
          { label: 'import', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Module import statement', insertText: "import { ${1:members} } from '${2:module}';", isSnippet: true },
          { label: 'export', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Module export statement', insertText: 'export const ${1:name} = ${2:value};', isSnippet: true },
          { label: 'interface', kind: monaco.languages.CompletionItemKind.Interface, detail: 'TypeScript interface declaration', insertText: 'interface ${1:Name} {\n\t${2:property}: ${3:string};\n}', isSnippet: true },
          { label: 'type', kind: monaco.languages.CompletionItemKind.Class, detail: 'TypeScript type alias', insertText: 'type ${1:Name} = ${2:string};', isSnippet: true },
          { label: 'fetch', kind: monaco.languages.CompletionItemKind.Function, detail: 'Asynchronous fetch API request', insertText: "fetch('${1:url}')\n\t.then(res => res.json())\n\t.then(data => {\n\t\t$0\n\t});", isSnippet: true },
          { label: 'setTimeout', kind: monaco.languages.CompletionItemKind.Function, detail: 'Timer timeout invocation', insertText: 'setTimeout(() => {\n\t$0\n}, ${1:1000});', isSnippet: true },
          { label: 'Promise', kind: monaco.languages.CompletionItemKind.Class, detail: 'Promise constructor', insertText: 'new Promise<${1:void}>((resolve, reject) => {\n\t$0\n});', isSnippet: true },
        ];

        globalKeywords.forEach((k) => {
          suggestions.push({
            label: k.label,
            kind: k.kind,
            detail: k.detail,
            insertText: k.insertText,
            insertTextRules: k.isSnippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
            range,
            sortText: '1' + k.label,
          });
        });

        return { suggestions };
      },
    });
  };

  registerJsTsCompletions('typescript');
  registerJsTsCompletions('javascript');

  // 3. Hover Provider for documentation tooltips
  const registerHoverDocs = (lang: string) => {
    monaco.languages.registerHoverProvider(lang, {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        const docMap: Record<string, { title: string; doc: string; type: string }> = {
          console: {
            title: 'var console: Console',
            doc: 'The `console` module provides a simple debugging console that is similar to the JavaScript console mechanism provided by web browsers.',
            type: 'namespace console',
          },
          log: {
            title: '(method) console.log(...data: any[]): void',
            doc: 'Prints to stdout with newline. Multiple arguments can be passed, with the first used as the primary message and all additional used as substitution values.',
            type: 'Method: stdout print',
          },
          useState: {
            title: 'function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]',
            doc: 'Returns a stateful value, and a function to update it.\n\nDuring the initial render, the returned state is the same as the value passed as the first argument.',
            type: 'React Hook',
          },
          useEffect: {
            title: 'function useEffect(effect: EffectCallback, deps?: DependencyList): void',
            doc: 'Accepts a function that contains imperative, possibly effectful code.\n\nMutations, subscriptions, timers, logging, and other side effects are not allowed inside the main body of a function component.',
            type: 'React Hook',
          },
          calculateVelocity: {
            title: 'function calculateVelocity(iteration: number): number',
            doc: 'Calculates the dynamic compiler execution velocity with harmonic frequency variation.',
            type: 'Application Utility',
          },
          formatBytes: {
            title: 'function formatBytes(bytes: number, decimals?: number): string',
            doc: 'Converts raw byte count into human-readable formatted string (KB, MB, GB).',
            type: 'Application Utility',
          }
        };

        const found = docMap[word.word];
        if (found) {
          return {
            range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
            contents: [
              { value: `\`\`\`typescript\n${found.title}\n\`\`\`` },
              { value: `**macOS IntelliSense Insight**\n\n${found.doc}` },
            ],
          };
        }

        return null;
      },
    });
  };

  registerHoverDocs('typescript');
  registerHoverDocs('javascript');

  // 4. Register Custom macOS Themes
  monaco.editor.defineTheme('macos-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', background: '19191d', foreground: 'e0e0e6' },
      { token: 'comment', foreground: '787c88', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'fc5fa3', fontStyle: 'bold' },
      { token: 'identifier', foreground: 'e0e0e6' },
      { token: 'string', foreground: 'fc6a5d' },
      { token: 'number', foreground: 'd0bf69' },
      { token: 'type', foreground: '5dd8ff' },
      { token: 'class', foreground: '5dd8ff', fontStyle: 'bold' },
      { token: 'function', foreground: '6699ff' },
      { token: 'delimiter', foreground: 'a1a1a6' },
      { token: 'tag', foreground: 'fc5fa3' },
      { token: 'attribute.name', foreground: '967efb' },
    ],
    colors: {
      'editor.background': '#16161b',
      'editor.foreground': '#e0e0e6',
      'editor.lineHighlightBackground': '#1f1f26',
      'editorCursor.foreground': '#007aff',
      'editorWhitespace.foreground': '#32323e',
      'editorIndentGuide.background1': '#262630',
      'editorIndentGuide.activeBackground1': '#4a4a5e',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#1e3852',
      'editorLineNumber.foreground': '#5c5c6e',
      'editorLineNumber.activeForeground': '#a1a1a6',
      'minimap.background': '#16161b',
      'editorGutter.background': '#16161b',
      'editorWidget.background': '#202028',
      'editorWidget.border': '#353545',
      'editorSuggestWidget.background': '#202028',
      'editorSuggestWidget.border': '#353545',
      'editorSuggestWidget.foreground': '#e0e0e6',
      'editorSuggestWidget.selectedBackground': '#007aff33',
      'editorSuggestWidget.highlightForeground': '#5dd8ff',
    },
  });

  monaco.editor.defineTheme('macos-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: '', background: 'fbfbfd', foreground: '1d1d1f' },
      { token: 'comment', foreground: '787c88', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ad3da4', fontStyle: 'bold' },
      { token: 'identifier', foreground: '1d1d1f' },
      { token: 'string', foreground: 'd12f1b' },
      { token: 'number', foreground: '272ad8' },
      { token: 'type', foreground: '3e6b89' },
      { token: 'function', foreground: '0071e3' },
      { token: 'tag', foreground: 'ad3da4' },
      { token: 'attribute.name', foreground: '703daa' },
    ],
    colors: {
      'editor.background': '#fbfbfd',
      'editor.foreground': '#1d1d1f',
      'editor.lineHighlightBackground': '#f0f0f4',
      'editorCursor.foreground': '#0071e3',
      'editorWhitespace.foreground': '#d2d2d7',
      'editorIndentGuide.background1': '#e5e5ea',
      'editorIndentGuide.activeBackground1': '#b0b0b8',
      'editor.selectionBackground': '#b3d7ff',
      'editorLineNumber.foreground': '#a1a1a6',
      'editorLineNumber.activeForeground': '#1d1d1f',
      'editorWidget.background': '#ffffff',
      'editorWidget.border': '#d2d2d7',
      'editorSuggestWidget.background': '#ffffff',
      'editorSuggestWidget.border': '#d2d2d7',
      'editorSuggestWidget.foreground': '#1d1d1f',
      'editorSuggestWidget.selectedBackground': '#0071e322',
      'editorSuggestWidget.highlightForeground': '#0071e3',
    },
  });

  monaco.editor.defineTheme('xcode-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', background: '121217', foreground: 'dfdfe5' },
      { token: 'comment', foreground: '6b7280' },
      { token: 'keyword', foreground: 'ff7ab2', fontStyle: 'bold' },
      { token: 'string', foreground: 'ff8170' },
      { token: 'type', foreground: '6bdfff' },
      { token: 'function', foreground: '78c2ff' },
      { token: 'number', foreground: 'daba7c' },
    ],
    colors: {
      'editor.background': '#0f0f14',
      'editor.foreground': '#dfdfe5',
      'editor.lineHighlightBackground': '#181822',
      'editorCursor.foreground': '#ff7ab2',
      'editor.selectionBackground': '#2c3e50',
      'editorLineNumber.foreground': '#4b5563',
      'editorLineNumber.activeForeground': '#9ca3af',
    },
  });

  monaco.editor.defineTheme('dracula', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', background: '282a36', foreground: 'f8f8f2' },
      { token: 'comment', foreground: '6272a4' },
      { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'type', foreground: '8be9fd' },
      { token: 'function', foreground: '50fa7b' },
      { token: 'number', foreground: 'bd93f9' },
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#44475a',
      'editorCursor.foreground': '#f8f8f0',
      'editor.selectionBackground': '#44475a',
    },
  });

  monaco.editor.defineTheme('high-contrast', {
    base: 'hc-black',
    inherit: true,
    rules: [
      { token: '', foreground: 'ffffff' },
      { token: 'comment', foreground: '7ca6ff' },
      { token: 'keyword', foreground: 'ffff00', fontStyle: 'bold' },
      { token: 'string', foreground: '00ff00' },
      { token: 'type', foreground: '00ffff' },
      { token: 'function', foreground: 'ff80df' },
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#ffffff',
      'editorLineNumber.foreground': '#ffffff',
    },
  });
}
