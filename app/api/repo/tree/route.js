export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const repo = searchParams.get('repo');
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!repo) {
    return new Response('Missing repository parameter', { status: 400 });
  }

  try {
    // First get the default branch
    const repoResponse = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
    });
    
    if (!repoResponse.ok) {
      // If token is invalid, return 401
      if (repoResponse.status === 401) {
        return new Response('Unauthorized', { status: 401 });
      }
      throw new Error('Failed to fetch repository info');
    }
    
    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch;

    // Then get the tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${repo}/git/trees/${defaultBranch}?recursive=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      }
    );

    if (!treeResponse.ok) {
      // If token is invalid, return 401
      if (treeResponse.status === 401) {
        return new Response('Unauthorized', { status: 401 });
      }
      throw new Error('Failed to fetch repository tree');
    }
    
    const treeData = await treeResponse.json();

    return new Response(JSON.stringify(treeData), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache'
      },
    });
  } catch (error) {
    console.error('Tree fetch error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}