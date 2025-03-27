export async function GET(request) {
  // Hard-coding the client ID directly in the code
  // REPLACE THIS WITH YOUR ACTUAL CLIENT ID
  const clientId = 'Ov23liFRAVWWeQMV3pYe';
  const redirectUri = 'https://mprokolo.gr/api/auth/callback';

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?` +
    `client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=repo,read:user,read:org` +
    `&prompt=consent` + 
    `&login=true`;

  return Response.redirect(githubAuthUrl);
}