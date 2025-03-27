export async function GET(request) {
  // Create a sanitized version of env variables that doesn't expose sensitive values
  const safeEnvVars = {};
  
  // Iterate through all env vars and sanitize sensitive ones
  Object.keys(process.env).forEach(key => {
    // Skip runtime system variables
    if (key.startsWith('NEXT_') && key !== 'NEXT_PUBLIC_APP_URL') {
      safeEnvVars[key] = '[SYSTEM_VARIABLE]';
    }
    // For sensitive variables, just show that they exist and their length
    else if (
      key.includes('SECRET') || 
      key.includes('TOKEN') || 
      key.includes('KEY') ||
      key.includes('PASSWORD') ||
      key.includes('AUTH')
    ) {
      const value = process.env[key];
      safeEnvVars[key] = value ? `[HIDDEN: ${value.length} chars]` : 'undefined';
    }
    // For public variables, show their actual values
    else {
      safeEnvVars[key] = process.env[key] || 'undefined';
    }
  });
  
  // For specific GitHub variables we care about, provide more debug info
  if (process.env.GITHUB_CLIENT_ID) {
    safeEnvVars.GITHUB_CLIENT_ID_PREFIX = process.env.GITHUB_CLIENT_ID.substring(0, 4) + '...';
    safeEnvVars.GITHUB_CLIENT_ID_LENGTH = process.env.GITHUB_CLIENT_ID.length;
  }

  // Add some runtime information
  safeEnvVars._NODE_ENV = process.env.NODE_ENV;
  safeEnvVars._VERCEL = process.env.VERCEL;
  safeEnvVars._IS_PRODUCTION = process.env.NODE_ENV === 'production';
  
  return new Response(
    JSON.stringify({
      message: 'Environment variables check (sanitized for security)',
      environment: process.env.NODE_ENV,
      githubClientIdExists: !!process.env.GITHUB_CLIENT_ID,
      githubClientSecretExists: !!process.env.GITHUB_CLIENT_SECRET,
      appUrlExists: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      variables: safeEnvVars
    }, null, 2),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}