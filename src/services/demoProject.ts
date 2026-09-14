import { FileNode, Project, ProjectType } from '../types';

export const STUDYFLOW_PROJECT: Project = {
  id: 'proj-studyflow',
  name: 'StudyFlow',
  type: 'typescript',
  tags: ['TypeScript', 'React', 'Algorithms'],
  description: 'Spaced repetition flashcard engine and active recall organizer',
  rootPath: '~/Projects/StudyFlow',
  createdAt: Date.now() - 86400000 * 3,
  updatedAt: Date.now() - 3600000 * 2,
  lastOpenedAt: Date.now(),
  activeFileId: 'study-app-tsx',
  gitCommits: [
    {
      id: 'c7f91a2',
      message: 'feat: implement SuperMemo-2 spaced repetition calculation',
      timestamp: Date.now() - 86400000 * 2,
      filesCount: 4,
      author: 'Developer <dev@macos.studio>',
    },
    {
      id: 'a3d82e1',
      message: 'feat: add audio chime on pomodoro timer completion',
      timestamp: Date.now() - 86400000,
      filesCount: 2,
      author: 'Developer <dev@macos.studio>',
    },
  ],
  rootFiles: [
    {
      id: 'study-src',
      name: 'src',
      path: '/src',
      type: 'folder',
      isExpanded: true,
      children: [
        {
          id: 'study-components',
          name: 'components',
          path: '/src/components',
          type: 'folder',
          isExpanded: true,
          children: [
            {
              id: 'study-card-deck',
              name: 'CardDeck.tsx',
              path: '/src/components/CardDeck.tsx',
              type: 'file',
              language: 'typescript',
              updatedAt: Date.now() - 7200000,
              content: `import React, { useState } from 'react';
import { Flashcard, ReviewScore } from '../types/study';
import { calculateNextReview } from '../algorithms/spacedRepetition';

interface CardDeckProps {
  cards: Flashcard[];
  onReviewCard: (cardId: string, nextInterval: number) => void;
}

export const CardDeck: React.FC<CardDeckProps> = ({ cards, onReviewCard }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const activeCard = cards[currentIndex];

  if (!activeCard) {
    return (
      <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10">
        <h3 className="text-base font-semibold text-[#32d74b]">All reviews complete!</h3>
        <p className="text-xs opacity-70 mt-1">Excellent focus session. Take a break.</p>
      </div>
    );
  }

  const handleScore = (score: ReviewScore) => {
    const nextInterval = calculateNextReview(activeCard.repetition, score);
    onReviewCard(activeCard.id, nextInterval);
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="h-56 p-6 rounded-2xl bg-[#1e1e24] border border-white/15 cursor-pointer select-none flex flex-col justify-between shadow-xl transition-all hover:border-[#007aff]"
      >
        <span className="text-[11px] font-mono text-[#007aff] uppercase">
          Card {currentIndex + 1} of {cards.length}
        </span>
        <div className="text-center my-auto">
          <p className="text-sm font-medium text-white/90">
            {isFlipped ? activeCard.back : activeCard.front}
          </p>
          <span className="text-[10px] text-white/40 mt-2 block">
            {isFlipped ? 'Answer' : 'Click card to flip'}
          </span>
        </div>
        <div className="text-right text-[10px] text-white/40">
          Ease Factor: {activeCard.easeFactor.toFixed(2)}
        </div>
      </div>

      {isFlipped && (
        <div className="grid grid-cols-4 gap-2 animate-in fade-in duration-150">
          <button
            onClick={() => handleScore(1)}
            className="p-2 rounded-lg bg-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/30"
          >
            Again
          </button>
          <button
            onClick={() => handleScore(2)}
            className="p-2 rounded-lg bg-orange-500/20 text-orange-300 text-xs font-medium hover:bg-orange-500/30"
          >
            Hard
          </button>
          <button
            onClick={() => handleScore(3)}
            className="p-2 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-medium hover:bg-blue-500/30"
          >
            Good
          </button>
          <button
            onClick={() => handleScore(4)}
            className="p-2 rounded-lg bg-green-500/20 text-green-300 text-xs font-medium hover:bg-green-500/30"
          >
            Easy
          </button>
        </div>
      )}
    </div>
  );
};
`,
            },
            {
              id: 'study-timer',
              name: 'PomodoroTimer.tsx',
              path: '/src/components/PomodoroTimer.tsx',
              type: 'file',
              language: 'typescript',
              updatedAt: Date.now() - 14400000,
              content: `import React, { useState, useEffect } from 'react';

export const PomodoroTimer: React.FC = () => {
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((s) => s - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsRunning(false);
      console.log('[Timer] Session finished! Enjoy your break.');
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-3">
      <div className="text-3xl font-mono font-bold text-[#007aff] tracking-wider">
        {timeFormatted}
      </div>
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-4 py-1.5 rounded-lg bg-[#007aff] text-white text-xs font-medium hover:bg-[#0062cc]"
        >
          {isRunning ? 'Pause' : 'Start Focus'}
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setSecondsRemaining(25 * 60);
          }}
          className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium hover:bg-white/15"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
`,
            },
          ],
        },
        {
          id: 'study-algorithms',
          name: 'algorithms',
          path: '/src/algorithms',
          type: 'folder',
          isExpanded: true,
          children: [
            {
              id: 'study-algo-sr',
              name: 'spacedRepetition.ts',
              path: '/src/algorithms/spacedRepetition.ts',
              type: 'file',
              language: 'typescript',
              updatedAt: Date.now() - 3600000,
              content: `import { ReviewScore } from '../types/study';

/**
 * SuperMemo SM-2 Interval Calculation
 * @param repetition Current review count
 * @param score Feedback rating (1: again, 2: hard, 3: good, 4: easy)
 * @returns interval in days
 */
export function calculateNextReview(repetition: number, score: ReviewScore): number {
  if (score === 1) {
    return 1; // reset to 1 day on recall failure
  }

  if (repetition === 0) {
    return 1;
  } else if (repetition === 1) {
    return 3;
  }

  const baseInterval = Math.round(repetition * 2.5);
  const factorAdjustment = score === 4 ? 1.3 : score === 2 ? 0.8 : 1.0;
  
  return Math.max(1, Math.round(baseInterval * factorAdjustment));
}

export function computeStudyStreak(reviewTimestamps: number[]): number {
  if (!reviewTimestamps.length) return 0;
  // Compute consecutive calendar day reviews
  let streak = 1;
  const sorted = [...reviewTimestamps].sort((a, b) => b - a);
  const oneDayMs = 86400000;
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = sorted[i] - sorted[i + 1];
    if (diff <= oneDayMs * 1.5) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
`,
            },
          ],
        },
        {
          id: 'study-types',
          name: 'types',
          path: '/src/types',
          type: 'folder',
          isExpanded: true,
          children: [
            {
              id: 'study-type-def',
              name: 'study.ts',
              path: '/src/types/study.ts',
              type: 'file',
              language: 'typescript',
              updatedAt: Date.now() - 10000000,
              content: `export type ReviewScore = 1 | 2 | 3 | 4;

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tag: string;
  repetition: number;
  easeFactor: number;
  lastReviewed?: number;
}

export interface DeckStats {
  totalCards: number;
  dueToday: number;
  retentionRate: number;
  streakDays: number;
}
`,
            },
          ],
        },
        {
          id: 'study-app-tsx',
          name: 'App.tsx',
          path: '/src/App.tsx',
          type: 'file',
          language: 'typescript',
          updatedAt: Date.now(),
          content: `import React, { useState } from 'react';
import { CardDeck } from './components/CardDeck';
import { PomodoroTimer } from './components/PomodoroTimer';
import { Flashcard } from './types/study';

const INITIAL_CARDS: Flashcard[] = [
  {
    id: 'c1',
    front: 'What is Time Complexity of QuickSort in worst case?',
    back: 'O(n^2) when pivot selection repeatedly splits unbalanced partitions.',
    tag: 'CS Algorithms',
    repetition: 2,
    easeFactor: 2.5,
  },
  {
    id: 'c2',
    front: 'What is a Pure Function in Functional Programming?',
    back: 'A function that produces identical output for identical arguments and has zero side-effects.',
    tag: 'Computer Science',
    repetition: 4,
    easeFactor: 2.7,
  },
  {
    id: 'c3',
    front: 'Difference between Interface and Type in TypeScript?',
    back: 'Interfaces support declaration merging and OOP inheritance, while Types support unions and primitives.',
    tag: 'TypeScript',
    repetition: 1,
    easeFactor: 2.4,
  },
];

export default function App() {
  const [cards, setCards] = useState<Flashcard[]>(INITIAL_CARDS);
  const [activeView, setActiveView] = useState<'study' | 'timer'>('study');

  const handleReviewCard = (cardId: string, nextInterval: number) => {
    console.log(\`[StudyFlow] Card \${cardId} scheduled in \${nextInterval} days\`);
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, repetition: c.repetition + 1, lastReviewed: Date.now() }
          : c
      )
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 font-sans">
      <header className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">StudyFlow</h1>
          <p className="text-xs text-white/60">Adaptive Recall & Focus Mastery</p>
        </div>
        <div className="flex space-x-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => setActiveView('study')}
            className={\`px-3 py-1 rounded-md transition-colors \${
              activeView === 'study' ? 'bg-[#007aff] text-white' : 'text-white/60 hover:text-white'
            }\`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setActiveView('timer')}
            className={\`px-3 py-1 rounded-md transition-colors \${
              activeView === 'timer' ? 'bg-[#007aff] text-white' : 'text-white/60 hover:text-white'
            }\`}
          >
            Pomodoro
          </button>
        </div>
      </header>

      <main>
        {activeView === 'study' ? (
          <CardDeck cards={cards} onReviewCard={handleReviewCard} />
        ) : (
          <PomodoroTimer />
        )}
      </main>
    </div>
  );
}
`,
        },
        {
          id: 'study-main-tsx',
          name: 'main.tsx',
          path: '/src/main.tsx',
          type: 'file',
          language: 'typescript',
          updatedAt: Date.now() - 50000000,
          content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
        },
        {
          id: 'study-styles-css',
          name: 'styles.css',
          path: '/src/styles.css',
          type: 'file',
          language: 'css',
          updatedAt: Date.now() - 50000000,
          content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #121217;
  color: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
`,
        },
      ],
    },
    {
      id: 'study-public',
      name: 'public',
      path: '/public',
      type: 'folder',
      children: [
        {
          id: 'study-index-html',
          name: 'index.html',
          path: '/public/index.html',
          type: 'file',
          language: 'html',
          updatedAt: Date.now() - 50000000,
          content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>StudyFlow - Spaced Repetition</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,
        },
      ],
    },
    {
      id: 'study-pkg-json',
      name: 'package.json',
      path: '/package.json',
      type: 'file',
      language: 'json',
      updatedAt: Date.now() - 50000000,
      content: `{
  "name": "studyflow",
  "version": "1.2.0",
  "private": true,
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.500.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  }
}
`,
    },
    {
      id: 'study-readme-md',
      name: 'README.md',
      path: '/README.md',
      type: 'file',
      language: 'markdown',
      updatedAt: Date.now() - 50000000,
      content: `# StudyFlow 🧠

A native macOS inspired spaced repetition engine and pomodoro timer.

## Features
- SuperMemo SM-2 interval algorithm
- Built-in Focus Timer
- Minimalist Dark & Light theme integration
- Real-time review metrics
`,
    },
  ],
};

export const MY_WEBSITE_PROJECT: Project = {
  id: 'proj-my-website',
  name: 'My Website',
  type: 'react',
  tags: ['React', 'Tailwind', 'Portfolio'],
  description: 'Clean personal website and design engineering portfolio',
  rootPath: '~/Projects/My Website',
  createdAt: Date.now() - 86400000 * 7,
  updatedAt: Date.now() - 3600000 * 5,
  lastOpenedAt: Date.now() - 3600000 * 5,
  activeFileId: 'web-app-tsx',
  gitCommits: [
    {
      id: '9b14f82',
      message: 'feat: add dark/light glass design system showcase',
      timestamp: Date.now() - 86400000 * 3,
      filesCount: 3,
      author: 'Developer <dev@macos.studio>',
    },
  ],
  rootFiles: [
    {
      id: 'web-src',
      name: 'src',
      path: '/src',
      type: 'folder',
      isExpanded: true,
      children: [
        {
          id: 'web-app-tsx',
          name: 'App.tsx',
          path: '/src/App.tsx',
          type: 'file',
          language: 'typescript',
          updatedAt: Date.now(),
          content: `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#111115] text-[#f0f0f3] p-8">
      <header className="max-w-3xl mx-auto py-12 border-b border-white/10">
        <h1 className="text-3xl font-bold tracking-tight">Alex Rivera</h1>
        <p className="text-sm text-[#007aff] mt-1 font-mono">Software Architect & Interface Designer</p>
      </header>

      <section className="max-w-3xl mx-auto py-8 space-y-6">
        <h2 className="text-lg font-semibold text-white/90">Selected Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#007aff] transition-colors">
            <h3 className="text-sm font-bold">StudyFlow</h3>
            <p className="text-xs text-white/60 mt-1">Adaptive flashcard engine built with React & TypeScript.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#007aff] transition-colors">
            <h3 className="text-sm font-bold">macOS Studio</h3>
            <p className="text-xs text-white/60 mt-1">Full-featured native desktop IDE experience for the web.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
`,
        },
        {
          id: 'web-styles',
          name: 'index.css',
          path: '/src/index.css',
          type: 'file',
          language: 'css',
          updatedAt: Date.now(),
          content: `@import "tailwindcss";\n`,
        },
      ],
    },
    {
      id: 'web-package',
      name: 'package.json',
      path: '/package.json',
      type: 'file',
      language: 'json',
      updatedAt: Date.now(),
      content: `{\n  "name": "alex-rivera-portfolio",\n  "version": "2.0.0"\n}\n`,
    },
  ],
};

export const PYTHON_DATA_PROJECT: Project = {
  id: 'proj-python-analytics',
  name: 'DataSight',
  type: 'python',
  tags: ['Python', 'Data Science', 'CLI'],
  description: 'Statistical summary and tabular metrics processor in Python',
  rootPath: '~/Projects/DataSight',
  createdAt: Date.now() - 86400000 * 14,
  updatedAt: Date.now() - 3600000 * 12,
  lastOpenedAt: Date.now() - 3600000 * 12,
  activeFileId: 'py-main',
  rootFiles: [
    {
      id: 'py-main',
      name: 'main.py',
      path: '/main.py',
      type: 'file',
      language: 'python',
      updatedAt: Date.now(),
      content: `import math

def calculate_statistics(numbers):
    if not numbers:
        return {}
    
    n = len(numbers)
    mean = sum(numbers) / n
    variance = sum((x - mean) ** 2 for x in numbers) / n
    std_dev = math.sqrt(variance)
    
    return {
        "count": n,
        "mean": round(mean, 2),
        "variance": round(variance, 2),
        "std_dev": round(std_dev, 2),
        "min": min(numbers),
        "max": max(numbers)
    }

if __name__ == "__main__":
    sample_dataset = [12, 24, 35, 42, 51, 68, 77, 85, 99, 105]
    metrics = calculate_statistics(sample_dataset)
    print("=== DataSight Analytics Engine ===")
    for key, val in metrics.items():
        print(f"  {key.capitalize()}: {val}")
`,
    },
    {
      id: 'py-readme',
      name: 'README.md',
      path: '/README.md',
      type: 'file',
      language: 'markdown',
      updatedAt: Date.now(),
      content: `# DataSight CLI 📊\nLightweight Python statistics engine for matrix and vector calculations.\n`,
    },
  ],
};

export const DEFAULT_DEMO_PROJECT: Project = STUDYFLOW_PROJECT;

export const DEMO_PROJECTS: Project[] = [
  STUDYFLOW_PROJECT,
  MY_WEBSITE_PROJECT,
  PYTHON_DATA_PROJECT,
];

export function createTemplateProject(
  name: string,
  type: ProjectType = 'typescript',
  description?: string
): Project {
  const cleanName = name.trim() || 'Untitled Project';
  const id = `proj-${Date.now()}`;
  const path = `~/Projects/${cleanName}`;
  const now = Date.now();

  let rootFiles: FileNode[] = [];

  if (type === 'react' || type === 'typescript') {
    rootFiles = [
      {
        id: `folder-src-${now}`,
        name: 'src',
        path: '/src',
        type: 'folder',
        isExpanded: true,
        children: [
          {
            id: `file-app-${now}`,
            name: 'App.tsx',
            path: '/src/App.tsx',
            type: 'file',
            language: 'typescript',
            updatedAt: now,
            content: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8 text-center font-sans">
      <h1 className="text-2xl font-bold mb-2">${cleanName}</h1>
      <p className="text-sm opacity-70 mb-4">Crafted with macOS Code Studio</p>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="px-4 py-2 rounded-lg bg-[#007aff] text-white text-xs font-semibold"
      >
        Clicks: {count}
      </button>
    </div>
  );
}
`,
          },
          {
            id: `file-main-${now}`,
            name: 'main.tsx',
            path: '/src/main.tsx',
            type: 'file',
            language: 'typescript',
            updatedAt: now,
            content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(<App />);\n`,
          },
        ],
      },
      {
        id: `file-pkg-${now}`,
        name: 'package.json',
        path: '/package.json',
        type: 'file',
        language: 'json',
        updatedAt: now,
        content: `{\n  "name": "${cleanName.toLowerCase().replace(/\\s+/g, '-')}",\n  "version": "1.0.0",\n  "type": "module"\n}\n`,
      },
      {
        id: `file-readme-${now}`,
        name: 'README.md',
        path: '/README.md',
        type: 'file',
        language: 'markdown',
        updatedAt: now,
        content: `# ${cleanName}\n\n${description || 'A new project built on macOS Code Studio.'}\n`,
      },
    ];
  } else if (type === 'python') {
    rootFiles = [
      {
        id: `file-main-py-${now}`,
        name: 'main.py',
        path: '/main.py',
        type: 'file',
        language: 'python',
        updatedAt: now,
        content: `# ${cleanName}\n\ndef main():\n    print("Hello from ${cleanName}!")\n\nif __name__ == "__main__":\n    main()\n`,
      },
      {
        id: `file-readme-${now}`,
        name: 'README.md',
        path: '/README.md',
        type: 'file',
        language: 'markdown',
        updatedAt: now,
        content: `# ${cleanName}\n\nPython script environment.\n`,
      },
    ];
  } else {
    rootFiles = [
      {
        id: `file-index-ts-${now}`,
        name: 'index.ts',
        path: '/index.ts',
        type: 'file',
        language: 'typescript',
        updatedAt: now,
        content: `// ${cleanName}\nconsole.log("Ready in ${cleanName}");\n`,
      },
      {
        id: `file-readme-${now}`,
        name: 'README.md',
        path: '/README.md',
        type: 'file',
        language: 'markdown',
        updatedAt: now,
        content: `# ${cleanName}\n`,
      },
    ];
  }

  return {
    id,
    name: cleanName,
    type,
    tags: [type.toUpperCase()],
    description: description || 'New project workspace',
    rootPath: path,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    activeFileId: rootFiles[0]?.type === 'file' ? rootFiles[0].id : rootFiles[0]?.children?.[0]?.id,
    rootFiles,
    gitCommits: [
      {
        id: 'init-commit',
        message: 'Initial workspace commit',
        timestamp: now,
        filesCount: rootFiles.length,
        author: 'Developer <dev@macos.studio>',
      },
    ],
  };
}
