# Design Spec — POC: LINE AWD Carbon Credit (3 เฟสในโฟลว์เดียว)

> **วันที่:** 19 ส.ค. 2569
> **สถานะ:** ร่างเพื่อทบทวน (draft for review)
> **อ้างอิง:** โปรเจกต์ทำนาลดโลกร้อน (AWD) — LINE OA "NetZeroCarbon" · เอกสารชุด LINE_AWD v3.2 · methodology T-VER-P-METH-13-08 (ฉบับ 25 ก.ย. 2567)

---

## 1. เป้าหมายของ POC

พิสูจน์ว่า **ห่วงโซ่ข้อมูลครบ 3 เฟสต่อกันได้จริงในโฟลว์เดียว**:

```
เฟส 1 (เก็บข้อมูล)  →  เฟส 2 (ตรวจ + คำนวณ)  →  เฟส 3 (แสดงต่อผู้สนับสนุน)
```

หลักการบังคับ: **ตัวเลขเฟส 2 ต้องมาจากข้อมูลเฟส 1 ผ่าน calc engine เท่านั้น และหน้าจอเฟส 3 ต้องเรนเดอร์ผลที่เก็บไว้ในเฟส 2 เท่านั้น — ห้ามมีตัวเลขโชว์แบบ hardcode ที่ไหนในระบบ**

POC ใช้ได้กับ 3 กลุ่มผู้ชมพร้อมกัน (stakeholder demo · farmer field test · technical proof) ที่ระดับ 10+ เกษตรกร บน Cloudflare Workers + D1 + R2

## 2. ขอบเขต (Vertical Slice — บางแต่ครบทั้งโซ่)

### เฟส 1 (ย่อจาก 71 งานเหลือแกนที่จำเป็น)
| ส่วน | ใน POC |
|------|--------|
| ผูกบัญชี | เพิ่มเพื่อน → ทักทาย → แชร์เบอร์ → จับคู่ทะเบียน (seed CSV 10+ คน) |
| Consent | 1 การ์ดรวม 4 ข้อ (ย่อจาก CS-01~04) — ติ๊กยอมรับทั้งหมด |
| Registration | ยืนยันข้อมูลจากทะเบียน (ไม่กรอกใหม่) |
| ภาพหลักฐาน | 3 กิจกรรม: เตรียมแปลง · เปียก-แห้ง (ท่อวัดระดับ) · เก็บเกี่ยว — ถ่ายสดผ่าน LIFF พร้อม GPS + timestamp |
| ปุ๋ย | 1 ครั้ง/ฤดู: เลือกสูตรหรือพิมพ์เอง → %N อัตโนมัติ → N อัตโนมัติ → ภาพถุง (ย่อจาก 3 ครั้ง) |
| น้ำ/ฟาง/พลังงาน | ระดับน้ำท่อ · วิธีจัดการฟาง · น้ำมัน/ไฟฟ้า (ย่อจาก SG 9 ขั้นเป็น 1 ฟอร์มสรุป) |
| **AI chat** (D13) | ผู้ช่วยนำทางทุกขั้น (Level C) + รับพิมพ์ข้อความแปลงเป็น draft ปุ๋ย (Level A+B กับ guardrail ยืนยัน) — chat ไม่ทำภาพ/ตัวเลขสรุปฤดู (อยู่ใน LIFF) |

### เฟส 2 (ย่อ)
| ส่วน | ใน POC |
|------|--------|
| AI ตรวจภาพ 3 ทาง | pass / flag / reject พร้อมเหตุผล → admin เห็นเฉพาะภาพที่ flag |
| หน้า admin | รายการเกษตรกร + ภาพ + GPS บน mini-map + ปุ่ม verify/reject + ปุ่ม approve season |
| Calc engine | สมการ TGO จริง (ดูข้อ 6) — รันเมื่อ approve season |
| ภาพดาวเทียม | **ไม่รวมใน POC** (ตัดออก — ต้องการข้อมูลจริงเพิ่ม) |

### เฟส 3 (ย่อ)
| ส่วน | ใน POC |
|------|--------|
| หน้า sponsor | รายการแปลง/จังหวัด → กดดูเครดิต tCO2e + หลักฐานภาพ + คณิตแบบ live |
| Export | ปุ่ม export JSON/CSV ของผลคำนวณต่อแปลง |
| รายงานฟอร์ม TGO | **ไม่รวมใน POC** (เป็นงานเฟส 3 เต็มรูปแบบ) |

