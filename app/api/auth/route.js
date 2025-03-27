import { getGitHubConfig } from '@/utils/amplify-secrets';

export async function GET(request) {
  // Get GitHub configuration from our utility
  const { clientId, redirectUri } = getGitHubConfig();
  
  console.log(`Using GitHub clientId: ${clientId.substring(0, 4)}... with redirect: ${redirectUri}`);
  
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