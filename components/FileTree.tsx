import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen } from 'lucide-react';
import { GitHubNode } from '../types';
import { fetchRepoContents } from '../services/github';

interface FileTreeItemProps {
  node: GitHubNode;
  owner: string;
  repo: string;
  depth?: number;
  onSelectFile: (node: GitHubNode) => void;
  selectedPath: string | null;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, owner, repo, depth = 0, onSelectFile, selectedPath }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<GitHubNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const isSelected = node.path === selectedPath;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'dir') {
      if (!isOpen && !hasLoaded) {
        setIsLoading(true);
        try {
          const data = await fetchRepoContents(owner, repo, node.path);
          // Sort folders first
          const sorted = data.sort((a, b) => (a.type === b.type ? 0 : a.type === 'dir' ? -1 : 1));
          setChildren(sorted);
          setHasLoaded(true);
        } catch (error) {
          console.error("Failed to load folder", error);
        } finally {
          setIsLoading(false);
        }
      }
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node);
    }
  };

  return (
    <div>
      <div
        onClick={handleToggle}
        className={`
          flex items-center gap-1 py-1 px-2 cursor-pointer select-none text-sm transition-colors
          ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-slate-800 text-slate-400'}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <span className="opacity-70">
          {node.type === 'dir' ? (
            isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          ) : (
            <span className="w-3" /> 
          )}
        </span>
        
        <span className={`${node.type === 'dir' ? 'text-blue-400' : 'text-slate-300'}`}>
          {node.type === 'dir' ? (
            isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
          ) : (
            <FileCode className="w-4 h-4" />
          )}
        </span>
        
        <span className="truncate">{node.name}</span>
        {isLoading && <span className="text-xs text-slate-600 ml-2">...</span>}
      </div>

      {isOpen && (
        <div>
          {children.map((child) => (
            <FileTreeItem
              key={child.sha}
              node={child}
              owner={owner}
              repo={repo}
              depth={depth + 1}
              onSelectFile={onSelectFile}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FileTreeProps {
  nodes: GitHubNode[];
  owner: string;
  repo: string;
  onSelectFile: (node: GitHubNode) => void;
  selectedPath: string | null;
}

export const FileTree: React.FC<FileTreeProps> = ({ nodes, owner, repo, onSelectFile, selectedPath }) => {
  return (
    <div className="overflow-y-auto h-full pb-4">
      {nodes.map((node) => (
        <FileTreeItem
          key={node.sha}
          node={node}
          owner={owner}
          repo={repo}
          onSelectFile={onSelectFile}
          selectedPath={selectedPath}
        />
      ))}
    </div>
  );
};
