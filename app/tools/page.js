'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MatrixRain from '@/components/MatrixRain';

export default function ToolsPage() {
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
            
            {/* Tools Grid - Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Example Tool Card */}
              <div className="border border-green-800 rounded-lg p-6 hover:border-green-400 transition-colors bg-black/50 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-green-400 mb-2">Coming Soon</h2>
                <p className="text-green-600">New tools will be added here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}