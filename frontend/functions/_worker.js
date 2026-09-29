// _worker.js — Pages advanced-mode port of the netzero-frontend worker proxy
// (BUG-017-B5). Pages `_redirects` only apply to GET requests, so POST /login
// on pages.dev fell through to 405 and the Pages domain could not log anyone
// in (admin or sponsor). This restores proxy parity with the workers.dev
// frontend: static assets are served via env.ASSETS, API paths are forwarded
// to the BACKEND service binding (set in project settings) with
// redirect:"manual" so the backend's 302 role-home responses survive.
//
// Source of truth: the deployed netzero-frontend worker script (fetched
// 2026-09-29) — keep the two in sync if one changes.
var REWRITES = [
  [/^\/api\/auth\/(.*)$/, "/$1"],
  [/^\/sponsor-login$/, "/sponsor/login"],
];
var proxy_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    const isApiPath =
      p.startsWith("/api/") ||
      p.startsWith("/evidence/") ||
      p === "/login" ||
      p === "/logout" ||
      p === "/redirect" ||
      p === "/sponsor-login" ||
      p.startsWith("/sponsor/");
    if (!isApiPath) {
      return env.ASSETS.fetch(request);
    }
    let target = p;
    for (const [re, sub] of REWRITES) target = target.replace(re, sub);
    const fwd = new URL(request.url);
    fwd.pathname = target;
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const body = hasBody ? await request.arrayBuffer() : void 0;
    return env.BACKEND.fetch(
      new Request(fwd.toString(), {
        method: request.method,
        headers: request.headers,
        body,
        redirect: "manual",
      })
    );
  },
};
export { proxy_default as default };
