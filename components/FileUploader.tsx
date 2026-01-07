
import React from 'react';
import { Upload, X, FileText, File, FileEdit, ZoomIn, Image as ImageIcon } from 'lucide-react';
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
      return (
        <div 
          className="relative group/thumb cursor-zoom-in overflow-hidden rounded-md border border-gray-200 aspect-square h-full w-full bg-gray-50 shadow-sm"
          title="Click to view full image"
          onClick={(e) => {
            e.stopPropagation();
            const win = window.open();
            if (win) {
              win.document.write(`
                <html>
                  <head><title>Preview: ${file.name}</title></head>
                  <body style="margin:0; background: #111; display: flex; align-items: center; justify-content: center; height: 100vh;">
                    <img src="${file.base64}" style="max-width: 95%; max-height: 95%; object-fit: contain; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
                  </body>
                </html>
              `);
            }
          }}
        >
          <img 
            src={file.base64} 
            alt={file.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110" 
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity duration-200">
            <ZoomIn className="w-3 h-3 text-white drop-shadow-md" />
          </div>
        </div>
      );
    }
    if (file.type === 'application/pdf') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 rounded-md border border-red-100 shadow-sm">
          <FileText className="w-5 h-5" />
        </div>
      );
    }
    if (isDocx(file.type)) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500 rounded-md border border-blue-100 shadow-sm">
          <FileEdit className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 rounded-md border border-gray-100 shadow-sm">
        <File className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          Upload Documents
        </h2>
        <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-tight">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      <div className="group relative border-2 border-dashed border-gray-200 rounded-xl p-6 sm:p-8 transition-all hover:border-indigo-400 hover:bg-indigo-50/20 active:bg-indigo-50/40">
        <input
          type="file"
          multiple
          accept="image/*,application/pdf,.docx"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Drop files or click to browse</p>
          <p className="text-xs text-gray-500 mt-1.5 font-medium">Supporting PDFs, Images, and .DOCX Templates</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest pl-1">Selected Assets</h3>
          <div className="grid grid-cols-1 gap-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {files.map((file, idx) => (
              <div 
                key={idx} 
                className={`group/item flex items-center gap-3.5 p-2.5 bg-white rounded-xl border transition-all duration-200 ${
                  isDocx(file.type) 
                    ? 'border-blue-100 bg-blue-50/20 hover:border-blue-300' 
                    : 'border-gray-200 hover:border-indigo-200 hover:shadow-sm'
                }`}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  {getFileIcon(file)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-xs sm:text-[13px] font-bold text-gray-800 truncate leading-tight" title={file.name}>
                      {file.name}
                    </p>
                    {isDocx(file.type) && (
                      <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shrink-0 shadow-sm">
                        Template
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                      {file.type.split('/').pop()?.split('.').pop() || 'file'}
                    </span>
                    {file.type.startsWith('image/') && (
                       <span className="flex items-center gap-1 text-[9px] text-indigo-500 font-bold">
                         <ImageIcon className="w-2.5 h-2.5" />
                         Preview Available
                       </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(idx)} 
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100 active:scale-90"
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
