# Spec — NetZeroCarbon POC: LINE AWD Carbon Credit (3 เฟสในโฟลว์เดียว)

> **status:** ready-for-agent
> **date:** 2026-08-19
> **docs:** อ่านประกอบกับ [`2026-08-19-line-awd-carbon-poc-design.md`](./2026-08-19-line-awd-carbon-poc-design.md) (schema/architecture เต็ม) และ glossary `CONTEXT.md`
> **tracker:** ยังไม่มี issue tracker ใน workspace — เมื่อมี tracker ให้ขึ้นเป็น issue + tag `ready-for-agent`

---

## Problem Statement

ปัจจุบันการเก็บข้อมูลการทำนาสำหรับคำนวณคาร์บอนเครดิต AWD ยังไม่มีการไหลของข้อมูลที่พิสูจน์ได้ครบทั้งโซ่ตั้งแต่เกษตรกร → หลังบ้าน → ผู้สนับสนุน โดยต้องพึ่งการติดตั้งแอปแยกและเชื่อมต่อระบบหลายจุด ทีมงานยังไม่มีหลักฐานว่า "ข้อมูลที่เก็บได้จาก LINE จะนำไปเป็นตัวเลขคาร์บอนที่ขายได้จริง" ทั้งต้นทุนและความเสี่ยงของการ integration ยังไม่ถูกทดสอบ

ตัวเลขคาร์บอนจะขายได้ต้องมีคุณสมบัติ 3 อย่างที่ระบบต้องพิสูจน์ตั้งแต่ต้น: **traceable** (ทุกตัวเลขมีที่มาที่ไป) · **deterministic** (ค่าที่เก็บเป็นฟิลด์โครงสร้าง ไม่ใช่ประโยค) · **human-verifiable** (มีคนรับรองเป็นขั้นสุดท้าย) — และ automation ต้องไม่ไปทำลายสามอย่างนี้

## Solution

สร้าง POC แบบ **thin vertical slice** — หนึ่ง worker บน Cloudflare Workers + D1 + R2 ที่ทำให้ **ทั้ง 3 เฟสไหลต่อกันในโฟลว์เดียว**:

- **เฟส 1** — เกษตรกรผูกบัญชี LINE, ถ่ายภาพหลักฐานผ่าน LIFF (สด + GPS + time), คุยกับแชทบอตเพื่อกรอกข้อมูลปุ๋ย, สรุปฤดู
- **เฟส 2** — AI ตรวจภาพ 3 ทาง (pass/flag/reject) เพื่อลดภาระแอดมิน, แอดมินตรวจ + อนุมัติ, calc engine คำนวณตามสมการ TGO จริง
- **เฟส 3** — แดชบอร์ดผู้สนับสนุนแสดงเครดิต + คณิตแบบ live + export

กฎบังคับ: **ตัวเลขเฟส 2 ต้องมาจากข้อมูลเฟส 1 ผ่าน calc engine เท่านั้น และหน้าจอเฟส 3 ต้องเรนเดอร์ผลที่เก็บในเฟส 2 เท่านั้น — ไม่มี hardcode** AI เป็นผู้ช่วยลดงาน แต่ไม่ใช่ผู้ตัดสินใจขั้นสุดท้าย (human stamp ยังอยู่)

## User Stories

