/**
 * Issue #103 — Typed approval gate
 * Season approval requires ≥1 verified-or-pre-verified photo of EACH type
 * (prepare, wetdry, harvest). Pre-verified counts unless superseded.
 */
import { describe, expect, it } from "vitest";
import { approveSeason } from "../../src/season/approve";

function mockD1ForTypedGate(opts: {
  seasonStatus?: string;
  photoTypes?: { photo_type: string; verified: boolean; pre_verified: boolean; superseded: boolean }[];
  fertCount?: number;
}) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("SELECT status FROM season_inputs")) {
            return {
              first: async () => (opts.seasonStatus ? { status: opts.seasonStatus } : null),
            };
          }
          if (sql.includes("photo_evidence") && sql.includes("photo_type")) {
            // Return rows for each photo type query
            const typeMatch = sql.match(/photo_type\s*=\s*\?/i);
            if (typeMatch && args.length > 0) {
              // Find the photo_type arg — it's after the plot_id and season_id
              const photoType = args.find((a) => typeof a === "string" && ["prepare", "wetdry", "harvest"].includes(a));
              const matching = opts.photoTypes?.filter((p) => p.photo_type === photoType) ?? [];
              const count = matching.filter((p) => p.verified || (p.pre_verified && !p.superseded)).length;
              return { first: async () => ({ cnt: count }) };
            }
            return { first: async () => ({ cnt: 0 }) };
          }
          if (sql.includes("COUNT") && sql.includes("photo_evidence")) {
            return { first: async () => ({ cnt: opts.photoTypes?.length ?? 0 }) };
          }
          if (sql.includes("COUNT") && sql.includes("fertilizer")) {
            return { first: async () => ({ cnt: opts.fertCount ?? 0 }) };
          }
          return { run: async () => ({ success: true }) };
        },
      };
    },
  };
}

describe("approveSeason — typed gate", () => {
  it("rejects when wetdry photo type is missing", async () => {
    const db = mockD1ForTypedGate({
      seasonStatus: "closed",
      photoTypes: [
        { photo_type: "prepare", verified: true, pre_verified: false, superseded: false },
        { photo_type: "harvest", verified: true, pre_verified: false, superseded: false },
      ],
      fertCount: 1,
    }) as unknown as D1Database;

    const r = await approveSeason(db, "p1", "s1");
    expect(r.success).toBe(false);
    expect(r.missing).toBeDefined();
    expect(r.missing!.some((m: string) => m.includes("wetdry"))).toBe(true);
  });

  it("rejects when all photos of a type are superseded pre-verified", async () => {
    const db = mockD1ForTypedGate({
      seasonStatus: "closed",
      photoTypes: [
        { photo_type: "prepare", verified: false, pre_verified: true, superseded: true },
        { photo_type: "wetdry", verified: true, pre_verified: false, superseded: false },
        { photo_type: "harvest", verified: true, pre_verified: false, superseded: false },
      ],
      fertCount: 1,
    }) as unknown as D1Database;

    const r = await approveSeason(db, "p1", "s1");
    expect(r.success).toBe(false);
    expect(r.missing!.some((m: string) => m.includes("prepare"))).toBe(true);
  });

  it("accepts pre-verified (unsuperseded) photos toward gate", async () => {
    const db = mockD1ForTypedGate({
      seasonStatus: "closed",
      photoTypes: [
        { photo_type: "prepare", verified: false, pre_verified: true, superseded: false },
        { photo_type: "wetdry", verified: false, pre_verified: true, superseded: false },
        { photo_type: "harvest", verified: false, pre_verified: true, superseded: false },
      ],
      fertCount: 1,
    }) as unknown as D1Database;

    const r = await approveSeason(db, "p1", "s1");
    expect(r.success).toBe(true);
  });

  it("accepts mix of human-verified and pre-verified", async () => {
    const db = mockD1ForTypedGate({
      seasonStatus: "closed",
      photoTypes: [
        { photo_type: "prepare", verified: true, pre_verified: false, superseded: false },
        { photo_type: "wetdry", verified: false, pre_verified: true, superseded: false },
        { photo_type: "harvest", verified: true, pre_verified: false, superseded: false },
      ],
      fertCount: 1,
    }) as unknown as D1Database;

    const r = await approveSeason(db, "p1", "s1");
    expect(r.success).toBe(true);
  });

  it("rejects when harvest type is missing entirely", async () => {
    const db = mockD1ForTypedGate({
      seasonStatus: "closed",
      photoTypes: [
        { photo_type: "prepare", verified: true, pre_verified: false, superseded: false },
        { photo_type: "wetdry", verified: true, pre_verified: false, superseded: false },
      ],
      fertCount: 1,
    }) as unknown as D1Database;

    const r = await approveSeason(db, "p1", "s1");
    expect(r.success).toBe(false);
    expect(r.missing!.some((m: string) => m.includes("harvest"))).toBe(true);
  });
});
