export async function GET(request) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    let allRepos = [];
    let page = 1;
    let hasNextPage = true;

    // Fetch all pages
    while (hasNextPage) {
      const response = await fetch(
        `https://api.github.com/user/repos?per_page=100&page=${page}&visibility=all&affiliation=owner,collaborator,organization_member`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const repos = await response.json();
      if (repos.length === 0) {
        hasNextPage = false;
      } else {
        allRepos = [...allRepos, ...repos];
        page++;
      }

      // Check if we've reached the last page
      const linkHeader = response.headers.get('Link');
      if (!linkHeader?.includes('rel="next"')) {
        hasNextPage = false;
      }
    }
    
    // Sort all repos by last updated
    const sortedRepos = allRepos.sort((a, b) => 
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