## 3. การตัดสินใจหลัก (Design Decisions)

| # | เรื่อง | การตัดสินใจ | เหตุผล |
|---|-------|--------------|--------|
| D1 | แนวทาง POC | Thin vertical slice (Approach A) | พิสูจน์ทั้งโซ่ด้วยต้นทุนต่ำสุด ~2 สัปดาห์; integration ถูกออกแบบตั้งแต่ต้น |
| D2 | Platform | Cloudflare Workers + D1 + R2 (1 worker เดียว) | edge ใกล้ไทย, cold-start เดียว, shared DB 1 ชุด, ops ง่าย |
| D3 | Chat AI | Level A+B + C กับ guardrail: **AI กรอก → เกษตรกรยืนยัน → ระบบ validate → เขียน DB** | อัตโนมัติสูงสุดที่ยังรักษา audit trail และความเป็นระเบียบของข้อมูล |
| D4 | Image AI | 3-way screening: pass/flag/reject พร้อมเหตุผล | ลดภาระ admin ~70-80%; final stamp ยังเป็นคน |
| D5 | การคำนวณ | สมการ TGO จริง (Tier-1 default) โดย baseline ใช้ค่าเริ่มต้น (default-based) และติดป้ายชัดเจนว่า "ยังไม่ผ่านทวนสอบ" | methodology ถูกต้อง, ซื่อสัตย์กับสถานะข้อมูล |
| D6 | ภาษา UI | ไทยทั้งหมด (ตัวหนังสือใหญ่ ปุ่มใหญ่ ตาม IS-09) | กลุ่มผู้ใช้จริง |
| D7 | จำนวนแปลง | **หลายแปลงต่อเกษตรกร** — `plots` เป็นตารางแยก; หลักฐาน/ปุ๋ย/ฤดูอ้างอิง `plot_id` | ผู้ใช้จริงถือหลายแปลง (R-10: 1-20 ต่อโฉนด); การแยกตารางตั้งแต่ POC กันการ migrate ซับซ้อนภายหลัง |
| D8 | ฤดู | **ใช้ 2 ฤดูจริง (Napi/Naprang)** — `season = '2569-napi'` / `'2569-naprang'` | บาง BL factor ต่างกันรายฤดู; การรวมยอดรายปีต้องแยกฤดู — string label ฟรี แต่กันการ re-meaning ภายหลัง; POC ยังทดสอบแค่ 1 ฤดูต่อแปลง end-to-end |
| D9 | การแก้ไขหลัง approve | **Freeze-on-approve** — หลัง approve ข้อมูล plot-season ถูกล็อก; ถ้าต้องแก้ admin ต้อง override → สร้าง estimate version ใหม่ + เก่าขึ้น `superseded` (เก็บทั้งคู่ใน audit) | ตัวเลข approved ต้อง reproduce ได้จาก input snapshot ที่ frozen — เป็นเรื่องที่ TGO verifier จะตรวจ; กัน audit trail แตกเงียบ ๆ |
| D10 | ข้อมูล demo | ship `seed.ts` สถานะผสม (ครบ/flag/reject/ว่าง) + magic link test-farmer สำหรับ onboarding สาธิต | sponsor page ต้องดูสมจริงตั้งแต่เปิด; demo ไม่พึ่งพาเบอร์โทรจริง; ข้อมูลเส้นทางเดียวกัน (ไม่แยกตาราง fake) |
| D11 | Access control | **In-app email+password** (hash ใน D1, session cookie) + role `admin`/`sponsor`; sponsor เป็น read-only; seed บัญชี demo (password ตั้งได้ผ่าน env) | กันข้อมูลมีค่าดูง่ายเกินไปและแยกสิทธิ์ admin/sponsor โดยไม่เพิ่ม infra (หลีกเลี่ยง Cloudflare Access ชั้นสอง) |
| D12 | การ validate calc | **Golden fixtures** — ถอด 3-5 แถวจาก Excel จริงเป็น fixture → calc ต้อง reproduce ใน tolerance | หลักฐานว่า "สมการ TGO จริง" จริง — จับ error เงียบก่อนผู้ทวนสอบ |
| D13 | ขอบเขตของ chat | **Chat = ผู้ช่วยนำทางทุกขั้น + รับข้อมูลปุ๋ย** (draft→ยืนยัน) · **LIFF = ภาพถ่าย (กล้อง+GPS+time) + ตัวเลขสรุปฤดู** (ระดับน้ำ/ผลผลิต/น้ำมัน/ไฟฟ้า/ฟาง) — typing ตัวเลขสั้นทำแต่ปุ่มได้เร็วกว่า; voice ไม่อยู่ใน POC | ปรับสมดุล "เสมือนคนคุย" กับ UX เกษตรกร และคุมสโคป POC |

