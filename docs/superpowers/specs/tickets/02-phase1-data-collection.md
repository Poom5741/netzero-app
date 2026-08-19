# Ticket 2 — Phase 1: Farmer Data Collection

> **status:** ready-for-agent
> **date:** 2026-08-19
> **depends on:** ticket 1 (foundation)
> **master spec:** [`../2026-08-19-line-awd-carbon-poc-spec.md`](../2026-08-19-line-awd-carbon-poc-spec.md) · **design doc:** [`../2026-08-19-line-awd-carbon-poc-design.md`](../2026-08-19-line-awd-carbon-poc-design.md)

## Purpose

ให้เกษตรกรกรอกข้อมูลการทำนาผ่าน LINE ครบ: ผูกบัญชี, ยินยอม, เลือกแปลง, ถ่ายภาพหลักฐานผ่าน LIFF (สด+GPS+time), คุยกับบอตเพื่อกรอกปุ๋ย, และสรุปฤดู — ข้อมูลทุกชิ้นเป็นโครงสร้าง policy-based และมี audit

## Problem

ไม่มีกลไกให้เกษตรกรป้อนข้อมูล ที่พิสูจน์ได้ว่ามาจากเหตุการณ์จริง (ถ่ายสด ณ จุด/เวลา) และสะดวกพอ (คุยกับบอต) โดยไม่ทำลายความเป็นระเบียบของข้อมูล

## User Stories

1. ในฐานะ **เกษตรกร** ฉันเพิ่มเพื่อน LINE แล้วเห็นข้อความต้อนรับที่บอกว่าระบบคืออะไร/ใช้เวลานานแค่ไหน
2. ในฐานะ **เกษตรกร** ฉันแชร์เบอร์ และระบบจับคู่กับทะเบียน ฉันจึงไม่ต้องกรอกซ้ำ
3. ในฐานะ **เกษตรกร** ฉันติ๊กยอมรับเงื่อนไข 4 ข้อ ฉันจึงเริ่มใช้ได้
4. ในฐานะ **เกษตรกร** ที่ถือหลายแปลง ฉันเลือกแปลงก่อนทำงาน ฉันจึงไม่ปนข้อมูล
5. ในฐานะ **เกษตรกร** ฉันถ่ายภาพแปลงสดผ่านกล้องในระบบพร้อม GPS+time ฉันจึงมีหลักฐานจริง
6. ในฐานะ **เกษตรกร** ฉันถ่ายภาพไม่ได้ถ้าไม่เปิดตำแหน่ง/GPS แม่นยำต่ำ ฉันจึงไม่สร้างหลักฐานไร้ค่า
7. ในฐานะ **เกษตรกร** ฉันพิมพ์ "ใส่ปุ๋ย 46-0-0 25 โล" แล้วบอตกรอกแบบฟอร์มให้ฉันยืนยัน/แก้ ฉันจึงกรอกเร็วขึ้น
8. ในฐานะ **เกษตรกร** ฉันถามบอต "ต้องทำอะไรต่อ" แล้วได้คำแนะนำ ฉันจึงเดินตามขั้นตอนได้เอง
9. ในฐานะ **เกษตรกร** บอตคำนวณ %N และไนโตรเจนให้อัตโนมัติ ฉันจึงไม่คิดเลขเอง
10. ในฐานะ **เกษตรกร** ฉันกรอกตัวเลขสรุปฤดู (ระดับน้ำ/ผลผลิต/น้ำมัน/ไฟฟ้า/ฟาง) ผ่าน LIFF ฉันจึงกรอกตัวเลขสั้นได้เร็ว
11. ในฐานะ **เจ้าหน้าที่/admin** ที่กรอกแทน ฉันเลือกคน+แปลงแล้วกรอกแทนได้ (ระบุตัวผู้ทำ) ฉันจึงช่วยเกษตรกรที่ใช้ LINE ไม่คล่อง

## Implementation Decisions

- **ผูกบัญชี:** follow → welcome flex → PDPA(รวม 4 ข้อ) → แชร์เบอร์ (LIFF) → จับคู่ `farmers.phone` → `line_links` ขึ้น `pending_verify` → mock การยืนยันโดยผู้ประสานงาน (POC ใช้ magic-link test-farmer ยืนยันทันที)
- **หลายแปลง (D7):** `plots.html` หน้ารายการแปลง → ลิงก์ไปงานของแปลงนั้น (pass `plot_id` ผ่าน query param/state)
- **LIFF camera (LF-04 core):** capture (ไม่ใช่ input type=file จากคลัง) → `navigator.geolocation.getCurrentPosition({enableHighAccuracy:true})` + accuracy → timestamp ฝั่ง server → upload ไป route photo ของ worker → R2 + บันทึก `photo_evidence`
- **Chat AI (D3, D13):**
  - Level C: text message → LLM prompt (บริบทว่า farmer อยู่ขั้นไหน) → ตอบข้อความ/แนะนำ — ไม่เขียน DB
  - Level A+B: ข้อความที่เจตนากรอกข้อมูลปุ๋ย → LLM → JSON draft `{formula, amount, ...}` → หน้า confirm (LIFF) → farmer ยืนยัน/แก้ → **validate (range, unit, is_urea, required)** → เขียน `fertilizer_entries` + บันทึก `farmer_messages` ครบ (raw→draft→confirmed)
  - Guardrail โค้ด: draft ต้องผ่าน validation ชุดเดียวกับปุ่ม · confidence ต่ำ/validate fail → ตอบกลับให้แตะปุ่ม · โควตา token ต่อคนต่อฤดูก่อนเรียก AI (ดู `ai_events` / ตั้งค่าคงที่ใน config)
- **สรุปฤดู (LIFF):** `summary.html` — ระดับน้ำท่อ, ฟาง, น้ำมัน (+ประเภท), ไฟฟ้า, ผลผลิต ต่อแปลงต่อฤดู → ปิดฤดู → `season_inputs` (สถานะ `open` → `closed`)
- **ไทย UI** ตัวอักษร/ปุ่มใหญ่ (IS-09)

## Testing Decisions

- **Seam 2 (calc module not here — calc อยู่ ticket 3)**
- **Seam 1 (black-box):** จำลอง webhook: follow → แชร์เบอร์ → consent → select plot → upload photo (mock GPS) → ส่งข้อความปุ๋ยภาษาไทย → confirm → ส่ง season summary → ปิดฤดู → assert ทุกตารางถูกต้อง (photo_evidence มี GPS+time, fertilizer_entries %N/N ถูก, farmer_messages มี draft+confirmed)
- **parser LLM fixtures:** ชุดข้อความไทย (เต็มประโยค, ปนตัวเลข, "เหมือนครั้งก่อน") → ค่าที่คาด ครอบคลุม pass/fail
- **GPS/validation:** accuracy สูงเกินเกณฑ์ → ปิดถ่าย; draft นอก range → reject → fallback ปุ่ม
- ความสำเร็จ: 1 เกษตรกรครบ happy path เฟส 1 ได้ข้อมูลทุกตารางที่ถูกต้อง

## Out of Scope

- Vision screening (ticket 3, อยู่หลัง upload)
- Calc (ticket 3)
- Admin approve/freeze (ticket 3)
- เอกสารสิทธิ์/ข้อมูลย้อนหลัง 3 ปี (non-goal ภาพรวม)
