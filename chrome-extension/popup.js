// File: chrome-extension/popup.js

document.getElementById('syncBookmarks').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'GET_BOOKMARKS' }, (response) => {
    const outputDiv = document.getElementById('output');
    if (response && response.bookmarks) {
      outputDiv.innerText = 'Bookmarks synced successfully. Check console for details.';
      console.log('Bookmarks:', response.bookmarks);
    } else {
      outputDiv.innerText = 'Failed to sync bookmarks.';
    }
  });
});