**สถานะที่ต้องตรงกันใน POC:** `ai_status` (AI) ≠ `admin_status` (คน) — AI ไม่มีสิทธิ์เขียน admin_status

## 4. สถาปัตยกรรม

```
┌────────────────────────────────────────────────────────────┐
│                  Cloudflare Worker (Hono)                   │
│                                                            │
│  routes/webhook.ts ── LINE Messaging API webhook            │
│      │  follow / postback / message (text+audio)            │
│      ▼                                                     │
│  lib/line.ts ── reply, push, flex cards, rich menu           │
│      │                                                     │
│      ▼                                                     │
│  lib/ai/chat.ts ── Workers AI (LLM)                        │
│      │  • FAQ/guidance (Level C)                            │
│      │  • draft parser (Level A+B) → farmer_messages        │
│      ▼                                                     │
│  routes/liff.ts ── camera.html / confirm / summary           │
│      │  photo upload → R2 + GPS validation                   │
│      │  → lib/ai/vision.ts (3-way screening)                │
│      │  → photo_evidence.ai_status                          │
│      ▼                                                     │
│  lib/calc/*.ts ── methane / n2o / co2 / burning / index     │
│      │  input: season_inputs + fertilizer_entries            │
│      │  output: carbon_estimates (BL vs PJ)                 │
│      ▼                                                     │
│  routes/admin.ts ── review queue (ai_status-filtered)        │
│  routes/sponsor.ts ── plot list + live math view + export    │
│                                                            │
│  D1 (SQLite) · R2 (photos) · AI Gateway (model routing)     │
└────────────────────────────────────────────────────────────┘
```

### โฟลว์หลัก (Vertical Slice Journey)

1. **เกษตรกร** เพิ่มเพื่อน NetZeroCarbon → welcome flex → PDPA รวม 4 ข้อ → แชร์เบอร์ → ระบบจับคู่ seed → ถาม LLM ได้ ("ต้องทำอะไรต่อ?")
2. **เลือกแปลง** รายการของแปลงที่ถือ (เช่น 7218-01, 7218-02) → งานรายแปลง
3. **ถ่ายภาพ** 3 รูปต่อแปลงผ่าน LIFF camera (สด + GPS + time) → vision ตรวจ → ผลเข้า review queue
4. **กรอกปุ๋ย** (chat) พิมพ์ข้อความ → LLM draft → เกษตรกรยืนยัน → N คำนวณ · **สรุปฤดู** (LIFF) ระดับน้ำ ฟาง น้ำมัน ไฟฟ้า ต่อแปลง → ปิดฤดู
5. **Admin** เห็นภาพ flag เท่านั้น + ภาพ pass (สรุป) → verify → **approve season per plot** → calc engine รัน → เก็บ carbon_estimates
6. **Sponsor** เปิดแปลง → เห็น net tCO2e + คณิต live + ปุ่ม export

## 5. Data Model (D1)

