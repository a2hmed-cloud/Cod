import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Search,
  Download,
  Link,
  Scissors,
  Clipboard,
  FolderOpen
} from 'lucide-react';
import { FileNode } from '../../types';
import { FileIcon } from '../Common/FileIcon';
import { downloadFileContent } from '../../services/storage';

interface FileExplorerProps {
  files: FileNode[];
  activeFileId: string | null;
  onSelectFile: (file: FileNode) => void;
  onCreateFile: (parentId: string | null, name: string) => void;
  onCreateFolder: (parentId: string | null, name: string) => void;
  onRenameNode: (id: string, newName: string) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  isLight: boolean;
  onSearchClick: () => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  node: FileNode;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  onDuplicateNode,
  isLight,
  onSearchClick,
}) => {
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
    new Set(['folder-src', 'folder-utils', 'folder-public'])
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [isCreatingInParent, setIsCreatingInParent] = useState<{
    parentId: string | null;
    type: 'file' | 'folder';
  } | null>(null);
  const [newItemName, setNewItemName] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    if (isCreatingInParent && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [isCreatingInParent]);

  // Close context menu on outside click
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const toggleFolder = (folderId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const startRenaming = (node: FileNode, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(node.id);
    setEditingName(node.name);
    setContextMenu(null);
  };

  const submitRename = () => {
    if (editingId && editingName.trim()) {
      onRenameNode(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const submitNewItem = () => {
    if (!isCreatingInParent || !newItemName.trim()) {
      setIsCreatingInParent(null);
      setNewItemName('');
      return;
    }

    if (isCreatingInParent.type === 'file') {
      onCreateFile(isCreatingInParent.parentId, newItemName.trim());
    } else {
      onCreateFolder(isCreatingInParent.parentId, newItemName.trim());
    }

    if (isCreatingInParent.parentId) {
      setExpandedFolderIds((prev) => new Set([...prev, isCreatingInParent.parentId!]));
    }

    setIsCreatingInParent(null);
    setNewItemName('');
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node,
    });
  };

  // Render tree item recursively
  const renderTree = (nodes: FileNode[], depth: number = 0) => {
    return nodes.map((node) => {
      const isFolder = node.type === 'folder';
      const isExpanded = expandedFolderIds.has(node.id);
      const isSelected = activeFileId === node.id;
      const isEditing = editingId === node.id;

      // Quick filter
      if (
        filterQuery &&
        !isFolder &&
        !node.name.toLowerCase().includes(filterQuery.toLowerCase())
      ) {
        return null;
      }

      return (
        <div key={node.id} className="select-none text-xs">
          <div
            id={`explorer-item-${node.id}`}
            onClick={(e) => {
              if (isFolder) {
                toggleFolder(node.id, e);
              } else {
                onSelectFile(node);
              }
            }}
            onContextMenu={(e) => handleContextMenu(e, node)}
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            className={`group relative flex items-center justify-between py-1.5 pr-2 rounded-md mx-1 cursor-pointer transition-all duration-100 ${
              isSelected
                ? isLight
                  ? 'bg-[#007aff]/15 text-[#007aff] font-medium'
                  : 'bg-[#007aff]/25 text-[#5dd8ff] font-medium'
                : isLight
                  ? 'hover:bg-black/5 text-[#1d1d1f]'
                  : 'hover:bg-white/5 text-[#d1d1d6]'
            }`}
          >
            <div className="flex items-center space-x-1.5 min-w-0 flex-1">
              {/* Disclosure triangle for folders */}
              {isFolder ? (
                <span
                  onClick={(e) => toggleFolder(node.id, e)}
                  className="w-3.5 h-3.5 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                >
                  {isExpanded ? (
                    <ChevronDown size={13} />
                  ) : (
                    <ChevronRight size={13} />
                  )}
                </span>
              ) : (
                <span className="w-3.5" />
              )}

              {/* Node Icon */}
              <FileIcon
                name={node.name}
                type={node.type}
                isOpen={isExpanded}
                size={14}
              />

              {/* Node Label or Inline Rename Input */}
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={submitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitRename();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className={`flex-1 min-w-0 px-1 py-0.5 rounded text-xs outline-none border ${
                    isLight
                      ? 'bg-white border-[#007aff] text-black shadow-xs'
                      : 'bg-[#181820] border-[#007aff] text-white shadow-xs'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate text-[12px]">{node.name}</span>
              )}
            </div>

            {/* Quick Action Button on Hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
              {isFolder && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreatingInParent({ parentId: node.id, type: 'file' });
                      setExpandedFolderIds((prev) => new Set([...prev, node.id]));
                    }}
                    title="New File inside"
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    <FilePlus size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreatingInParent({ parentId: node.id, type: 'folder' });
                      setExpandedFolderIds((prev) => new Set([...prev, node.id]));
                    }}
                    title="New Folder inside"
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    <FolderPlus size={12} />
                  </button>
                </>
              )}
              <button
                onClick={(e) => handleContextMenu(e, node)}
                title="Options"
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
              >
                <MoreVertical size={12} />
              </button>
            </div>
          </div>

          {/* Children and Inline creation form */}
          {isFolder && isExpanded && (
            <div>
              {/* Inline create input if parent matches */}
              {isCreatingInParent && isCreatingInParent.parentId === node.id && (
                <div
                  style={{ paddingLeft: `${(depth + 1) * 14 + 10}px` }}
                  className="flex items-center space-x-1.5 py-1 pr-2 mx-1"
                >
                  <span className="w-3.5" />
                  <FileIcon
                    name={isCreatingInParent.type === 'folder' ? 'folder' : newItemName || 'file.ts'}
                    type={isCreatingInParent.type}
                    size={14}
                  />
                  <input
                    ref={createInputRef}
                    type="text"
                    placeholder={`new ${isCreatingInParent.type}...`}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onBlur={submitNewItem}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitNewItem();
                      if (e.key === 'Escape') setIsCreatingInParent(null);
                    }}
                    className={`flex-1 min-w-0 px-1 py-0.5 rounded text-xs outline-none border ${
                      isLight
                        ? 'bg-white border-[#007aff] text-black'
                        : 'bg-[#181820] border-[#007aff] text-white'
                    }`}
                  />
                </div>
              )}

              {node.children && renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <aside
      id="sidebar-file-explorer"
      className={`h-full flex flex-col select-none transition-colors duration-200 border-r ${
        isLight
          ? 'bg-[#f0f0f3]/90 border-black/10 text-[#1d1d1f]'
          : 'bg-[#18181f]/90 border-white/10 text-[#f5f5f7]'
      }`}
    >
      {/* Sidebar Header with Action Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/5 dark:border-white/5">
        <span className="text-[11px] font-semibold uppercase tracking-wider opacity-60">
          Explorer
        </span>
        <div className="flex items-center space-x-1">
          <button
            id="btn-explorer-new-file"
            onClick={() => setIsCreatingInParent({ parentId: null, type: 'file' })}
            title="New File at Root"
            className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <FilePlus size={14} />
          </button>
          <button
            id="btn-explorer-new-folder"
            onClick={() => setIsCreatingInParent({ parentId: null, type: 'folder' })}
            title="New Folder at Root"
            className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <FolderPlus size={14} />
          </button>
          <button
            id="btn-explorer-search"
            onClick={onSearchClick}
            title="Search Files (⌘F)"
            className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <Search size={14} />
          </button>
        </div>
      </div>

      {/* Filter / Quick file search box */}
      <div className="px-2 py-1.5 border-b border-black/5 dark:border-white/5">
        <input
          type="text"
          placeholder="Filter files..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className={`w-full px-2 py-1 text-xs rounded-md border outline-none transition-all ${
            isLight
              ? 'bg-white/80 border-black/10 focus:border-[#007aff] text-black placeholder:text-black/40'
              : 'bg-white/5 border-white/10 focus:border-[#007aff] text-white placeholder:text-white/40'
          }`}
        />
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto py-1.5 space-y-0.5">
        {/* Root Level Creation Input */}
        {isCreatingInParent && isCreatingInParent.parentId === null && (
          <div className="flex items-center space-x-1.5 py-1 px-3 mx-1">
            <FileIcon
              name={isCreatingInParent.type === 'folder' ? 'folder' : newItemName || 'file.ts'}
              type={isCreatingInParent.type}
              size={14}
            />
            <input
              ref={createInputRef}
              type="text"
              placeholder={`new root ${isCreatingInParent.type}...`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={submitNewItem}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitNewItem();
                if (e.key === 'Escape') setIsCreatingInParent(null);
              }}
              className={`flex-1 min-w-0 px-1 py-0.5 rounded text-xs outline-none border ${
                isLight
                  ? 'bg-white border-[#007aff] text-black'
                  : 'bg-[#181820] border-[#007aff] text-white'
              }`}
            />
          </div>
        )}

        {renderTree(files)}
      </div>

      {/* Context Menu Popup (macOS style) */}
      {contextMenu && (
        <div
          id="explorer-context-menu"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className={`fixed z-50 w-48 rounded-lg p-1 border shadow-2xl ${
            isLight
              ? 'bg-white/95 border-black/10 text-neutral-800 shadow-black/20'
              : 'bg-[#22222a]/95 border-white/10 text-neutral-200 shadow-black/70'
          } backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-75`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">
            {contextMenu.node.name}
          </div>

          <button
            onClick={() => {
              if (contextMenu.node.type === 'file') {
                onSelectFile(contextMenu.node);
              } else {
                toggleFolder(contextMenu.node.id);
              }
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-[#007aff] hover:text-white flex items-center space-x-2"
          >
            <span>Open</span>
          </button>

          <button
            onClick={(e) => startRenaming(contextMenu.node, e)}
            className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-[#007aff] hover:text-white flex items-center space-x-2"
          >
            <Edit2 size={12} />
            <span>Rename</span>
          </button>

          <button
            onClick={() => {
              onDuplicateNode(contextMenu.node.id);
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-[#007aff] hover:text-white flex items-center space-x-2"
          >
            <Copy size={12} />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.node.path);
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-[#007aff] hover:text-white flex items-center space-x-2"
          >
            <Link size={12} />
            <span>Copy Path</span>
          </button>

          {contextMenu.node.type === 'file' && (
            <button
              onClick={() => {
                downloadFileContent(contextMenu.node.name, contextMenu.node.content || '');
                setContextMenu(null);
              }}
              className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-[#007aff] hover:text-white flex items-center space-x-2"
            >
              <Download size={12} />
              <span>Download File</span>
            </button>
          )}

          <div className={`h-[1px] my-1 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

          <button
            onClick={() => {
              const confirmDelete = window.confirm(`Delete "${contextMenu.node.name}"?`);
              if (confirmDelete) {
                onDeleteNode(contextMenu.node.id);
              }
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1.5 rounded-md text-xs text-red-400 hover:bg-red-500 hover:text-white flex items-center space-x-2"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </aside>
  );
};
