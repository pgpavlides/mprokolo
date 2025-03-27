// Configuration for different environments
// This provides a fallback mechanism when environment variables don't work

const config = {
  // Base configuration with fallbacks
  github: {
    // IMPORTANT: Replace these values with your actual GitHub OAuth App credentials
    clientId: process.env.GITHUB_CLIENT_ID || "your_github_client_id_here",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "your_github_client_secret_here",
  },
  
  app: {
    // Default to production URL, but use environment variable if available
    url: process.env.NEXT_PUBLIC_APP_URL || "https://mprokolo.gr",
  },
  
  // Additional configuration can be added here
};

// Helper function to get the current environment
export function getEnvironment() {
  return process.env.NODE_ENV || "development";
}

// Export the configuration
export default config;
