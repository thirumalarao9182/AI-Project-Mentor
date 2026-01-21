
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectFile, AnalysisReport, SecurityIssue, OptimizationSuggestion, ProgressUpdate, AnalysisStep } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getCodeSummary = (files: ProjectFile[]) => 
  files.map(f => `File: ${f.path}\nContent:\n${f.content.substring(0, 4000)}`).join('\n\n---\n\n');

/**
 * Deep Analysis Orchestrator
 * Runs 5 sequential steps, passing previous state to next step for contextual reasoning.
 */
export const runDeepAnalysis = async (
  files: ProjectFile[], 
  goal: string, 
  onProgress: (update: ProgressUpdate) => void
): Promise<AnalysisReport> => {
  const codeContext = getCodeSummary(files);

  const reportProgress = (step: AnalysisStep, message: string) => {
    onProgress({ step, message, timestamp: Date.now() });
  };

  try {
    // STEP 1: Project Understanding
    reportProgress('understanding', "Initializing Gemini 3 Pro reasoning core...");
    await new Promise(r => setTimeout(r, 500));
    reportProgress('understanding', "Scanning project structure and identifying tech stack...");
    
    const step1 = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        ACT AS: A Principal Software Architect.
        TASK: Perform a high-level scan of the provided codebase to establish context.
        USER GOAL: "${goal}"

        INSTRUCTIONS:
        1. Identify the primary programming languages, frameworks, and key libraries (techStack).
        2. Summarize the core business logic and primary purpose of this software (summary).
        3. Calculate an initial "Project Maturity/Consistency" score (0-100) based on standard engineering conventions seen in the code.

        OUTPUT FORMAT: JSON strictly matching the provided schema.
        
        CODEBASE:
        ${codeContext}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            scoreBase: { type: Type.NUMBER }
          },
          required: ["summary", "techStack", "scoreBase"]
        }
      }
    });
    const understanding = JSON.parse(step1.text || '{}');
    reportProgress('understanding', `Context mapped. Found ${understanding.techStack.length} major technologies.`);

    // STEP 2: Architecture Review
    reportProgress('architecture', "Evaluating structural integrity and design patterns...");
    const step2 = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        ACT AS: A Systems Design Consultant.
        CONTEXT: ${JSON.stringify(understanding)}
        USER GOAL: "${goal}"

        TASK: Evaluate the codebase's structural integrity.
        INSTRUCTIONS:
        1. Classify the architectural pattern (e.g., MVC, Hexagonal, Layered, Event-Driven, Micro-kernel).
        2. Analyze Strengths: List 3-4 specific ways this architecture supports the user's goal.
        3. Analyze Gaps: List 3-4 specific architectural bottlenecks or anti-patterns.

        OUTPUT FORMAT: JSON strictly matching the provided schema.

        CODEBASE:
        ${codeContext}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pattern: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["pattern", "pros", "cons"]
        }
      }
    });
    const architecture = JSON.parse(step2.text || '{}');
    reportProgress('architecture', `Identified ${architecture.pattern} architecture.`);

    // STEP 3: Resilience Audit
    reportProgress('improvements', "Initiating security audit and performance scan...");
    const step3 = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        ACT AS: A Senior Security & Site Reliability Engineer.
        ARCHITECTURE CONTEXT: ${JSON.stringify(architecture)}

        TASK: Perform a rigorous code audit for Resilience.
        INSTRUCTIONS:
        1. SECURITY: Identify vulnerabilities (OWASP focus).
        2. OPTIMIZATION: Identify performance leaks.

        OUTPUT FORMAT: JSON strictly matching the provided schema.

        CODEBASE:
        ${codeContext}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            security: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING, enum: ["low", "medium", "high", "critical"] },
                  description: { type: Type.STRING },
                  location: { type: Type.STRING },
                  fix: { type: Type.STRING }
                }
              }
            },
            optimization: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  impact: { type: Type.STRING, enum: ["low", "medium", "high"] },
                  category: { type: Type.STRING, enum: ["performance", "readability", "scalability"] },
                  description: { type: Type.STRING },
                  example: { type: Type.STRING }
                }
              }
            }
          },
          required: ["security", "optimization"]
        }
      }
    });
    const improvements = JSON.parse(step3.text || '{}');
    reportProgress('improvements', `Audit complete: ${improvements.security.length} security items found.`);

    // STEP 4: Documentation & Diagram
    reportProgress('documentation', "Generating system diagrams and technical README...");
    const step4 = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        ACT AS: A Technical Writer.
        TASK: Generate high-fidelity documentation and a Mermaid.js diagram.
        
        CODEBASE:
        ${codeContext}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readme: { type: Type.STRING },
            diagram: { type: Type.STRING }
          },
          required: ["readme", "diagram"]
        }
      }
    });
    const documentation = JSON.parse(step4.text || '{}');
    reportProgress('documentation', "System flow visualizer generated.");

    // STEP 5: Executive Pitch
    reportProgress('pitching', "Synthesizing project value proposition for stakeholders...");
    const step5 = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        ACT AS: A Startup Coach.
        GOAL: ${goal}
        TASK: Draft a high-impact pitch.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pitch: { type: Type.STRING }
          },
          required: ["pitch"]
        }
      }
    });
    const pitchData = JSON.parse(step5.text || '{}');
    reportProgress('pitching', "Pitch refined and ready.");

    return {
      summary: understanding.summary,
      score: understanding.scoreBase,
      techStack: understanding.techStack,
      architecture: architecture,
      securityIssues: improvements.security,
      optimizationSuggestions: improvements.optimization,
      readme: documentation.readme,
      diagram: documentation.diagram,
      pitch: pitchData.pitch
    };
  } catch (error: any) {
    reportProgress('error', `Analysis interrupted: ${error.message}`);
    throw error;
  }
};

export const createChat = (files: ProjectFile[]) => {
  const context = files.map(f => `Path: ${f.path}\nContent:\n${f.content}`).join('\n\n');
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are an expert Software Mentor. Context:\n${context}`,
    },
  });
};
