"use client";

import { useState } from "react";
import { generateJoke } from "./actions";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [joke, setJoke] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const presets = [
    "Programming",
    "Artificial Intelligence",
    "Coffee",
    "Office Life",
    "Cats and Dogs",
    "Quantum Physics"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setJoke(null);
    setCopied(false);

    try {
      const result = await generateJoke(topic.trim());
      setJoke(result);
    } catch (err: any) {
      console.error(err);
      setError(err || "Failed to generate joke. Please check if your GOOGLE_API_KEY is set in .env.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!joke) return;
    navigator.clipboard.writeText(joke);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            Basics.ipynb Pipeline
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-3 leading-tight">
            Jupyter Joke Agent
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-md mx-auto">
            Input a topic. We will run the Python code directly from your Jupyter Notebook to generate a custom joke from Gemini.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl blur opacity-30 group-focus-within:opacity-60 transition duration-300"></div>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic (e.g., software engineering, pizza...)"
                disabled={loading}
                className="w-full bg-zinc-950/80 border border-zinc-800 text-zinc-100 rounded-2xl py-4 px-5 pr-12 focus:outline-none focus:border-violet-500 transition-all placeholder-zinc-600 text-sm md:text-base"
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-violet-600 text-white hover:bg-violet-500 active:scale-95 transition-all disabled:opacity-50 disabled:hover:bg-violet-600 disabled:active:scale-100"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTopic(p)}
                disabled={loading}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  topic === p
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/50"
                    : "bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </form>

        {/* Status / Output Section */}
        <div className="mt-8 pt-8 border-t border-zinc-800/80 min-h-[140px] flex flex-col justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-3 py-6">
              <div className="flex space-x-1.5">
                <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2.5 h-2.5 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
              <p className="text-zinc-500 text-xs tracking-wider uppercase animate-pulse">Running basics.ipynb...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3">
              <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-semibold">Pipeline Error:</span> {error}
              </div>
            </div>
          )}

          {joke && (
            <div className="relative p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 group">
              <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all hover:bg-zinc-800 active:scale-95"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <svg className="h-4.5 w-4.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-zinc-200 text-base md:text-lg leading-relaxed whitespace-pre-wrap pr-8">
                {joke}
              </p>
            </div>
          )}

          {!loading && !joke && !error && (
            <div className="text-center py-6 text-zinc-600 text-sm">
              Ready to generate. The output will show here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
