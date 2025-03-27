export async function GET(request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  // Check if required environment variables are set
  if (!clientId || !appUrl) {
    return new Response(
      JSON.stringify({
        error: 'Missing required environment variables',
        clientIdExists: !!clientId,
        appUrlExists: !!appUrl
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

  return Response.redirect(githubAuthUrl);
}