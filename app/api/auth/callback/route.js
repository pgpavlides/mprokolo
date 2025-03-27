export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  try {
    // Get credentials from environment variables with fallbacks
    // Only use fallbacks for client ID (not sensitive) to enable local development
    const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liHUvWs884aAKKrv';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    
    // Verify client secret is available
    if (!clientSecret) {
      console.error('GitHub client secret is missing from environment variables');
      return new Response('Server configuration error: Missing GitHub client secret', { status: 500 });
    }
    
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Set the token in an HTTP-only cookie
    const cookieValue = `token=${data.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=7200; Secure`;
    
    return new Response('Authentication successful', {
      status: 302,
      headers: {
        'Set-Cookie': cookieValue,
        'Location': '/',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    return new Response(`Authentication failed: ${error.message}`, { status: 500 });
  }
}