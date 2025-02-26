// app/lib/components/BookmarksSyncModal.js
import React, { useState, useEffect } from 'react';
import { X, Upload, Chrome, FileDown, AlertTriangle, RefreshCw } from 'lucide-react';
import ImportBookmarksModal from './ImportBookmarksModal';

const BookmarksSyncModal = ({ isOpen, onClose, onImport, onCategoriesUpdate }) => {
  const [method, setMethod] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [extensionDetected, setExtensionDetected] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');
  const [isCheckingExtension, setIsCheckingExtension] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);

  // Function to check for extension with multiple communication methods
  const checkForExtension = () => {
    setIsCheckingExtension(true);
    setDebugMessage('Checking for extension...');
    setCheckAttempts(prev => prev + 1);
    
    // Multiple communication methods
    const checkMethods = [
      // Method 1: Window postMessage
      () => window.postMessage({ 
        type: 'CHECK_EXTENSION',
        timestamp: Date.now(),
        attempt: checkAttempts + 1
      }, '*'),
      
      // Method 2: Custom document event
      () => {
        try {
          document.dispatchEvent(new CustomEvent('CHECK_BROCCOLI_EXTENSION', { 
            detail: { timestamp: Date.now() } 
          }));
        } catch (e) {
          // Silently catch any errors
        }
      },
      
      // Method 3: Chrome runtime message (if available)
      () => {
        if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
          try {
            window.chrome.runtime.sendMessage({ type: 'CHECK_EXTENSION' }, (response) => {
              if (response && response.status === 'ok') {
                setExtensionDetected(true);
                setDebugMessage('Extension detected via Chrome runtime');
              }
            });
          } catch (e) {
            // Silently catch any errors
          }
        }
      }
    ];

    // Run all check methods
    checkMethods.forEach(method => method());
    
    // Set timeout for final check
    setTimeout(() => {
      setIsCheckingExtension(false);
      if (!extensionDetected) {
        setDebugMessage('No extension response. Ensure extension is installed and active.');
      }
    }, 2000);
  };

  useEffect(() => {
    let isMounted = true;
    let extensionCheckTimeout;

    // Comprehensive handler for extension detection
    const handleExtensionMessage = (event) => {
      // Multiple detection methods
      const detectExtension = () => {
        // postMessage detection
        if (event.data && typeof event.data === 'object') {
          const message = event.data;
          if (message.type === 'BROCCOLI_EXTENSION_LOADED' || 
              message.type === 'BROCCOLI_EXTENSION_RESPONSE') {
            setExtensionDetected(true);
            setDebugMessage('Extension detected and ready');
            setIsCheckingExtension(false);
            return true;
          }
        }

        // Custom event detection
        if (event.detail && event.detail.type === 'BROCCOLI_EXTENSION_RESPONSE') {
          setExtensionDetected(true);
          setDebugMessage('Extension detected via custom event');
          setIsCheckingExtension(false);
          return true;
        }

        return false;
      };

      // If detection is successful, clear any pending timeouts
      if (detectExtension() && extensionCheckTimeout) {
        clearTimeout(extensionCheckTimeout);
      }

      // Handle successful bookmark sync
      if (event.data && event.data.type === 'CHROME_BOOKMARKS_SYNC') {
        const message = event.data;
        // Create category objects directly
        if (message.categories && message.categories.length > 0 && onCategoriesUpdate) {
          onCategoriesUpdate(message.categories);
        }
        
        // Then import bookmarks
        onImport(message.bookmarks);
        onClose();
      }

      // Handle error messages
      if (event.data && event.data.type === 'CHROME_BOOKMARKS_ERROR') {
        setDebugMessage(`Error: ${event.data.error}`);
        setIsCheckingExtension(false);
      }
    };

    // Add multiple event listeners
    const messageListener = (event) => {
      if (isMounted) handleExtensionMessage(event);
    };

    const customEventListener = (event) => {
      if (isMounted) handleExtensionMessage(event);
    };

    // Add listeners
    window.addEventListener('message', messageListener);
    document.addEventListener('BROCCOLI_EXTENSION_RESPONSE', customEventListener);

    // Comprehensive initial extension check
    const initialCheck = () => {
      if (!extensionDetected) {
        checkForExtension();
        
        // Set a timeout to ensure detection
        extensionCheckTimeout = setTimeout(() => {
          if (!extensionDetected && isMounted) {
            setDebugMessage('Extension detection failed. Please check installation.');
            setIsCheckingExtension(false);
          }
        }, 3000);
      }
    };

    // Initial check with slight delay to ensure listeners are set up
    const checkTimer = setTimeout(initialCheck, 500);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(checkTimer);
      if (extensionCheckTimeout) clearTimeout(extensionCheckTimeout);
      window.removeEventListener('message', messageListener);
      document.removeEventListener('BROCCOLI_EXTENSION_RESPONSE', customEventListener);
    };
  }, [onImport, onClose, onCategoriesUpdate]);

  // Handle manual file import
  const handleManualImport = (bookmarks, categories) => {
    // Update categories if provided
    if (categories && categories.length > 0 && onCategoriesUpdate) {
      onCategoriesUpdate(categories);
    }
    
    // Import bookmarks
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
        <div className="mb-4 p-2 bg-gray-900 rounded border border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-green-400">
              <AlertTriangle className="w-4 h-4" />
              <span>{debugMessage || 'Extension status unknown'}</span>
            </div>
            <button 
              onClick={checkForExtension}
              disabled={isCheckingExtension}
              className="text-green-400 hover:text-green-300 p-1 rounded-md transition-colors"
              title="Check for extension"
            >
              <RefreshCw className={`w-4 h-4 ${isCheckingExtension ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

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
                    <li>Download Extension from <a className='text-red-500 hover:text-xl' href='https://drive.google.com/drive/folders/1rGcIy3pRlj671Izg7HcIw5oJGBSE_-ny?usp=sharing'> HERE </a></li>
                    <li>Extract the .zip</li>
                    <li>Open Chrome Extensions (chrome://extensions)</li>
                    <li>Enable "Developer mode" (top right)</li>
                    <li>Click "Load unpacked"</li>
                    <li>Select the extension folder</li>
                    <li>Refresh this page</li>
                    <li>Click the refresh button above to check again</li>
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
                  setDebugMessage('Requesting bookmarks sync...');
                  // Use multiple communication methods for reliability
                  window.postMessage({ type: 'REQUEST_BOOKMARKS_SYNC', timestamp: Date.now() }, '*');
                  try {
                    document.dispatchEvent(new CustomEvent('REQUEST_BOOKMARKS_SYNC', { 
                      detail: { timestamp: Date.now() } 
                    }));

                    // Additional Chrome runtime message if available
                    if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
                      window.chrome.runtime.sendMessage({ type: 'REQUEST_BOOKMARKS_SYNC' });
                    }
                  } catch (e) {
                    // Silently catch any errors
                  }
                } else {
                  setDebugMessage('Extension not detected. Please install the extension first.');
                }
              }}
              className={`w-full px-4 py-2 text-green-100 rounded-lg 
                       transition-colors flex items-center justify-center gap-2
                       ${method === 'extension' && !extensionDetected 
                         ? 'bg-green-900/50 hover:bg-green-900/70 cursor-not-allowed' 
                         : 'bg-green-900 hover:bg-green-800'}`}
              disabled={method === 'extension' && !extensionDetected}
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