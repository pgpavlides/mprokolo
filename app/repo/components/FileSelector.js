'use client';

import React, { useState, useMemo } from "react";
import { X, Search, Check, Copy, FileDown, Trash2, File, Folder, ChevronRight, ChevronDown } from "lucide-react";

export default function FileSelector({
  isOpen,
  onClose,
  treeData = [],
  onExport,
  repoName,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // Helper functions for folder operations
  const getFilesInFolder = (tree, basePath = "") => {
    let files = [];
    
    // Add files in current directory
    if (tree.files) {
      files = [...files, ...tree.files.map(f => f.path)];
    }
    
    // Recursively get files from subdirectories
    if (tree.dirs) {
      Object.entries(tree.dirs).forEach(([dirName, contents]) => {
        const dirPath = basePath ? `${basePath}/${dirName}` : dirName;
        files = [...files, ...getFilesInFolder(contents, dirPath)];
      });
    }
    
    return files;
  };

  const getFolderFromPath = (tree, targetPath) => {
    const parts = targetPath.split('/');
    let current = tree;
    
    for (const part of parts) {
      if (current.dirs && current.dirs[part]) {
        current = current.dirs[part];
      } else {
        return null;
      }
    }
    
    return current;
  };

  // Create tree structure from flat data
  const fileTree = useMemo(() => {
    const tree = {};
    
    treeData.forEach(item => {
      const parts = item.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // It's a file
          if (!current.files) current.files = [];
          current.files.push(item);
        } else {
          // It's a directory
          if (!current.dirs) current.dirs = {};
          if (!current.dirs[part]) current.dirs[part] = {};
          current = current.dirs[part];
        }
      });
    });
    
    return tree;
  }, [treeData]);

  // Filter tree based on search term
  const filteredTree = useMemo(() => {
    if (!searchTerm) return fileTree;
    
    const term = searchTerm.toLowerCase();
    const filteredFiles = treeData.filter(
      item => item.type !== "tree" && item.path.toLowerCase().includes(term)
    );

    // Rebuild tree with only matching files and their parent folders
    const newTree = {};
    filteredFiles.forEach(item => {
      const parts = item.path.split('/');
      let current = newTree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          if (!current.files) current.files = [];
          current.files.push(item);
        } else {
          if (!current.dirs) current.dirs = {};
          if (!current.dirs[part]) current.dirs[part] = {};
          current = current.dirs[part];
        }
      });
    });

    return newTree;
  }, [treeData, searchTerm, fileTree]);

  // Get all files for select all functionality
  const allFiles = useMemo(() => {
    return treeData.filter(item => item.type !== "tree");
  }, [treeData]);

  // Get selected files data
  const selectedFilesData = useMemo(() => {
    return Array.from(selectedFiles).map(path => {
      return treeData.find(item => item.path === path);
    }).filter(Boolean);
  }, [selectedFiles, treeData]);

  const handleFolderSelect = (path) => {
    const folder = getFolderFromPath(filteredTree, path);
    if (!folder) return;
    
    const filesInFolder = getFilesInFolder(folder, path);
    const allSelected = filesInFolder.length > 0 && filesInFolder.every(file => selectedFiles.has(file));
    
    setSelectedFiles(prev => {
      const next = new Set(prev);
      filesInFolder.forEach(file => {
        if (allSelected) {
          next.delete(file);
        } else {
          next.add(file);
        }
      });
      return next;
    });
  };

  const toggleFolder = (path) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

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
    if (selectedFiles.size === allFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(allFiles.map(file => file.path)));
    }
  };

  const handleRemoveSelected = (path) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      next.delete(path);
      return next;
    });
  };

  const handleExport = async (type) => {
    const selectedTreeData = treeData.filter(
      item => selectedFiles.has(item.path)
    );
    
    await onExport(selectedTreeData, type);
    onClose();
  };

  // Recursive component for rendering the file tree
  const renderTree = (tree, basePath = "") => {
    return (
      <div className="pl-4">
        {/* Render directories */}
        {tree.dirs && Object.entries(tree.dirs).map(([dirName, contents]) => {
          const dirPath = basePath ? `${basePath}/${dirName}` : dirName;
          const isExpanded = expandedFolders.has(dirPath);
          const filesInFolder = getFilesInFolder(contents, dirPath);
          const allSelected = filesInFolder.length > 0 && filesInFolder.every(file => selectedFiles.has(file));
          const someSelected = filesInFolder.some(file => selectedFiles.has(file));

          return (
            <div key={dirPath}>
              <div className="flex items-center py-1 px-2 hover:bg-green-900/20 rounded cursor-pointer">
                <div onClick={() => toggleFolder(dirPath)}>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-green-500 mr-1" />
                  )}
                </div>
                <div 
                  className="flex items-center flex-1 gap-2"
                  onClick={() => handleFolderSelect(dirPath)}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {allSelected ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : someSelected ? (
                      <div className="w-3 h-3 border border-green-700 rounded bg-green-500/50" />
                    ) : (
                      <div className="w-3 h-3 border border-green-700 rounded" />
                    )}
                  </div>
                  <Folder className="w-4 h-4 text-green-500" />
                  <span className="text-green-400">{dirName}</span>
                  <span className="text-green-600 text-xs">
                    ({filesInFolder.length} files)
                  </span>
                </div>
              </div>
              {isExpanded && renderTree(contents, dirPath)}
            </div>
          );
        })}
        
        {/* Render files */}
        {tree.files && tree.files.map(file => (
          <div
            key={file.path}
            onClick={() => handleToggleFile(file.path)}
            className={`flex items-center py-1 px-2 rounded cursor-pointer ml-5
              ${selectedFiles.has(file.path)
                ? "bg-green-900/30 border border-green-700"
                : "hover:bg-green-900/20 border border-transparent"
              }`}
          >
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              {selectedFiles.has(file.path) ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <div className="w-3 h-3 border border-green-700 rounded" />
              )}
            </div>
            <File className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-green-400 text-sm truncate">
              {file.path.split('/').pop()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg w-[1200px] max-h-[80vh] flex flex-col">
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

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - File Tree */}
          <div className="flex-1 flex flex-col border-r border-green-800">
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
                  {selectedFiles.size === allFiles.length ? "Deselect All" : "Select All"}
                </button>
                <span className="text-green-600 text-sm">
                  {selectedFiles.size} files selected
                </span>
              </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto p-4">
              {Object.keys(filteredTree).length === 0 ? (
                <div className="text-center text-green-600">
                  No files match your search
                </div>
              ) : (
                renderTree(filteredTree)
              )}
            </div>
          </div>

          {/* Right Panel - Selected Files */}
          <div className="w-96 flex flex-col">
            <div className="p-4 border-b border-green-800">
              <h3 className="text-sm font-semibold text-green-400">Selected Files</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {selectedFilesData.map((file) => (
                  <div
                    key={file.path}
                    className="flex items-center justify-between p-2 rounded bg-green-900/20 
                             border border-green-800 group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <File className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-green-400 truncate text-sm">
                        {file.path}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveSelected(file.path)}
                      className="text-green-600 hover:text-green-400 opacity-0 group-hover:opacity-100 
                               transition-opacity ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {selectedFilesData.length === 0 && (
                  <div className="text-center text-green-600 text-sm py-4">
                    No files selected
                  </div>
                )}
              </div>
            </div>
          </div>
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