'use client';

import Link from 'next/link';
import { ArrowLeft, Plus, LibraryIcon, FileDown } from 'lucide-react';
import { useState } from 'react';
import MatrixRain from '@/components/MatrixRain';
import LinksManagement from '@/components/LinksManagement';
import LibraryView from '@/components/LibraryView';
import ImportExportModal from '@/components/ImportExportModal';

export default function LibPage() {
  const [activeView, setActiveView] = useState(null);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  return (
    <>
      <MatrixRain />
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4">
          <div className="py-4 flex justify-between items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Menu</span>
            </Link>
            <button
              onClick={() => setIsImportExportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 
                         border border-green-800 rounded hover:border-green-400 
                         text-green-400 hover:text-green-300"
            >
              <FileDown className="w-4 h-4" />
              <span>Import/Export</span>
            </button>
          </div>

          {/* Library Menu */}
          {!activeView && (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
              <div className="grid grid-cols-2 gap-8">
                <button
                  onClick={() => setActiveView('add')}
                  className="group relative w-48 h-48 flex flex-col items-center justify-center 
                             bg-black/50 backdrop-blur-sm border border-green-800 
                             rounded-lg hover:border-green-400 transition-all duration-300"
                >
                  <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center gap-3">
                    <Plus className="w-10 h-10 text-green-500" />
                    <span className="text-green-400 font-medium">Add Link</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveView('view')}
                  className="group relative w-48 h-48 flex flex-col items-center justify-center 
                             bg-black/50 backdrop-blur-sm border border-green-800 
                             rounded-lg hover:border-green-400 transition-all duration-300"
                >
                  <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center gap-3">
                    <LibraryIcon className="w-10 h-10 text-green-500" />
                    <span className="text-green-400 font-medium">View Library</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Active Views */}
          {activeView === 'add' && (
            <LinksManagement 
              onBack={() => setActiveView(null)} 
              hideBackToMenu={true} 
            />
          )}
          {activeView === 'view' && (
            <LibraryView 
              onBack={() => setActiveView(null)} 
              hideBackToMenu={true} 
            />
          )}

          {/* Import/Export Modal */}
          <ImportExportModal
            isOpen={isImportExportModalOpen}
            onClose={() => setIsImportExportModalOpen(false)}
          />
        </div>
      </div>
    </>
  );
}