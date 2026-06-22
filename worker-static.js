const BACKEND_ORIGIN = "https://rafid-api.mahdialmuntadhar1.workers.dev";

function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function placeholderSvg(pathname) {
  const title = pathname.split("/").pop() || "talaba-placeholder.png";
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#5b21b6"/>
      <stop offset="45%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#g)"/>
  <circle cx="980" cy="90" r="210" fill="rgba(255,255,255,0.12)"/>
  <circle cx="160" cy="620" r="260" fill="rgba(255,255,255,0.10)"/>
  <text x="600" y="325" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="900" fill="white">Talaba</text>
  <text x="600" y="390" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.88)">Campus Life</text>
  <text x="600" y="445" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.65)">${title}</text>
</svg>`;

  return new Response(svg.trim(), {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }

    // Critical fix:
    // Some frontend files call /api/... relative to talaba.kaniq.org.
    // The frontend Worker does not own the API, so we proxy those requests to rafid-api.
    if (url.pathname.startsWith("/api/")) {
      const backendUrl = new URL(url.pathname + url.search, BACKEND_ORIGIN);

      const proxyHeaders = new Headers(request.headers);

      // MVP_AUTH_ORIGIN_PROXY_FIX_20260622
      // Do not forward browser Origin/Referer to rafid-api.
      // The browser calls talaba.kaniq.org, but rafid-api may reject that Origin.
      // This Worker is the trusted same-origin proxy.
      proxyHeaders.delete("Origin");
      proxyHeaders.delete("origin");
      proxyHeaders.delete("Referer");
      proxyHeaders.delete("referer");

      const proxyRequest = new Request(backendUrl.toString(), {
        method: request.method,
        headers: proxyHeaders,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        redirect: "follow"
      });

      try {
        const response = await fetch(proxyRequest);
        return withCors(response);
      } catch (error) {
        return new Response(JSON.stringify({
          error: "Talaba API proxy failed",
          message: String(error && error.message ? error.message : error)
        }), {
          status: 502,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }

    // Stop broken Campus Life design image requests from slowing the app.
    if (
      url.pathname.startsWith("/designs/campus-life/") ||
      url.pathname.startsWith("/designs/")
    ) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
      return placeholderSvg(url.pathname);
    }

    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    return env.ASSETS.fetch(new Request(new URL("/index.html", url), request));
  }
};

