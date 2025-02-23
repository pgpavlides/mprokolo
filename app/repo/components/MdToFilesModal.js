import React, { useState } from 'react';
import { X, FileText, Folder, Upload, AlertTriangle } from 'lucide-react';

export default function MdToFilesModal({ isOpen, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [failedFiles, setFailedFiles] = useState([]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.md')) {
      setError('Please select a Markdown (.md) file');
      return;
    }

    try {
      const content = await file.text();
      setSelectedFile(file);
      setSelectedContent(content);
      setError(null);
      setFailedFiles([]);
    } catch (err) {
      setError('Error reading file');
      console.error(err);
    }
  };

  const writeFileWithRetry = async (path, content, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch('/api/writeFile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path, content }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to write file');
        }

        return true;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  };

  const parseMarkdownContent = (content) => {
    const files = [];
    let currentFile = null;
    let currentLanguage = '';
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('## ')) {
        if (currentFile) {
          files.push(currentFile);
        }
        currentFile = {
          path: line.slice(3),
          content: '',
          language: ''
        };
      } 
      else if (line.startsWith('```') && currentFile) {
        currentLanguage = line.slice(3).trim();
        i++;
        let codeContent = '';
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeContent += lines[i] + '\n';
          i++;
        }
        currentFile.content = codeContent;
        currentFile.language = currentLanguage;
      }
    }
    
    if (currentFile) {
      files.push(currentFile);
    }
    
    return files;
  };

  const handleGenerate = async () => {
    if (!selectedContent) return;

    setLoading(true);
    setFailedFiles([]);
    try {
      const files = parseMarkdownContent(selectedContent);
      setProgress({ current: 0, total: files.length });

      const failed = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          await writeFileWithRetry(file.path, file.content);
          setProgress({ current: i + 1, total: files.length });
        } catch (err) {
          console.error(`Error creating file ${file.path}:`, err);
          failed.push({ path: file.path, error: err.message });
        }
      }

      if (failed.length > 0) {
        setFailedFiles(failed);
        setError(`Failed to create ${failed.length} files`);
      } else {
        onClose();
      }
    } catch (err) {
      setError('Error generating files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg w-[600px] p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-green-400">
            MD to Files
          </h2>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-green-800 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".md"
              onChange={handleFileSelect}
              className="hidden"
              id="mdFileInput"
            />
            <label
              htmlFor="mdFileInput"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <FileText className="w-12 h-12 text-green-500" />
              <span className="text-green-400">
                {selectedFile ? selectedFile.name : 'Select MD file'}
              </span>
              <span className="text-green-600 text-sm">
                Click to browse or drag and drop
              </span>
            </label>
          </div>

          {error && (
            <div className="bg-red-900/20 text-red-400 rounded-lg p-4 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
              {failedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {failedFiles.map((file, index) => (
                    <div key={index} className="pl-6 text-xs">
                      {file.path}: {file.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedFile && !error && (
            <div className="bg-green-900/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-green-500" />
                <span className="text-green-400 text-sm truncate">
                  Selected file: {selectedFile.name}
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-green-900/20 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-green-400 text-sm">Generating files...</span>
                <span className="text-green-400 text-sm">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-black rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!selectedFile || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-900 
                     text-green-100 rounded-lg hover:bg-green-800 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Generate Files</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}