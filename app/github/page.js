'use client';

import GitHubRepoList from '@/components/GitHubRepoList';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function GithubPage() {
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black">
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
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black border border-green-800 
                     rounded-lg hover:border-green-400 transition-colors text-green-400 hover:text-green-300"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Repos</span>
          </button>
        </div>
        <GitHubRepoList key={key} />
      </div>
    </div>
  );
}

