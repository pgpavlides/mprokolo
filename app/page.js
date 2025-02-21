'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import MatrixRain from '@/components/MatrixRain';
import { Github, Library } from 'lucide-react';

export default function Home() {
  return (
    <>
      <MatrixRain />
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        <div className="z-10">
          {/* Logo */}
          <div className="mb-16 animate-fade-in">
            <Logo />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-8 animate-fade-in-delayed">
            <Link
              href="/github"
              className="group relative px-6 py-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-green-800 
                       rounded-lg hover:border-green-400 transition-all duration-300"
            >
              <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Github className="w-5 h-5 text-green-500" />
                <span className="text-green-400 font-medium">Github MD</span>
              </div>
            </Link>

            <Link
              href="/lib"
              className="group relative px-6 py-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-green-800 
                       rounded-lg hover:border-green-400 transition-all duration-300"
            >
              <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Library className="w-5 h-5 text-green-500" />
                <span className="text-green-400 font-medium">Lib</span>
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