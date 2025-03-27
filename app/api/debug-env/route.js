export async function GET(request) {
  // Only return partial client ID for security (first 4 chars)
  const clientIdPrefix = process.env.GITHUB_CLIENT_ID?.substring(0, 4) || 'not-set';
  const clientSecretExists = !!process.env.GITHUB_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'not-set';
  
  return Response.json({
    clientIdPrefix: clientIdPrefix + '...',
    clientSecretExists,
    appUrl,
    fullRedirectUrl: `${appUrl}/api/auth/callback`
  });
}