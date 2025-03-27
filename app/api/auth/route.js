export async function GET(request) {
  // Use the client ID from environment variables with fallback
  const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liHUvWs884aAKKrv';
  const redirectUri = 'https://mprokolo.gr/api/auth/callback';
  
  console.log(`Using GitHub OAuth with redirect: ${redirectUri}`);
  
  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=repo,read:user,read:org` +
    `&prompt=consent` + 
    `&login=true`;

  return Response.redirect(githubAuthUrl);
}