// File path: app/tools/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import MatrixRain from '@/components/MatrixRain';

// A simple modal component
function InfoModal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Modal overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      {/* Modal content */}
      <div className="bg-gray-900 p-6 rounded-lg relative z-10 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-green-400">{title}</h2>
        <div className="text-green-200">{children}</div>
        <button
          onClick={onClose}
          className="mt-4 px-3 py-1 bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  // Two state variables to control each modal
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [visualizeModalOpen, setVisualizeModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check auth status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/repos', {
          cache: 'no-store',
          headers: {
            'pragma': 'no-cache',
            'cache-control': 'no-cache'
          }
        });
        
        if (!response.ok && response.status === 401) {
          window.location.href = '/api/auth';
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };

    checkAuth();
  }, []);

  // Simplified code snippets (dummy placeholders for actual code)
  const viewerCode = `// 3D DOM Viewer code snippet`;
  const visualizeCode = `// DOM 3D Visualize code snippet`;

  // Function to copy text to the clipboard
  const copyToClipboard = async (text) => {
    if (!isClient) return;
    
    try {
      await navigator.clipboard.writeText(text);
      alert('Code copied to clipboard!');
    } catch (error) {
      alert('Failed to copy code.');
    }
  };

  if (!isClient) {
    return (
      <>
        <MatrixRain />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <MatrixRain />
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4">
          {/* Header with Back Button */}
          <div className="py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Menu</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="mt-8">
            <h1 className="text-2xl font-bold text-green-400 mb-6">Tools</h1>
            
            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 3D DOM Viewer Tool Card */}
              <div className="relative border border-green-800 rounded-lg p-6 hover:border-green-400 transition-colors bg-black/50 backdrop-blur-sm">
                {/* Info icon */}
                <button
                  onClick={() => setViewerModalOpen(true)}
                  className="absolute top-2 right-2 text-green-400 hover:text-green-300"
                  aria-label="How to use 3D DOM Viewer"
                >
                  <Info className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-green-400 mb-2">3D DOM Viewer</h2>
                <button
                  onClick={() => copyToClipboard(viewerCode)}
                  className="mb-4 px-3 py-1 bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors"
                >
                  Copy Code
                </button>
                <pre className="text-green-600 text-xs overflow-auto whitespace-pre-wrap">
                  {viewerCode}
                </pre>
              </div>

              {/* DOM 3D Visualize Tool Card */}
              <div className="relative border border-green-800 rounded-lg p-6 hover:border-green-400 transition-colors bg-black/50 backdrop-blur-sm">
                {/* Info icon */}
                <button
                  onClick={() => setVisualizeModalOpen(true)}
                  className="absolute top-2 right-2 text-green-400 hover:text-green-300"
                  aria-label="How to use DOM 3D Visualize"
                >
                  <Info className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-green-400 mb-2">DOM 3D Visualize</h2>
                <button
                  onClick={() => copyToClipboard(visualizeCode)}
                  className="mb-4 px-3 py-1 bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors"
                >
                  Copy Code
                </button>
                <pre className="text-green-600 text-xs overflow-auto whitespace-pre-wrap">
                  {visualizeCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info modals */}
      <InfoModal
        isOpen={viewerModalOpen}
        onClose={() => setViewerModalOpen(false)}
        title="3D DOM Viewer - How to Use"
      >
        <p>
          Copy the code and paste it into your browser console on any webpage. It will visualize the DOM as a
          stack of 3D blocks.
        </p>
      </InfoModal>
      <InfoModal
        isOpen={visualizeModalOpen}
        onClose={() => setVisualizeModalOpen(false)}
        title="DOM 3D Visualize - How to Use"
      >
        <p>
          Copy the code and paste it into your browser console. This snippet applies a 3D transformation to the
          DOM for a cool visual effect.
        </p>
      </InfoModal>
    </>
  );
}