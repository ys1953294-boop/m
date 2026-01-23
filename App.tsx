import React, { useState } from 'react';
import { RepoSearch } from './components/RepoSearch';
import { FileTree } from './components/FileTree';
import { CodeViewer } from './components/CodeViewer';
import { RepoDetails, GitHubNode, FileContent } from './types';
import { fetchRepoDetails, fetchRepoContents, fetchFileContent } from './services/github';
import { BookOpen, GitFork, Star } from 'lucide-react';

const App: React.FC = () => {
  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null);
  const [rootNodes, setRootNodes] = useState<GitHubNode[]>([]);
  const [currentFile, setCurrentFile] = useState<FileContent | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (owner: string, repo: string) => {
    setIsLoading(true);
    setRepoDetails(null);
    setRootNodes([]);
    setCurrentFile(null);
    
    try {
      const details = await fetchRepoDetails(owner, repo);
      const contents = await fetchRepoContents(owner, repo);
      // Sort folders first