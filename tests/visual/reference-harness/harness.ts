/**
 * Reference harness — isolated HTML renderer for client artifact content.
 *
 * Renders extracted source styles with deterministic fixture data.
 * No dependency on the running Next.js app.
 */

import { existsSync, readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { ADMIN_FIXTURES, FARMER_FIXTURES, FIXTURE_META, SPONSOR_FIXTURES } from "./fixtures";

export interface MissingAsset {
  assetName: string;
  assetType: "image" | "font" | "content";
  screenName: string;
}

export interface HarnessPageOptions {
  surface: "line-oa" | "admin" | "sponsor";
  screenName: string;
  stateName: string;
}

/**
 * Build a self-contained HTML page for a reference screen.
 *
 * Includes:
 * - Google Fonts <link> for Noto Sans Thai + Material Symbols
 * - Inline CSS from extracted source styles
 * - Fixture data injected as JSON
 * - prefers-reduced-motion override disabling animations
 * - Missing-asset detection script
 */
export function createHarnessPage(options: HarnessPageOptions): string {
  const { surface, screenName, stateName } = options;

  const fixtureData = {
    farmers: FARMER_FIXTURES,
    admins: ADMIN_FIXTURES,
    sponsors: SPONSOR_FIXTURES,
    meta: FIXTURE_META,
    surface,
    screenName,
    stateName,
  };

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reference: ${surface}/${screenName}/${stateName}</title>

  <!-- Google Fonts: Noto Sans Thai + Material Symbols (MUST use <link>, not next/font/google) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet">

  <style>
    /* Disable all animations for deterministic capture */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    /* Force disable animations regardless of media query */
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    /* Base styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Noto Sans Thai', sans-serif;
      background: #f0f4f8;
      color: #1a202c;
      line-height: 1.6;
    }

    /* Missing asset placeholder */
    .missing-asset-placeholder {
      border: 2px dashed #e53e3e;
      background: #fff5f5;
      padding: 12px;
      margin: 8px;
      font-size: 12px;
      color: #e53e3e;
      text-align: center;
    }

    /* Screen container */
    #harness-screen {
      min-height: 100vh;
    }

    /* Material Symbols icon class */
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body>
  <div id="harness-screen" data-surface="${surface}" data-screen="${screenName}" data-state="${stateName}">
    <!-- Screen content will be rendered here by screen-specific modules -->
    <div data-expected-content="screen-body">
      <p>Screen: ${surface}/${screenName} — State: ${stateName}</p>
      <p>Fixture ID: ${FIXTURE_META.fixtureId}</p>
      <p>Today: ${FIXTURE_META.todayDate} (${FIXTURE_META.timezone})</p>
    </div>
  </div>

  <!-- Fixture data injection -->
  <script>
    window.__HARNESS_FIXTURES__ = ${JSON.stringify(fixtureData)};
  </script>

  <!-- Missing-asset detection script -->
  <script>
    window.__detectMissingAssets = function() {
      const missing = [];

      // 1. Broken images: img elements with naturalWidth === 0
      document.querySelectorAll('img').forEach(function(img) {
        if (img.naturalWidth === 0 || !img.complete) {
          missing.push({
            assetName: img.src || img.alt || 'unknown-image',
            assetType: 'image',
            screenName: '${screenName}'
          });
          // Render placeholder
          const placeholder = document.createElement('div');
          placeholder.className = 'missing-asset-placeholder';
          placeholder.textContent = 'Missing image: ' + (img.alt || img.src);
          img.parentNode.insertBefore(placeholder, img);
        }
      });

      // 2. Missing fonts: check if required fonts loaded
      if (document.fonts) {
        var requiredFonts = ['Noto Sans Thai', 'Material Symbols Outlined'];
        requiredFonts.forEach(function(fontFamily) {
          if (!document.fonts.check('16px "' + fontFamily + '"')) {
            missing.push({
              assetName: fontFamily,
              assetType: 'font',
              screenName: '${screenName}'
            });
          }
        });
      }

      // 3. Empty containers: elements with data-expected-content but no children
      document.querySelectorAll('[data-expected-content]').forEach(function(el) {
        if (el.childNodes.length === 0 || el.textContent.trim() === '') {
          missing.push({
            assetName: el.getAttribute('data-expected-content') || 'unknown-content',
            assetType: 'content',
            screenName: '${screenName}'
          });
          var placeholder = document.createElement('div');
          placeholder.className = 'missing-asset-placeholder';
          placeholder.textContent = 'Missing content: ' + el.getAttribute('data-expected-content');
          el.appendChild(placeholder);
        }
      });

      return missing;
    };
  </script>
</body>
</html>`;
}

/**
 * Launch a static file server for the reference harness.
 * Returns the server instance and the base URL.
 */
export function serveHarness(port: number): { server: Server; baseUrl: string } {
  const harnessDir = join(__dirname, "..");

  const server = createServer((req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    let filePath: string;

    if (url.pathname === "/" || url.pathname === "/harness") {
      // Serve a default harness page
      const html = createHarnessPage({
        surface: "admin",
        screenName: "overview",
        stateName: "default",
      });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    // Serve screen pages: /screen/{surface}/{screenName}/{stateName}
    const screenMatch = url.pathname.match(/^\/screen\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (screenMatch) {
      const [, surface, screenName, stateName] = screenMatch;
      const html = createHarnessPage({
        surface: surface as "line-oa" | "admin" | "sponsor",
        screenName,
        stateName,
      });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    // Serve static files from harness directory
    filePath = join(harnessDir, url.pathname);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath);
      const ext = filePath.split(".").pop();
      const mimeTypes: Record<string, string> = {
        html: "text/html",
        css: "text/css",
        js: "application/javascript",
        json: "application/json",
        png: "image/png",
        jpg: "image/jpeg",
        svg: "image/svg+xml",
      };
      res.writeHead(200, { "Content-Type": mimeTypes[ext || ""] || "application/octet-stream" });
      res.end(content);
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  server.listen(port);
  const baseUrl = `http://localhost:${port}`;
  return { server, baseUrl };
}