```sql
-- เฟส 1
CREATE TABLE farmers (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  province TEXT NOT NULL,
  status TEXT DEFAULT 'active'
);

CREATE TABLE plots (                  -- D7: หลายแปลงต่อเกษตรกร
  id INTEGER PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES farmers(id),
  plot_code TEXT NOT NULL,           -- เช่น '7218-01' (ระบบรันให้)
  area_rai REAL NOT NULL,
  centroid_lat REAL, centroid_lng REAL,
  UNIQUE(farmer_id, plot_code)
);

CREATE TABLE line_links (
  id INTEGER PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES farmers(id),
  line_user_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  consent_ok BOOLEAN DEFAULT FALSE,
  consent_version TEXT,
  verified BOOLEAN DEFAULT FALSE,
  linked_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE photo_evidence (
  id INTEGER PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES farmers(id),
  plot_id INTEGER NOT NULL REFERENCES plots(id),   -- D7
  activity_type TEXT NOT NULL,       -- 'prepare' | 'wetdry' | 'harvest'
  photo_url TEXT NOT NULL,           -- R2 key
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  gps_accuracy REAL,
  captured_at DATETIME NOT NULL,
  ai_status TEXT DEFAULT 'pending',  -- 'pass' | 'flag' | 'reject'
  ai_label TEXT,                     -- 'rice_field','water_tube_visible',...
  ai_reason TEXT,
  ai_confidence REAL,
  model_version TEXT,
  admin_status TEXT DEFAULT 'pending', -- 'pending' | 'verified' | 'rejected'
  reviewed_by TEXT, reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fertilizer_entries (
  id INTEGER PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES farmers(id),
  plot_id INTEGER NOT NULL REFERENCES plots(id),   -- D7
  formula TEXT NOT NULL,             -- '46-0-0' หรือข้อความพิมพ์เอง
  percent_n REAL NOT NULL,
  amount_kg_rai REAL NOT NULL,
  nitrogen_kg_rai REAL NOT NULL,     -- amount × %N ÷ 100
  is_urea BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'menu',        -- 'menu' | 'ai' | 'proxy'
  confirmed_by_farmer BOOLEAN DEFAULT TRUE,
  bag_photo_url TEXT,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE season_inputs (
  id INTEGER PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES farmers(id),
  plot_id INTEGER NOT NULL REFERENCES plots(id),   -- D7
  season TEXT NOT NULL,              -- '2569-napi' / '2569-naprang' (D8)
  water_level_cm REAL,               -- ระดับน้ำท่อ (ลบ = แห้งกว่าดิน)
  straw_mgmt TEXT,                   -- 'plow_under'|'burn'|'bale_sell'|'remove'
  fuel_liters REAL, fuel_type TEXT,  -- 'diesel'|'gasoline'
  electricity_kwh REAL,
  yield_kg_rai REAL,
  closed_at DATETIME
);

CREATE TABLE farmer_messages (       -- audit trail เส้นทาง AI
  id INTEGER PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES farmers(id),
  plot_id INTEGER REFERENCES plots(id),            -- D7 (เมื่อเกี่ยวข้อง)
  channel TEXT,                      -- 'text' | 'audio'
  raw_text TEXT, audio_url TEXT,
  llm_draft JSON,
  validation_result JSON,
  confirmed JSON,                    -- ค่าที่เกษตรกรยืนยัน/แก้
  final_values JSON,
  status TEXT DEFAULT 'draft',       -- 'draft'|'confirmed'|'rejected'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- เฟส 2
CREATE TABLE carbon_estimates (
  id INTEGER PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES farmers(id),
  plot_id INTEGER NOT NULL REFERENCES plots(id),   -- D7
  season TEXT NOT NULL,
  water_factor REAL,                 -- SF_w ที่ใช้ (PJ)
  baseline_water_factor REAL,        -- 1.00 (ขังต่อเนื่อง)
  total_n_kg REAL,                   -- PJ
  baseline_total_n_kg REAL,          -- default อัตรา/ไร่
  methane_pj REAL, methane_bl REAL,
  n2o_pj REAL, n2o_bl REAL,
  co2_urea_pj REAL, co2_lime_pj REAL,
  co2_fuel_pj REAL, co2_elec_pj REAL,
  burning_pj REAL,
  baseline_tco2e REAL, project_tco2e REAL, net_tco2e REAL,
  status TEXT DEFAULT 'draft',       -- 'draft' | 'approved' | 'superseded' (D9)
  version INTEGER DEFAULT 1,         -- D9: version ของ estimate
  supersedes_id INTEGER,             -- D9: ลิงก์เวอร์ชันก่อนหน้า (เมื่อ override)
  override_reason TEXT,              -- D9: เหตุผลที่ admin override
  calculated_by TEXT, calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ledger ค่าใช้จ่าย/โควตา AI
CREATE TABLE ai_events (
  id INTEGER PRIMARY KEY,
  event_type TEXT,                   -- 'chat_draft' | 'faq' | 'photo_screening'
  model TEXT, input_tokens INTEGER, output_tokens INTEGER,
  cost_usd REAL, context_ref TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 6. Calc Engine — สมการ TGO (Tier-1 default)

Pure functions ใน `lib/calc/*.ts` รับ config JSON (ค่าคงที่ทั้งหมดอยู่ที่ `factors.ts`) — ค่าจากไฟล์ "การคำนวณ AWD.xlsx" ที่มีอยู่แล้ว:

**หลักการสองระดับของตัวเลข:**
- **Methodology factors** (EF, NCV, density, GWP, SF_p/SF_w) → **ตัวเลขจริง** จากไฟล์ "การคำนวณ AWD.xlsx" / methodology T-VER-P-METH-13-08 — ปักหมุดใน `factors.ts`, ห้ามเปลี่ยนโดยไม่มีหลักฐาน
- **Baseline activity defaults** (อัตราปุ๋ยไนโตรเจนเริ่มต้นต่อไร่ · วันขังน้ำเริ่มต้น) — เป็น **ค่าเริ่มต้นที่ชัยฉาก** ใน `factors.ts` พร้อมป้าย "ค่าเริ่มต้น · ยังไม่ผ่านทวนสอบ" — ยังไม่มีข้อมูล Baseline จริง 3 ปี; ใช้เพื่อสาธิตกลไกเท่านั้น

```ts
// factors.ts (ตัวอย่างค่า — ตัวเลขจริงดึงจากไฟล์การคำนวณ AWD)
export const FACTORS = {
  sf_w: { continuous: 1.00, drained_once: 0.71, awd: 0.55 },  // Q-02
  sf_p: { long_flood: 2.41, normal: 1.00, no_flood_180: 0.89, no_flood_365: 0.59 }, // Q-01
  gwp: { ch4: 28, n2o: 265 },          // AR5 (ยืนยันกับไฟล์ต้นฉบับตอน implement)
  // EF / NCV / density: ปักหมุดจริงตอน implement จากไฟล์สมการการคำนวณ
  // BL activity placeholders (ค่าเริ่มต้น — ใช้สำหรับสฯกลไก):
  baseline: {
    n_default_kg_rai: 12,              // ⚠️ placeholder จนกว่าข้อมูลจริง
    flood_days_default: 120,           // ⚠️ placeholder
  },
};
```

**Project (PJ) — ใช้ค่าจริงที่เกษตรกรส่ง:**
```
CH4      = EF_ch4 × t_PJ × SF_w(awd = 0.55) × SF_p(1.00) × SF_o × A
N2O      = (N_fert + N_org) × EF1 + (N_vol + N_leach) × EF2
CO2_urea = M_urea × EF_urea
CO2_lime = M_lime × EF_lime
CO2_fuel = liters × density × NCV × EF
CO2_elec = kWh × EF_elec
burning  = เฉพาะถ้า straw_mgmt = 'burn' (non-CO2, CH4+N2O)
```

**Baseline (BL) — ค่าเริ่มต้น business-as-usual:**
```
CH4      = EF_ch4 × t_BL × SF_w(1.00 ขังต่อเนื่อง) × SF_p × SF_o × A
N2O      = (N_default_per_rai × A) × EF1 + indirect
(ไม่นับ CO2 ปุ๋ย/ปูน/พลังงานกรณีฐาน = 0 — ตามสมการที่ระบุเฉพาะในกรณีดำเนินโครงการ)
```

**Net = (BL − PJ) × GWP ต่อก๊าซ → รวมเป็น tCO2e/ฤดู**

จุดพิสูจน์ของ POC: ทำ AWD + ลดปุ๋ยไนโตรเจน → PJ < BL → net เป็นบวก

## 7. AI Integration

**ให้ชัดเจน:** "คุยกับเกษตรกร" หมายถึง **การแชทด้วยข้อความ (conversational text chat)** ไม่ใช่ speech recognition/voice ตามที่เราตีความตอนแรก — voice/STT ถูกตัดออกจาก POC (เลื่อนไปเฟส 2+)

### 7.1 Chat LLM (Workers AI — รุ่น 8B ที่รองรับไทย; รันผ่าน AI Gateway เพื่อสลับโมเดลได้)
ช่องทางหลักคือ **ข้อความ** เกษตรกรพิมพ์แบบภาษาปาก เต็มประโยค หรือปนตัวเลข เลเยอร์ LLM แปลงเป็นบทสนทนา
| ฟังก์ชัน | ระดับ | รายละเอียด |
|----------|-------|------------|
| FAQ / แนะนำ / นำทาง | C | ตอบคำถาม "ต้องทำอะไรต่อ" "ถ่ายรูปทำไม" "แล้วได้ตังค์ยังไง" — นำผู้ใช้ไปยังขั้นถัดไปของ flow; ไม่เขียนข้อมูลใด ๆ ลง DB |
| Draft parser | A+B | ข้อความอิสระ → JSON draft ตาม schema ฟอร์ม (เช่น ปุ๋ย ระดับน้ำ) → ส่งให้หน้า confirm |

**Guardrail (บังคับในโค้ด):**
1. draft ต้องผ่าน validation ชุดเดียวกับปุ่ม (range, unit, required, is_urea)
2. เกษตรกรต้องกด [ยืนยัน] หรือแก้ไขก่อนเขียน DB — ทุกค่าบันทึกใน `farmer_messages.confirmed`
3. confidence ต่ำ / validate fail → fallback กลับเมนูปุ่ม
4. โควตา token ต่อคนต่อฤดู (ดู `ai_events`) — เกิน → ตอบแบบเทมเพลต, ปิด AI

**Voice/STT:** ✂️ ตัดออกจาก POC (ตีความผิดตอนแรก — หมายถึง chat ข้อความ) → เลื่อน voice เป็นเฟส 2+

### 7.2 Vision screening (Workers AI vision model)
ทุกภาพที่ upload:
```
[ภาพ] → model → { status: pass|flag|reject, label, reason, confidence }
  pass   → admin เห็นใน "ผ่านอัตโนมัติ" (กดรวม verify ได้)
  flag   → เข้าคิวหลักให้ admin ตรวจ (ไม่พอใจเหตุผล AI ก็ยังเห็น)
  reject → สถานะ reject + เหตุผล → ส่งกลับให้เกษตรกรถ่ายใหม่ (ผ่าน flex message)
```
- admin เท่านั้นที่เขียน `admin_status`; `ai_status` เป็นข้อมูลประกอบ
- เก็บ `model_version` ทุกแถวเพื่อ audit

## 8. หน้าจอ

### 8.0 Auth (D11)
- เข้าสู่ระบบ email+password (hash ใน D1, session cookie)
- role: `admin` (คิวตรวจ, ปุ่มอนุมัติ/override) · `sponsor` (read-only)
- seed บัญชี demo `admin`/`sponsor`; password ตั้งผ่าน env var

### 8.1 LIFF (โทรศัพท์, ไทย, ตัวอักษร/ปุ่มใหญ่)
| หน้า | หน้าที่ |
|------|---------|
| `plots.html` | รายการแปลงของเกษตรกร → เลือกว่จะทำงานแปลงไหน |
| `camera.html` | ถ่ายสดของแปลงที่เลือก (capture, ไม่มี file picker), GPS + accuracy + timestamp, กันภาพซ้ำ/ซ้อน |
| `confirm.html` | ยืนยัน draft AI (ปุ๋ย) + แก้ไขได้ + ถ่ายภาพถุง (บังคับเมื่อพิมพ์สูตรเอง) |
| `summary.html` | สรุปฤดู: ระดับน้ำ ฟาง น้ำมัน ไฟฟ้า → ปิดฤดู |

### 8.2 Admin dashboard (desktop-first, ไทย)
| ส่วน | เนื้อหา |
|------|---------|
| คิวตรวจ | ภาพที่ `ai_status = flag` ขึ้นบนสุด · pass/reject อยู่แถวล่าง · ตัวกรองสถานะ |
| รายละเอียดภาพ | รูป + GPS mini-map + time + ai_reason + ai_confidence |
| ปุ่ม | [ผ่าน] [ตีกลับพร้อมเหตุผล] — เขียน `admin_status` |
| Season | [อนุมัติฤดู] ต่อแปลง → รัน calc → เก็บ estimates · **หลังอนุมัติข้อมูลถูกล็อก (D9)** · override → create version ใหม่ |
| Audit | ลิงก์ไป farmer_messages + ai_events + estimate versions ของคน/แปลงนั้น |

**เงื่อนไขอนุมัติ plot-season (ทุกข้อต้องครบ):**
- ภาพหลักฐาน 3 กิจกรรมของแปลงนั้นมี `admin_status = verified` ครบ
- มี fertilizer entry ของแปลง/ฤดูนั้น
- มี season_inputs ของแปลง/ฤดูนั้น
- ยังไม่มี estimate `approved` สำหรับแปลง/ฤดูนั้น (ถ้ามี → ใช้ override path)

ถ้าเงื่อนไขไม่ครบ → ปุ่ม [อนุมัติ] ดับ พร้อมบอกว่ารายการไหนค้าง

**จุดยืนเรื่อง AI reject / ควบคุมคุณภาพภาพ:**
- ประตูคือ `admin_status` (คน) ไม่ใช่ `ai_status` (AI) — ตาม D4
- ภาพที่ `ai_status = reject` ถูกเน้นขึ้นบนสุดให้ admin ตัดสิน; admin ยัง verify ได้เป็น exception พร้อมเหตุผล (logged)
- ภาพที่ admin "ตีกลับ" → ส่ง flex ให้เกษตรกรถ่ายใหม่จนกว่าผ่าน/ยืนยัน
- **Batch approve ข้าม** ใน POC (YAGNI) — อนุมัติทีละ plot-season

### 8.3 Sponsor dashboard (desktop, ไทย/อังกฤษได้ในภายหลัง)
| ส่วน | เนื้อหา |
|------|---------|
| รายการแปลง | จัดกลุ่มตามจังหวัด · แสดง net tCO2e ต่อแปลง |
| หน้าแปลง | ตัวเลข summary + **คณิต live** (SF_w 0.55, N รวม, สมการเต็ม) + ภาพหลักฐานที่ผ่าน verify |
| ป้ายกำกับ | "ค่าประมาณ · ยังไม่ผ่านการทวนสอบ" ทุกตัวเลข |
| Export | JSON/CSV ของ estimates |

## 9. Error Handling

| กรณี | พฤติกรรม |
|------|----------|
| GPS ไม่อนุญาต / accuracy ต่ำ | บล็อกถ่าย พร้อมคำแนะนำเปิดตำแหน่ง |
| เน็ตหลุดระหว่างถ่าย/ส่ง | queue ในเครื่อง (IndexedDB) + แจ้ง "ต้องมีเน็ตตอนกดส่ง" — ส่งซ้ำได้จนสำเร็จ แล้วล้างคิว |
| ภาพซ้ำ/ซ้อน (ส่งซ้ำ) | ระบบเทียบ hash + timestamp → เตือน |
| LINE webhook timeout | reply แบบ async (queue) — ใช้ `X-Line-Retry-Key` กัน replay |
| LLM fail / timeout | fallback เทมเพลต + กลับเมนูปุ่ม — ไม่เคยบล็อก farmer |
| Vision fail | สถานะ `ai_status = flag` (ให้คนตรวจแทน) — ไม่ auto-reject เมื่อ model ไม่ตอบ |
| Calc error | แสดงข้อผิดพลาดที่ระบุ field; ไม่บันทึก partial result |

## 10. Testing

| ระดับ | เนื้อหา |
|-------|---------|
| Unit — calc | **Golden fixtures (D12):** ถอด 3-5 แถวจาก `NZC - การคำนวณ AWD.xlsx` ที่มี input ครบ + ผลรวมที่เห็นได้ เป็น fixture → `calc/*` ต้อง reproduce ภายใน tolerance (±0.5% หรือ exact ตาม rounding ของชีต) · factor ทุกตัวใน `factors.ts` อ้าง cell/แถวต้นทาง · divergence ต้องอธิบายได้ (rounding/unit) ไม่ปล่อยผ่านเงียบ ๆ |
| Unit — อื่น | parser LLM (fixtures ไทย: พิมพ์, พูดสะกด, ปนตัวเลข) · GPS/validation |
| Integration | webhook → LIFF → vision → queue admin → approve → calc → sponsor (happy path เต็มโฟลว์) |
| AI eval | ชุดภาพตัวอย่าง (แปลงดี/เบลอ/ในร่ม/ซ้ำ) วัด precision/recall ของ screening; เกณฑ์: reject ไม่พลาดภาพดีเกิน 5% |
| Field test | เกษตรกรจริง 3-5 คน สแกน QR → ถ่ายภาพ → กรอกปุ๋ย → ดู admin |
| Demo script | ฉากจำลองเต็ม: 1 เกษตรกรครบโฟลว์ + 1 ภาพ flag ให้ admin ตัดสิน + sponsor view |

## 11. ประมาณการเวลา (1 dev, POC)

| งาน | วัน |
|-----|-----|
| Setup (wrangler, D1 schema, R2, LINE OA + webhook) | 1 |
| ผูกบัญชี + welcome + consent + seed (หลายแปลง) | 1.5 |
| หน้าเลือกแปลง + LIFF camera + GPS + upload | 2.5 |
| Vision screening + queue | 1.5 |
| Chat LLM (FAQ + draft parser + confirm) | 2 |
| Fertilizer + season summary + ปิดฤดู (รายแปลง) | 1.5 |
| Calc engine + unit test เทียบ Excel (รายแปลง) | 2 |
| Admin dashboard | 2 |
| Sponsor dashboard + export | 1 |
| Field test + demo polish | 1 |
| **รวม** | **~15.5 วัน** |

## 11bis. ข้อมูล Demo / Seed (D10)

POC มี **2 ทางกรอกข้อมูล**:
1. **Live LINE flow** — ใช้ field test (สแกน QR จริง)
2. **`seed.ts`** — ใส่ข้อมูล demo ผ่านทางเดิม (DB เดียว, validation+calc เดียว ไม่มีตาราง fake แยก)

**ชุด seed (D10):** ~8-10 เกษตรกร / 2-3 จังหวัด / 1-3 แปลงต่อคน (~15-20 แปลง) ในสถานะผสม:
- แปลงส่วนใหญ่ **ครบ + approved estimate** → sponsor dashboard พร้อมข้อมูลตั้งแต่เปิด
- 1-2 เกษตรกร **ระหว่างทาง** — มีภาพ `flag` 1 อัน และ `reject` 1 อัน → admin มีงานตัดสินใจจริง + สาธิต loop "ตีกลับ → ถ่ายใหม่"
- 1 เกษตรกร **ว่าง** → สาธิต onboarding จากศูนย์ใน demo

**ข้อ 2:** มี **magic link / test-farmer** สำหรับ onboarding ระหว่าง demo — ข้ามการจับคู่เบอร์จริง (ลิงก์ผูกกับ test farmer โดยตรง) เพื่องานสาธิตไม่พึ่งพาเบอร์โทรจริง

## 12. Non-Goals (ชัดเจนว่าไม่ทำใน POC)

- Baseline ย้อนหลัง 3 ปี (ใช้ค่าเริ่มต้นแทน + ป้ายกำกับ)
- เอกสารสิทธิ์ 6 ประเภท + ฟอร์มบริษัท (ใช้ seed + consent รวม)
- ภาพดาวเทียม/โดรน + KML boundary check
- ปฏิทิน 9 ขั้น SG-01~SG-09 เต็มรูปแบบ (ใช้ 3 ภาพ + 1 ฟอร์มสรุป)
- Audit log ระดับ row ครบทุกตาราง (มีใน farmer_messages/ai_events/photo หลัก)
- Rich Menu 7 ปุ่ม (ใช้ปุ่มลัดขั้นต่ำใน POC)
- รายงานฟอร์ม TGO ฉบับเต็ม

## 13. ความเสี่ยงที่ต้องเปิดเผย

1. **คุณภาพโมเดลไทย 8B** — รับได้เพราะ farmer ยืนยันทุกค่าก่อน commit; ถ้าผิดบ่อย → swap ผ่าน AI Gateway
2. **Baseline ค่าเริ่มต้น ≠ ข้อมูลจริง** — ตัวเลขเครดิตเป็น "ค่าประมาณ" มีป้ายกำกับชัดเจน; กลไกการคำนวณถูกต้อง
3. **LINE OA ยังไม่ได้สร้าง** — ต้องสร้าง Messaging API channel ก่อนเริ่ม (blocker สำหรับ field test)
4. **GWP/EF บางค่าต้องปักหมุดกับไฟล์ต้นฉบับตอน implement** — รายการชัดเจนใน factors.ts TODO