1. ในฐานะ **เกษตรกร** ฉันเพิ่มเพื่อน LINE "NetZeroCarbon" แล้วเห็นข้อความต้อนรับ ฉันจึงรู้ว่าบัญชีนี้คืออะไรและใช้ทำอะไร
2. ในฐานะ **เกษตรกร** ฉันแชร์เบอร์โทร และระบบจับคู่กับทะเบียนของฉัน ฉันจึงไม่ต้องกรอกข้อมูลซ้ำ
3. ในฐานะ **เกษตรกร** ฉันยอมรับข้อตกลง 4 ข้อด้วยการแตะเดียว ฉันจึงเริ่มใช้งานได้ทันที
4. ในฐานะ **เกษตรกร** ที่ถือหลายแปลง ฉันเลือกว่า**จะทำงานแปลงไหน**ก่อนทุกงาน ฉันจึงไม่ปนข้อมูลระหว่างแปลง
5. ในฐานะ **เกษตรกร** ฉันถ่ายภาพแปลงแบบสดผ่านกล้องในระบบพร้อมพิกัดและเวลาอัตโนมัติ ฉันจึงมีหลักฐานว่าถ่ายที่นี่จริงในเวลานี้
6. ในฐานะ **เกษตรกร** ฉันพิมพ์ข้อความภาษาปาก "ใส่ปุ๋ย 46-0-0 25 โล" แล้วบอตแปลงเป็นแบบฟอร์มให้ฉัน**ยืนยันหรือแก้**ก่อนบันทึก ฉันจึงกรอกเร็วขึ้นโดยไม่พลาด
7. ในฐานะ **เกษตรกร** ฉันถามบอตว่า "ต้องทำอะไรต่อ" "ถ่ายรูปทำไม" แล้วได้คำตอบที่เป็นธรรมชาติ ฉันจึงใช้ระบบได้โดยไม่ต้องอ่านคู่มือ
8. ในฐานะ **เกษตรกร** บอตคำนวณ %N และไนโตรเจนให้อัตโนมัติจากสูตรที่ฉันเลือก/พิมพ์ ฉันจึงไม่ต้องคิดเลขเอง
9. ในฐานะ **เกษตรกร** ฉันกรอกตัวเลขสรุปฤดู (ระดับน้ำ ผลผลิต น้ำมัน ไฟฟ้า ฟาง) ด้วยปุ่ม/จำนวนในหน้า LIFF ฉันจึงกรอกตัวเลขสั้นได้เร็ว
10. ในฐานะ **เกษตรกร** ฉันเห็นภาพถูกตีกลับพร้อมเหตุผล และถ่ายใหม่ได้ ฉันจึงแก้หลักฐานได้เองโดยไม่ต้องหาคนช่วย
11. ในฐานะ **แอดมิน** ฉันเห็นเฉพาะภาพที่ AI flag ขึ้นบนสุด ฉันจึงไม่ต้องไล่ดูภาพดี ๆ ที่ผ่านเอง
12. ในฐานะ **แอดมิน** ฉันเห็นภาพ + พิกัดบนแผนที่เล็ก + เหตุผลของ AI (label/confidence) ฉันจึงตัดสินใจได้เร็วขึ้น
13. ในฐานะ **แอดมิน** ฉันกดผ่าน/ตีกลับภาพ พร้อมเหตุผล ฉันจึงเป็นคนตัดสินใจขั้นสุดท้าย (ไม่ใช่ AI)
14. ในฐานะ **แอดมิน** ฉันอนุมัติฤดูของแปลงเฉพาะเมื่อภาพครบ verify + ปุ๋ยครบ + ข้อมูลฤดูครบ ฉันจึงรับรองเฉพาะข้อมูลที่สมบูรณ์
15. ในฐานะ **แอดมิน** ฉันเห็นว่าข้อมูลโดนล็อกหลังอนุมัติ และแก้ทีหลังได้ผ่าน override ที่สร้างเวอร์ชันใหม่ ฉันจึงรักษา audit trail ของตัวเลข
16. ในฐานะ **แอดมิน** ฉันเห็น audit (farmer_message, ai_event, estimate versions) ของแต่ละคน/แปลง ฉันจึงตรวจย้อนได้
17. ในฐานะ **ผู้สนับสนุน** ฉันเข้าดู dashboardsแบบ read-only แยกจากแอดมิน ฉันจึงเห็นตัวเลขโดยไม่แก้ไขอะไรได้
18. ในฐานะ **ผู้สนับสนุน** ฉันเห็นเครดิต tCO2e ต่อแปลง + คณิตแบบ live (SF_w, ไนโตรเจน) ฉันจึงเชื่อใจว่าตัวเลขมาจากไหน
19. ในฐานะ **ผู้สนับสนุน** ฉันเห็นตัวเลขติดป้าย "ค่าประมาณ · ยังไม่ผ่านการทวนสอบ" ฉันจึงไม่เข้าใจผิดว่าเป็นเครดิตที่รับรองแล้ว
20. ในฐานะ **ผู้สนับสนุน** ฉัน export ผลคำนวณเป็น JSON/CSV ฉันจึงนำไปใช้ต่อได้
21. ในฐานะ **ผู้แยกดูงาน** (quality evaluator) ตัวเลข calc ของ POC ตรงกับไฟล์ Excel การคำนวณ AWD จริง ฉันจึงไว้ใจได้ว่าวิธีถูกต้อง
22. ในฐานะ **ผู้ทำ demo** เพื่อน/ตั๋วเข้าไปทาง magic link เป็น test-farmer โดยไม่ต้องใช้เบอร์จริง ฉันจึงสาธิต onboarding ได้ทุกครั้ง

## Implementation Decisions

- **Platform/stack (D2):** หนึ่ง Cloudflare Worker (Hono) + D1 (SQLite) + R2 (ภาพ) + AI Gateway (สลับโมเดลได้) — server static dashboard จาก worker เดียวกัน
- **หลายแปลงต่อเกษตรกร (D7):** `plots` เป็นตารางแยก `(farmer_id, plot_code UNIQUE)`; photo/fertilizer/season_inputs/carbon_estimates อ้าง `plot_id` — ทุกงานรายแปลง
- **สองฤดูจริง (D8):** `season = '<ปี>-napi' | '<ปี>-naprang'`; POC ทดสอบ 1 ฤดู/แปลง end-to-end
- **AI chat — 3 ระดับรวม (D3, D13):**
  - Level C: ตอบคำถาม/แนะนำ/นำทาง ไม่เขียนข้อมูลลง DB
  - Level A+B: พิมพ์ข้อความ → LLM draft JSON → **หน้า confirm → ระบบ validate → เขียน DB** (บันทึก raw → draft → confirmed ครบใน `farmer_messages`)
  - Guardrail: draft ผ่าน validation ชุดเดียวกับปุ่ม · confidence ต่ำ/validate fail → fallback เมนูปุ่ม · โควตา token/คน/ฤดู ก่อนเรียก AI (นับใน `ai_events`)
  - ขอบเขต: chat = ผู้ช่วยนำทาง + ข้อมูลปุ๋ยเท่านั้น · voice/STT ไม่อยู่ใน POC
