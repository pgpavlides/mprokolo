export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const repo = searchParams.get('repo');
    const token = request.cookies.get('token')?.value;
  
    if (!token || !repo) {
      return new Response('Unauthorized or missing repository', { status: 401 });
    }
  
    try {
      // First get the default branch
      const repoResponse = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (!repoResponse.ok) throw new Error('Failed to fetch repository info');
      const repoData = await repoResponse.json();
      const defaultBranch = repoData.default_branch;
  
      // Then get the tree
      const treeResponse = await fetch(
        `https://api.github.com/repos/${repo}/git/trees/${defaultBranch}?recursive=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
  
      if (!treeResponse.ok) throw new Error('Failed to fetch repository tree');
      const treeData = await treeResponse.json();
  
      return new Response(JSON.stringify(treeData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(error.message, { status: 500 });
    }
  }