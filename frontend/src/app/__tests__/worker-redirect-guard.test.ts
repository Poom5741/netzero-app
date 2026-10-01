/**
 * T-502 — Worker-redirect guard (R-004). READ-ONLY Tier-1: readFileSync on the
 * Worker entry (repo-root src/index.ts) asserting that the /admin and
 * /sponsor 302 redirects (src/index.ts:382 and :387) are registered BEFORE
 * the API route mounts (adminRoutes at :404, sponsorRoutes at :407), so a
 * future edit can never quietly restore the unreachable Worker-side
 * admin/sponsor HTML ahead of the redirect topology. This suite reads src/
 * but never modifies it (presentation-only feature boundary, R-024).
 *
 * Relative depth check: this file lives at frontend/src/app/__tests__/, so
 * the repo-root Worker entry is four levels up: ../../../../src/index.ts.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url)); // frontend/src/app/__tests__
const INDEX_PATH = join(HERE, "../../../../src/index.ts"); // repo-root Worker entry
const INDEX = readFileSync(INDEX_PATH, "utf8");
const LINES = INDEX.split(String.fromCharCode(10)); // newline, backslash-free

const QT = String.fromCharCode(34); // double-quote char, backslash-free needles
const ADMIN_REDIRECT = "app.get(" + QT + "/admin(/*)?" + QT;
const SPONSOR_REDIRECT = "app.get(" + QT + "/sponsor(/*)?" + QT;
const ADMIN_MOUNT = "app.route(" + QT + "/" + QT + ", adminRoutes)";
const SPONSOR_MOUNT = "app.route(" + QT + "/sponsor" + QT + ", sponsorRoutes)";
const FRONTEND_ORIGIN = "https://netzero-frontend.poom-a1d.workers.dev";

function lineOf(needle: string): number {
  return LINES.findIndex((line) => line.includes(needle));
}

describe("T-502 — Worker-redirect guard (R-004, read-only)", () => {
  it("registers the /admin 302 redirect (src/index.ts:382)", () => {
    expect(lineOf(ADMIN_REDIRECT)).toBeGreaterThanOrEqual(0);
  });

  it("registers the /sponsor 302 redirect (src/index.ts:387)", () => {
    expect(lineOf(SPONSOR_REDIRECT)).toBeGreaterThanOrEqual(0);
  });

  it("redirects target the deployed frontend origin", () => {
    expect(INDEX).toContain(FRONTEND_ORIGIN);
  });

  it("the /admin redirect precedes the adminRoutes mount (382 < 404)", () => {
    const redirect = lineOf(ADMIN_REDIRECT);
    const mount = lineOf(ADMIN_MOUNT);
    expect(redirect).toBeGreaterThanOrEqual(0);
    expect(mount).toBeGreaterThanOrEqual(0);
    expect(redirect).toBeLessThan(mount);
  });

  it("the /sponsor redirect precedes the sponsorRoutes mount (387 < 407)", () => {
    const redirect = lineOf(SPONSOR_REDIRECT);
    const mount = lineOf(SPONSOR_MOUNT);
    expect(redirect).toBeGreaterThanOrEqual(0);
    expect(mount).toBeGreaterThanOrEqual(0);
    expect(redirect).toBeLessThan(mount);
  });
});
