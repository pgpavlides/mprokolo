export async function GET(request) {
  // Simple GitHub OAuth implementation
  // Using the client ID directly since it's not sensitive
  const clientId = 'Ov23liHUvWs884aAKKrv';
  const redirectUri = 'https://mprokolo.gr/api/auth/callback';
  
  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=repo,read:user,read:org` +
    `&prompt=consent` + 
    `&login=true`;

  return Response.redirect(githubAuthUrl);
}