
import React, { useState } from 'react';
import { AnalysisReport, SecurityIssue, OptimizationSuggestion } from '../types';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface AnalysisDashboardProps {
  report: AnalysisReport;
}

const SeverityBadge = ({ severity }: { severity: SecurityIssue['severity'] }) => {
  const styles = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wider ${styles[severity as keyof typeof styles]}`}>{severity}</span>;
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);
  const chartData = [{ name: 'Score', value: report.score, fill: '#2563eb' }];

  const copyReadme = () => {
    navigator.clipboard.writeText(report.readme);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Section: Health & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col justify-center">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Project Intent</h3>
            <p className="text-xl text-slate-700 leading-relaxed font-medium">
              {report.summary}
            </p>
            <div className="flex flex-wrap gap-2 mt-8">
              {report.techStack.map(tech => (
                <span key={tech} className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                  {tech}
                </span>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Structural Score</h3>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="80%" outerRadius="100%" data={chartData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={30} angleAxisId={0} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-5xl font-black text-slate-800 tracking-tighter">{report.score}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Consistency</span>
            </div>
          </div>
        </section>
      </div>

      {/* Pitch Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </div>
        <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4">Value Proposition</h3>
        <p className="text-2xl font-bold leading-snug max-w-4xl relative z-10">
          "{report.pitch}"
        </p>
      </section>

      {/* Mermaid Diagram Section */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">System Architecture Flow</h3>
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 overflow-x-auto flex justify-center">
           <pre className="text-slate-600 text-sm font-mono whitespace-pre text-center">
             {report.diagram}
           </pre>
        </div>
        <p className="mt-4 text-xs text-slate-400 text-center italic">Copy the code above into a Mermaid editor for a visual rendering of your system flow.</p>
      </section>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Pattern Analysis: {report.architecture.pattern}</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-green-600 uppercase tracking-widest">Strengths</h4>
                <ul className="space-y-2">
                  {report.architecture.pros.map((pro, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 bg-green-50/50 p-3 rounded-xl border border-green-100">
                      <span className="text-green-500 font-bold">✓</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest">Gaps</h4>
                <ul className="space-y-2">
                  {report.architecture.cons.map((con, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 bg-red-50/50 p-3 rounded-xl border border-red-100">
                      <span className="text-red-500 font-bold">!</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Resilience Audit</h3>
            <div className="space-y-4">
              {report.securityIssues.map((issue, i) => (
                <div key={i} className="p-4 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-white transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <SeverityBadge severity={issue.severity} />
                    <span className="text-[10px] text-slate-400 font-mono bg-white px-2 py-1 rounded border border-slate-100">{issue.location}</span>
                  </div>
                  <h5 className="font-bold text-slate-800 text-sm mb-2">{issue.description}</h5>
                  <div className="flex gap-2 items-center text-xs text-blue-600 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                    Fix: {issue.fix}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 pb-0 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Enterprise Documentation</h3>
              <button 
                onClick={copyReadme}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Markdown'}
              </button>
            </div>
            <div className="p-8">
              <div className="bg-slate-900 rounded-2xl p-6 h-[400px] overflow-y-auto">
                <pre className="code-font text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {report.readme}
                </pre>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Optimization Pipeline</h3>
            <div className="space-y-6">
              {report.optimizationSuggestions.map((opt, i) => (
                <div key={i} className="space-y-3 group">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${opt.impact === 'high' ? 'bg-red-500 shadow-lg shadow-red-200' : opt.impact === 'medium' ? 'bg-yellow-500 shadow-lg shadow-yellow-200' : 'bg-blue-500 shadow-lg shadow-blue-200'}`}></span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{opt.category} • {opt.impact} impact</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{opt.description}</p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 group-hover:border-blue-200 transition-colors">
                    <pre className="code-font text-xs text-slate-500 overflow-x-auto">
                      <code>{opt.example}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
