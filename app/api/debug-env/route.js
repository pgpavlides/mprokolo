// Environment debugging endpoint - REMOVE THIS IN PRODUCTION
export async function GET(request) {
  // Get request headers
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  
  // Safely get process.env variables without exposing secrets
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME ? 'set' : 'not set',
    AWS_LAMBDA_FUNCTION_VERSION: process.env.AWS_LAMBDA_FUNCTION_VERSION ? 'set' : 'not set',
    AWS_REGION: process.env.AWS_REGION || 'not set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? 'set' : 'not set', 
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? 'set' : 'not set',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'not set',
  };
  
  // Determine if we're in what we think is production
  const host = request.headers.get('host');
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.AWS_LAMBDA_FUNCTION_NAME ||
                      host === 'mprokolo.gr';
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: isProduction ? 'production' : 'development',
    host: host,
    headers: headers,
    environmentVariables: envInfo,
    redirectUri: isProduction 
      ? 'https://mprokolo.gr/api/auth/callback'
      : `http://${host}/api/auth/callback`
  };
  
  return new Response(JSON.stringify(debugInfo, null, 2), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}