export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Set the token in an HTTP-only cookie
    const cookieValue = `token=${data.access_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=7200`;
    
    return new Response('Authentication successful', {
      status: 302,
      headers: {
        'Set-Cookie': cookieValue,
        'Location': '/',
      },
    });
  } catch (error) {
    return new Response(`Authentication failed: ${error.message}`, { status: 500 });
  }
}