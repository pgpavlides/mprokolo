export async function GET(request) {
  // Read from environment variables - this will work with the .env file
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = 'https://mprokolo.gr/api/auth/callback';
  
  // Verify client ID is available
  if (!clientId) {
    console.error('GitHub client ID missing from environment variables');
    return new Response('Server configuration error: Missing GitHub client ID', { status: 500 });
  }
  
  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=repo,read:user,read:org` +
    `&prompt=consent` + 
    `&login=true`;

  return Response.redirect(githubAuthUrl);
}