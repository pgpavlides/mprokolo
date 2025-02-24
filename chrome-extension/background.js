// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_BOOKMARKS') {
      chrome.bookmarks.getTree()
        .then(bookmarks => {
          console.log('Retrieved bookmarks:', bookmarks);
          sendResponse({ bookmarks });
        })
        .catch(error => {
          console.error('Error getting bookmarks:', error);
          sendResponse({ error: error.message });
        });
  
      return true; // Will respond asynchronously
    }
  });