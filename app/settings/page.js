'use client';

import Link from 'next/link';
import { ArrowLeft, User, Globe, Shield } from 'lucide-react';
import MatrixRain from '@/components/MatrixRain';

export default function SettingsPage() {
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
            <h1 className="text-2xl font-bold text-green-400 mb-6">Settings</h1>
            
            {/* Settings Sections */}
            <div className="space-y-6 max-w-2xl">
              {/* Account Settings */}
              <div className="border border-green-800 rounded-lg p-6 bg-black/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold text-green-400">Account</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600">GitHub Connection</span>
                    <span className="text-green-400">Connected</span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="border border-green-800 rounded-lg p-6 bg-black/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold text-green-400">Preferences</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600">Theme</span>
                    <span className="text-green-400">Matrix</span>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="border border-green-800 rounded-lg p-6 bg-black/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold text-green-400">Security</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600">Session Status</span>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}