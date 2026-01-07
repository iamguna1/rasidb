
import React, { useState } from 'react';
import { Download, AlertCircle, FileEdit, Copy, CheckCircle2 } from 'lucide-react';
import { ExtractionResult, FileData } from '../types';
import { exportToExcel } from '../utils/excel';
import { generatePopulatedDocx } from '../utils/docx';

interface ExtractionResultsProps {
  result: ExtractionResult;
  setResult: React.Dispatch<React.SetStateAction<ExtractionResult | null>>;
  templateFile: FileData | null;
}

const ExtractionResults: React.FC<ExtractionResultsProps> = ({ result, setResult, templateFile }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleValueChange = (index: number, newValue: string) => {
    const updatedFields = [...result.fields];
    updatedFields[index].value = newValue;
    setResult({ ...result, fields: updatedFields });
  };

  const handleExtraChange = (key: 'immovablePropertyDescription' | 'applicantsAndCoBorrowers', value: string) => {
    setResult({ ...result, [key]: value });
  };

  const handleWordExport = () => {
    if (templateFile) {
      generatePopulatedDocx(templateFile, result);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Extraction Results</h2>
          <p className="text-xs text-gray-500 font-medium">Verified using Gemini 3 Flash Intelligence</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {templateFile && (
            <button
              onClick={handleWordExport}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg font-bold text-sm"
            >
              <FileEdit className="w-4 h-4" />
              Generate Word Doc
            </button>
          )}
          <button
            onClick={() => exportToExcel(result)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg font-bold text-sm"
          >
            <Download className="w-4 h-4" />
            Excel Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">ID</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Field Attribute</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Value & Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {result.fields.map((field, idx) => (
                <tr key={idx} className="group hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400">{field.id}</td>
                  <td className="px-6 py-4 text-xs sm:text-sm font-bold text-gray-700">
                    {field.fieldName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleValueChange(idx, e.target.value)}
                        className="flex-grow bg-gray-50/50 border border-gray-100 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-800 outline-none transition-all font-medium"
                        placeholder="Not found in document"
                      />
                      <button 
                        onClick={() => copyToClipboard(field.value, idx)}
                        className={`p-2 rounded-lg transition-all ${
                          copiedIndex === idx 
                          ? 'text-emerald-500 bg-emerald-50 scale-110' 
                          : 'text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 opacity-0 group-hover:opacity-100'
                        }`}
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Immovable Property</h3>
            <button 
              onClick={() => copyToClipboard(result.immovablePropertyDescription, 999)}
              className="text-indigo-500 hover:text-indigo-700 font-bold text-[10px] uppercase flex items-center gap-1"
            >
              {copiedIndex === 999 ? 'Copied!' : <><Copy className="w-3 h-3"/> Copy Text</>}
            </button>
          </div>
          <textarea
            value={result.immovablePropertyDescription}
            onChange={(e) => handleExtraChange('immovablePropertyDescription', e.target.value)}
            className="w-full h-48 p-4 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-400 outline-none resize-none leading-relaxed text-slate-700 font-medium"
            placeholder="No description extracted..."
          />
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Applicants & Co-Borrowers</h3>
            <button 
              onClick={() => copyToClipboard(result.applicantsAndCoBorrowers, 1000)}
              className="text-indigo-500 hover:text-indigo-700 font-bold text-[10px] uppercase flex items-center gap-1"
            >
              {copiedIndex === 1000 ? 'Copied!' : <><Copy className="w-3 h-3"/> Copy Text</>}
            </button>
          </div>
          <textarea
            value={result.applicantsAndCoBorrowers}
            onChange={(e) => handleExtraChange('applicantsAndCoBorrowers', e.target.value)}
            className="w-full h-48 p-4 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-400 outline-none resize-none leading-relaxed text-slate-700 font-medium"
            placeholder="No borrower details extracted..."
          />
        </div>
      </div>
      
      <div className="bg-indigo-600 rounded-2xl p-5 text-white flex items-start gap-4 shadow-xl shadow-indigo-100">
        <CheckCircle2 className="w-6 h-6 text-indigo-200 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-sm mb-1">Extraction Complete</h4>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Data has been mapped and normalized. You can manually correct any fields before exporting. 
            If a Word template is uploaded, click <b>Generate Word Doc</b> to perform a Mail Merge.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExtractionResults;
