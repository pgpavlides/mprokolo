document.getElementById('syncButton').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  const button = document.getElementById('syncButton');
  
  try {
    button.disabled = true;
    button.textContent = 'Syncing...';
    
    // Get all bookmarks
    const bookmarks = await chrome.bookmarks.getTree();
    
    // Process bookmarks
    const processedBookmarks = [];
    const processNode = (node, parentTitle = '') => {
      if (node.url) {
        processedBookmarks.push({
          id: Date.now() + Math.random(),
          name: node.title,
          link: node.url,
          category: parentTitle || 'Chrome Bookmarks',
          tags: ['chrome', 'imported', 'extension'],
          dateAdded: node.dateAdded
        });
      }
      if (node.children) {
        const currentTitle = node.title || parentTitle;
        node.children.forEach(child => processNode(child, currentTitle));
      }
    };

    bookmarks.forEach(node => processNode(node));

    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, {
      type: 'SYNC_BOOKMARKS',
      bookmarks: processedBookmarks
    });

    // Show success message
    statusEl.textContent = `Successfully synced ${processedBookmarks.length} bookmarks!`;
    statusEl.className = 'status success';
    statusEl.style.display = 'block';
    button.textContent = 'Sync Complete!';

  } catch (error) {
    console.error('Error syncing bookmarks:', error);
    statusEl.textContent = 'Error syncing bookmarks. Please try again.';
    statusEl.className = 'status error';
    statusEl.style.display = 'block';
    button.textContent = 'Sync Bookmarks';
    button.disabled = false;
  }
});