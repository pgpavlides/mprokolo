import config from '@/app/config';

export async function GET(request) {
  // Use values from config which provides fallbacks if env vars don't work
  const clientId = config.github.clientId;
  const appUrl = config.app.url;
  
  // Debug logging
  console.log('Auth route config check:', {
    clientIdExists: !!clientId,
    clientIdPrefix: clientId ? clientId.substring(0, 4) + '...' : 'not-set',
    appUrlExists: !!appUrl,
    appUrl: appUrl || 'not-set',
    envNodeEnv: process.env.NODE_ENV
  });
  
  // Check if required values are set, including checking for placeholder values
  if (!clientId || clientId === 'your_github_client_id_here') {
    return new Response(
      JSON.stringify({
        error: 'GitHub OAuth configuration issue',
        message: 'The GitHub Client ID is not properly configured.',
        action: 'Please edit app/config.js and add your GitHub OAuth credentials.',
        clientIdExists: !!clientId,
        clientIdValue: clientId === 'your_github_client_id_here' ? 'Using placeholder value' : 'Not set',
        appUrlExists: !!appUrl,
        appUrlValue: appUrl || 'undefined'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const redirectUri = `${appUrl}/api/auth/callback`;

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=repo,read:user,read:org` +
    `&prompt=consent` + // Force consent screen
    `&login=true`; // Force login screen

  console.log('Redirecting to:', { githubAuthUrl });

  return Response.redirect(githubAuthUrl);
}