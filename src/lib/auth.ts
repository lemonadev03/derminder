import { NextRequest } from 'next/server';

export function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return false;
  }

  // Expect format: "Basic base64(username:password)"
  const [scheme, credentials] = authHeader.split(' ');
  
  if (scheme !== 'Basic' || !credentials) {
    return false;
  }

  try {
    const decoded = atob(credentials);
    const [username, password] = decoded.split(':');
    
    return (
      username === process.env.AUTH_USERNAME &&
      password === process.env.AUTH_PASSWORD
    );
  } catch {
    return false;
  }
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
      'WWW-Authenticate': 'Basic realm="Derminder"',
    },
  });
}

