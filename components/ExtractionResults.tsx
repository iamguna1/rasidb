
import React from 'react';
import { Download, AlertCircle, FileEdit } from 'lucide-react';
import { ExtractionResult, FileData } from '../types';
import { exportToExcel } from '../utils/excel';
import { generatePopulatedDocx } from '../utils/docx';

interface ExtractionResultsProps {
  result: ExtractionResult;
  setResult: React.Dispatch<React.SetStateAction<ExtractionResult | null>>;
  templateFile: FileData | null;
}

const ExtractionResults: React.FC<ExtractionResultsProps> = ({ result, setResult, templateFile }) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Extraction Results</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {templateFile && (
            <button
              onClick={handleWordExport}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              <FileEdit className="w-4 h-4" />
              Generate Word Doc
            </button>
          )}
          <button
            onClick={() => exportToExcel(result)}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Excel Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Field Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Extracted Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.fields.map((field, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{field.id}</td>
                  <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900 break-words max-w-[120px] sm:max-w-none">
                    {field.fieldName}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleValueChange(idx, e.target.value)}
                      className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded px-2 py-2 text-xs sm:text-sm text-gray-700 outline-none transition-all"
                      placeholder="N/A"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm sm:text-md font-semibold text-gray-800 mb-3">Immovable Property Description</h3>
          <textarea
            value={result.immovablePropertyDescription}
            onChange={(e) => handleExtraChange('immovablePropertyDescription', e.target.value)}
            className="w-full h-40 sm:h-48 p-3 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none leading-relaxed"
            placeholder="No description extracted..."
          />
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm sm:text-md font-semibold text-gray-800 mb-3">Applicants & Co-Borrowers</h3>
          <textarea
            value={result.applicantsAndCoBorrowers}
            onChange={(e) => handleExtraChange('applicantsAndCoBorrowers', e.target.value)}
            className="w-full h-40 sm:h-48 p-3 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none leading-relaxed"
            placeholder="No borrower details extracted..."
          />
        </div>
      </div>
      
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
        <p className="text-xs sm:text-sm text-indigo-700">
          {templateFile 
            ? "Template loaded! Click 'Generate Word Doc' to populate your placeholders." 
            : "Review values above. Edits are saved in real-time and reflected in the Excel export."}
        </p>
      </div>
    </div>
  );
};

export default ExtractionResults;
