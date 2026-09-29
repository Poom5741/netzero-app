# Flow Spec — the artifact's conversation script (43 steps)

Source of truth: `design-artifacts/2026-09-28/line-oa-farmer.html`, module
`5a25b866-38ba-416b-afff-53fe6c36cc28.js` — the file's own header says:

> "Farmer-facing LINE OA script. Copy is taken from the NZC chatbot spec
> (LINE_Chatbot_Flow_AWD · nodes OB-01…OB-11, PJ-00…PJ-13, RP-01…RP-04).
> Each entry is one thing that appears in the conversation, in order."

Parsed: **43 steps**, 25 distinct nodes, types `divider(7) flex(16) oa(9) me(7) photo(4)`.
The artifact UI calls this "10 scenes / 43 steps". This is the flow spec — the screens are
secondary.

## The 43 steps, in order

| # | Node | Type | Content | Actions |
|---|---|---|---|---|
| 1 | — | divider | เพิ่ม NetZeroCarbon เป็นเพื่อนแล้ว | |
| 2 | OB-01 | flex | สวัสดีครับ 🌾 นี่คืน LINE ของ NetZeroCarbon | ผูกบัญชีของฉัน ★ |
| 3 | OB-15 | flex | PDPA consent | อ่านข้อความเต็ม · ยินยอม ★ |
| 4 | — | me | ยินยอม | |
| 5 | OB-02 | oa | ขอเบอร์โทรศัพท์…แชร์ผ่านปุ่มด้านล่าง | |
| 6 | — | me | 081-234-5678 | |
| 7 | OB-03 | flex | สมชาย ใจดี — ใช่ท่านหรือไม่ | ไม่ใช่ · ใช่ ผมเอง ★ |
| 8 | — | divider | ขั้นตอนสมัคร | |
| 9 | OB-05 | oa | ขอให้อ่านและติ๊กยอมรับอีก 3 ข้อ | |
| 10 | OB-05 | flex | ต้องติ๊กครบทุกข้อจึงจะไปต่อได้ | อ่านข้อความเต็ม · ยอมรับทั้ง 3 ข้อ ★ |
| 11 | OB-12 | oa | กรอกข้อมูลของท่านและแปลงนาครับ | |
| 12 | LF-01 | flex | ฟอร์มสมัครเข้าร่วมโครงการ | กรอกข้อมูล ★ |
| 13 | — | me | กรอกข้อมูลเรียบร้อย | |
| 14 | OB-13 | flex | แปลงนี้ต้องแนบเอกสาร 3 รายการ | ดาวน์โหลดแบบฟอร์ม · ถ่ายเอกสาร ★ |
| 15 | OB-10 | flex | รับใบสมัครแล้วครับ ✅ (ยังส่งภาพไม่ได้) | แก้ไขใบสมัคร · กรอกข้อมูลย้อนหลัง ★ |
| 16 | OB-11 | flex | รหัสเกษตรกร SPB-0142 | เริ่มใช้งาน ★ |
| 17 | — | divider | ฤดูโครงการ · นาปี 2569 · ต้องส่งภาพ 4 รอบ | |
| 18 | PJ-00 | oa | พร้อมเริ่มปลูกฤดูนี้แล้วหรือยัง | |
| 19 | — | me | 1 ก.ค. 2569 | |
| 20 | PJ-13 | flex | ฤดูนี้มี 9 ขั้นตอนที่ต้องบันทึก | ดูทั้งปฏิทิน · บันทึกขั้นนี้ ★ |
| 21 | — | divider | วันที่ 28 หลังหว่าน · ภาพรอบที่ 1 (เปียก) | |
| 22 | PJ-02 | flex | ถึงเวลารายงานแล้วครับ | ยังไม่ได้ทำ · ถ่ายภาพส่งเลย ★ |
| 23 | PJ-03 | oa | รอบนี้เป็นช่วงเปียก — ถ่ายให้เห็นท่อ PVC ตอนน้ำเต็ม | |
| 24 | — | photo | WET-1, gps 14.9231,100.1042 · 07:13 | |
| 25 | — | me | 0 ซม. (น้ำเต็ม) | |
| 26 | PJ-07 | oa | รับภาพรอบที่ 1 (เปียก) แล้ว ✅ เหลืออีก 3 ภาพ | |
| 27 | — | divider | วันที่ 42 · ภาพรอบที่ 1 (แห้ง) | |
| 28 | PJ-02 | flex | ปล่อยน้ำแห้งรอบแรกได้แล้ว | ขอดูวิธีถ่าย · ถ่ายภาพส่งเลย ★ |
| 29 | — | photo | DRY-1, gps 14.9231,100.1042 · 07:41 | |
| 30 | PJ-04 | oa | น้ำในท่ออยู่ต่ำกว่าผิวดินกี่เซนติเมตร | |
| 31 | — | me | 10 ซม. | |
| 32 | PJ-06 | flex | แปลงนาหลังบ้าน · DRY-1 (SG-05) | ถ่ายภาพใหม่ · ส่งข้อมูล ★ |
| 33 | PJ-08 | flex | ครอปนี้ส่งแล้ว 2 จาก 4 ภาพ | ดูสรุปแปลง ★ |
| 34 | — | divider | วันที่ 61 · ภาพรอบที่ 2 (เปียก) | |
| 35 | — | me | [ส่งรูปจากคลังภาพ] | |
| 36 | SY-03 | oa | ภาพที่ส่งทางแชตใช้เป็นหลักฐานไม่ได้ — ไม่มีพิกัดและเวลา | |
| 37 | — | photo | WET-2, gps 14.9230,100.1043 · 08:05 | |
| 38 | PJ-09 | flex | เหตุผล: เป็นช่วงเปียก แต่ในภาพน้ำแห้งแล้ว | สอบถามเจ้าหน้าที่ · ถ่ายใหม่ ★ |
| 39 | — | photo | WET-2, gps 14.9230,100.1043 · 06:48 | |
| 40 | PJ-07 | oa | รับข้อมูลแล้ว ✅ ตรวจภายใน 1-2 วัน — เหลืออีก 1 ภาพ | |
| 41 | — | divider | งานที่ต้องทำ | |
| 42 | RP-01 | flex | เหลือ 3 เรื่องที่ต้องทำ | กรอกย้อนหลัง · บันทึกกิจกรรม ★ |
| 43 | RP-03 | flex | แปลงนาหลังบ้าน · 14.0 ไร่ | ดูประวัติการส่ง · เปิดแดชบอร์ดของฉัน ★ |

