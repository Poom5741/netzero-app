// T-601 static preview server for the Tier-2 computed-CSS suite.
// Serves the Next.js static export in out/ with ZERO dependencies (the
// npx-serve route was rejected: not installed, would fetch a new package).
// Clean URLs: /admin -> out/admin.html, /admin/ -> out/admin/index.html.
// Deliberately backend-less: T-601 verifies the STATIC EXPORT chrome only;
// API calls fail here by design (R-025: no API-value assertions anywhere).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)), "out");
const PORT = Number(process.env.TIER2_PORT || 4177);
const HOST = "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

function safeJoin(pathname) {
  const raw = decodeURIComponent(pathname).split("?")[0];
  const parts = raw.split("/").filter(function (p) {
    return p.length > 0 && p !== "." && p !== "..";
  });
  return join(OUT_ROOT, ...parts);
}

async function resolveFile(pathname) {
  for (const candidate of [safeJoin(pathname), safeJoin(pathname) + ".html", safeJoin(pathname + "/")]) {
    if (!candidate.startsWith(OUT_ROOT + sep) && candidate !== OUT_ROOT) continue;
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

const server = createServer(async function (req, res) {
  const pathname = req.url || "/";
  let file = await resolveFile(pathname);
  let status = 200;
  if (!file) {
    file = await resolveFile("/404.html");
    status = 404;
  }
  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("not found: " + pathname);
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(status, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(500);
    res.end("read error");
  }
});

server.listen(PORT, HOST, function () {
  console.log("tier2 static server on http://" + HOST + ":" + PORT + " serving " + OUT_ROOT);
});
