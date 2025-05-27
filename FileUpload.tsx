import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Progress } from './ui/progress';

interface FileUploadProps {
  onFileProcessed: (fileContent: string, fileName: string, fileType: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const selectedFile = acceptedFiles[0];
    const fileType = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    
    if (!['pdf', 'docx'].includes(fileType)) {
      setError('Please upload a PDF or DOCX file only.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    processFile(selectedFile);
  }, [onFileProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 50 * 1024 * 1024, // 50MB max size
    multiple: false
  });

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate progress for UX purposes
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return newProgress;
      });
    }, 300);

    try {
      // Read the file
      const fileContent = await readFileContent(file);
      
      // Complete the progress
      clearInterval(progressInterval);
      setProgress(100);
      
      // Pass the content to parent component
      onFileProcessed(fileContent, file.name, file.name.split('.').pop()?.toLowerCase() || '');
    } catch (err) {
      clearInterval(progressInterval);
      setError('Error processing file. Please try again.');
      console.error('File processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('File reading error'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium">Upload RFP Document</h3>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop your PDF or DOCX file here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Maximum file size: 50MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {file && !error && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {isProcessing ? (
              <span className="text-xs font-medium text-primary">Processing...</span>
            ) : (
              <span className="text-xs font-medium text-green-600">Ready</span>
            )}
          </div>

          {isProcessing && (
            <div className="mt-3">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {progress}% complete
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
