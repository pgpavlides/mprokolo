import React, { useState, useEffect } from 'react';
import { X, Upload, Chrome, FileDown, AlertTriangle } from 'lucide-react';
import ImportBookmarksModal from './ImportBookmarksModal';

const BookmarksSyncModal = ({ isOpen, onClose, onImport }) => {
  const [method, setMethod] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [extensionDetected, setExtensionDetected] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const handleExtensionMessage = (event) => {
      const message = event.data;
      console.log('Received message:', message);

      if (!isMounted) return;

      if (message.type === 'BROCCOLI_EXTENSION_LOADED' || 
          message.type === 'BROCCOLI_EXTENSION_RESPONSE') {
        setExtensionDetected(true);
        setDebugMessage('Extension detected and ready');
      }

      if (message.type === 'CHROME_BOOKMARKS_SYNC') {
        console.log('Received bookmarks:', message.bookmarks);
        console.log('Received categories:', message.categories);
        
        // Update categories in localStorage first
        if (message.categories && message.categories.length > 0) {
          const existingCategories = JSON.parse(localStorage.getItem('mprokolo-library-categories') || '[]');
          
          // Filter out duplicate categories by name
          const newCategories = message.categories.filter(newCat => 
            !existingCategories.some(existingCat => existingCat.name === newCat.name)
          );
          
          // Combine existing and new categories
          const updatedCategories = [...existingCategories, ...newCategories];
          
          // Save updated categories to localStorage
          localStorage.setItem('mprokolo-library-categories', JSON.stringify(updatedCategories));
          
          // Force a reload of the categories in the parent component
          window.dispatchEvent(new Event('storage'));
        }
        
        // Then import bookmarks
        onImport(message.bookmarks);
        onClose();
      }

      if (message.type === 'CHROME_BOOKMARKS_ERROR') {
        console.error('Bookmark sync error:', message.error);
        setDebugMessage(`Error: ${message.error}`);
      }
    };

    // Add message listener
    window.addEventListener('message', handleExtensionMessage);

    // Check for extension on mount
    window.postMessage({ type: 'CHECK_EXTENSION' }, '*');

    // Cleanup function
    return () => {
      isMounted = false;
      window.removeEventListener('message', handleExtensionMessage);
    };
  }, [onImport, onClose]);

  // Handle manual file import
  const handleManualImport = (bookmarks) => {
    onImport(bookmarks);
    onClose();
  };

  if (!isOpen) return null;
  if (showImportModal) {
    return (
      <ImportBookmarksModal
        isOpen={true}
        onClose={() => {
          setShowImportModal(false);
          onClose();
        }}
        onImport={handleManualImport}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-green-800 rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-green-400">Sync Bookmarks</h2>
          <button onClick={onClose} className="text-green-500 hover:text-green-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Debug Info */}
        {debugMessage && (
          <div className="mb-4 p-2 bg-gray-900 rounded border border-green-800">
            <div className="flex items-center gap-2 text-xs text-green-400">
              <AlertTriangle className="w-4 h-4" />
              <span>{debugMessage}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Extension Method */}
            <button
              onClick={() => setMethod('extension')}
              className={`p-4 border rounded-lg text-center transition-colors ${
                method === 'extension'
                  ? 'border-green-400 bg-green-900/30'
                  : 'border-green-800 hover:border-green-600'
              }`}
            >
              <Chrome className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-green-400 font-medium">Chrome Extension</div>
              <div className="text-green-600 text-sm mt-1">
                {extensionDetected ? 'Extension detected' : 'Extension required'}
              </div>
            </button>

            {/* Manual Import Method */}
            <button
              onClick={() => setMethod('manual')}
              className={`p-4 border rounded-lg text-center transition-colors ${
                method === 'manual'
                  ? 'border-green-400 bg-green-900/30'
                  : 'border-green-800 hover:border-green-600'
              }`}
            >
              <FileDown className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-green-400 font-medium">Manual Import</div>
              <div className="text-green-600 text-sm mt-1">
              ⚠️UNDER DEVELOPMENT⚠️
              </div>
            </button>
          </div>

          {method === 'extension' && (
            <div className="bg-green-900/20 rounded-lg p-4">
              {extensionDetected ? (
                <div className="text-green-400">
                  <p>Click continue to sync your bookmarks using the Chrome extension.</p>
                  <p className="text-sm text-green-600 mt-2">
                    Your bookmark folders will be imported as categories automatically.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-green-400 mb-2">Extension not detected. To install:</p>
                  <ol className="list-decimal ml-4 text-green-600">
                    <li>Download Extension from <a className='text-red-500 hover:text-xl' href='https://drive.google.com/file/d/1GwuBVLaei2AMosUPKyYW6Ci2XsBWpimR/view?usp=sharing'> HERE </a></li>
                    <li>Extract the .zip</li>
                    <li>Open Chrome Extensions (chrome://extensions)</li>
                    <li>Enable "Developer mode" (top right)</li>
                    <li>Click "Load unpacked"</li>
                    <li>Select the extension folder</li>
                    <li>Refresh this page</li>
                    <li>You should see: "Extension detected and ready"</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {method === 'manual' && (
            <div className="bg-green-900/20 rounded-lg p-4">
              <p className="text-green-400">
                Click continue to import bookmarks from a Chrome bookmarks HTML file.
              </p>
              <p className="text-sm text-green-600 mt-2">
                Your bookmark folders will be imported as categories automatically.
              </p>
            </div>
          )}

          {method && (
            <button
              onClick={() => {
                if (method === 'manual') {
                  setShowImportModal(true);
                } else if (extensionDetected) {
                  console.log('Requesting bookmarks sync');
                  setDebugMessage('Requesting bookmarks sync...');
                  window.postMessage({ type: 'REQUEST_BOOKMARKS_SYNC' }, '*');
                }
              }}
              className="w-full px-4 py-2 bg-green-900 text-green-100 rounded-lg 
                       hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarksSyncModal;