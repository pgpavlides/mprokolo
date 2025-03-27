export async function GET(request) {
  // Use environment variables for configuration
  const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liFRAVWWeQMV3pYe';
  
  // Determine the base URL dynamically with more reliable environment detection
  const host = request.headers.get('host');
  
  // Force to production URL if running in production environment
  // Check for common production environment variables
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.AWS_LAMBDA_FUNCTION_NAME ||
                      host === 'mprokolo.gr';
                      
  let redirectUri;
  
  if (isProduction) {
    // Hard-code the production URL to avoid any host header spoofing issues
    redirectUri = 'https://mprokolo.gr/api/auth/callback';
    console.log('Using production redirect URI:', redirectUri);
  } else {
    // Local development
    const protocol = 'http';
    const baseUrl = `${protocol}://${host}`;
    redirectUri = `${baseUrl}/api/auth/callback`;
    console.log('Using local development redirect URI:', redirectUri);
  }

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