
import React, { useState, useEffect, useRef } from 'react';
import { ProjectFile, AnalysisReport, AnalysisStep, ProgressUpdate } from './types';
import { runDeepAnalysis } from './services/geminiService';
import ProjectUploader from './components/ProjectUploader';
import AnalysisDashboard from './components/AnalysisDashboard';
import MentorChat from './components/MentorChat';

const App: React.FC = () => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('idle');
  const [activeTab, setActiveTab] = useState<'analysis' | 'chat'>('analysis');
  const [logs, setLogs] = useState<ProgressUpdate[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleFilesLoaded = async (loadedFiles: ProjectFile[], goal: string) => {
    setFiles(loadedFiles);
    setReport(null);
    setLogs([]);
    
    try {
      const finalReport = await runDeepAnalysis(
        loadedFiles, 
        goal, 
        (update) => {
          setCurrentStep(update.step);
          setLogs(prev => [...prev, update]);
        }
      );
      
      setReport(finalReport);
      setCurrentStep('complete');
    } catch (err: any) {
      console.error("Deep analysis failed", err);
      setCurrentStep('error');
    }
  };

  const resetProject = () => {
    setFiles([]);
    setReport(null);
    setCurrentStep('idle');
    setLogs([]);
    setActiveTab('analysis');
  };

  const getProgressPercentage = () => {
    switch(currentStep) {
      case 'understanding': return 15;
      case 'architecture': return 35;
      case 'improvements': return 55;
      case 'documentation': return 75;
      case 'pitching': return 90;
      case 'complete': return 100;
      case 'error': return 0;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-12 transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border-main px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetProject}>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-text-primary tracking-tight">AI Project Mentor</h1>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Architectural Orchestrator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {files.length > 0 && currentStep === 'complete' && (
              <div className="flex bg-muted-bg p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'analysis' ? 'bg-card text-blue-600 shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  ANALYSIS
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'chat' ? 'bg-card text-blue-600 shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  MENTOR CHAT
                </button>
              </div>
            )}
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-muted-bg text-text-secondary hover:text-text-primary transition-all"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>

            {files.length > 0 && currentStep === 'complete' && (
              <button onClick={resetProject} className="text-xs font-bold text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors">RESET</button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {currentStep === 'idle' ? (
          <div className="mt-12">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
              <span className="px-4 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block border border-blue-500/20">Deep Reasoning Engine</span>
              <h2 className="text-5xl font-black text-text-primary mb-6 tracking-tighter leading-tight">Project Intelligence<br/>Through Chain of Thought.</h2>
              <p className="text-text-secondary text-xl max-w-2xl mx-auto font-medium">
                Gemini 3 Pro analyzes your code across 5 specialized phases to ensure structural integrity and production readiness.
              </p>
            </div>
            <ProjectUploader onFilesLoaded={handleFilesLoaded} isLoading={false} />
          </div>
        ) : currentStep === 'error' ? (
          <div className="max-w-xl mx-auto py-32 text-center space-y-8 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-500/10 text-red-600 rounded-3xl mx-auto flex items-center justify-center border border-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>
              <h3 className="text-2xl font-black text-text-primary mb-2">Analysis Interrupted</h3>
              <p className="text-text-secondary">Something went wrong during the analysis phase. This is often due to context length limits or API rate limits.</p>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 text-left font-mono text-xs text-red-400 overflow-x-auto max-h-40">
              {logs[logs.length-1]?.message}
            </div>
            <button onClick={resetProject} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
              Try Again
            </button>
          </div>
        ) : currentStep === 'complete' ? (
          <div className="transition-all duration-1000 animate-in fade-in slide-in-from-bottom-8">
            {activeTab === 'analysis' && report ? (
              <AnalysisDashboard report={report} />
            ) : (
              <MentorChat files={files} />
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12 py-12">
            {/* Main Progress Circle */}
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="75" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted-bg" />
                  <circle cx="80" cy="80" r="75" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={471} strokeDashoffset={471 - (471 * getProgressPercentage()) / 100} className="text-blue-600 transition-all duration-700 ease-in-out" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-black text-text-primary leading-none">{getProgressPercentage()}%</span>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Processing</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-text-primary tracking-tight">Orchestrating Gemini 3 Pro</h3>
                <p className="text-text-secondary font-medium">Phase {['understanding', 'architecture', 'improvements', 'documentation', 'pitching'].indexOf(currentStep) + 1} of 5</p>
              </div>
            </div>

            {/* Live Log Console */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
              <div className="bg-slate-800 px-6 py-3 border-b border-slate-700 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500/50 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500/50 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500/50 rounded-full"></div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orchestration Console</span>
              </div>
              <div className="p-8 h-80 overflow-y-auto space-y-3 font-mono text-sm">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-slate-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                    <span className={`font-bold ${log.step === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
                      {log.step.toUpperCase()}
                    </span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>

            {/* Step Breadcrumbs */}
            <div className="flex gap-4 px-4">
              {['understanding', 'architecture', 'improvements', 'documentation', 'pitching'].map((s, i) => {
                const isActive = currentStep === s;
                const isDone = getProgressPercentage() > (i * 20) + 10;
                return (
                  <div key={s} className="flex-1 space-y-3">
                    <div className={`h-1.5 rounded-full transition-all duration-700 ${isDone ? 'bg-blue-600' : isActive ? 'bg-blue-400 animate-pulse' : 'bg-muted-bg'}`}></div>
                    <p className={`text-[10px] font-black uppercase text-center tracking-widest truncate ${isDone || isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {s.substring(0, 4)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
