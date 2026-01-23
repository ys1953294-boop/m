import React, { useState, useEffect } from 'react';
import { FileContent, AnalysisResult, AnalysisStatus } from '../types';
import { EXTENSION_TO_LANG } from '../constants';
import { analyzeCode } from '../services/gemini';
import { BrainCircuit, Check, Copy, AlertTriangle, Sparkles, X } from 'lucide-react';

interface CodeViewerProps {
  file: FileContent | null;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setAnalysis(null);
    setStatus(AnalysisStatus.IDLE);
  }, [file]);

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus(AnalysisStatus.LOADING);
    try {
      const result = await analyzeCode(file.content, file.name);
      setAnalysis(result);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (e) {
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleCopy = () => {
    if (file) {
      navigator.clipboard.writeText(file.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/50">
        <Sparkles className="w-16 h-16 mb-4 opacity-20" />
        <p>Select a file to view content</p>
      </div>
    );
  }

  const lang = EXTENSION_TO_LANG[file.language] || 'Plain Text';

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono text-sm">{file.path}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs border border-slate-700">
            {lang}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Copy code"
          >
            {copySuccess ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleAnalyze}
            disabled={status === AnalysisStatus.LOADING || status === AnalysisStatus.COMPLETE}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${status === AnalysisStatus.COMPLETE 
                ? 'bg-green-500/10 text-green-400 border border-green-500/50' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {status === AnalysisStatus.LOADING ? (
              <span className="animate-pulse">Analyzing...</span>
            ) : status === AnalysisStatus.COMPLETE ? (
              <>
                <Check className="w-4 h-4" /> Analysis Ready
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" /> Analyze with Gemini
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area: Split View if Analyzed */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Code View */}
        <div className={`flex-1 overflow-auto custom-scrollbar relative bg-[#0d1117] ${analysis ? 'lg:border-r border-slate-800' : ''}`}>
           <pre className="p-4 text-sm font-mono leading-relaxed text-slate-300 tab-4">
            <code>{file.content}</code>
           </pre>
        </div>

        {/* Analysis Panel */}
        {analysis && (
          <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 border-slate-800 overflow-y-auto flex flex-col shrink-0 transition-all duration-300 ease-in-out">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Gemini Insights
                </h3>
                <button 
                  onClick={() => { setAnalysis(null); setStatus(AnalysisStatus.IDLE); }}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Summary</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                   <div className="flex-1 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-1">Complexity</h4>
                      <span className={`text-sm font-medium ${
                        analysis.complexity.includes('High') ? 'text-red-400' : 
                        analysis.complexity.includes('Medium') ? 'text-amber-400' : 'text-green-400'
                      }`}>
                        {analysis.complexity}
                      </span>
                   </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-slate-400 bg-slate-800/30 p-3 rounded-lg border-l-2 border-indigo-500 flex gap-3">
                         <span className="text-indigo-500 font-mono text-xs mt-0.5">{idx + 1}</span>
                         <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
