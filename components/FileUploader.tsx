
import React from 'react';
import { Upload, X, FileText, File, FileEdit } from 'lucide-react';
import { FileData } from '../types';

interface FileUploaderProps {
  files: FileData[];
  setFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ files, setFiles }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles: FileData[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const base64 = await fileToBase64(file);
      newFiles.push({
        name: file.name,
        type: file.type,
        base64: base64
      });
    }
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isDocx = (type: string) => type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const getFileIcon = (file: FileData) => {
    if (file.type.startsWith('image/')) {
      return <img src={file.base64} alt={file.name} className="w-full h-full object-cover rounded shadow-sm" />;
    }
    if (file.type === 'application/pdf') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 rounded border border-red-100">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      );
    }
    if (isDocx(file.type)) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500 rounded border border-blue-100">
          <FileEdit className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-500 rounded border border-gray-100">
        <File className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    );
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          Upload Docs
        </h2>
        <span className="text-[10px] sm:text-sm font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      <div className="group relative border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 transition-all hover:border-indigo-400 hover:bg-indigo-50/30">
        <input
          type="file"
          multiple
          accept="image/*,application/pdf,.docx"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-indigo-500" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-700">Browse or drop files</p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">PDF, JPG, PNG & .DOCX Template</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-5 sm:mt-6 space-y-3">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">File List</h3>
          <div className="grid grid-cols-1 gap-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <div 
                key={idx} 
                className={`group/item flex items-center gap-3 p-2 bg-white rounded-lg border transition-all ${
                  isDocx(file.type) ? 'border-blue-100 bg-blue-50/30' : 'border-gray-200 hover:border-indigo-200'
                }`}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                  {getFileIcon(file)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{file.name}</p>
                    {isDocx(file.type) && (
                      <span className="text-[8px] bg-blue-100 text-blue-700 px-1 rounded font-bold uppercase">Template</span>
                    )}
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase">
                    {file.type.split('/').pop()?.split('.').pop() || 'file'}
                  </p>
                </div>
                <button 
                  onClick={() => removeFile(idx)} 
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors sm:opacity-0 group-hover/item:opacity-100"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
