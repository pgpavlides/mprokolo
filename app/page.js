'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import MatrixRain from '@/components/MatrixRain';
import GithubLogin from '@/components/GithubLogin';
import { Github, Library, Settings, PenToolIcon, LogOut } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/repos', {
        // Add cache: 'no-store' to prevent caching
        cache: 'no-store',
        headers: {
          'pragma': 'no-cache',
          'cache-control': 'no-cache'
        }
      });
      setIsAuthenticated(response.ok);
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    
    // Use the new API route for secure logout
    window.location.href = '/api/auth/logout';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <GithubLogin />;
  }

  return (
    <>
      <MatrixRain />
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-20 px-4 py-2 bg-black/50 backdrop-blur-sm border border-green-800 
                 rounded-lg hover:border-green-400 transition-all duration-300 group flex items-center gap-2"
      >
        <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <LogOut className="w-4 h-4 text-green-400" />
        <span className="relative text-green-400 text-sm">Logout</span>
      </button>
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        <div className="z-10">
          {/* Logo */}
          <div className="mb-16 animate-fade-in">
            <Logo />
          </div>

          {/* Navigation Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-delayed">
            <Link
              href="/github"
              className="group relative w-32 h-32 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm border border-green-800 
                       rounded-lg hover:border-green-400 transition-all duration-300"
            >
              <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center gap-3">
                <Github className="w-10 h-10 text-green-500" />
                <span className="text-green-400 font-medium">Github MD</span>
              </div>
            </Link>

            <Link
              href="/lib"
              className="group relative w-32 h-32 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm border border-green-800 
                       rounded-lg hover:border-green-400 transition-all duration-300"
            >
              <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center gap-3">
                <Library className="w-10 h-10 text-green-500" />
                <span className="text-green-400 font-medium">Bookmarks</span>
              </div>
            </Link>

            <Link
              href="/tools"
              className="group relative w-32 h-32 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm border border-green-800 
                       rounded-lg hover:border-green-400 transition-all duration-300"
            >
              <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center gap-3">
                <PenToolIcon className="w-10 h-10 text-green-500" />
                <span className="text-green-400 font-medium">Tools</span>
              </div>
            </Link>

            <Link
              href="/settings"
              className="group relative w-32 h-32 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm border border-green-800 
                       rounded-lg hover:border-green-400 transition-all duration-300"
            >
              <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center gap-3">
                <Settings className="w-10 h-10 text-green-500" />
                <span className="text-green-400 font-medium">Settings</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Version Number */}
        <div className="absolute bottom-4 text-green-700 text-sm animate-fade-in-delayed">
          Version 0.5.0 🥦
        </div>
      </div>
    </>
  );
}