import React, { useState } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';

// Function to generate unique IDs
function generateUniqueId(counter) {
  return `bookmark_${Date.now()}_${counter}`;
}

const ImportBookmarksModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.html')) {
      setError('Please select a bookmarks HTML file');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const bookmarkNodes = doc.querySelectorAll('a');
      let idCounter = 0;
      
      const bookmarks = Array.from(bookmarkNodes).map(node => {
        const path = [];
        let parent = node.parentElement;
        while (parent && parent.tagName !== 'HTML') {
          if (parent.tagName === 'DT' && parent.previousElementSibling?.tagName === 'H3') {
            path.unshift(parent.previousElementSibling.textContent);
          }
          parent = parent.parentElement;
        }

        return {
          id: generateUniqueId(idCounter++),
          name: node.textContent || 'Untitled Bookmark',
          link: node.href,
          category: path.length > 0 ? path[0] : 'Chrome Bookmarks',
          tags: ['chrome', 'imported', 'manual'],
          dateAdded: node.getAttribute('add_date'),
          path: path.join('/')
        };
      });

      onImport(bookmarks);
      onClose();
    } catch (error) {
      setError('Error parsing bookmarks file');
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-green-400">Import Bookmarks</h2>
          <button onClick={onClose} className="text-green-500 hover:text-green-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-green-400 mb-4">
            <p>To export your Chrome bookmarks:</p>
            <ol className="list-decimal ml-4 mt-2 text-green-600">
              <li>Open Chrome Bookmark Manager (Ctrl+Shift+O)</li>
              <li>Click the three dots ⋮ menu</li>
              <li>Select "Export bookmarks"</li>
              <li>Save the HTML file</li>
              <li>Upload the file here</li>
            </ol>
          </div>

          <input
            type="file"
            accept=".html"
            onChange={handleFileSelect}
            className="hidden"
            id="bookmarkFile"
          />
          <label
            htmlFor="bookmarkFile"
            className="block w-full p-4 border-2 border-dashed border-green-800 rounded-lg 
                     text-center cursor-pointer hover:border-green-600"
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <span className="text-green-400">
              {file ? file.name : 'Select bookmarks HTML file'}
            </span>
          </label>

          {error && (
            <div className="bg-red-900/20 text-red-400 rounded-lg p-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!file}
            className="w-full px-4 py-2 bg-green-900 text-green-100 rounded-lg 
                     hover:bg-green-800 transition-colors flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Import Bookmarks
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportBookmarksModal;