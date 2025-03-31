'use client';

import { useState, useEffect, useRef } from 'react';
import { FolderTree, Copy, Check, Download, RefreshCw, PlusCircle, X } from 'lucide-react';

export default function DirectoryTreeGenerator() {
  const [treeOutput, setTreeOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(true);
  const [includeFiles, setIncludeFiles] = useState(true);
  const [showInstructionsPopup, setShowInstructionsPopup] = useState(false);
  const [projectDir, setProjectDir] = useState('');
  const [fullPath, setFullPath] = useState('');
  const [packageJsonContent, setPackageJsonContent] = useState('');
  const [rawTree, setRawTree] = useState('');
  const popupRef = useRef(null);

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
  
  // Default AI instructions
  const [instructionItems, setInstructionItems] = useState([
    {
      id: "app_dir",
      text: "❇️**The application is in this directory** : {Application Directory}",
      active: true,
      isHeader: true
    },
    {
      id: "app_tree",
      text: "❇️**This is my tree application** : {Application tree}",
      active: true,
      isHeader: true
    },
    {
      id: "coding_lang",
      text: "❇️**Coding Language** : JavaScript/TypeScript",
      active: true,
      isHeader: true
    },
    {
      id: "instruction_header",
      text: "❇️**Instruction**:",
      active: true,
      isHeader: true
    },
    {
      id: "react_expert",
      text: "1. You are an expert React & NextJS developer tasked with analyzing and improving the codebase",
      active: true
    },
    {
      id: "chunk_editing",
      text: "2. When dealing with large files, edit in chunks so you don't run out of context.",
      active: true
    },
    {
      id: "modularity",
      text: "3. Focus on Modularity and reusability",
      active: true
    },
    {
      id: "documentation",
      text: "4. Comments and documentation inside the code.",
      active: true
    },
    {
      id: "preserve_function",
      text: "5. Do NOT change any existing functionality unless it is critical to fixing the previously identified issues",
      active: true
    },
    {
      id: "targeted_changes",
      text: "6. Only make changes that directly address the identified issues or significantly improve the code based on your analysis",
      active: true
    },
    {
      id: "intact_functionality",
      text: "7. Ensure that all original functionality remains intact",
      active: true
    },
    {
      id: "delete_unused",
      text: "8. When we stop using a file make inside the codebase DELETE/REMOVEIT or RENAME with `.remove` extension to the file so i can remove it manually.",
      active: true
    },
    {
      id: "await_commands",
      text: "9. Read any files you want from the directory and await my commands. When you area ready say `Yes Senpai` and await for commands.",
      active: true
    }
  ]);
  
  // Custom instructions
  const [customInstructions, setCustomInstructions] = useState([]);
  const [newInstruction, setNewInstruction] = useState('');
  
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
  
  // Close instructions popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowInstructionsPopup(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef]);

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
      
      // Store the top-level directory name
      setProjectDir(dirHandle.name);
      
      // Try to get full path - Note: FileSystemAPI doesn't provide full path for security,
      // we have to approximate it
      try {
        // Create a representation of the full path
        setFullPath(`/.../${dirHandle.name}`);
      } catch (err) {
        console.log('Unable to determine full path:', err);
        setFullPath(dirHandle.name);
      }
      
      // Try to read package.json if it exists
      try {
        const packageJsonFile = await dirHandle.getFileHandle('package.json');
        const fileData = await packageJsonFile.getFile();
        const packageJsonText = await fileData.text();
        setPackageJsonContent(packageJsonText);
      } catch (err) {
        console.log('package.json not found or cannot be read:', err);
        setPackageJsonContent('');
      }
      
      // Generate the directory tree
      const tree = await generateTree(dirHandle, '', 0);
      setRawTree(tree);
      
      // Generate AI instructions and combine with tree
      const completeOutput = generateOutput(fullPath || dirHandle.name, tree);
      setTreeOutput(completeOutput);
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

  // Function to generate the complete output with AI instructions and tree
  const generateOutput = (dirName, tree) => {
    // If no instructions are active, just return the tree
    const activeInstructions = [
      ...instructionItems.filter(item => item.active),
      ...customInstructions.filter(item => item.active)
    ];
    
    if (activeInstructions.length === 0) {
      return tree;
    }
    
    // Generate AI instructions
    let aiInstructions = "# AI INSTRUCTIONS\n\n";
    
    // Process header instructions first
    const headerInstructions = instructionItems.filter(item => item.active && item.isHeader);
    headerInstructions.forEach(item => {
      let text = item.text;
      
      // Replace placeholders with actual values
      if (item.id === "app_dir") {
        text = text.replace("{Application Directory}", dirName);
      } else if (item.id === "app_tree") {
        text = text.replace("{Application tree}", "Below");
      }
      
      aiInstructions += text + "\n";
    });
    
    aiInstructions += "\n";
    
    // Process numbered instructions
    const normalInstructions = instructionItems.filter(item => item.active && !item.isHeader);
    normalInstructions.forEach(item => {
      aiInstructions += item.text + "\n";
    });
    
    // Add custom instructions with correct numbering
    if (customInstructions.some(item => item.active)) {
      const startNumber = normalInstructions.length + 1;
      customInstructions.filter(item => item.active).forEach((item, index) => {
        aiInstructions += `${startNumber + index}. ${item.text}\n`;
      });
    }
    
    aiInstructions += "\n";
    
    // Combine with the tree
    return aiInstructions + tree;
  };

  // Function to recursively generate the directory tree
  const generateTree = async (dirHandle, prefix = '', depth = 0) => {
    // Skip excluded folders
    if (depth > 0 && excludedFolders.includes(dirHandle.name)) {
      return `${prefix}📁 ${dirHandle.name} (skipped)\n`;
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

  // Function to toggle an instruction's active state
  const toggleInstruction = (id, isCustom = false) => {
    if (isCustom) {
      setCustomInstructions(
        customInstructions.map(inst => 
          inst.id === id ? { ...inst, active: !inst.active } : inst
        )
      );
    } else {
      setInstructionItems(
        instructionItems.map(inst => 
          inst.id === id ? { ...inst, active: !inst.active } : inst
        )
      );
    }
    
    // Update the tree output if it exists
    if (rawTree && projectDir) {
      const updatedOutput = generateOutput(fullPath || projectDir, rawTree);
      setTreeOutput(updatedOutput);
    }
  };

  // Function to add a custom instruction
  const addCustomInstruction = () => {
    if (newInstruction.trim()) {
      const newId = `custom_${Date.now()}`;
      setCustomInstructions([
        ...customInstructions,
        {
          id: newId,
          text: newInstruction.trim(),
          active: true
        }
      ]);
      setNewInstruction('');
      
      // Update the tree output if it exists
      if (rawTree && projectDir) {
        const updatedOutput = generateOutput(fullPath || projectDir, rawTree);
        setTreeOutput(updatedOutput);
      }
    }
  };

  // Function to remove a custom instruction
  const removeCustomInstruction = (id) => {
    setCustomInstructions(customInstructions.filter(inst => inst.id !== id));
    
    // Update the tree output if it exists
    if (rawTree && projectDir) {
      const updatedOutput = generateOutput(fullPath || projectDir, rawTree);
      setTreeOutput(updatedOutput);
    }
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
            <div className="flex items-center gap-2">
              <h3 className="text-md font-medium text-green-400">Directory Tree</h3>
              <div className="relative">
                <button
                  onClick={() => setShowInstructionsPopup(!showInstructionsPopup)}
                  className="px-2 py-1 bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                  title="Manage AI Instructions"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="text-xs">AI Instructions</span>
                </button>
                
                {showInstructionsPopup && (
                  <div 
                    ref={popupRef}
                    className="absolute z-50 top-full mt-1 left-0 w-80 bg-black border border-green-700 rounded-md shadow-lg"
                  >
                    <div className="flex justify-between items-center p-2 border-b border-green-800">
                      <h4 className="text-green-400 text-xs font-semibold">Manage AI Instructions</h4>
                      <button 
                        onClick={() => setShowInstructionsPopup(false)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto p-2">
                      {/* Header Instructions */}
                      <div className="mb-3">
                        <h5 className="text-green-400 text-xs font-semibold mb-1">Header Information</h5>
                        {instructionItems.filter(item => item.isHeader).map(instruction => (
                          <div key={instruction.id} className="flex items-start gap-2 mb-1">
                            <input
                              type="checkbox"
                              id={`instruction-${instruction.id}`}
                              checked={instruction.active}
                              onChange={() => toggleInstruction(instruction.id)}
                              className="mt-1 h-3 w-3 rounded border-green-700 text-green-600 focus:ring-green-500"
                            />
                            <label htmlFor={`instruction-${instruction.id}`} className="text-green-300 text-xs">
                              {instruction.text}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      {/* Standard Instructions */}
                      <div className="mb-3">
                        <h5 className="text-green-400 text-xs font-semibold mb-1">Default Instructions</h5>
                        {instructionItems.filter(item => !item.isHeader).map(instruction => (
                          <div key={instruction.id} className="flex items-start gap-2 mb-1">
                            <input
                              type="checkbox"
                              id={`instruction-${instruction.id}`}
                              checked={instruction.active}
                              onChange={() => toggleInstruction(instruction.id)}
                              className="mt-1 h-3 w-3 rounded border-green-700 text-green-600 focus:ring-green-500"
                            />
                            <label htmlFor={`instruction-${instruction.id}`} className="text-green-300 text-xs">
                              {instruction.text}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      {/* Custom Instructions */}
                      {customInstructions.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-green-400 text-xs font-semibold mb-1">Custom Instructions</h5>
                          {customInstructions.map(instruction => (
                            <div key={instruction.id} className="flex items-start gap-2 mb-1">
                              <input
                                type="checkbox"
                                id={`custom-${instruction.id}`}
                                checked={instruction.active}
                                onChange={() => toggleInstruction(instruction.id, true)}
                                className="mt-1 h-3 w-3 rounded border-green-700 text-green-600 focus:ring-green-500"
                              />
                              <label htmlFor={`custom-${instruction.id}`} className="text-green-300 text-xs flex-grow">
                                {instruction.text}
                              </label>
                              <button
                                onClick={() => removeCustomInstruction(instruction.id)}
                                className="text-red-400 hover:text-red-300"
                                title="Remove instruction"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Add custom instruction */}
                      <div className="mb-2 border-t border-green-800 pt-2">
                        <h5 className="text-green-400 text-xs font-semibold mb-1">Add Custom Instruction</h5>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newInstruction}
                            onChange={(e) => setNewInstruction(e.target.value)}
                            placeholder="Enter custom instruction..."
                            className="flex-grow p-1 text-xs bg-black border border-green-700 text-green-300 rounded"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addCustomInstruction();
                              }
                            }}
                          />
                          <button
                            onClick={addCustomInstruction}
                            disabled={!newInstruction.trim()}
                            className={`px-2 py-1 text-xs rounded ${!newInstruction.trim() ? 'bg-green-900 text-green-700 cursor-not-allowed' : 'bg-green-700 text-green-200 hover:bg-green-600'}`}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {instructionItems.some(i => i.active) || customInstructions.some(i => i.active) ? (
                <span className="text-xs text-green-500 italic">
                  AI instructions active
                </span>
              ) : null}
            </div>
            
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