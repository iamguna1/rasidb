
import React, { useState, useMemo } from 'react';
import { FileText, Search, Loader2, Scale } from 'lucide-react';
import FileUploader from './components/FileUploader';
import ExtractionResults from './components/ExtractionResults';
import { extractDataFromDocs } from './services/geminiService';
import { FileData, ExtractionResult } from './types';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Identify the first docx file as the template
  const templateFile = useMemo(() => {
    return files.find(f => f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') || null;
  }, [files]);

  // Filter out docx files for Gemini processing (it only handles images/pdfs)
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <header className="mb-8 sm:mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl mb-4 shadow-lg scale-90 sm:scale-100">
          <Scale className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 px-2">Legal & Financial Data Extractor</h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
          Upload recovery documents to extract data and fill your .docx Mail Merge template.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-1 space-y-6">
          <FileUploader files={files} setFiles={setFiles} />
          
          <button
            onClick={handleStartExtraction}
            disabled={sourceFiles.length === 0 || isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-md sticky bottom-4 sm:relative z-20 ${
              sourceFiles.length === 0 || isProcessing
                ? 'bg-gray-300 cursor-not-allowed opacity-80'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Docs...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Start Extraction
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm flex gap-2 animate-in fade-in zoom-in-95 duration-200">
              <span className="font-bold flex-shrink-0">Error:</span> {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-5 text-xs sm:text-sm text-blue-800">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Guidelines
            </h4>
            <ul className="space-y-1 list-disc list-inside opacity-90">
              <li>Upload PDFs/Images for extraction</li>
              <li>Upload <b>one .docx</b> as a template</li>
              <li>Template placeholders: <b>&#123;COURT&#125;</b>, etc.</li>
              <li>Wait for jurisdiction auto-check</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <ExtractionResults 
              result={result} 
              setResult={setResult} 
              templateFile={templateFile} 
            />
          ) : (
            <div className="min-h-[300px] sm:h-full sm:min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-white p-8 sm:p-12 text-center transition-all">
              <div className="bg-gray-50 p-5 sm:p-6 rounded-full mb-4">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">Upload & Analyze</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
                Upload your legal docs and your Word template. Extracted details will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-12 sm:mt-16 text-center text-gray-400 text-[10px] sm:text-xs border-t border-gray-100 pt-8 pb-4">
        &copy; {new Date().getFullYear()} Advanced Document Extraction • Mail Merge Ready
      </footer>
    </div>
  );
};

export default App;
