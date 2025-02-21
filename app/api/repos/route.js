export async function GET(request) {
    const token = request.cookies.get('token')?.value;
  
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }
  
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
  
      const repos = await response.json();
      
      // Sort repos by last updated
      const sortedRepos = repos.sort((a, b) => 
        new Date(b.updated_at) - new Date(a.updated_at)
      );
  
      return new Response(JSON.stringify(sortedRepos), {
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