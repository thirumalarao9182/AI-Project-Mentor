
import React, { useRef, useState } from 'react';
import { ProjectFile } from '../types';
import JSZip from 'jszip';
import { SAMPLE_FILES, SAMPLE_PROJECT_GOAL } from '../sampleProject';

interface ProjectUploaderProps {
  onFilesLoaded: (files: ProjectFile[], goal: string) => void;
  isLoading: boolean;
}

const ProjectUploader: React.FC<ProjectUploaderProps> = ({ onFilesLoaded, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const [goal, setGoal] = useState('');
  const [extracting, setExtracting] = useState(false);

  const isTextFile = (filename: string) => {
    const textExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.md', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.cs', '.php', '.rb', '.yml', '.yaml', '.txt', '.env'];
    return textExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const shouldIgnore = (path: string) => {
    const ignoredDirs = ['node_modules/', '.git/', 'dist/', 'build/', '.next/', 'out/', 'vendor/'];
    return ignoredDirs.some(dir => path.includes(dir));
  };

  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const loadedFiles: ProjectFile[] = [];

      const promises: Promise<void>[] = [];
      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir && isTextFile(relativePath) && !shouldIgnore(relativePath)) {
          promises.push((async () => {
            const content = await zipEntry.async('string');
            loadedFiles.push({
              name: zipEntry.name.split('/').pop() || '',
              path: relativePath,
              content: content,
              type: 'text/plain'
            });
          })());
        }
      });

      await Promise.all(promises);
      onFilesLoaded(loadedFiles, goal || "Analyze this ZIP project for architecture and best practices.");
    } catch (err) {
      console.error("ZIP processing failed", err);
      alert("Failed to process ZIP file. Please ensure it's a valid archive.");
    } finally {
      setExtracting(false);
    }
  };

  const handleFolderChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const loadedFiles: ProjectFile[] = [];
    const fileList = Array.from(files) as File[];

    for (const file of fileList) {
      const path = (file as any).webkitRelativePath || file.name;
      if (isTextFile(path) && !shouldIgnore(path)) {
        const content = await file.text();
        loadedFiles.push({
          name: file.name,
          path: path,
          content: content,
          type: file.type || 'text/plain'
        });
      }
    }

    onFilesLoaded(loadedFiles, goal || "Analyze this folder for best practices and architecture.");
  };

  const loadDemoProject = () => {
    onFilesLoaded(SAMPLE_FILES, SAMPLE_PROJECT_GOAL);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Quick Start Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-1 rounded-3xl shadow-xl shadow-blue-500/10">
        <div className="bg-card p-8 rounded-[22px] flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-300">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-black text-text-primary tracking-tight">Judging Quick Start</h3>
            <p className="text-text-secondary text-sm font-medium">No files handy? Run our architect audit on a sample project with intentional design flaws.</p>
          </div>
          <button 
            onClick={loadDemoProject}
            className="whitespace-nowrap px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
          >
            Try Demo Project
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <div className="bg-card p-8 rounded-3xl shadow-sm border border-border-main transition-colors duration-300">
        <label className="block text-sm font-black text-text-secondary uppercase tracking-[0.2em] mb-4">
          1. Target Outcome
        </label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What are you trying to achieve? (e.g. 'Optimize for high traffic', 'Fix potential security leaks', 'Modernize architecture')"
          className="w-full h-24 p-4 bg-muted-bg border border-border-main rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none mb-8 font-medium text-text-primary placeholder:text-text-secondary/50 shadow-inner"
        />

        <label className="block text-sm font-black text-text-secondary uppercase tracking-[0.2em] mb-4">
          2. Code Ingestion
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ZIP Upload Card */}
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-main rounded-2xl bg-muted-bg hover:bg-card hover:border-indigo-400 transition-all group cursor-pointer relative" onClick={() => zipInputRef.current?.click()}>
            <input type="file" ref={zipInputRef} onChange={handleZipUpload} accept=".zip" className="hidden" />
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            </div>
            <h4 className="font-bold text-text-primary text-center">Upload ZIP</h4>
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">Single archive</p>
          </div>

          {/* Folder Upload Card */}
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-main rounded-2xl bg-muted-bg hover:bg-card hover:border-blue-400 transition-all group cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} onChange={handleFolderChange} multiple webkitdirectory="" directory="" className="hidden" />
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h4 className="font-bold text-text-primary text-center">Upload Folder</h4>
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">Recursive scan</p>
          </div>
        </div>

        {(isLoading || extracting) && (
          <div className="mt-8 p-4 bg-blue-500/10 rounded-2xl flex items-center gap-4 animate-pulse border border-blue-500/20">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
              {extracting ? "Extracting ZIP contents..." : "Orchestrating Gemini analysis..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectUploader;
