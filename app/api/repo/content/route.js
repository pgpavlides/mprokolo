export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const repo = searchParams.get('repo');
  const path = searchParams.get('path');
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!repo || !path) {
    return new Response('Missing required parameters', { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      }
    );

    if (!response.ok) {
      // If token is invalid, return 401
      if (response.status === 401) {
        return new Response('Unauthorized', { status: 401 });
      }
      throw new Error(`Failed to fetch file content: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache'
      },
    });
  } catch (error) {
    console.error('Content fetch error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}