import { makeSplit } from "../src/vision/split.ts";
import type { BakeoffManifest } from "../src/vision/bakeoff.ts";

const flag = process.argv.indexOf("--data-dir");
const dir = flag >= 0 ? process.argv[flag + 1] : undefined;
if (!dir || dir.includes("..")) throw new Error("Usage: bun scripts/make-split.ts --data-dir <safe directory>");
process.chdir(dir);
const manifest = JSON.parse(await Bun.file("manifest.json").text()) as BakeoffManifest;
const split = makeSplit(manifest);
const count = (rows: typeof split.train) => Object.fromEntries(["flooded", "dry", "invalid"].map((label) => [label, rows.filter((row) => row.label === label).length]));
await Bun.write("split.json", JSON.stringify({ ...split, counts: { train: count(split.train), holdout: count(split.holdout) } }) + "\n");
