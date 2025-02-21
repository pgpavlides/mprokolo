export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const repo = searchParams.get('repo');
  const path = searchParams.get('path');
  const token = request.cookies.get('token')?.value;

  if (!token || !repo || !path) {
    return new Response('Unauthorized or missing parameters', { status: 401 });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch file content');
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}