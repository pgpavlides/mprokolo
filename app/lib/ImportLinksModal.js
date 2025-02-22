'use client';

import React, { useState } from 'react';
import { Upload, X, AlertTriangle, FileText } from 'lucide-react';

const ImportLinksModal = ({ 
  isOpen, 
  onClose, 
  onImport, 
  existingCategories 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedLinks, setParsedLinks] = useState([]);
  const [importError, setImportError] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset previous states
    setImportError(null);
    setParsedLinks([]);

    // Check file type
    if (!file.name.endsWith('.json')) {
      setImportError('Please select a JSON file');
      return;
    }

    try {
      const fileContent = await file.text();
      const parsedContent = JSON.parse(fileContent);

      // Validate parsed content is an array of links
      if (!Array.isArray(parsedContent)) {
        setImportError('Invalid JSON format. Expected an array of links.');
        return;
      }

      // Basic link validation
      const validLinks = parsedContent.filter(link => 
        link.name && link.link
      );

      if (validLinks.length === 0) {
        setImportError('No valid links found in the file.');
        return;
      }

      setSelectedFile(file);
      setParsedLinks(validLinks);
    } catch (error) {
      setImportError('Error parsing JSON file');
      console.error(error);
    }
  };

  const handleImport = () => {
    if (parsedLinks.length > 0) {
      onImport(parsedLinks);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg p-6 w-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-green-400">
            Import Links
          </h2>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-2 border-dashed border-green-800 rounded-lg p-8 text-center mb-4">
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            id="linksFileInput"
          />
          <label
            htmlFor="linksFileInput"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <FileText className="w-12 h-12 text-green-500" />
            <span className="text-green-400">
              {selectedFile ? selectedFile.name : 'Select JSON file'}
            </span>
            <span className="text-green-600 text-sm">
              Click to browse or drag and drop
            </span>
          </label>
        </div>

        {importError && (
          <div className="bg-red-900/20 text-red-400 rounded-lg p-4 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{importError}</span>
          </div>
        )}

        {parsedLinks.length > 0 && (
          <div className="bg-green-900/20 rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-green-400">Links to Import</span>
              <span className="text-green-600">{parsedLinks.length} links</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {parsedLinks.map((link, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center bg-green-900/30 text-green-400 px-2 py-1 rounded mb-1"
                >
                  <span className="truncate mr-2">{link.name}</span>
                  <a 
                    href={link.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-green-600 hover:text-green-400 truncate"
                  >
                    {link.link}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={parsedLinks.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-900 
                     text-green-100 rounded-lg hover:bg-green-800 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Import Links</span>
        </button>
      </div>
    </div>
  );
};

export default ImportLinksModal;