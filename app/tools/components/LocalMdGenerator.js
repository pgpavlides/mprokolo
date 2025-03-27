'use client';

import { useState, useEffect } from 'react';
import { FolderTree, FileText, Download, RefreshCw, Folder, File, X, CheckCircle2, Terminal, AlertTriangle, Copy, Check } from 'lucide-react';

const BINARY_FILE_TYPES = [
  // Image files
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'raw',
  'heic', 'heif', 'avif', 'psd', 'ai', 'eps', 'sketch',
  
  // 3D files
  'glb', 'gltf', 'fbx', 'obj', 'stl',
  
  // Audio files
  'mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma', 'aiff', 'alac',
  'mid', 'midi', 'ac3', 'amr', 'ape', 'au', 'mka', 'ra', 'voc',
  
  // Other binary formats
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'tar',
  'gz', '7z', 'exe', 'dll', 'so', 'dmg', 'iso', 'bin'
];

export default function LocalMdGenerator() {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fileTree, setFileTree] = useState([]);
  const [markdownContent, setMarkdownContent] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [apiSupported, setApiSupported] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Exclude options
  const defaultExcludedFolders = ['node_modules', '.git', '.next', 'dist', 'build', 'coverage'];
  const defaultExcludedFileTypes = [
    // Binary executables and libraries
    'exe', 'dll', 'so', 'o', 'obj', 'bak',
    // Documentation
    'md',
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'raw', 'heic', 'heif', 'avif', 'psd', 'ai', 'eps', 'sketch',
    // 3D Models
    'glb', 'gltf', 'fbx', 'obj', 'stl',
    // Audio
    'mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma', 'aiff', 'alac', 'mid', 'midi', 'ac3', 'amr', 'ape', 'au', 'mka', 'ra', 'voc',
    // Audio Projects
    'aup', 'sesx', 'als', 'flp', 'band', 'logic', 'ptx', 'rpp',
    // Video
    'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'
  ];
  const defaultExcludedFiles = ['package-lock.json'];
  
  const [excludeFolders, setExcludeFolders] = useState(defaultExcludedFolders);
  const [excludeFileTypes, setExcludeFileTypes] = useState(defaultExcludedFileTypes);
  const [excludeFiles, setExcludeFiles] = useState(defaultExcludedFiles);
  const [splitMarkdown, setSplitMarkdown] = useState(false);
  const [splitSize, setSplitSize] = useState(50);

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
    setError('');
    setSelectedFolder(null);
    setFolderName('');
    setFileTree([]);
    setMarkdownContent('');
    setLoading(true);
    
    if (!apiSupported) {
      setError('Your browser does not support the File System Access API. Please use Chrome, Edge, or another compatible browser.');
      setLoading(false);
      return;
    }
    
    try {
      const dirHandle = await window.showDirectoryPicker();
      setDirectoryHandle(dirHandle);
      setSelectedFolder(dirHandle);
      setFolderName(dirHandle.name);
      
      // Generate file tree
      setProgress({ current: 0, total: 1, fileName: 'Analyzing directory structure...' });
      const tree = await generateFileTree(dirHandle);
      setFileTree(tree);
      
      // Automatically generate markdown after selecting directory
      if (tree.length > 0) {
        await generateMarkdown(tree, dirHandle);
      }
    } catch (err) {
      console.error('Error selecting directory:', err);
      // Only set error for actual errors, not when user cancels
      if (err.name === 'AbortError') {
        // User cancelled directory selection - don't show an error
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

  // Function to recursively generate the file tree
  const generateFileTree = async (directoryHandle, path = '') => {
    const result = [];
    
    try {
      // Process all entries in the directory
      for await (const entry of directoryHandle.values()) {
        const entryPath = path ? `${path}/${entry.name}` : entry.name;
        
        if (entry.kind === 'directory') {
          // Skip excluded folders
          if (excludeFolders.includes(entry.name)) {
            result.push({
              name: entry.name,
              path: entryPath,
              type: 'directory',
              skipped: true,
              children: []
            });
            continue;
          }
          
          // Get subdirectory contents
          const subDirectoryHandle = await directoryHandle.getDirectoryHandle(entry.name);
          const children = await generateFileTree(subDirectoryHandle, entryPath);
          
          result.push({
            name: entry.name,
            path: entryPath,
            type: 'directory',
            skipped: false,
            children
          });
        } else if (entry.kind === 'file') {
          // Check if file should be excluded
          const fileName = entry.name;
          const fileExtension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
          const shouldSkip = excludeFileTypes.includes(fileExtension) || excludeFiles.includes(fileName);
          
          result.push({
            name: entry.name,
            path: entryPath,
            type: 'file',
            skipped: shouldSkip,
            extension: fileExtension,
            isBinary: BINARY_FILE_TYPES.includes(fileExtension)
          });
        }
      }
    } catch (err) {
      console.error('Error reading directory:', err);
    }
    
    // Sort: directories first, then files, alphabetically
    return result.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  };

  // Function to generate markdown content
  const generateMarkdown = async (providedTree = null, providedDirHandle = null) => {
    // Use provided values or fallback to state
    const treeToUse = providedTree || fileTree;
    const dirHandleToUse = providedDirHandle || directoryHandle;
    
    if (!dirHandleToUse || treeToUse.length === 0) return;
    
    setGenerating(true);
    setMarkdownContent('');
    
    try {
      // Generate tree structure string
      const treeStructure = renderTreeStructure(treeToUse);
      
      // Find all non-skipped and non-binary files
      const filesToInclude = [];
      const findFiles = (items, basePath = '') => {
        for (const item of items) {
          if (item.type === 'directory' && !item.skipped) {
            findFiles(item.children, item.path);
          } else if (item.type === 'file' && !item.skipped && !item.isBinary) {
            filesToInclude.push(item);
          }
        }
      };
      
      findFiles(treeToUse);
      
      // Start building markdown
      let markdownParts = [];
      let currentPart = `# Directory Structure\n\n\`\`\`\n${treeStructure}\`\`\`\n\n# File Contents\n\n`;
      let currentPartSize = 0;
      let processedFiles = 0;
      
      setProgress({ current: 0, total: filesToInclude.length, fileName: 'Starting...' });
      
      for (const file of filesToInclude) {
        setProgress({ 
          current: processedFiles + 1, 
          total: filesToInclude.length, 
          fileName: file.path 
        });
        
        try {
          // Get file handle and content
          const content = await getFileContent(dirHandleToUse, file.path);
          const fileSection = `## ${file.path}\n\n\`\`\`${file.extension}\n${content}\`\`\`\n\n`;
          
          // If splitting is enabled, check if we need to start a new part
          if (splitMarkdown) {
            if (currentPartSize >= splitSize) {
              markdownParts.push(currentPart);
              currentPart = `# Directory Structure\n\n\`\`\`\n${treeStructure}\`\`\`\n\n# File Contents (Continued)\n\n`;
              currentPartSize = 0;
            }
            
            currentPart += fileSection;
            currentPartSize++;
          } else {
            currentPart += fileSection;
          }
        } catch (err) {
          console.error(`Error processing file ${file.path}:`, err);
          currentPart += `## ${file.path}\n\n\`\`\`\nError reading file: ${err.message}\`\`\`\n\n`;
        }
        
        processedFiles++;
      }
      
      // Add the last part if needed
      if (currentPart.length > 0) {
        markdownParts.push(currentPart);
      }
      
      setProgress({ 
        current: filesToInclude.length, 
        total: filesToInclude.length, 
        fileName: 'Complete' 
      });
      
      // Set the final markdown (single part or join all parts)
      if (markdownParts.length === 1) {
        setMarkdownContent(markdownParts[0]);
      } else {
        // Save each part separately or set combined content
        const combined = markdownParts.join('\n\n--- New Part ---\n\n');
        setMarkdownContent(combined);
      }
    } catch (err) {
      console.error('Error generating markdown:', err);
      setError(`Error generating markdown: ${err.message || 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  // Function to render tree structure
  const renderTreeStructure = (items, prefix = '') => {
    let result = '';
    
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const itemPrefix = prefix + connector;
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      
      if (item.skipped) {
        result += `${itemPrefix}${item.name} (skipped)\n`;
      } else {
        result += `${itemPrefix}${item.name}\n`;
        
        if (item.type === 'directory' && item.children.length > 0) {
          result += renderTreeStructure(item.children, childPrefix);
        }
      }
    });
    
    return result;
  };

  // Function to get file content by path
  const getFileContent = async (rootDirHandle, filePath) => {
    try {
      const parts = filePath.split('/');
      let currentHandle = rootDirHandle;
      
      // Navigate through directories
      for (let i = 0; i < parts.length - 1; i++) {
        currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
      }
      
      // Get the file handle
      const fileName = parts[parts.length - 1];
      const fileHandle = await currentHandle.getFileHandle(fileName);
      
      // Get the file contents
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      return content;
    } catch (err) {
      throw new Error(`Failed to read ${filePath}: ${err.message}`);
    }
  };

  // Function to download markdown
  const downloadMarkdown = () => {
    if (!markdownContent) return;
    
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = splitMarkdown ? `${folderName}-documentation-combined.md` : `${folderName}-documentation.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to copy markdown to clipboard
  const copyMarkdown = async () => {
    if (!markdownContent) return;
    
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setError('Failed to copy to clipboard');
    }
  };

  // Function to handle option changes
  const handleExcludeFoldersChange = (e) => {
    const folders = e.target.value.split(',').map(folder => folder.trim()).filter(Boolean);
    setExcludeFolders(folders);
  };

  const handleExcludeFileTypesChange = (e) => {
    const types = e.target.value.split(',').map(type => type.trim()).filter(Boolean);
    setExcludeFileTypes(types);
  };

  return (
    <div className="relative border border-green-800 rounded-lg p-6 hover:border-green-400 transition-colors bg-black/50 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
        <Terminal className="w-5 h-5" />
        <span>Local MD Generator</span>
      </h2>
      
      <div className="mb-6">
        <p className="text-green-300 text-sm mb-4">
          Generate a Markdown documentation of your local project directory structure and file contents.
        </p>
        
        {/* Options */}
        <div className="mb-4">
          <button 
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="text-green-400 text-sm flex items-center gap-1 hover:text-green-300 transition-colors"
          >
            {showOptions ? '▼' : '►'} Generation Options
          </button>
          
          {showOptions && (
            <div className="mt-2 p-3 border border-green-900 rounded bg-black/30 space-y-4">
              <div>
                <label htmlFor="excludeFolders" className="block text-green-300 text-sm mb-1">
                  Exclude Folders (comma-separated)
                </label>
                <input
                  type="text"
                  id="excludeFolders"
                  value={excludeFolders.join(', ')}
                  onChange={handleExcludeFoldersChange}
                  className="w-full p-2 bg-black border border-green-700 rounded text-green-200 text-sm focus:border-green-500 focus:outline-none"
                  placeholder="node_modules, .git, dist"
                />
              </div>
              
              <div>
                <label htmlFor="excludeFileTypes" className="block text-green-300 text-sm mb-1">
                  Exclude File Types (comma-separated)
                </label>
                <input
                  type="text"
                  id="excludeFileTypes"
                  value={excludeFileTypes.join(', ')}
                  onChange={handleExcludeFileTypesChange}
                  className="w-full p-2 bg-black border border-green-700 rounded text-green-200 text-sm focus:border-green-500 focus:outline-none"
                  placeholder="exe, dll, obj"
                />
              </div>
              
              <div>
                <label htmlFor="excludeFiles" className="block text-green-300 text-sm mb-1">
                  Exclude Specific Files (comma-separated)
                </label>
                <input
                  type="text"
                  id="excludeFiles"
                  value={excludeFiles.join(', ')}
                  onChange={(e) => {
                    const files = e.target.value.split(',').map(file => file.trim()).filter(Boolean);
                    setExcludeFiles(files);
                  }}
                  className="w-full p-2 bg-black border border-green-700 rounded text-green-200 text-sm focus:border-green-500 focus:outline-none"
                  placeholder="package-lock.json, .DS_Store"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="splitMarkdown"
                  checked={splitMarkdown}
                  onChange={(e) => setSplitMarkdown(e.target.checked)}
                  className="h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="splitMarkdown" className="text-green-300 text-sm">
                  Split into multiple files (for large projects)
                </label>
                
                {splitMarkdown && (
                  <div className="flex items-center gap-2 ml-4">
                    <label htmlFor="splitSize" className="text-green-300 text-sm">
                      Files per part:
                    </label>
                    <input
                      type="number"
                      id="splitSize"
                      min="10"
                      max="500"
                      value={splitSize}
                      onChange={(e) => setSplitSize(parseInt(e.target.value) || 50)}
                      className="h-8 w-20 rounded border-green-700 bg-black text-green-400 focus:ring-green-500 focus:border-green-500 p-1"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleDirectorySelect}
            disabled={loading || !apiSupported}
            className={`px-4 py-2 ${!apiSupported ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-700 hover:bg-green-600'} text-green-200 rounded transition-colors flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{generating ? 'Generating Markdown...' : 'Selecting Directory...'}</span>
              </>
            ) : (
              <>
                <FolderTree className="w-4 h-4" />
                <span>Select Directory</span>
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-900 rounded text-red-400 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}
      </div>
      
      {/* Selected Directory Info */}
      {selectedFolder && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Folder className="w-4 h-4 text-green-500" />
            <h3 className="text-md font-medium text-green-400">
              Selected Directory: <span className="font-bold">{folderName}</span>
            </h3>
          </div>
          
          {fileTree.length > 0 && (
            <div className="mt-2 text-green-500 text-sm">
              {fileTree.reduce((count, item) => {
                const countFiles = (items) => {
                  let result = 0;
                  for (const item of items) {
                    if (item.type === 'directory' && !item.skipped) {
                      result += countFiles(item.children);
                    } else if (item.type === 'file' && !item.skipped) {
                      result++;
                    }
                  }
                  return result;
                };
                
                return count + countFiles([item]);
              }, 0)} files will be included in the markdown
            </div>
          )}
        </div>
      )}
      
      {/* Progress Indicator */}
      {generating && (
        <div className="mb-6 p-4 border border-green-900 rounded-lg bg-black/30">
          <div className="flex justify-between mb-2">
            <span className="text-green-400 text-sm">Generating markdown...</span>
            <span className="text-green-400 text-sm">
              {progress.current} / {progress.total}
            </span>
          </div>
          
          <div className="w-full bg-black rounded-full h-2 mb-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.max(0, Math.min(100, (progress.current / Math.max(1, progress.total)) * 100))}%`
              }}
            />
          </div>
          
          <div className="text-green-600 text-xs truncate">
            {progress.fileName}
          </div>
        </div>
      )}
      
      {/* Markdown Result */}
      {markdownContent && !generating && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h3 className="text-md font-medium text-green-400">Markdown Generated</h3>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={copyMarkdown}
                className="px-2 py-1 bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors flex items-center gap-1 text-sm"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              
              <button
                onClick={downloadMarkdown}
                className="px-2 py-1 bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors flex items-center gap-1 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="bg-black/80 border border-green-900 rounded-lg p-4 text-green-400 text-xs font-mono overflow-auto max-h-96">
              <pre className="whitespace-pre-wrap">
                {/* Show a preview of the first 500 characters */}
                {markdownContent.substring(0, 500)}
                {markdownContent.length > 500 && '...\n\n[Content truncated for preview]'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}