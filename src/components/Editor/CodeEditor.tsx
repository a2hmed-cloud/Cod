import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import MonacoEditorComponent, { OnMount } from '@monaco-editor/react';
import type * as MonacoType from 'monaco-editor';
import { AppSettings, EditorDiagnostic, EditorSplitMode, EditorTab } from '../../types';
import { setupMonacoIntelliSense } from '../../editor/intellisense';
import { Columns2, Rows2, X } from 'lucide-react';

export interface CodeEditorHandle {
  undo: () => void;
  redo: () => void;
  format: () => void;
  find: () => void;
  selectAll: () => void;
  revealLine: (line: number, col: number) => void;
}

interface CodeEditorProps {
  tab: EditorTab | null;
  content: string;
  onChange: (value: string) => void;
  settings: AppSettings;
  isLight: boolean;
  onCursorChange?: (pos: { line: number; column: number }, totalLines: number) => void;
  onDiagnosticsChange?: (diagnostics: EditorDiagnostic[]) => void;
  splitMode: EditorSplitMode;
  onCloseSplit?: () => void;
  secondaryTab?: EditorTab | null;
  secondaryContent?: string;
  onSecondaryChange?: (value: string) => void;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  (
    {
      tab,
      content,
      onChange,
      settings,
      isLight,
      onCursorChange,
      onDiagnosticsChange,
      splitMode,
      onCloseSplit,
      secondaryTab,
      secondaryContent,
      onSecondaryChange,
    },
    ref
  ) => {
    const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<any>(null);
    const secondaryEditorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null);

    // Expose actions to parent
    useImperativeHandle(ref, () => ({
      undo: () => {
        editorRef.current?.trigger('toolbar', 'undo', null);
      },
      redo: () => {
        editorRef.current?.trigger('toolbar', 'redo', null);
      },
      format: () => {
        editorRef.current?.getAction('editor.action.formatDocument')?.run();
      },
      find: () => {
        editorRef.current?.getAction('actions.find')?.run();
      },
      selectAll: () => {
        editorRef.current?.trigger('toolbar', 'editor.action.selectAll', null);
      },
      revealLine: (line: number, col: number) => {
        if (editorRef.current) {
          editorRef.current.revealPositionInCenter({ lineNumber: line, column: col });
          editorRef.current.setPosition({ lineNumber: line, column: col });
          editorRef.current.focus();
        }
      },
    }));

    // Handle primary Monaco Mounting
    const handleEditorDidMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Initialize custom themes & IntelliSense autocomplete
      setupMonacoIntelliSense(monaco);

      // Apply active theme
      monaco.editor.setTheme(settings.editorTheme);

      // Track cursor position
      editor.onDidChangeCursorPosition((e) => {
        const model = editor.getModel();
        const totalLines = model ? model.getLineCount() : 1;
        onCursorChange?.(
          { line: e.position.lineNumber, column: e.position.column },
          totalLines
        );
      });

      // Track model changes
      editor.onDidChangeModelContent(() => {
        const model = editor.getModel();
        if (model) {
          const pos = editor.getPosition() || { lineNumber: 1, column: 1 };
          onCursorChange?.(
            { line: pos.lineNumber, column: pos.column },
            model.getLineCount()
          );
        }
      });

      // Listen for syntax markers / diagnostics
      monaco.editor.onDidChangeMarkers(() => {
        const model = editor.getModel();
        if (!model) return;
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        const diagnostics: EditorDiagnostic[] = markers.map((m: any, idx: number) => ({
          id: `diag-${idx}-${m.startLineNumber}-${m.startColumn}`,
          fileId: tab?.fileId || '',
          fileName: tab?.name || 'Untitled',
          line: m.startLineNumber,
          column: m.startColumn,
          message: m.message,
          severity:
            m.severity === 8
              ? 'error'
              : m.severity === 4
              ? 'warning'
              : 'info',
          source: m.source || 'IntelliSense',
        }));
        onDiagnosticsChange?.(diagnostics);
      });

