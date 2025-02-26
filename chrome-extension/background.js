// File: chrome-extension/background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_BOOKMARKS') {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      // Return the complete bookmark tree.
      sendResponse({ bookmarks: bookmarkTreeNodes });
    });
    // Return true to indicate that we'll respond asynchronously.
    return true;
  }
});
