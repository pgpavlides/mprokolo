// app/repo/utils/createMdUtils.js

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
  const { excludedFolders, excludedFileTypes, excludedFiles, splitOptions } = options;

  // Utility functions
  const shouldIncludeInTree = (item) => {
    const fileName = item.path.split("/").pop();
    if (excludedFiles.includes(fileName)) return false;
    if (excludedFolders.some(folder => item.path.startsWith(folder))) return false;
    return true;
  };

  const shouldIncludeContent = (item) => {
    const fileName = item.path.split("/").pop();
    const fileExtension = fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
    if (excludedFiles.includes(fileName)) return false;
    if (excludedFileTypes.includes(fileExtension)) return false;
    if (excludedFolders.some(folder => item.path.startsWith(folder))) return false;
    if (BINARY_FILE_TYPES.includes(fileExtension)) return false;
    return true;
  };

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

  const getFileContent = async (item) => {
    try {
      const response = await fetch(`/api/repo/content?repo=${repoFullName}&path=${item.path}`);
      if (!response.ok) throw new Error(`Failed to fetch ${item.path}`);
      const data = await response.json();
      const content = atob(data.content);
      return content;
    } catch (error) {
      console.error(`Error fetching ${item.path}:`, error);
      return `Error loading file content: ${error.message}`;
    }
  };

  // Generate tree structure
  const rootItems = treeData.filter((item) => !item.path.includes("/"));
  const treeStructure = buildTree(rootItems);

  // Get all files that should be included
  const filesToInclude = treeData.filter(item => 
    item.type !== "tree" && shouldIncludeContent(item)
  );

  // Initialize progress
  onProgress({
    current: 0,
    total: filesToInclude.length,
    fileName: 'Starting...',
    isComplete: false
  });

  // Handle file splitting
  if (splitOptions?.enabled) {
    const splitSize = splitOptions.size || 50;
    const chunks = [];
    let currentChunk = [];
    let processedFiles = 0;

    for (const file of filesToInclude) {
      onProgress({
        current: processedFiles + 1,
        total: filesToInclude.length,
        fileName: file.path,
        isComplete: false
      });

      const content = await getFileContent(file);
      const fileExtension = file.path.split('.').pop();
      
      currentChunk.push({
        path: file.path,
        content,
        extension: fileExtension
      });

      if (currentChunk.length >= splitSize) {
        chunks.push(currentChunk);
        currentChunk = [];
      }

      processedFiles++;
    }

    // Add remaining files if any
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // Generate multiple markdown files
    const markdownFiles = chunks.map((chunk, index) => {
      let content = `# Repository Structure\n\n\`\`\`\n${treeStructure}\`\`\`\n\n`;
      content += `# File Contents (Part ${index + 1}/${chunks.length})\n\n`;

      chunk.forEach(file => {
        content += `## ${file.path}\n\n\`\`\`${file.extension}\n${file.content}\`\`\`\n\n`;
      });

      return {
        content,
        filename: `documentation-part-${index + 1}-of-${chunks.length}.md`
      };
    });

    onProgress({
      current: filesToInclude.length,
      total: filesToInclude.length,
      fileName: 'Complete',
      isComplete: true
    });

    return markdownFiles;
  } else {
    // Original single file behavior
    let markdownContent = `# Repository Structure\n\n\`\`\`\n${treeStructure}\`\`\`\n\n`;
    markdownContent += `# File Contents\n\n`;

    let processedFiles = 0;
    for (const file of filesToInclude) {
      onProgress({
        current: processedFiles + 1,
        total: filesToInclude.length,
        fileName: file.path,
        isComplete: false
      });

      const content = await getFileContent(file);
      const fileExtension = file.path.split('.').pop();
      
      markdownContent += `## ${file.path}\n\n\`\`\`${fileExtension}\n${content}\`\`\`\n\n`;
      
      processedFiles++;
    }

    onProgress({
      current: filesToInclude.length,
      total: filesToInclude.length,
      fileName: 'Complete',
      isComplete: true
    });

    return {
      content: markdownContent,
      filename: 'documentation.md'
    };
  }
};