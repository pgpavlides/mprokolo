/** @type {import('next').NextConfig} */
const nextConfig = {
    // Add configuration for response headers to prevent caching
    async headers() {
      return [
        {
          // Apply these headers to all routes
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            }
          ],
        },
      ];
    },
    // Configure webpack to handle fs, net, tls modules
    webpack: (config) => {
      config.resolve.fallback = { fs: false, net: false, tls: false };
      return config;
    }
  };
  
  export default nextConfig;