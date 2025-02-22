import React, { useState, useEffect } from 'react';
import { X, Upload, FileDown, AlertTriangle } from 'lucide-react';

const ImportExportModal = ({ isOpen, onClose }) => {
  const [links, setLinks] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState(null);
  const [importedLinks, setImportedLinks] = useState([]);

  useEffect(() => {
    const savedLinks = localStorage.getItem('mprokolo-library-links');
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }
  }, [isOpen]);

  const exportLinks = () => {
    const dataStr = JSON.stringify(links, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'mprokolo-library-links.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportError(null);
    setImportedLinks([]);

    if (!file.name.endsWith('.json')) {
      setImportError('Please select a JSON file');
      return;
    }

    try {
      const fileContent = await file.text();
      const parsedContent = JSON.parse(fileContent);

      if (!Array.isArray(parsedContent)) {
        setImportError('Invalid JSON format. Expected an array of links.');
        return;
      }

      const validLinks = parsedContent.filter(link => 
        link.name && link.link
      );

      if (validLinks.length === 0) {
        setImportError('No valid links found in the file.');
        return;
      }

      setImportFile(file);
      setImportedLinks(validLinks);
    } catch (error) {
      setImportError('Error parsing JSON file');
      console.error(error);
    }
  };

  const handleImport = () => {
    if (importedLinks.length > 0) {
      // Merge imported links, avoiding duplicates
      const uniqueImportedLinks = importedLinks.filter(
        importedLink => !links.some(existingLink => existingLink.link === importedLink.link)
      ).map(link => ({
        ...link,
        id: Date.now() + Math.random()
      }));

      const updatedLinks = [...links, ...uniqueImportedLinks];
      
      // Save to localStorage
      localStorage.setItem('mprokolo-library-links', JSON.stringify(updatedLinks));
      
      // Update state
      setLinks(updatedLinks);
      
      // Reset import state
      setImportFile(null);
      setImportedLinks([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg p-6 w-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-green-400">
            Import/Export Links
          </h2>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Section */}
        <div className="mb-6 bg-green-900/20 border border-green-800 rounded-lg p-4">
          <h3 className="text-green-400 mb-4">Export Links</h3>
          <div className="flex items-center justify-between">
            <span className="text-green-600">
              {links.length} links saved
            </span>
            <button
              onClick={exportLinks}
              className="flex items-center gap-2 px-4 py-2 bg-green-900 
                         text-green-100 rounded-lg hover:bg-green-800 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Export to JSON
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
          <h3 className="text-green-400 mb-4">Import Links</h3>
          <div className="border-2 border-dashed border-green-800 rounded-lg p-8 text-center mb-4">
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="linksImportInput"
            />
            <label
              htmlFor="linksImportInput"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-12 h-12 text-green-500" />
              <span className="text-green-400">
                {importFile ? importFile.name : 'Select JSON file'}
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

          {importedLinks.length > 0 && (
            <div className="bg-green-900/30 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-green-400">Links to Import</span>
                <span className="text-green-600">{importedLinks.length} links</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {importedLinks.map((link, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center bg-green-900/50 text-green-400 px-2 py-1 rounded mb-1"
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

          {importedLinks.length > 0 && (
            <button
              onClick={handleImport}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-900 
                         text-green-100 rounded-lg hover:bg-green-800 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import Links
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExportModal;