// Debug logging
console.log('Broccoli Extension Content Script Loaded');

// Listen for messages from webpage
window.addEventListener('message', async (event) => {
  // We only accept messages from our window
  if (event.source !== window) return;
  console.log('Content script received message:', event.data);

  if (event.data.type === 'REQUEST_BOOKMARKS_SYNC') {
    try {
      // Request bookmarks from background script
      const response = await chrome.runtime.sendMessage({ type: 'GET_BOOKMARKS' });
      
      if (!response || !response.bookmarks) {
        throw new Error('Failed to get bookmarks from Chrome API');
      }

      // Process the bookmarks
      const processedBookmarks = [];
      const categories = new Set();

      const processNode = (node, parentFolders = []) => {
        if (node.url) {
          // Get the immediate parent folder name (excluding "Other Bookmarks")
          const relevantFolders = parentFolders.filter(folder => folder !== 'Other Bookmarks');
          const category = relevantFolders.length > 0 ? relevantFolders[relevantFolders.length - 1] : 'Uncategorized';

          // Add category to the set
          if (category !== 'Uncategorized') {
            categories.add(category);
          }

          // Generate tags from title and folders
          const titleWords = node.title.toLowerCase()
            .split(/[\s\-_,\|\[\]\(\)]+/)
            .filter(word => word.length > 2)
            .filter(word => !['the', 'and', 'for', 'with', 'www', 'com', 'org', 'net'].includes(word));

          const folderTags = relevantFolders.map(folder => 
            folder.toLowerCase().replace(/[^a-z0-9]/g, '')
          );

          const tags = [
            ...new Set([
              ...titleWords,
              ...folderTags,
              'chrome',
              'imported'
            ])
          ];

          processedBookmarks.push({
            id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2)}`,
            name: node.title || 'Untitled',
            link: node.url,
            category: category,
            path: relevantFolders.join('/'),
            tags: tags,
            dateAdded: node.dateAdded
          });
        }

        // Process children if they exist
        if (node.children) {
          const newParentFolders = node.title ? [...parentFolders, node.title] : parentFolders;
          node.children.forEach(child => processNode(child, newParentFolders));
        }
      };

      // Process each root node
      response.bookmarks.forEach(root => processNode(root));

      // Create category objects
      const categoryObjects = Array.from(categories).map(name => ({
        id: `category_${Date.now()}_${Math.random().toString(36).substr(2)}`,
        name: name,
        icon: 'folder' // Default icon
      }));

      // Send to webpage
      window.postMessage({
        type: 'CHROME_BOOKMARKS_SYNC',
        bookmarks: processedBookmarks,
        categories: categoryObjects
      }, '*');

      console.log('Processed bookmarks:', processedBookmarks);
      console.log('Created categories:', categoryObjects);

    } catch (error) {
      console.error('Error processing bookmarks:', error);
      window.postMessage({
        type: 'CHROME_BOOKMARKS_ERROR',
        error: error.message
      }, '*');
    }
  }
});

// Send initial notification
window.postMessage({ 
  type: 'BROCCOLI_EXTENSION_LOADED',
  timestamp: Date.now()
}, '*');