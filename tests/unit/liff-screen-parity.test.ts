/**
 * Pins the six artifact LIFF screens (/calendar /summary /fields /contact
 * /baseline /docs) and the shared LiffShell they must render through.
 *
 * The sibling liff-page-parity and liff-form-parity tests assert that
 * src/routes/liff.ts CONTAINS certain artifact tokens — they cannot detect a
 * missing route registration, an ad-hoc page bypassing liffScreenHtml, or a
 * new screen reintroducing the legacy palette inside the shared shell.
 *
 * Artifact source: design-artifacts/2026-09-28/line-oa-farmer.html, decoded
 * module 30fbaadd-d95b-4dad-b1c1-fa2494ac1677.js (LiffShell + screen
 * components) and specs/016-flow-parity/node-design-spec.md.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(process.cwd(), "src", "routes", "liff.ts");
const source = readFileSync(SRC, "utf8");

/** The six artifact screens added after the original chat/camera/documents pages. */
const ARTIFACT_SCREENS = [
  "/calendar",
  "/summary",
  "/fields",
  "/contact",
  "/baseline",
  "/docs",
] as const;

/** The GET routes that predate the artifact screens; the chat root is "/". */
const PREEXISTING_GETS = ["/", "/register", "/camera", "/documents"] as const;

/** Artifact LiffShell tokens: header gradient var, roundel size, teal ramp. */
const SHELL_TOKENS = ["var(--gradient-deep)", "26px", "#E7FCF7", "#028E91"] as const;

/** Pre-artifact greys and Material reds removed by the earlier slices. */
const LEGACY_PALETTE = [
  "#f0f2f5",
  "#e0e0e0",
  "#ddd",
  "#e8f5e9",
  "#00a854",
  "#ffebee",
  "#f44336",
] as const;

interface RouteProbe {
  path: string;
  registration: string;
}

const SCREEN_PROBES: RouteProbe[] = ARTIFACT_SCREENS.map((path) => ({
  path,
  registration: `liffRoutes.get("${path}"`,
}));

/**
 * Registration lines must start a line: a commented-out or re-indented
 * `// liffRoutes.get(...)` must not count as a registered route.
 */
function registrationPattern(probe: RouteProbe): RegExp {
  return new RegExp(`^${probe.registration.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m");
}

function isRegistered(probe: RouteProbe): boolean {
  return registrationPattern(probe).test(source);
}

/**
 * Slice of the source from a route's registration line to the next top-level
 * `liffRoutes.get/post` line. Empty string when the route is not registered.
 */
function handlerSlice(probe: RouteProbe): string {
  const match = registrationPattern(probe).exec(source);
  if (!match) return "";
  const rest = source.slice(match.index + match[0].length);
  const next = rest.search(/^liffRoutes\.(get|post)/m);
  return next === -1 ? rest : rest.slice(0, next);
}

/** Body of the shared liffScreenHtml function, or null if it is gone. */
function shellBody(): string | null {
  const start = source.indexOf("function liffScreenHtml(");
  if (start === -1) return null;
  const next = source.slice(start).search(/\nfunction |\nexport /);
  return next === -1 ? source.slice(start) : source.slice(start, start + next);
}

describe("LIFF artifact screen route existence", () => {
  it("registers all six artifact screens", () => {
    for (const probe of SCREEN_PROBES) {
      expect(isRegistered(probe), `${probe.path} must be registered in src/routes/liff.ts`).toBe(
        true,
      );
    }
  });

  it("retains the four pre-existing GET routes, root matched exactly", () => {
    for (const path of PREEXISTING_GETS) {
      const registration = path === "/" ? 'liffRoutes.get("/"' : `liffRoutes.get("${path}"`;
      expect(
        registrationPattern({ path, registration }).test(source),
        `${path} must remain registered`,
      ).toBe(true);
    }
  });

  it("does not let the root registration match a nested path", () => {
    // `liffRoutes.get("/"` anchored at line start with the closing quote +
    // separator must not be satisfied by e.g. liffRoutes.get("/calendar".
    expect(/^liffRoutes\.get\("\/",/m.test(source)).toBe(true);
  });
});

describe("LIFF artifact screens render through the shared shell", () => {
  for (const probe of SCREEN_PROBES) {
    it(`renders ${probe.path} through liffScreenHtml`, () => {
      const slice = handlerSlice(probe);
      expect(
        slice.length,
        `${probe.path} must be registered before its handler can be inspected`,
      ).toBeGreaterThan(0);
      expect(
        slice.includes("liffScreenHtml("),
        `${probe.path} must render through liffScreenHtml, not an ad-hoc page`,
      ).toBe(true);
    });
  }
});

describe("LiffShell artifact tokens", () => {
  const body = shellBody();

  it("liffScreenHtml exists", () => {
    expect(body, "function liffScreenHtml must exist in src/routes/liff.ts").not.toBeNull();
  });

  it("carries the artifact header gradient, roundel size, and teal ramp", () => {
    expect(body).not.toBeNull();
    for (const token of SHELL_TOKENS) {
      expect(body?.includes(token), `liffScreenHtml must contain artifact token ${token}`).toBe(
        true,
      );
    }
  });
});

describe("LiffShell legacy palette guard", () => {
  const body = shellBody();

  it("contains no pre-artifact greys or Material reds inside the shell", () => {
    expect(body).not.toBeNull();
    const present = LEGACY_PALETTE.filter((color) => body?.includes(color));
    expect(
      present,
      `legacy palette values found inside liffScreenHtml: ${present.join(", ")}`,
    ).toEqual([]);
  });
});
