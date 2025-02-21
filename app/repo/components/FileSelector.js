import React, { useState, useMemo } from "react";
import { X, Search, Check, Copy, FileDown } from "lucide-react";

export default function FileSelector({
  isOpen,
  onClose,
  treeData = [],
  onExport,
  repoName,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState(new Set());

  // Filter files based on search term
  const filteredFiles = useMemo(() => {
    if (!searchTerm) return treeData.filter(item => item.type !== "tree");
    
    const term = searchTerm.toLowerCase();
    return treeData.filter(
      item => item.type !== "tree" && item.path.toLowerCase().includes(term)
    );
  }, [treeData, searchTerm]);

  const handleToggleFile = (path) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(file => file.path)));
    }
  };

  const handleExport = async (type) => {
    const selectedFilesArray = Array.from(selectedFiles);
    const selectedTreeData = treeData.filter(
      item => selectedFilesArray.includes(item.path)
    );
    
    await onExport(selectedTreeData, type);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg w-[800px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-green-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-green-400">
            Select Files to Export
          </h2>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Actions */}
        <div className="p-4 border-b border-green-800 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-green-800 rounded-lg 
                       text-green-400 placeholder-green-700 focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={handleSelectAll}
              className="text-green-500 hover:text-green-400 text-sm"
            >
              {selectedFiles.size === filteredFiles.length ? "Deselect All" : "Select All"}
            </button>
            <span className="text-green-600 text-sm">
              {selectedFiles.size} files selected
            </span>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredFiles.length === 0 ? (
            <div className="text-center text-green-600">
              No files match your search
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.path}
                  onClick={() => handleToggleFile(file.path)}
                  className={`flex items-center p-2 rounded cursor-pointer transition-colors
                    ${
                      selectedFiles.has(file.path)
                        ? "bg-green-900/30 border border-green-700"
                        : "hover:bg-green-900/20 border border-transparent"
                    }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center mr-2">
                    {selectedFiles.has(file.path) ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 border border-green-700 rounded" />
                    )}
                  </div>
                  <span className="flex-1 text-green-400 truncate">
                    {file.path}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-green-800 flex justify-end gap-3">
          <button
            onClick={() => handleExport('copy')}
            disabled={selectedFiles.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-900/30 text-green-400 rounded-lg
                     hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>
          <button
            onClick={() => handleExport('markdown')}
            disabled={selectedFiles.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-900 text-green-100 rounded-lg
                     hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-4 h-4" />
            <span>Export MD</span>
          </button>
        </div>
      </div>
    </div>
  );
}