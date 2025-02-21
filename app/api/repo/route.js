// app/api/repo/route.js
export async function GET(request) {
    const token = request.cookies.get('token')?.value;
    const searchParams = request.nextUrl.searchParams;
    const repoId = searchParams.get('id');
  
    if (!token || !repoId) {
      return new Response('Unauthorized or missing repository ID', { status: 401 });
    }
  
    try {
      // First get all repos to find the one with matching ID
      const reposResponse = await fetch('https://api.github.com/user/repos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
  
      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories');
      }
  
      const repos = await reposResponse.json();
      const repo = repos.find(r => r.id.toString() === repoId);
  
      if (!repo) {
        return new Response('Repository not found', { status: 404 });
      }
  
      return new Response(JSON.stringify(repo), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }