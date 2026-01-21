
/**
 * AI Project Mentor - Backend Implementation (Node.js/Express)
 * 
 * To run this in a real environment:
 * 1. npm install express multer adm-zip cors dotenv @google/genai
 * 2. node server.js
 */

import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const isTextFile = (filename: string) => {
  const textExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.md', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.cs', '.php', '.rb', '.yml', '.yaml', '.txt'];
  return textExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

const shouldIgnore = (filePath: string) => {
  const ignoredDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'out', 'vendor'];
  return ignoredDirs.some(dir => filePath.split(path.sep).includes(dir));
};

/**
 * Main Analysis Endpoint
 */
app.post('/api/analyze', upload.single('project'), async (req, res) => {
  const { goal } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No project file uploaded.' });
  }

  try {
    const zip = new AdmZip(file.path);
    const zipEntries = zip.getEntries();
    const projectFiles: any[] = [];

    zipEntries.forEach((entry) => {
      const entryPath = entry.entryName;
      if (!entry.isDirectory && isTextFile(entryPath) && !shouldIgnore(entryPath)) {
        projectFiles.push({
          path: entryPath,
          content: entry.getData().toString('utf8')
        });
      }
    });

    // Clean up uploaded zip
    fs.unlinkSync(file.path);

    // Call Gemini (Simulating the multi-step orchestration)
    // In a real production app, this would be a sequence of calls to ai.models.generateContent
    const context = projectFiles.map(f => `Path: ${f.path}\nContent:\n${f.content.substring(0, 3000)}`).join('\n\n');
    
    // 1. Structure Analysis
    // 2. Security Audit
    // 3. Optimization suggestions
    // ... orchestrate as seen in frontend service

    res.json({
      success: true,
      fileCount: projectFiles.length,
      message: "Context prepared successfully.",
      // In a real app, you'd return the final AnalysisReport here
    });

  } catch (error: any) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI Project Mentor Backend running on port ${PORT}`);
});
