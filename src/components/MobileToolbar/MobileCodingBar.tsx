import React from 'react';
import { Undo, Redo, Search, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileCodingBarProps {
  onInsertText: (text: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSearch: () => void;
  isLight: boolean;
}

export const MobileCodingBar: React.FC<MobileCodingBarProps> = ({
  onInsertText,
  onUndo,
  onRedo,
  onOpenSearch,
  isLight,
}) => {
  const symbolKeys = [
    { label: '{ }', insert: '{\n  $0\n}' },
    { label: '( )', insert: '($0)' },
    { label: '[ ]', insert: '[$0]' },
    { label: '< >', insert: '<$0>' },
    { label: '"', insert: '"' },
    { label: "'", insert: "'" },
    { label: '`', insert: '`' },
    { label: ':', insert: ': ' },
    { label: ';', insert: ';' },
    { label: '=', insert: ' = ' },
    { label: '=>', insert: ' => ' },
    { label: 'Tab', insert: '  ' },
    { label: '&&', insert: ' && ' },
    { label: '||', insert: ' || ' },
    { label: '!', insert: '!' },
    { label: '/', insert: '/' },
  ];

  return (
    <div
      id="mobile-coding-toolbar"
      className={`h-11 flex items-center select-none overflow-x-auto no-scrollbar px-1 border-t shrink-0 z-20 ${
        isLight
          ? 'bg-[#ececef] border-black/10 text-neutral-800'
          : 'bg-[#1c1c24] border-white/10 text-neutral-200'
      }`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Quick Action keys */}
      <div className="flex items-center space-x-1 shrink-0 pr-1.5 border-r border-black/10 dark:border-white/10">
        <button
          onClick={onUndo}
          title="Undo"
          className="min-w-[44px] h-[36px] flex items-center justify-center rounded-md hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/20"
        >
          <Undo size={15} />
        </button>
        <button
          onClick={onRedo}
          title="Redo"
          className="min-w-[44px] h-[36px] flex items-center justify-center rounded-md hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/20"
        >
          <Redo size={15} />
        </button>
        <button
          onClick={onOpenSearch}
          title="Find"
          className="min-w-[44px] h-[36px] flex items-center justify-center rounded-md hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/20"
        >
          <Search size={15} />
        </button>
      </div>

      {/* Symbol insertion keys */}
      <div className="flex items-center space-x-1 pl-1">
        {symbolKeys.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onInsertText(item.insert)}
            className={`min-w-[44px] h-[36px] px-2 rounded-md font-mono text-xs font-medium flex items-center justify-center transition-colors ${
              isLight
                ? 'bg-white hover:bg-black/5 text-neutral-800 shadow-xs'
                : 'bg-white/10 hover:bg-white/15 text-neutral-100 shadow-xs'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
