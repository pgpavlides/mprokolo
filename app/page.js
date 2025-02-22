'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import MatrixRain from '@/components/MatrixRain';
import GithubLogin from '@/components/GithubLogin';
import { Github, Library, Settings, PenToolIcon } from 'lucide-react';

const handleLogout = async () => {
  // Clear the token cookie
  document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
  // Redirect to the login page
  window.location.href = '/';
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/repos');
        setIsAuthenticated(response.ok);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return null; // Or a loading spinner if preferred
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
                 rounded-lg hover:border-green-400 transition-all duration-300 group"
      >
        <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                <span className="text-green-400 font-medium">Lib</span>
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
          Version 0.2.0
        </div>
      </div>
    </>
  );
}