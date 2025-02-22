import React, { useEffect, useState } from "react";
import { Github, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import MatrixRain from "@/components/MatrixRain";

const GithubLogin = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/repos");
        if (response.ok) {
          // If authenticated, redirect to main page
          window.location.href = "/";
        } else {
          // If not authenticated, show login button
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to check authentication status");
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/auth";
  };

  if (loading) {
    return (
      <>
        <MatrixRain />
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <MatrixRain />
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        {/* Logo Section */}
        <div className="mb-12 animate-fade-in z-10">
          <Logo />
        </div>

        {/* Login Button */}
        <div className="animate-fade-in-delayed z-10">
          <button
            onClick={handleLogin}
            className="group relative px-6 py-3 flex items-center gap-3 bg-black border-2 border-green-500 
                     rounded-lg hover:bg-green-500 transition-all duration-300"
          >
            {/* Glow effect */}
            <div
              className="absolute -inset-1 bg-green-500/20 rounded-lg blur opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300"
            />

            {/* Button content */}
            <div className="relative flex items-center gap-3">
              <Github className="w-5 h-5 text-green-500 group-hover:text-black transition-colors" />
              <span className="text-green-500 font-medium group-hover:text-black transition-colors">
                Sign in with GitHub
              </span>
            </div>
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 text-red-500 text-sm text-center">{error}</div>
          )}
        </div>

        {/* Version Number */}
        <div className="absolute bottom-4 text-green-700 text-sm animate-fade-in-delayed z-10">
          Version 0.4.0 🥦
        </div>
      </div>
    </>
  );
};

export default GithubLogin;
