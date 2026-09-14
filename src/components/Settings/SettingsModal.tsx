import React, { useState } from 'react';
import {
  X,
  Sliders,
  Palette,
  Layout,
  Database,
  Info,
  Check,
  RotateCcw,
  Download
} from 'lucide-react';
import { AppSettings, EditorTheme, ThemeMode } from '../../types';
import { DEFAULT_SETTINGS } from '../../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  isLight: boolean;
  onExportProject: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  isLight,
  onExportProject,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'editor' | 'interface' | 'sync' | 'about'>('appearance');
  const [current, setCurrent] = useState<AppSettings>(settings);
  const [savedAlert, setSavedAlert] = useState(false);

  if (!isOpen) return null;

  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...current, [key]: value };
    setCurrent(updated);
    onSaveSettings(updated);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 1200);
  };

  const handleReset = () => {
    setCurrent(DEFAULT_SETTINGS);
    onSaveSettings(DEFAULT_SETTINGS);
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="settings-modal-window"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl h-[520px] rounded-xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-150 animate-in zoom-in-95 duration-100 ${
          isLight
            ? 'bg-[#ffffff]/98 border-black/10 text-neutral-900 shadow-black/20'
            : 'bg-[#1e1e24]/98 border-white/10 text-neutral-100 shadow-black/60'
        } backdrop-blur-3xl`}
      >
        <div
          className={`h-11 px-4 flex items-center justify-between border-b select-none shrink-0 ${
            isLight ? 'bg-[#f6f6f8] border-black/10' : 'bg-[#23232c] border-white/10'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-[#e0443e] cursor-pointer" onClick={onClose} />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-[#dea123]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-[#1aab29]" />
            <span className="text-xs font-semibold tracking-tight ml-2">Preferences</span>
          </div>

          <div className="flex items-center space-x-2">
            {savedAlert && (
              <span className="text-[11px] text-[#32d74b] flex items-center space-x-1 animate-in fade-in">
                <Check size={12} />
                <span>Saved</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div
            className={`w-44 border-r p-2 space-y-1 select-none shrink-0 ${
              isLight ? 'bg-[#f6f6f8]/70 border-black/10' : 'bg-[#18181f]/70 border-white/10'
            }`}
          >
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center space-x-2.5 transition-colors ${
                activeTab === 'appearance'
                  ? 'bg-[#007aff] text-white font-medium shadow-xs'
                  : isLight
                    ? 'hover:bg-black/5 text-neutral-700'
                    : 'hover:bg-white/5 text-neutral-300'
              }`}
            >
              <Palette size={14} />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center space-x-2.5 transition-colors ${
                activeTab === 'editor'
                  ? 'bg-[#007aff] text-white font-medium shadow-xs'
                  : isLight
                    ? 'hover:bg-black/5 text-neutral-700'
                    : 'hover:bg-white/5 text-neutral-300'
              }`}
            >
              <Sliders size={14} />
              <span>Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('interface')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center space-x-2.5 transition-colors ${
                activeTab === 'interface'
                  ? 'bg-[#007aff] text-white font-medium shadow-xs'
                  : isLight
                    ? 'hover:bg-black/5 text-neutral-700'
                    : 'hover:bg-white/5 text-neutral-300'
              }`}
            >
              <Layout size={14} />
              <span>Interface</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center space-x-2.5 transition-colors ${
                activeTab === 'sync'
                  ? 'bg-[#007aff] text-white font-medium shadow-xs'
                  : isLight
                    ? 'hover:bg-black/5 text-neutral-700'
                    : 'hover:bg-white/5 text-neutral-300'
              }`}
            >
              <Database size={14} />
              <span>Project & Sync</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center space-x-2.5 transition-colors ${
                activeTab === 'about'
                  ? 'bg-[#007aff] text-white font-medium shadow-xs'
                  : isLight
                    ? 'hover:bg-black/5 text-neutral-700'
                    : 'hover:bg-white/5 text-neutral-300'
              }`}
            >
              <Info size={14} />
              <span>About</span>
            </button>

            <div className={`h-[1px] my-2 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

            <button
              onClick={handleReset}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center space-x-2 text-neutral-400 hover:text-neutral-200"
            >
              <RotateCcw size={12} />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Application Theme</h4>
                  <p className="text-xs opacity-60 mb-3">
                    Choose between macOS Dark, Light, or automatic System scheme.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          handleChange('theme', mode);
                          if (mode === 'light') handleChange('editorTheme', 'macos-light');
                          if (mode === 'dark') handleChange('editorTheme', 'macos-dark');
                        }}
                        className={`p-3 rounded-lg border text-xs font-medium capitalize flex flex-col items-center justify-center space-y-2 transition-all ${
                          current.theme === mode
                            ? 'border-[#007aff] bg-[#007aff]/10 text-[#007aff] ring-2 ring-[#007aff]/30'
                            : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                        }`}
                      >
                        <span className="capitalize">{mode} Mode</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`h-[1px] ${isLight ? 'bg-black/5' : 'bg-white/5'}`} />

                <div>
                  <h4 className="text-sm font-semibold mb-1">Editor Theme</h4>
                  <p className="text-xs opacity-60 mb-3">
                    Xcode and Apple-inspired color palettes for code editing.
                  </p>
                  <select
                    value={current.editorTheme}
                    onChange={(e) => handleChange('editorTheme', e.target.value as EditorTheme)}
                    className={`w-full p-2 rounded-lg border text-xs outline-none ${
                      isLight
                        ? 'bg-white border-black/10 text-neutral-800'
                        : 'bg-[#181820] border-white/10 text-neutral-200'
                    }`}
                  >
                    <option value="macos-dark">macOS Dark (Graphite & Neon)</option>
                    <option value="macos-light">macOS Light (Clean Xcode)</option>
                    <option value="xcode-dark">Xcode Midnight (Deep Navy)</option>
                    <option value="dracula">Dracula Dark (Purple & Pink)</option>
                    <option value="high-contrast">macOS High Contrast</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold block">Font Size</span>
                    <span className="text-[11px] opacity-60">Editor typography scale (px)</span>
                  </div>
                  <input
                    type="number"
                    min="10"
                    max="28"
                    value={current.fontSize}
                    onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                    className={`w-16 p-1 rounded border text-xs text-center ${
                      isLight ? 'bg-white border-black/10' : 'bg-[#181820] border-white/10'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold block">Tab Size</span>
                    <span className="text-[11px] opacity-60">Number of spaces per tab</span>
                  </div>
                  <select
                    value={current.tabSize}
                    onChange={(e) => handleChange('tabSize', Number(e.target.value))}
                    className={`p-1 px-2 rounded border text-xs ${
                      isLight ? 'bg-white border-black/10' : 'bg-[#181820] border-white/10'
                    }`}
                  >
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold block">Minimap</span>
                    <span className="text-[11px] opacity-60">Code outline overview on the right</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={current.minimap}
                    onChange={(e) => handleChange('minimap', e.target.checked)}
                    className="w-4 h-4 accent-[#007aff]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold block">Bracket Matching</span>
                    <span className="text-[11px] opacity-60">Highlight matching bracket pairs</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={current.bracketPairColorization}
                    onChange={(e) => handleChange('bracketPairColorization', e.target.checked)}
                    className="w-4 h-4 accent-[#007aff]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold block">Word Wrap</span>
                    <span className="text-[11px] opacity-60">Wrap long code lines</span>
                  </div>
                  <select
                    value={current.wordWrap}
                    onChange={(e) => handleChange('wordWrap', e.target.value as 'on' | 'off')}
                    className={`p-1 px-2 rounded border text-xs ${
                      isLight ? 'bg-white border-black/10' : 'bg-[#181820] border-white/10'
                    }`}
                  >
                    <option value="on">On</option>
                    <option value="off">Off</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold block">Cursor Blinking</span>
                    <span className="text-[11px] opacity-60">Animation style of the text caret</span>
                  </div>
                  <select
                    value={current.cursorBlinking}
                    onChange={(e) => handleChange('cursorBlinking', e.target.value as any)}
                    className={`p-1 px-2 rounded border text-xs ${
                      isLight ? 'bg-white border-black/10' : 'bg-[#181820] border-white/10'
                    }`}
                  >
                    <option value="smooth">Smooth (macOS native)</option>
                    <option value="blink">Standard Blink</option>
                    <option value="solid">Solid</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'interface' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold block">Window Mode</span>
                    <span className="text-[11px] opacity-60">
                      Show in macOS Desktop frame or Fullscreen IDE
                    </span>
                  </div>
                  <select
                    value={current.windowMode}
                    onChange={(e) => handleChange('windowMode', e.target.value as 'desktop' | 'fullscreen')}
                    className={`p-1 px-2 rounded border text-xs ${
                      isLight ? 'bg-white border-black/10' : 'bg-[#181820] border-white/10'
                    }`}
                  >
                    <option value="desktop">Desktop with macOS Wallpaper</option>
                    <option value="fullscreen">Fullscreen IDE Window</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold block">Mobile Coding Toolbar</span>
                    <span className="text-[11px] opacity-60">
                      Show touch-friendly symbol shortcuts above keyboard
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={current.mobileToolbar}
                    onChange={(e) => handleChange('mobileToolbar', e.target.checked)}
                    className="w-4 h-4 accent-[#007aff]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold block">Reduced Motion</span>
                    <span className="text-[11px] opacity-60">Disable spring and slide animations</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={current.reducedMotion}
                    onChange={(e) => handleChange('reducedMotion', e.target.checked)}
                    className="w-4 h-4 accent-[#007aff]"
                  />
                </div>
              </div>
            )}

            {activeTab === 'sync' && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-[#007aff]">
                    <Database size={14} />
                    <span>Local-First Storage Active</span>
                  </div>
                  <p className="text-[11px] opacity-70">
                    All your projects, files, and tab states are saved locally in high-performance browser IndexedDB storage with automatic fallback.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold block">Auto-Save</span>
                    <span className="text-[11px] opacity-60">Automatically commit edits to disk</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={current.autoSave}
                    onChange={(e) => handleChange('autoSave', e.target.checked)}
                    className="w-4 h-4 accent-[#007aff]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={onExportProject}
                    className="px-3 py-2 bg-[#007aff] hover:bg-[#0062cc] text-white text-xs font-medium rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Download size={13} />
                    <span>Download Project as ZIP Archive</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-3 select-text">
                <h4 className="text-sm font-semibold">macOS Code Studio</h4>
                <p className="text-xs opacity-70 leading-relaxed">
                  Version 1.0.0 (Darwin arm64 Architecture)
                  <br />
                  Engineered with React 19, Monaco Editor, TypeScript, Tailwind CSS, and Express API.
                </p>
                <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] space-y-1 font-mono">
                  <div>Architecture: Apple Silicon M-Series Compatible</div>
                  <div>Editor Core: Microsoft Monaco Language Engine</div>
                  <div>Local Database: IndexedDB v1 + LocalStorage</div>
                  <div>IntelliSense: Dynamic Real-Time Completion Service</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