★ = primary action.

## What the flow encodes that a static screen does not

1. **Alternating wet/dry photo rounds.** SG-04 wet → SG-05 dry → SG-07 wet → SG-08 dry.
   Credit is reduced automatically if fewer than 4 photos land.
2. **GPS + time are mandatory evidence.** Step 35 deliberately sends a gallery image and the bot
   rejects it (SY-03) because it has no coordinates. Step 38 then rejects a *correct-time* photo
   for being a wet round taken in a dry state (PJ-09).
3. **Registration blocks photo work.** Step 15 says so explicitly: ระหว่างนี้ยังส่งภาพกิจกรรมไม่ได้ —
   during review, backfill entry is the only allowed activity.
4. **Backfill is offered twice** (steps 15 and 42) as the fallback while review or credit-lock
   is pending.

## Gap analysis against the current bot

| Artifact node | Current code | Status |
|---|---|---|
| OB-01 … OB-03, OB-05, OB-10 … OB-13 | `flex-builders.ts`, `flow-registration.ts` | present |
| OB-15 PDPA consent | `consent.ts` | present |
| LF-01 | `/liff/register` | present |
| PJ-00, PJ-02 … PJ-09 | `flow-photo-reporting.ts`, `calendar-api.ts`, `results-api.ts` | present |
| PJ-13 9-step intro | `buildCalendarBubble` | present |
| RP-01, RP-03 | `backfill-api.ts`, `dashboard-api.ts` | present as chat messages |
| PJ-09 wet/dry mismatch rejection | `photo.ts` | present |
| 7 dividers | `chatDivider()` | present |
| SY-03 gallery-image rejection | — | **to verify** |

**Conclusion: the flow logic is largely implemented already.** The remaining gap is presentation
fidelity — exact copy, hero tones, action labels, dividers — plus the LIFF screens the flow
deep-links into.
