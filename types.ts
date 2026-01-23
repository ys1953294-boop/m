export interface GitHubNode {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface RepoDetails {
  owner: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  default_branch: string;
}

export interface FileContent {
  name: string;
  path: string;
  content: string; // Decoded content
  language: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AnalysisResult {
  summary: string;
  suggestions: string[];
  complexity: string;
}
