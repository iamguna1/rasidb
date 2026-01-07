
import React, { useState, useMemo, useEffect } from 'react';
import { FileText, Search, Loader2, Scale, RotateCcw, ShieldCheck, Zap, AlertCircle, Globe } from 'lucide-react';
import FileUploader from './components/FileUploader';
import ExtractionResults from './components/ExtractionResults';
import { extractDataFromDocs } from './services/geminiService';
import { FileData, ExtractionResult } from './types';

const PROCESSING_STAGES = [
  "Initializing Secure Connection...",
  "Scanning Uploaded Documents...",
  "Applying Legal OCR Filters...",
  "Identifying Financial Entities...",
  "Mapping Field Logic...",
  "Finalizing Legal Review..."
];

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      interval = setInterval(() => {
        setLoadingStage(prev => (prev + 1) % PROCESSING_STAGES.length);
      }, 3500);
    } else {
      setLoadingStage(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const templateFile = useMemo(() => {
    return files.find(f => f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') || null;
  }, [files]);

  const sourceFiles = useMemo(() => {
    return files.filter(f => f.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }, [files]);

  const handleStartExtraction = async () => {
    if (sourceFiles.length === 0) {
      setError("Please upload at least one PDF or image document for extraction.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    try {
      const data = await extractDataFromDocs(sourceFiles);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during extraction.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSession = () => {
    if (confirm("Are you sure you want to clear all data and files? This cannot be undone.")) {
      setFiles([]);
      setResult(null);
      setError(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 selection:bg-indigo-100">
      <header className="mb-10 sm:mb-16 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl mb-6 shadow-2xl shadow-indigo-200">
          <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">v1.2.0 Stable</span>
          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" /> Secure
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Legal Data Intelligence</h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto font-medium px-4">
          Automated extraction for high-stakes recovery documents. 
          Bridge the gap between physical paper and digital data in seconds.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
        <div className="lg:col-span-4 space-y-6">
          <FileUploader files={files} setFiles={setFiles} />
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartExtraction}
              disabled={sourceFiles.length === 0 || isProcessing}
              className={`w-full py-5 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-3 shadow-xl tracking-tight text-lg ${
                sourceFiles.length === 0 || isProcessing
                  ? 'bg-slate-200 cursor-not-allowed text-slate-400'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200 hover:shadow-indigo-300'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 fill-white" />
                  Run Intelligence
                </>
              )}
            </button>

            {(result || files.length > 0) && (
              <button
                onClick={resetSession}
                className="w-full py-3 rounded-xl font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-red-100"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Session
              </button>
            )}
          </div>

          {isProcessing && (
            <div className="p-5 bg-white border border-indigo-100 rounded-2xl shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">System Status</span>
              </div>
              <p className="text-sm font-bold text-slate-700">{PROCESSING_STAGES[loadingStage]}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-1000" 
                  style={{ width: `${((loadingStage + 1) / PROCESSING_STAGES.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex gap-3 animate-in zoom-in-95 duration-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-bold leading-tight">{error}</p>
            </div>
          )}

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-2xl">
            <h4 className="font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 text-indigo-400">
              <FileText className="w-3 h-3" />
              Workflow Guidelines
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0 border border-indigo-500/30">01</span>
                <p className="text-xs font-medium text-slate-300">Upload JPG, PNG, or PDF source documents.</p>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0 border border-indigo-500/30">02</span>
                <p className="text-xs font-medium text-slate-300">Optionally upload a <b>.docx</b> template for Mail Merge.</p>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0 border border-indigo-500/30">03</span>
                <p className="text-xs font-medium text-slate-300">Run extraction and review/edit values in the dashboard.</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-8">
          {result ? (
            <ExtractionResults 
              result={result} 
              setResult={setResult} 
              templateFile={templateFile} 
            />
          ) : (
            <div className="min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-white p-12 text-center transition-all">
              <div className="bg-slate-50 p-8 rounded-full mb-6 border border-slate-100">
                <FileText className="w-16 h-16 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Workspace Ready</h3>
              <p className="text-sm text-slate-500 max-w-sm font-medium leading-relaxed">
                Your extracted legal data will appear here in a structured dashboard format once analysis begins.
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-20 text-center pb-12">
        <div className="flex items-center justify-center gap-6 mb-8 opacity-20">
           <div className="h-px bg-slate-300 w-12"></div>
           <Scale className="w-5 h-5" />
           <div className="h-px bg-slate-300 w-12"></div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1.5 rounded-lg bg-white shadow-sm">
              <Globe className="w-3 h-3" /> Release: Web-Native
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100 px-3 py-1.5 rounded-lg bg-emerald-50 shadow-sm">
              <ShieldCheck className="w-3 h-3" /> Verified Build
            </span>
          </div>

          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Document Extraction Release Candidate
          </p>
          <p className="text-slate-300 text-[10px] font-medium max-w-md mx-auto leading-relaxed">
            Built with Gemini 3 Pro Vision Intelligence. Optimized for large-scale legal processing and mail-merge automation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