- **Vision screening (D4):** ทุกภาพ → pass/flag/reject + label + reason + confidence + model_version → admin_review_queue; **admin เท่านั้นเขียน `admin_status`**; `ai_status=reject` เน้นบนสุด ไม่ block การตัดสินใจ admin; ตีกลับ → flex ให้เกษตรกรถ่ายใหม่
- **Calc — TGO จริง (D5, D12):** module แยก (`calc/*`) — CH₄ (SF_w/SF_p/SF_o) · N₂O (ตรง+อ้อม) · CO₂ (ยูเรีย/ปูน/เชื้อเพลิง/ไฟฟ้า) · burning · BL vs PJ · factors ทั้งหมดรวมในไฟล์ config คำเดียว อ้าง cell ต้นทางจาก Excel
  - methodology factors = ของจริงจาก Excel; **baseline activity defaults = placeholder ที่ตั้งค่าได้** ติดป้ายชัดเจน "ค่าเริ่มต้น · ยังไม่ผ่านทวนสอบ"
  - golden fixtures: calc ต้อง reproduce 3-5 แถวจาก Excel ภายใน tolerance
- **Freeze-on-approve (D9):** ข้อมูล plot-season ถูกล็อกหลัง approve; override → สร้าง `carbon_estimates` version ใหม่ + เก่าขึ้น `superseded` + บันทึกเหตุผล
- **Auth (D11):** email+password (hash ใน D1) + session cookie + role `admin`/`sponsor`; sponsor read-only; seed บัญชี demo
- **Demo/seed (D10):** `seed.ts` ใส่สถานะผสม (ครบ/flag/reject/ว่าง) ผ่านทางเดิม (ไม่มีตาราง fake) + magic-link test-farmer
- **Data model:** ตาม design doc §5 (farmers, plots, line_links, photo_evidence, fertilizer_entries, season_inputs, farmer_messages, carbon_estimates, ai_events, users) — `ai_status` ≠ `admin_status` เสมอ

## Testing Decisions

หลักการ: **ทดสอบพฤติกรรมภายนอก ไม่ใช่โครงสร้างภายใน** — spec/API contract เปลี่ยนได้ แต่พฤติกรรมที่ผู้ใช้เห็นต้องคงที่

สอง seams (ตกลงกับผู้ใช้แล้ว):

- **Seam 1 — black-box HTTP flow test (หลัก):** ขับทั้ง vertical slice ผ่าน public HTTP surface ของ worker เท่านั้น — จำลอง webhook LINE (onboarding → ถ่ายภาพ → ข้อความปุ๋ย) → เรียก admin API (review flag → approve) → assert sponsor API คืนค่า estimate ที่ถูก ครอบคลุม happy path เต็มโฟลว์ (webhook → LIFF → vision → queue → admin → calc → sponsor)
- **Seam 2 — calc golden fixtures:** ทดสอบ module `calc` แยก เพื่อ reproduce 3-5 แถวจาก `การคำนวณ AWD.xlsx` ภายใน tolerance — เพราะ calc เป็นส่วนที่แม่นยำสุดของตัวเลข ต้อง fail เร็วและดังอิสระจาก full stack

รองรับด้วย: parser LLM fixtures (ไทยปาก/ปนตัวเลข) · GPS/validation · AI eval ชุดภาพ (precision/recall; reject ไม่พลาดภาพดีเกิน 5%)

## Out of Scope

- Baseline ย้อนหลัง 3 ปี (ใช้ค่าเริ่มต้น + ป้ายกำกับ) · เอกสารสิทธิ์ 6 ประเภท + ฟอร์มบริษัท · ภาพดาวเทียม/โดรน + KML boundary · ปฏิทิน 9 ขั้น SG เต็มรูปแบบ · voice/STT · Batch approve (YAGNI) · audit log ระดับ row ครบทุกตาราง · Rich Menu 7 ปุ่ม · รายงานฟอร์ม TGO ฉบับเต็ม · fake demo table (ห้าม)

## Further Notes

- เมื่อมี issue tracker ให้นำ spec นี้ขึ้น + tag `ready-for-agent`
- ความเสี่ยงเปิดเผย: คุณภาพโมเดลไทย 8B (รับได้เพราะ farmer ยืนยันทุกค่า) ⋅ baseline ค่าเริ่มต้น ≠ ข้อมูลจริง (กลไกถูกต้อง) ⋅ LINE OA ยังไม่ได้สร้าง (blocker field test) ⋅ EF/GWP บางค่าต้องปักหมุดกับไฟล์ต้นฉบับตอน implement
- ประมาณการ: ~15.5 วัน (1 dev)
