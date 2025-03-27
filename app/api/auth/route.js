export async function GET(request) {
  // Use environment variables for configuration
  const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liFRAVWWeQMV3pYe';
  
  // Determine the base URL dynamically
  const host = request.headers.get('host');
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  // Set the redirect URI to match exactly what's registered in GitHub OAuth App
  const redirectUri = `${baseUrl}/api/auth/callback`;

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=repo,read:user,read:org` +
    `&prompt=consent` + 
    `&login=true`;

  console.log(`Redirecting to GitHub with redirect_uri: ${redirectUri}`);
  return Response.redirect(githubAuthUrl);
}