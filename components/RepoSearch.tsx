import React, { useState } from 'react';
import { Search, Github, Loader2 } from 'lucide-react';

interface RepoSearchProps {
  onSearch: (owner: string, repo: string) => Promise<void>;
  isLoading: boolean;
}

export const RepoSearch: React.FC<RepoSearchProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parts = input.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setError('Please use the format "owner/repo" (e.g., facebook/react)');
      return;
    }

    try {
      await onSearch(parts[0].trim(), parts[1].trim());
    } catch (err) {
      setError('Repository not found or API limit reached.');
    }
  };

  return (
    <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col gap-4">
      <div className="flex items-center gap-2 text-indigo-400 mb-2">
        <Github className="w-6 h-6" />
        <h1 className="text-xl font-bold tracking-tight text-white">GitGenie</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="owner/repo (e.g. facebook/react)"
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 text-sm font-mono"
            disabled={isLoading}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
               <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
            </div>
          )}
        </div>
      </form>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
};
