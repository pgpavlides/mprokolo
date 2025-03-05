// File path: app/api/auth/logout/route.js
export async function GET() {
    // Clear the token cookie by expiring it immediately
    const cookieValue = 'token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    return new Response('Logged out successfully', {
      status: 302,
      headers: {
        'Set-Cookie': cookieValue,
        'Location': '/',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
      },
    });
  }