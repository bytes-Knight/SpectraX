import { useState, useEffect, useRef } from "react";
import { StartScan, SelectFile } from "../wailsjs/go/main/App";
import { EventsOn } from "../wailsjs/runtime/runtime";
import { 
  Shield, 
  Upload, 
  Play, 
  Loader2,
  Globe,
  Database,
  Search,
  Download,
  FileText,
  Trash2,
  Filter,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

interface ScanResult {
  url: string;
  parameter: string;
  found_in: string;
  char_analysis: Record<string, string>;
}

function App() {
  const [urls, setUrls] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, url: "" });
  const [results, setResults] = useState<ScanResult[]>([]);
  const [fileContent, setFileContent] = useState("");
  const [filterDuplicates, setFilterDuplicates] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const offProgress = EventsOn("scan-progress", (current: number, total: number, url: string) => {
      setProgress({ current, total, url });
    });

    const offResult = EventsOn("scan-result", (result: ScanResult) => {
      setResults((prev) => [result, ...prev]);
    });

    return () => {
      offProgress();
      offResult();
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(e.target.value);
    processUrls(e.target.value);
  };

  const processUrls = (content: string) => {
    const lines = content.split("\n").map(l => l.trim()).filter(l => l !== "");
    setUrls(lines);
  };

  const handleFileUpload = async () => {
    try {
      const content = await SelectFile();
      if (content) {
        setFileContent(content);
        processUrls(content);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startScan = async () => {
    if (urls.length === 0) return;
    setScanning(true);
    setResults([]);
    try {
      await StartScan(urls, filterDuplicates);
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const clearInput = () => {
    setFileContent("");
    setUrls([]);
  };

  const exportResults = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SpectraX-report.json";
    a.click();
  };

  return (
    <div className="h-screen bg-[#010103] text-white p-6 flex flex-col relative overflow-hidden selection:bg-cyan-500/30 font-sans">
      <div className="scanline" />
      
      {/* Header */}
      <header className="max-w-[95%] w-full mx-auto flex items-center justify-between mb-6 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl border border-cyan-400/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter font-cyber neon-glow-blue uppercase">
              Spectra<span className="text-cyan-400">X</span>
              <span className="ml-2 text-xs font-mono-tech text-cyan-500/40">v2.1</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-3">
          {results.length > 0 && (
            <button 
              onClick={exportResults}
              className="flex items-center gap-2 px-4 py-1.5 bg-black/40 hover:bg-cyan-500/10 rounded-lg transition-all border border-cyan-500/20 text-cyan-400 text-xs font-cyber tracking-widest"
            >
              <Download className="w-3 h-3" /> EXPORT_REPORTS
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[95%] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow overflow-hidden z-10">
        {/* Input Panel */}
        <div className="lg:col-span-4 flex flex-col h-full gap-4">
          <div className="glass rounded-3xl p-6 space-y-4 flex flex-col flex-grow relative overflow-hidden">
            <div className="flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 text-cyan-400">
                <Zap className="w-4 h-4 fill-cyan-400" />
                <h2 className="font-cyber text-xs tracking-widest uppercase">Input_Stream</h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleFileUpload} 
                  className="p-1.5 hover:bg-cyan-500/10 rounded-lg text-cyan-500 border border-cyan-500/20" 
                  title="Upload .txt File"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button onClick={clearInput} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 border border-red-500/20" title="Clear">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm font-mono-tech focus:outline-none focus:border-cyan-500/30 transition-all placeholder:text-gray-800 flex-grow resize-none custom-scrollbar"
              placeholder="// LOAD TARGETS..."
              value={fileContent}
              onChange={handleTextChange}
              disabled={scanning}
            />

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-cyan-500" />
                <span className="text-[11px] font-cyber text-cyan-400 tracking-widest uppercase">URO_DEDUP</span>
              </div>
              <button 
                onClick={() => setFilterDuplicates(!filterDuplicates)}
                className={`w-8 h-4 rounded-full transition-all relative ${filterDuplicates ? 'bg-cyan-600' : 'bg-gray-800'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${filterDuplicates ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>

            <button
              onClick={startScan}
              disabled={scanning || urls.length === 0}
              className={`w-full py-4 rounded-xl font-cyber tracking-widest flex items-center justify-center gap-2 transition-all flex-shrink-0 uppercase text-xs ${
                scanning 
                ? "bg-gray-900 text-gray-700 border border-white/5" 
                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg active:scale-[0.98] border border-cyan-400/20"
              }`}
            >
              {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {scanning ? "Processing..." : "Run Scanner"}
            </button>
          </div>

          <AnimatePresence>
            {scanning && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass rounded-2xl p-4 space-y-3 flex-shrink-0"
              >
                <div className="flex justify-between items-center text-[11px] font-cyber text-cyan-500/60 uppercase tracking-widest">
                  <span>Progress_Matrix</span>
                  <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-cyan-500" initial={{ width: 0 }} animate={{ width: `${(progress.current / progress.total) * 100}%` }} />
                </div>
                <div className="text-[10px] font-mono-tech text-cyan-500/30 truncate">{progress.url}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-4 flex-shrink-0 px-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-500" />
              <h2 className="font-cyber text-xs tracking-widest text-purple-400 uppercase">Detection_Feed</h2>
            </div>
            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[11px] font-cyber rounded-full border border-purple-500/20 uppercase tracking-widest">
              {results.length} Found
            </span>
          </div>

          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-10">
            <AnimatePresence initial={false}>
              {results.length === 0 && !scanning && (
                <div className="h-full flex flex-col items-center justify-center text-gray-800 glass rounded-[2rem] border-dashed">
                  <Search className="w-12 h-12 mb-4 opacity-10" />
                  <p className="font-cyber tracking-widest text-[11px] uppercase opacity-40">Awaiting_Scan_Init</p>
                </div>
              )}
              {results.map((result, i) => (
                <motion.div
                  key={result.url + i}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-2xl p-4 border-l-2 border-l-cyan-500 group transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono-tech rounded">P:{result.parameter}</span>
                        <span className="text-xs font-cyber text-white/80 tracking-widest uppercase">{result.found_in}_REFLECTION</span>
                      </div>
                      <div className="text-[11px] font-mono-tech text-gray-500 break-all cursor-pointer hover:text-white transition-colors" onClick={() => window.open(result.url)}>
                        {result.url}
                      </div>
                    </div>
                  </div>

                  {/* CHARACTER GRID - COMPACT MODE */}
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(result.char_analysis).map(([char, status]) => (
                      <div 
                        key={char} 
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono-tech border transition-all ${
                          status === "Allowed" ? "char-card-allowed" : status === "Converted" ? "char-card-converted" : "char-card-blocked"
                        }`}
                        title={`${char}: ${status}`}
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