      editor.focus();
    };

    // Handle secondary Monaco Mounting (for split view)
    const handleSecondaryDidMount: OnMount = (editor, monaco) => {
      secondaryEditorRef.current = editor;
      monaco.editor.setTheme(settings.editorTheme);
    };

    // Update themes dynamically
    useEffect(() => {
      if (monacoRef.current) {
        monacoRef.current.editor.setTheme(settings.editorTheme);
      }
    }, [settings.editorTheme]);

    // Update primary editor options dynamically
    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.updateOptions({
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap,
          minimap: { enabled: settings.minimap },
          lineNumbers: settings.lineNumbers,
          cursorBlinking: settings.cursorBlinking,
          cursorStyle: settings.cursorStyle,
          bracketPairColorization: { enabled: settings.bracketPairColorization },
        });
      }
      if (secondaryEditorRef.current) {
        secondaryEditorRef.current.updateOptions({
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap,
          minimap: { enabled: settings.minimap },
          lineNumbers: settings.lineNumbers,
        });
      }
    }, [settings]);

    const commonMonacoOptions = {
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap,
      minimap: {
        enabled: settings.minimap,
        maxColumn: 80,
        renderCharacters: false,
      },
      lineNumbers: settings.lineNumbers,
      cursorBlinking: settings.cursorBlinking,
      cursorStyle: settings.cursorStyle,
      bracketPairColorization: { enabled: settings.bracketPairColorization },
      smoothScrolling: !settings.reducedMotion,
      cursorSmoothCaretAnimation: !settings.reducedMotion ? ('on' as const) : ('off' as const),
      renderWhitespace: 'selection' as const,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 10, bottom: 20 },
      fontLigatures: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on' as const,
      tabCompletion: 'on' as const,
      snippetSuggestions: 'top' as const,
    };

    if (!tab) {
      return null;
    }

    return (
      <div
        id="editor-container"
        className={`flex-1 flex min-h-0 relative overflow-hidden ${
          splitMode === 'horizontal' ? 'flex-col' : 'flex-row'
        }`}
      >
        {/* Primary Pane */}
        <div className="flex-1 min-w-0 min-h-0 relative h-full">
          <MonacoEditorComponent
            height="100%"
            width="100%"
            language={tab.language}
            value={content}
            onChange={(val) => onChange(val || '')}
            theme={settings.editorTheme}
            onMount={handleEditorDidMount}
            loading={
              <div className="flex items-center justify-center h-full text-xs opacity-50 font-mono text-white">
                Initializing Monaco Editor Engine...
              </div>
            }
            options={commonMonacoOptions}
          />
        </div>

        {/* Split Pane if active */}
        {splitMode !== 'none' && (
          <>
            {/* Split Divider */}
            <div
              className={`shrink-0 bg-white/10 ${
                splitMode === 'horizontal' ? 'h-1.5 w-full cursor-row-resize' : 'w-1.5 h-full cursor-col-resize'
              } hover:bg-[#007aff] transition-colors relative flex items-center justify-center`}
            >
              <button
                onClick={onCloseSplit}
                title="Close Split Pane"
                className="absolute z-20 p-0.5 rounded-full bg-[#22222a] border border-white/20 text-white/70 hover:text-white hover:bg-red-500 shadow-md"
              >
                <X size={10} />
              </button>
            </div>

            {/* Secondary Pane */}
            <div className="flex-1 min-w-0 min-h-0 relative h-full">
              <MonacoEditorComponent
                height="100%"
                width="100%"
                language={secondaryTab ? secondaryTab.language : tab.language}
                value={secondaryContent !== undefined ? secondaryContent : content}
                onChange={(val) => onSecondaryChange ? onSecondaryChange(val || '') : onChange(val || '')}
                theme={settings.editorTheme}
                onMount={handleSecondaryDidMount}
                options={commonMonacoOptions}
              />
            </div>
          </>
        )}
      </div>
    );
  }
);
