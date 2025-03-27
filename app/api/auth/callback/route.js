export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  try {
    // Check if we're in production environment
    const host = request.headers.get('host');
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.AWS_LAMBDA_FUNCTION_NAME ||
                        host === 'mprokolo.gr';
    
    // Use environment variables for credentials - with clear production/development distinction
    let clientId, clientSecret;
    
    if (isProduction) {
      // In production, strictly require environment variables
      clientId = process.env.GITHUB_CLIENT_ID;
      clientSecret = process.env.GITHUB_CLIENT_SECRET;
      console.log('Using production OAuth configuration');
    } else {
      // In development, allow fallbacks
      clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liFRAVWWeQMV3pYe';
      clientSecret = process.env.GITHUB_CLIENT_SECRET;
      console.log('Using development OAuth configuration');
    }
    
    // Verify credentials are available
    if (!clientId || !clientSecret) {
      const missingVars = [];
      if (!clientId) missingVars.push('GITHUB_CLIENT_ID');
      if (!clientSecret) missingVars.push('GITHUB_CLIENT_SECRET');
      
      console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      return new Response(`Server configuration error: Missing ${missingVars.join(', ')}`, { status: 500 });
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