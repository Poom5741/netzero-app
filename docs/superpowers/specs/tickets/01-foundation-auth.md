# Ticket 1 — Foundation & Auth

> **status:** ready-for-agent
> **date:** 2026-08-19
> **depends on:** —
> **master spec:** [`../2026-08-19-line-awd-carbon-poc-spec.md`](../2026-08-19-line-awd-carbon-poc-spec.md) · **design doc:** [`../2026-08-19-line-awd-carbon-poc-design.md`](../2026-08-19-line-awd-carbon-poc-design.md)

## Purpose

สร้างรากฐานของระบบที่ทุก ticket ต่อยอด: โปรเจกต์ Cloudflare Worker หนึ่งตัว, schema D1 เต็มรูป, storage R2, LINE OA/webhook, และ auth แยกสิทธิ์ admin/sponsor — ทั้งหมดเป็นของจริง ใช้ร่วมกันทั้ง 3 เฟส

## Problem

ไม่มีโครงที่ 3 เฟสจะแชร์กันได้ — ถ้า schema/worker/auth ไม่ตรงกันก่อน งานทุกชิ้นจะแก้ย้อนหลังแพง ต้องวาง seam ร่วมก่อนจากศูนย์

## User Stories

1. ในฐานะ dev ฉัน deploy หนึ่ง Worker ไป Cloudflare และมี D1 + R2 ผูกกับมัน ฉันจึงรันทั้งระบบจากที่เดียว
2. ในฐานะ dev ฉันรัน migration schema D1 ได้ ฉันจึงสร้างตารางทั้งหมดล่วงหน้า
3. ในฐานะ dev ฉันมี LINE OA "NetZeroCarbon" ที่รับ webhook และตอบกลับได้ ฉันจึงทดสอบข้อความจริงได้
4. ในฐานะ **แอดมิน** ฉันล็อกอินด้วย email+password ฉันจึงเข้าคิวตรวจได้
5. ในฐานะ **ผู้สนับสนุน** ฉันล็อกอินได้แบบ read-only ฉันจึงเห็นข้อมูลโดยแก้ไม่ได้
6. ในฐานะ dev ฉัน seed บัญชี `admin`/`sponsor` demo (password ตั้งผ่าน env) ฉันจึงเปิดระบบให้ทีมได้ทันที

## Implementation Decisions

- หนึ่ง Cloudflare Worker (Hono) + bindings: D1 (`DB`), R2 (`PHOTOS`), secrets: `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`, `ADMIN_PASSWORD`, `SPONSOR_PASSWORD`, AI Gateway (`AI`)
- Schema D1 ตาม design doc §5 ทั้ง 10 ตาราง (farmers, plots, line_links, photo_evidence, fertilizer_entries, season_inputs, farmer_messages, carbon_estimates, ai_events, users) + migration runnable
- LINE webhook: verify signature (LINE_CHANNEL_SECRET), จัดการ `follow`/`postback`/`message(text)` events, reply/push ผ่าน LINE Messaging API, กัน replay ด้วย `X-Line-Retry-Key`
- Auth: password hash ใน D1 (`users.password_hash` bcrypt/scrypt), session cookie (HttpOnly, Secure), middleware ตรวจ role — `admin` vs `sponsor`; ทุก route ที่เป็น admin/sponsor ต้องผ่าน gate นี้
- Serve static dashboard (admin/sponsor) จาก worker เดียวกัน (static assets)
- Router smoke test: แต่ละ route respond ถูก status

## Testing Decisions

- **Seam 1 (black-box):** เดิน HTTP ต่อ worker — login admin → ปกป้อง route trial (401 ถ้าไม่มี token, บล็อก role ผิด) → webhook signature fail = 401
- **Seam 2:** —
- ความสำเร็จ: schema migrate ได้ 10 ตาราง, LINE webhook respond, auth แยก role ได้จริง, static pages เปิดได้

## Out of Scope

- UI เต็มของ admin/sponsor (อยู่ ticket 3/4) — ที่นี่แค่ route + auth + static shell
- งาน fuctional ของไร่/ภาพ/ปุ๋ย/คำนวณ (ticket 2-4)
