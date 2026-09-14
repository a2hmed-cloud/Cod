import React from 'react';
import {
  FileCode,
  FileText,
  FileType as FileTypeIcon,
  Folder,
  FolderOpen,
  FileJson,
  FileSpreadsheet,
  Code2,
  Terminal,
  Globe,
  File,
  Image,
  Package,
  Settings,
  Database,
  Layers
} from 'lucide-react';

interface FileIconProps {
  name: string;
  type?: 'file' | 'folder';
  isOpen?: boolean;
  className?: string;
  size?: number;
}

export const FileIcon: React.FC<FileIconProps> = ({
  name,
  type = 'file',
  isOpen = false,
  className = '',
  size = 14,
}) => {
  if (type === 'folder') {
    if (isOpen) {
      return <FolderOpen size={size} className={`text-[#6bb5ff] shrink-0 ${className}`} />;
    }
    return <Folder size={size} className={`text-[#5da8ff] shrink-0 ${className}`} />;
  }

  // Exact file matches
  const lowerName = name.toLowerCase();
  if (lowerName === 'package.json') {
    return <Package size={size} className={`text-[#ea2027] shrink-0 ${className}`} />;
  }
  if (lowerName.includes('tsconfig') || lowerName.includes('vite.config') || lowerName.includes('webpack')) {
    return <Settings size={size} className={`text-[#3178c6] shrink-0 ${className}`} />;
  }
  if (lowerName.startsWith('.git') || lowerName === '.gitignore') {
    return <Layers size={size} className={`text-[#f05032] shrink-0 ${className}`} />;
  }

  const ext = name.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'tsx':
      return <Code2 size={size} className={`text-[#5dd8ff] shrink-0 ${className}`} />;
    case 'jsx':
      return <Code2 size={size} className={`text-[#ffd15d] shrink-0 ${className}`} />;
    case 'ts':
      return <FileCode size={size} className={`text-[#3178c6] shrink-0 ${className}`} />;
    case 'js':
    case 'mjs':
    case 'cjs':
      return <FileCode size={size} className={`text-[#f7df1e] shrink-0 ${className}`} />;
    case 'css':
    case 'scss':
    case 'less':
      return <FileTypeIcon size={size} className={`text-[#42a5f5] shrink-0 ${className}`} />;
    case 'html':
    case 'htm':
      return <Globe size={size} className={`text-[#e44d26] shrink-0 ${className}`} />;
    case 'json':
      return <FileJson size={size} className={`text-[#cbcb41] shrink-0 ${className}`} />;
    case 'md':
    case 'markdown':
      return <FileText size={size} className={`text-[#42b883] shrink-0 ${className}`} />;
    case 'py':
      return <FileCode size={size} className={`text-[#3776ab] shrink-0 ${className}`} />;
    case 'java':
      return <FileCode size={size} className={`text-[#e76f51] shrink-0 ${className}`} />;
    case 'kt':
    case 'kts':
      return <FileCode size={size} className={`text-[#7f52ff] shrink-0 ${className}`} />;
    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
      return <FileCode size={size} className={`text-[#00599c] shrink-0 ${className}`} />;
    case 'sh':
    case 'bash':
    case 'zsh':
      return <Terminal size={size} className={`text-[#27c93f] shrink-0 ${className}`} />;
    case 'sql':
      return <Database size={size} className={`text-[#e38c00] shrink-0 ${className}`} />;
    case 'svg':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'ico':
      return <Image size={size} className={`text-[#bf5af2] shrink-0 ${className}`} />;
    case 'yaml':
    case 'yml':
      return <FileText size={size} className={`text-[#cb3837] shrink-0 ${className}`} />;
    default:
      return <File size={size} className={`text-[#a1a1a6] shrink-0 ${className}`} />;
  }
};
