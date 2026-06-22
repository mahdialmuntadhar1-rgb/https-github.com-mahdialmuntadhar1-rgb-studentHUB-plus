function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function withCors(response: Response, origin: string) {
  const headers = new Headers(response.headers);

  Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || url.origin;

    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: corsHeaders(origin)
        });
      }

      const backendUrl = new URL(request.url);
      backendUrl.protocol = 'https:';
      backendUrl.hostname = 'rafid-api.mahdialmuntadhar1.workers.dev';
      backendUrl.port = '';

      const headers = new Headers(request.headers);
      headers.delete('host');
      headers.set('Accept', headers.get('Accept') || 'application/json');

      const backendRequest = new Request(backendUrl.toString(), {
        method: request.method,
        headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'follow'
      });

      try {
        const backendResponse = await fetch(backendRequest);
        return withCors(backendResponse, origin);
      } catch (error: any) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Talaba API proxy failed',
          message: error?.message || 'Unknown proxy error'
        }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(origin)
          }
        });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
