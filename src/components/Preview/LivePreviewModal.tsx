import React, { useState } from 'react';
import {
  X,
  RotateCw,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Project } from '../../types';
import { getAllFilesFlat } from '../../services/storage';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  isLight: boolean;
}

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  isOpen,
  onClose,
  project,
  isLight,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [reloadKey, setReloadKey] = useState(0);

  if (!isOpen) return null;

  const files = getAllFilesFlat(project.rootFiles);
  const appTsx = files.find((f) => f.name === 'App.tsx')?.content || '';
  const stylesCss = files.find((f) => f.name === 'styles.css')?.content || '';

  // Generate safe sandbox preview HTML
  const previewHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          ${stylesCss}
          body { margin: 0; padding: 0; background: #1a1a20; color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          const { useState, useEffect, useRef, useMemo, useCallback } = React;
          
          function calculateVelocity(iteration) {
            return 480 + Math.sin(iteration * 0.4) * 45 + (iteration * 12);
          }
          function formatBytes(bytes) {
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
          }

          // Injected App component
          try {
            ${appTsx
              .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
              .replace(/export\s+default\s+function\s+App/g, 'function App')
              .replace(/export\s+function/g, 'function')}
            
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
          } catch (err) {
            document.getElementById('root').innerHTML = '<div style="padding:20px;color:#ff5f56;font-family:monospace;"><b>Runtime Error:</b><br/>' + err.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;

  let containerWidth = 'w-full h-full';
  if (device === 'tablet') containerWidth = 'w-[768px] h-[90%] rounded-xl shadow-2xl border border-white/10';
  if (device === 'mobile') containerWidth = 'w-[375px] h-[90%] rounded-2xl shadow-2xl border border-white/10';

  return (
    <div
      id="live-preview-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="live-preview-window"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-5xl h-[85vh] rounded-xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-150 animate-in zoom-in-95 duration-100 ${
          isLight
            ? 'bg-[#ffffff] border-black/10 text-neutral-900 shadow-black/20'
            : 'bg-[#1e1e24] border-white/10 text-neutral-100 shadow-black/60'
        }`}
      >
        {/* Preview Browser Toolbar (Safari style) */}
        <div
          className={`h-11 px-3 flex items-center justify-between border-b select-none shrink-0 ${
            isLight ? 'bg-[#f6f6f8] border-black/10' : 'bg-[#22222a] border-white/10'
          }`}
        >
          {/* Traffic lights */}
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-[#e0443e] cursor-pointer" onClick={onClose} />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-[#dea123]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-[#1aab29]" />
          </div>

          {/* Device toggle */}
          <div className="flex items-center space-x-1 bg-black/5 dark:bg-white/10 p-0.5 rounded-lg">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1 rounded ${device === 'desktop' ? 'bg-white dark:bg-white/20 shadow-xs' : 'opacity-60'}`}
              title="Desktop View"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1 rounded ${device === 'tablet' ? 'bg-white dark:bg-white/20 shadow-xs' : 'opacity-60'}`}
              title="Tablet View"
            >
              <Tablet size={14} />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1 rounded ${device === 'mobile' ? 'bg-white dark:bg-white/20 shadow-xs' : 'opacity-60'}`}
              title="Mobile View"
            >
              <Smartphone size={14} />
            </button>
          </div>

          {/* URL bar (macOS Safari style) */}
          <div
            className={`hidden sm:flex items-center space-x-2 px-3 py-1 rounded-md text-xs border w-64 max-w-sm truncate ${
              isLight ? 'bg-white border-black/10 text-neutral-600' : 'bg-white/5 border-white/10 text-neutral-400'
            }`}
          >
            <CheckCircle2 size={12} className="text-[#32d74b] shrink-0" />
            <span className="truncate font-mono text-[11px]">localhost:3000/{project.name}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100"
              title="Reload preview"
            >
              <RotateCw size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 bg-black/40 flex items-center justify-center p-2 overflow-hidden">
          <div className={`${containerWidth} overflow-hidden transition-all duration-200 bg-[#1e1e24]`}>
            <iframe
              key={reloadKey}
              srcDoc={previewHtml}
              title="Live App Preview"
              sandbox="allow-scripts allow-modals"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
