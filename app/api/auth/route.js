import { getGitHubOAuthConfig } from '@/utils/aws-ssm';

export async function GET(request) {
  try {
    // Get GitHub configuration from AWS SSM Parameter Store - production-grade approach
    const { clientId, redirectUri } = await getGitHubOAuthConfig();
    
    console.log(`Using AWS SSM config: clientId=${clientId.substring(0, 4)}... with redirect=${redirectUri}`);
    
    const githubAuthUrl =
      `https://github.com/login/oauth/authorize?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=repo,read:user,read:org` +
      `&prompt=consent` + 
      `&login=true`;

    return Response.redirect(githubAuthUrl);
  } catch (error) {
    console.error('Error configuring GitHub OAuth:', error);
    return new Response(`Configuration error: ${error.message}`, { status: 500 });
  }
}