'use client';

import { useState, useEffect } from 'react';
import { FolderTree, Copy, Check, Download, RefreshCw } from 'lucide-react';

export default function DirectoryTreeGenerator() {
  const [treeOutput, setTreeOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(true);
  const [includeFiles, setIncludeFiles] = useState(true);

  const [apiSupported, setApiSupported] = useState(true);
  
  // Default excluded folders
  const defaultExcludedFolders = [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    'coverage'
  ];
  
  const [excludedFolders, setExcludedFolders] = useState(defaultExcludedFolders);
  const [showExcludeOptions, setShowExcludeOptions] = useState(false);
  
  // Check if File System Access API is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('showDirectoryPicker' in window)) {
        setApiSupported(false);
        setError('Your browser does not support the File System Access API. Please use Chrome, Edge, or another compatible browser.');
      }
    }
  }, []);

  // Function to handle directory selection
  const handleDirectorySelect = async () => {
    // Clear previous errors and results
    setError('');
    setLoading(true);
    
    // Check if API is supported before proceeding
    if (!apiSupported) {
      setError('Your browser does not support the File System Access API. Please use Chrome, Edge, or another compatible browser.');
      setLoading(false);
      return;
    }
    
    try {
      // Use the File System Access API to select a directory
      const dirHandle = await window.showDirectoryPicker();
      
      // Generate the directory tree
      const tree = await generateTree(dirHandle, '', 0);
      setTreeOutput(tree);
    } catch (err) {
      console.error('Error selecting directory:', err);
      // Only set error for actual errors, not when user cancels
      if (err.name === 'AbortError') {
        // User cancelled the directory picker - this is normal, don't show error
        console.log('User cancelled directory selection');
      } else if (err.name === 'NotAllowedError') {
        setError('Permission to access the directory was denied.');
      } else if (err.name === 'NotFoundError') {
        setError('The directory could not be found.');
      } else {
        setError(`Error selecting directory: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to recursively generate the directory tree
  const generateTree = async (dirHandle, prefix = '', depth = 0) => {
    // Skip excluded folders
    if (depth > 0 && excludedFolders.includes(dirHandle.name)) {
      return `${prefix}📁 ${dirHandle.name} (skipped)
`;
    }
    
    let result = `${prefix}📁 ${dirHandle.name}\n`;
    
    try {
      const entries = [];
      for await (const entry of dirHandle.values()) {
        entries.push(entry);
      }
      
      // Sort entries (directories first, then files)
      entries.sort((a, b) => {
        // If types are different (one is directory, one is file)
        if (a.kind !== b.kind) {
          return a.kind === 'directory' ? -1 : 1;
        }
        // If same type, sort alphabetically
        return a.name.localeCompare(b.name);
      });
      
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const isLast = i === entries.length - 1;
        const newPrefix = prefix + (isLast ? '  ' : '│ ');
        
        if (entry.kind === 'directory' && expandedFolders) {
          const subTree = await generateTree(entry, newPrefix, depth + 1);
          result += subTree;
        } else if (entry.kind === 'file' && includeFiles) {
          result += `${prefix}${isLast ? '└─' : '├─'} 📄 ${entry.name}\n`;
        } else if (entry.kind === 'directory' && !expandedFolders) {
          result += `${prefix}${isLast ? '└─' : '├─'} 📁 ${entry.name}\n`;
        }
      }
    } catch (err) {
      console.error('Error reading directory:', err);
      result += `${prefix}  ❌ Error reading directory: ${err.message || 'Unknown error'}\n`;
    }
    
    return result;
  };

  // Function to copy the tree to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(treeOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy tree:', err);
      setError('Failed to copy tree to clipboard');
    }
  };

  // Function to download the tree as a text file
  const downloadTree = () => {
    const blob = new Blob([treeOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'directory-tree.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative border border-green-800 rounded-lg p-6 hover:border-green-400 transition-colors bg-black/50 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
        <FolderTree className="w-5 h-5" />
        <span>Directory Tree Generator</span>
      </h2>
      
      <div className="mb-6">
        <p className="text-green-300 text-sm mb-4">
          Generate a visual tree of your file system. Select a folder to begin.
        </p>
        
        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="expandedFolders"
              checked={expandedFolders}
              onChange={(e) => setExpandedFolders(e.target.checked)}
              className="h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="expandedFolders" className="text-green-300 text-sm">
              Expand Folders
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeFiles"
              checked={includeFiles}
              onChange={(e) => setIncludeFiles(e.target.checked)}
              className="h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="includeFiles" className="text-green-300 text-sm">
              Include Files
            </label>
          </div>
          

        </div>
        
        {/* Excluded Folders */}
        <div className="mb-4">
          <button 
            type="button"
            onClick={() => setShowExcludeOptions(!showExcludeOptions)}
            className="text-green-400 text-sm flex items-center gap-1 hover:text-green-300 transition-colors"
          >
            {showExcludeOptions ? '▼' : '►'} Excluded Folders
          </button>
          
          {showExcludeOptions && (
            <div className="mt-2 p-3 border border-green-900 rounded bg-black/30">
              <div className="flex flex-wrap gap-2 mb-2">
                {defaultExcludedFolders.map(folder => (
                  <div key={folder} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id={`exclude-${folder}`}
                      checked={excludedFolders.includes(folder)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExcludedFolders([...excludedFolders, folder]);
                        } else {
                          setExcludedFolders(excludedFolders.filter(f => f !== folder));
                        }
                      }}
                      className="h-3 w-3 rounded border-green-700 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor={`exclude-${folder}`} className="text-green-300 text-xs">
                      {folder}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-green-600 text-xs italic">
                These folders will be skipped during tree generation to keep output more manageable.
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={handleDirectorySelect}
          disabled={loading || !apiSupported}
          className={`px-4 py-2 ${!apiSupported ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-700 hover:bg-green-600'} text-green-200 rounded transition-colors flex items-center gap-2`}
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <FolderTree className="w-4 h-4" />
          )}
          <span>{loading ? 'Generating...' : 'Select Directory'}</span>
        </button>
        
        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </div>
      
      {treeOutput && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-medium text-green-400">Directory Tree</h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              
              <button
                onClick={downloadTree}
                className="px-2 py-1 bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                title="Download as text file"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs">Download</span>
              </button>
            </div>
          </div>
          
          <pre className="bg-black/80 border border-green-900 rounded-lg p-4 text-green-400 text-xs font-mono overflow-auto max-h-96">
            {treeOutput}
          </pre>
        </div>
      )}
    </div>
  );
}