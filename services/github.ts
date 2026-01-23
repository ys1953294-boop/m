import { GITHUB_API_BASE } from '../constants';
import { GitHubNode, RepoDetails } from '../types';

export const fetchRepoDetails = async (owner: string, repo: string): Promise<RepoDetails> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);
  if (!response.ok) {
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }
  const data = await response.json();
  return {
    owner: data.owner.login,
    name: data.name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    default_branch: data.default_branch,
  };
};

export const fetchRepoContents = async (owner: string, repo: string, path: string = ''): Promise<GitHubNode[]> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch path: ${path}`);
  }
  const data = await response.json();
  // Ensure it's an array (it might be a single object if path points to a file, but our logic usually avoids this by checking type)
  return Array.isArray(data) ? data : [data];
};

export const fetchFileContent = async (downloadUrl: string): Promise<string> => {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error('Failed to download file content');
  }
  return await response.text();
};
