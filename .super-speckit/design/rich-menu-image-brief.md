# Brief — Rich menu image for LINE (generate with ChatGPT image)

You generate this. I cannot: the asset is a design decision, and putting my invented pixels in
front of farmers is exactly the kind of thing that should have a human look at it.

## Exact technical spec — these are not negotiable

| Property | Value | Why |
|---|---|---|
| **Canvas** | **2500 × 843 px** | LINE rejects other sizes |
| **Format** | PNG | |
| **Grid** | 3 columns × 2 rows | 6 cells |
| **Cell size** | 833 × 420 px | tap-target bounds are already coded in `src/line/rich-menu.ts` |
| **Total** | 6 cells, no gaps, no margins | LINE splits it exactly on this grid |

**No text baked into the safe area is required** — the labels below are for the image, and LINE
renders the accessible name from the config, not the pixels.

## Cell order — this must match `getRichMenuItems()` exactly

| # | Cell | Glyph | Label | Tap action |
|---|---|---|---|---|
| 1 | top-left | 📋 | กรอกข้อมูลย้อนหลัง | `action=BL_HOME` |
| 2 | top-mid | 📷 | บันทึกงานในแปลง | `action=SEASON_HOME` |
| 3 | top-right | 🔔 | งานที่ต้องทำ | `action=TODO` |
| 4 | bottom-left | 🌾 | แปลงของฉัน | `action=FIELD_LIST` |
| 5 | bottom-mid | 📊 | สรุปผลของฉัน | `action=SUMMARY` |
| 6 | bottom-right | ☎️ | ติดต่อเจ้าหน้าที่ | `action=CONTACT` |

**Getting the order wrong silently misroutes farmers.** The tap bounds are positional — cell 3 in
the image is cell 3 in the config.

## Colors — use these exactly, from the artifact

| Token | Hex | Use |
|---|---|---|
| LINE green | `#06C755` | primary accents, glyphs |
| LINE green dark | `#04A344` | label text |
| White | `#FFFFFF` | cell background |
| Teal-50 | `#E7FCF7` | **cell 3 only** — the "active" state in the artifact |
| Hairline | `#EEF2F6` | 1px cell separators |

The artifact shows cell 3 (*งานที่ต้องทำ*) on `#E7FCF7`, not white. That contrast is intentional.

## Typography

- Label: **11px equivalent** relative to a 833px cell → roughly **48–56px** in the full-size image
- Weight: **semibold/bold**
- Color: `#04A344`
- Centered under the glyph
- **Must not overflow its cell** — Thai text wraps easily

## Prompt you can paste into ChatGPT image generation

```
A flat LINE rich menu image, exactly 2500 by 843 pixels, a 3-column by 2-row grid
of six equal cells, no gaps, no borders around the whole image.

Each cell has a large emoji-style icon centered in the upper area and a short
Thai label centered below it, bold sans-serif, in green #04A344.

Cell backgrounds are white #FFFFFF, except the top-right cell which is very pale
mint #E7FCF7. Thin 1px separators in #EEF2F6 between cells.

Cells in order, left to right, top to bottom:
top-left: clipboard emoji, label "กรอกข้อมูลย้อนหลัง"
top-middle: camera emoji, label "บันทึกงานในแปลง"
top-right: bell emoji, label "งานที่ต้องทำ"
bottom-left: rice plant emoji, label "แปลงของฉัน"
bottom-middle: bar chart emoji, label "สรุปผลของฉัน"
bottom-right: telephone emoji, label "ติดต่อเจ้าหน้าที่"

Flat modern UI, no gradients, no shadows, no 3D, white background.
```

## Before I wire it up, I will check

1. File is exactly 2500×843 (LINE rejects otherwise)
2. Cell 3 is the mint one, in the right position
3. Labels are readable and not clipped
4. Nothing important sits near a cell edge

Then: upload via `POST /v2/bot/richmenu/{id}/content`, and the call site in
`src/line/rich-menu-client.ts` gets wired behind a flag — **not** straight into the
webhook, because a rejected upload would break the welcome flow.

## Where to put it

Any path works; suggest `assets/richmenu/richmenu-2500x843.png`. I will move and wire it.
