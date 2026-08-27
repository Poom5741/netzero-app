# Labeled pipe photos (local only)

Labeled dataset for pipe-report photo classification (issue #92). Excluded from git via
`data/` in `.gitignore`; lives here locally.

## Layout

- `flooded/` — pipe photos showing standing water (`NZC - ขังน้ำ`)
- `dry/` — pipe photos with no water (`NZC - ปล่อยแห้ง`)
- `invalid/` — photos not usable as pipe evidence (`NZC - ภาพไม่ถูกต้อง`)
- `manifest.json` — index of every image

## Manifest format

```json
{
  "version": 1,
  "source_folders": { "<label>": "<original Drive folder name>" },
  "counts": { "flooded": 81, "dry": 68, "invalid": 20 },
  "total": 169,
  "images": [ { "path": "flooded/1.png", "label": "flooded" } ]
}
```

Each `images[]` entry has `path` (relative to this directory) and `label`
(one of `flooded | dry | invalid`, matching `WaterState` minus
`not_applicable` in `src/vision/classifier.ts`). Regenerate with the one-off
command used at creation time if files are added or renamed.
