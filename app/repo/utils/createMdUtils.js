// app/repo/utils/createMdUtils.js

// Define all binary file types
const BINARY_FILE_TYPES = [
    // Image files
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'raw',
    'heic', 'heif', 'avif', 'psd', 'ai', 'eps', 'sketch',
    
    // 3D files
    'glb', 'gltf', 'fbx', 'obj', 'stl',
    
    // Audio files
    'mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma', 'aiff', 'alac',
    'mid', 'midi', 'ac3', 'amr', 'ape', 'au', 'mka', 'ra', 'voc',
    
    // Audio project files
    'aup', 'sesx', 'als', 'flp', 'band', 'logic', 'ptx', 'rpp'
  ];
  
  export const generateMarkdown = async (treeData, options, repoFullName, onProgress) => {
    const { excludedFolders, excludedFileTypes, excludedFiles } = options;
  
    // For tree structure - only exclude folders and specific files
    const shouldIncludeInTree = (item) => {
      const fileName = item.path.split("/").pop();
      
      // Check folder and specific file exclusions only
      if (excludedFiles.includes(fileName)) return false;
      if (excludedFolders.some(folder => item.path.startsWith(folder))) return false;
  
      return true;
    };
  
    // For content - exclude folders, specific files, and binary files
    const shouldIncludeContent = (item) => {
      const fileName = item.path.split("/").pop();
      const fileExtension = fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
  
      // Check all exclusions including binary files
      if (excludedFiles.includes(fileName)) return false;
      if (excludedFileTypes.includes(fileExtension)) return false;
      if (excludedFolders.some(folder => item.path.startsWith(folder))) return false;
      if (BINARY_FILE_TYPES.includes(fileExtension)) return false;
  
      return true;
    };
  
    // Generate tree structure
    const buildTree = (items, prefix = "") => {
      let result = "";
      const filteredItems = items.filter(shouldIncludeInTree);
  
      filteredItems.forEach((item, index, array) => {
        const isLast = index === array.length - 1;
        const connector = isLast ? "└── " : "├── ";
        const itemPrefix = prefix + connector;
        const childPrefix = prefix + (isLast ? "    " : "│   ");
  
        result += `${itemPrefix}${item.path.split("/").pop()}\n`;
  
        if (item.type === "tree") {
          const children = treeData.filter(
            (child) =>
              child.path.startsWith(item.path + "/") &&
              child.path.split("/").length === item.path.split("/").length + 1
          );
          result += buildTree(children, childPrefix);
        }
      });
      return result;
    };
  
    // Get file content
    const getFileContent = async (item) => {
      try {
        const response = await fetch(`/api/repo/content?repo=${repoFullName}&path=${item.path}`);
        if (!response.ok) throw new Error(`Failed to fetch ${item.path}`);
        const data = await response.json();
        
        // GitHub API returns base64 encoded content
        const content = atob(data.content);
        return content;
      } catch (error) {
        console.error(`Error fetching ${item.path}:`, error);
        return `Error loading file content: ${error.message}`;
      }
    };
  
    // First generate tree structure
    const rootItems = treeData.filter((item) => !item.path.includes("/"));
    const treeStructure = buildTree(rootItems);
  
    // Initialize markdown content with tree structure
    let markdownContent = `# Repository Structure\n\n\`\`\`\n${treeStructure}\`\`\`\n\n`;
    markdownContent += `# File Contents\n\n`;
  
    // Get all files that should be included in content
    const filesToInclude = treeData.filter(item => 
      item.type !== "tree" && shouldIncludeContent(item)
    );
  
    // Process each file and report progress
    let processedFiles = 0;
    const totalFiles = filesToInclude.length;
  
    // Initial progress report
    onProgress({
      current: 0,
      total: totalFiles,
      fileName: 'Starting...',
      isComplete: false
    });
  
    // Add each file's content
    for (const file of filesToInclude) {
      // Update progress
      onProgress({
        current: processedFiles + 1,
        total: totalFiles,
        fileName: file.path,
        isComplete: false
      });
  
      const content = await getFileContent(file);
      const fileExtension = file.path.split('.').pop();
      
      markdownContent += `## ${file.path}\n\n\`\`\`${fileExtension}\n${content}\n\`\`\`\n\n`;
      
      processedFiles++;
    }
  
    // Final progress report
    onProgress({
      current: totalFiles,
      total: totalFiles,
      fileName: 'Complete',
      isComplete: true
    });
  
    return markdownContent;
  };