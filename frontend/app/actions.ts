"use server"

import { execFile } from "child_process";
import path from "path";

export async function generateJoke(topic: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Resolve absolute paths for Python and the runner script
    // process.cwd() is /d:/only coding/3rd year/langchainlearn/frontend
    const pythonPath = path.resolve(process.cwd(), "..", ".venv", "Scripts", "python.exe");
    const scriptPath = path.resolve(process.cwd(), "..", "run_notebook.py");
    
    execFile(pythonPath, [scriptPath, topic], (error, stdout, stderr) => {
      if (error) {
        console.error("Exec error:", stderr);
        // Fallback to error message
        reject(stderr.trim() || error.message);
        return;
      }
      resolve(stdout.trim());
    });
  });
}
