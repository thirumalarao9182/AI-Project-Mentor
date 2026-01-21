
export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  type: string;
}

export interface AnalysisReport {
  summary: string;
  score: number;
  architecture: {
    pattern: string;
    pros: string[];
    cons: string[];
  };
  securityIssues: SecurityIssue[];
  optimizationSuggestions: OptimizationSuggestion[];
  techStack: string[];
  readme: string;
  diagram: string; // Mermaid.js formatted string
  pitch: string;
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  fix: string;
}

export interface OptimizationSuggestion {
  impact: 'low' | 'medium' | 'high';
  category: 'performance' | 'readability' | 'scalability';
  description: string;
  example: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type AnalysisStep = 
  | 'idle' 
  | 'understanding' 
  | 'architecture' 
  | 'improvements' 
  | 'documentation' 
  | 'pitching' 
  | 'complete'
  | 'error';

export interface ProgressUpdate {
  step: AnalysisStep;
  message: string;
  timestamp: number;
}
