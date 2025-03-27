export async function GET(request) {
  // Try alternative method to access environment variables
  const clientId = process.env.GITHUB_CLIENT_ID || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mprokolo.gr';
  
  // Hardcoded fallback if env vars aren't working
  // DO NOT USE THIS IN PRODUCTION - THIS IS ONLY FOR TEMPORARY DEBUGGING
  // REPLACE THIS WITH YOUR ACTUAL CLIENT ID FROM THE GITHUB DEVELOPER SETTINGS
  const fallbackClientId = 'YOUR_GITHUB_CLIENT_ID_HERE'; 
  
  // Use the environment variable if available, otherwise use the fallback
  const effectiveClientId = clientId || fallbackClientId;
  
  if (!effectiveClientId || effectiveClientId === 'YOUR_GITHUB_CLIENT_ID_HERE') {
    return new Response(
      JSON.stringify({
        error: 'No client ID available. Please set the hardcoded fallback in the code for testing.',
        helpText: 'Edit the app/api/alternative-auth/route.js file and replace YOUR_GITHUB_CLIENT_ID_HERE with your actual GitHub Client ID'
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
    `client_id=${encodeURIComponent(effectiveClientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=repo,read:user,read:org` +
    `&prompt=consent` +
    `&login=true`;
  
  return Response.redirect(githubAuthUrl);
}