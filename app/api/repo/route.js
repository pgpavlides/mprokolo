// app/api/repo/route.js
export async function GET(request) {
  const token = request.cookies.get("token")?.value;
  const searchParams = request.nextUrl.searchParams;
  const repoId = searchParams.get("id");

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // First get all repos to find the one with matching ID
    const reposResponse = await fetch(
      `https://api.github.com/repositories/${repoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      }
    );

    if (!reposResponse.ok) {
      // If token is invalid, return 401
      if (reposResponse.status === 401) {
        return new Response("Unauthorized", { status: 401 });
      }

      const errorData = await reposResponse.text();
      console.error("GitHub API Error:", {
        status: reposResponse.status,
        statusText: reposResponse.statusText,
        error: errorData,
      });
      throw new Error(
        `Failed to fetch repository: ${reposResponse.status} ${reposResponse.statusText}`
      );
    }

    const repo = await reposResponse.json();

    return new Response(JSON.stringify(repo), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Repo fetch error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
