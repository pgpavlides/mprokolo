// app/api/repo/commits/route.js

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const repo = searchParams.get('repo');
    const perPage = searchParams.get('per_page') || '1';
    const token = request.cookies.get('token')?.value;
  
    if (!token || !repo) {
      return new Response('Unauthorized or missing repository', { status: 401 });
    }
  
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo}/commits?per_page=${perPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('GitHub API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to fetch commits: ${response.status} ${response.statusText}`);
      }
  
      const commits = await response.json();
      
      return new Response(JSON.stringify(commits), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Commits fetch error:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        details: error.stack
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }