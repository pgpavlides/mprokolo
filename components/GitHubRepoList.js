'use client';

import React, { useState, useEffect } from 'react';
import { Github, LogOut, Search } from 'lucide-react';
import Link from 'next/link';

const GitHubRepoList = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/repos', {
        cache: 'no-store',
        headers: {
          'pragma': 'no-cache',
          'cache-control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setAuthError(true);
          return;
        }
        throw new Error('Failed to fetch repositories');
      }
      
      const data = await response.json();
      setRepos(data);
    } catch (err) {
      console.error('Repository fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Use the dedicated logout route
    window.location.href = '/api/auth/logout';
  };

  // Filter repositories based on search term
  const filteredRepos = repos.filter(repo => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      repo.name.toLowerCase().includes(searchTermLower) ||
      (repo.language && repo.language.toLowerCase().includes(searchTermLower))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Github className="w-16 h-16 mb-4 text-green-500" />
        <p className="text-red-500 mb-4">Authentication error. Please sign in again.</p>
        <button
          onClick={() => window.location.href = '/api/auth'}
          className="px-6 py-3 bg-green-600 text-black font-bold rounded-lg hover:bg-green-400 transition-colors duration-200 flex items-center gap-2"
        >
          <Github className="w-5 h-5" />
          Sign in with GitHub
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button 
          onClick={fetchRepos}
          className="px-6 py-3 bg-green-600 text-black font-bold rounded-lg hover:bg-green-400 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Github className="w-6 h-6 text-green-500" />
            <h1 className="text-xl font-semibold text-green-400">Repositories</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-green-600 hover:text-green-400 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
          <input
            type="text"
            placeholder="Search repositories by name or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black border border-green-800 rounded-lg 
                     text-green-400 placeholder-green-700 focus:outline-none focus:border-green-500
                     transition-colors duration-200"
          />
        </div>

        {/* Results Count */}
        <div className="mb-4 text-green-600">
          Found {filteredRepos.length} repositories
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map(repo => (
            <Link
              key={repo.id}
              href={`/repo/${repo.id}`}
              className="border border-green-800 rounded-lg p-4 hover:bg-green-900/30 h-24 relative group cursor-pointer transition-all duration-200"
            >
              <div className="flex flex-col h-full justify-between">
                <h3 className="font-medium text-green-400 truncate hover:text-green-300">
                  {repo.name}
                </h3>
                <div className="flex items-center justify-between text-sm text-green-600">
                  <span>{repo.language || 'No language'}</span>
                  <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results Message */}
        {filteredRepos.length === 0 && (
          <div className="text-center mt-8 text-green-600">
            No repositories found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubRepoList;