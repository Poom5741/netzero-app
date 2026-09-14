// เครื่องคำนวณเครดิต AWD — สมการตาม T-VER-P-METH-13-08 (แนวทางการประเมินที่ 3)
// ถอดจาก NZC_Phase2_Calculation_AWD.xlsx (ชีต 1_สมการ · 2_พารามิเตอร์คงที่ · 3_พารามิเตอร์ตามพฤติกรรม)
// ค่าทุกตัวสอบกลับกับ NZC - การคำนวณ AWD.xlsx แล้ว (ชีต Sheet32 และ 3.7 สรุปGHG)

// ---------- กลุ่ม A · พารามิเตอร์คงที่ ----------
const A = {
  EF_BL_c: 0.1952,      // กก.CH4/ไร่/วัน — IPCC 2019 V4 Ch5 Table 5.11 (1.22 kg/ha/d ÷ 6.25)
  CF: 0.89,             // ตัวปรับอนุรักษ์นิยม — คูณเฉพาะมีเทนของกรณีฐาน (E-03)
  U_d: 0.15,            // ส่วนหักความไม่แน่นอน — แนวทางที่ 3 บังคับ 15% เสมอ (E-01)
  GWP_CH4: 28,
  GWP_N2O: 265,
  EF_Limestone: 0.12,   // ตัน C/ตันหินปูน
  EF_Dolomite: 0.13,    // ตัน C/ตันโดโลไมต์
  EF_Urea: 0.2,         // ตัน C/ตันยูเรีย
  Frac_GASF: 0.11, Frac_GASM: 0.21, Frac_LEACH: 0.24,
  EF_ATD: 0.01, EF_LEACH: 0.011,
  EF_CH4_burn: 2.7      // กรัม CH4/กก.แห้ง
};

// ---------- กลุ่ม B · ตารางค้นค่าตามพฤติกรรม ----------
const SF_P = { "WP-1": { v: 2.41, label: "ขังน้ำก่อนปลูก > 30 วัน" }, "WP-2": { v: 1.00, label: "ไม่ขังน้ำ < 180 วัน หรือขังน้ำสั้น ๆ < 30 วัน" }, "WP-3": { v: 0.68, label: "ไม่มีการขังน้ำก่อนปลูก > 180 วัน" }, "WP-4": { v: 0.58, label: "ไม่มีการขังน้ำก่อนปลูก > 365 วัน" } };
// SF_w: ค่า 0.55 ใช้ได้ต่อเมื่อหลักฐานภาพระดับน้ำในท่อครบ — ถ้าไม่ครบ ถอยเป็น 0.71 พร้อม flag
const SF_W = {
  "WW-1": { v: 1.00, n2o: 0.003, label: "ขังน้ำต่อเนื่องตลอดฤดู", photos: 0 },
  "WW-2": { v: 0.71, n2o: 0.005, label: "ระบายน้ำ / ปล่อยแห้ง 1 ครั้ง", photos: 2 },
  "WW-3": { v: 0.55, n2o: 0.005, label: "ปล่อยแห้งหลายครั้ง / เปียกสลับแห้ง (AWD)", photos: 4, fallback: "WW-2" }
};
const CFOA = { "OM-1": { v: 1.00, label: "ฟางไถกลบก่อนปลูก < 30 วัน" }, "OM-2": { v: 0.29, label: "ฟางไถกลบก่อนปลูก > 30 วัน" }, "OM-3": { v: 0.45, label: "ปุ๋ยหมัก / วัสดุอินทรีย์อื่น" }, "OM-4": { v: 0.14, label: "ปุ๋ยคอก" } };

// ---------- ปฏิทินภาพหลักฐาน: 4 ภาพต่อครอป · เปียก 2 · แห้ง 2 สลับกัน ----------
// WW-3 (AWD) ต้องมีคู่ เปียก-แห้ง ครบ 2 รอบ จึงจะใช้ SF_w = 0.55 ได้
const PHOTO_ROUNDS = [
  { code: "WET-1", stage: "SG-04", name: "รอบที่ 1 · เปียก", phase: "wet", day: 28, need: "ภาพท่อ PVC ให้เห็นน้ำเต็มระดับผิวดิน" },
  { code: "DRY-1", stage: "SG-05", name: "รอบที่ 1 · แห้ง", phase: "dry", day: 42, need: "ภาพท่อ PVC ให้เห็นระดับน้ำต่ำกว่าผิวดิน (อ่านค่า ซม.)" },
  { code: "WET-2", stage: "SG-07", name: "รอบที่ 2 · เปียก", phase: "wet", day: 61, need: "ภาพท่อ PVC ให้เห็นน้ำเต็มระดับผิวดินอีกครั้ง" },
  { code: "DRY-2", stage: "SG-08", name: "รอบที่ 2 · แห้ง", phase: "dry", day: 75, need: "ภาพท่อ PVC ให้เห็นระดับน้ำต่ำกว่าผิวดิน (อ่านค่า ซม.)" }
];

// ---------- E-08 · ตัวปรับจากวัสดุอินทรีย์ ----------
function sfOrganic(items) { // [{code, roa}] — roa เป็น กก./ไร่
  const sum = (items || []).reduce((s, it) => s + it.roa * 0.00625 * (CFOA[it.code] ? CFOA[it.code].v : 1), 0);
  return Math.pow(1 + sum, 0.59);
}

// ---------- E-07 · ค่าสัมประสิทธิ์การปล่อยมีเทนของแปลง ----------
function efCh4(sfP, sfW, sfO) { return A.EF_BL_c * sfP * sfW * sfO; }

// ---------- E-06 · มีเทนจากพื้นที่นา (tCO2eq) ----------
function ch4Soil(ef, rai, days) { return ef * rai * days * 1e-3 * A.GWP_CH4; }

// ---------- E-09 / E-10 · ปูนและยูเรีย (tCO2eq) ----------
function co2Lime(mLimeT, mDoloT, rai) { return ((mLimeT * rai) * A.EF_Limestone + (mDoloT * rai) * A.EF_Dolomite) * 44 / 12; }
function co2Urea(mUreaT, rai) { return (mUreaT * rai) * A.EF_Urea * 44 / 12; }

// ---------- E-11 ถึง E-16 · ไนตรัสออกไซด์ (tCO2eq) ----------
function n2oSoil(nSynthKg, nOrgKg, rai, efDirect) {
  const nSyn = nSynthKg * rai / 1000, nOrg = nOrgKg * rai / 1000; // ตัน N
  const direct = (nSyn + nOrg) * efDirect * 44 / 28;
  const volat = (nSyn * A.Frac_GASF + nOrg * A.Frac_GASM) * A.EF_ATD * 44 / 28;
  const leach = (nSyn + nOrg) * A.Frac_LEACH * A.EF_LEACH * 44 / 28;
  return (direct + volat + leach) * A.GWP_N2O;
}

// ---------- E-17 · เชื้อเพลิงและไฟฟ้าที่เพิ่มขึ้น (ฝั่งโครงการเท่านั้น) ----------
const FUEL = { "ดีเซล": { ncv: 36.42e-6, ef: 74100 }, "เบนซิน": { ncv: 34.2e-6, ef: 69300 } }; // TJ/ลิตร · kgCO2/TJ
function co2Fuel(litrePerRai, rai, type, kwhPerRai) {
  const f = FUEL[type] || FUEL["ดีเซล"];
  const fuel = (litrePerRai * rai) * f.ncv * f.ef / 1000;      // tCO2eq
  const elec = ((kwhPerRai || 0) * rai / 1000) * 0.4999;        // MWh × EF กริดไทย
  return fuel + elec;
}

// ---------- E-18 · การเผามวลชีวภาพ ----------
function nonCo2Burn(mbKgPerRai, raiBurned) {
  return raiBurned > 0 ? (mbKgPerRai * raiBurned) * A.EF_CH4_burn / 1e6 * A.GWP_CH4 : 0;
}

// ---------- ขั้นที่ 2 · ตัดสิน SF_w จากหลักฐาน ----------
function resolveSfW(code, photosApproved) {
  const row = SF_W[code] || SF_W["WW-1"];
  if (row.fallback && photosApproved < row.photos) {
    const fb = SF_W[row.fallback];
    return { code: row.fallback, v: fb.v, n2o: fb.n2o, fallback: true, reason: "หลักฐานภาพระดับน้ำครบ " + photosApproved + "/" + row.photos + " ภาพ — ยังใช้ SF_w = " + row.v.toFixed(2) + " ไม่ได้" };
  }
  return { code, v: row.v, n2o: row.n2o, fallback: false, reason: "หลักฐานครบ " + photosApproved + "/" + row.photos + " ภาพ" };
}

// ---------- E-03 / E-05 · รวมรายฤดูรายแปลง ----------
function seasonSide(side, p, sfW) {
  const sfO = sfOrganic(p.organic);
  const ef = efCh4(SF_P[p.sfP] ? SF_P[p.sfP].v : 1, sfW.v, sfO);
  const ch4 = ch4Soil(ef, p.rai, p.days);
  const lime = co2Lime(p.limeT || 0, p.doloT || 0, p.rai);
  const urea = co2Urea(p.ureaT || 0, p.rai);
  const n2o = n2oSoil(p.nSynth || 0, p.nOrg || 0, p.rai, sfW.n2o);
  const fuel = side === "PJ" ? co2Fuel(p.fuelL || 0, p.rai, p.fuelType, p.kwh) : 0;
  const burn = p.burnRai ? nonCo2Burn(p.mb || 0, p.burnRai) : 0;
  const ch4Applied = side === "BL" ? ch4 * A.CF : ch4; // CF คูณเฉพาะมีเทนกรณีฐาน
  return { sfO, ef, ch4, ch4Applied, lime, urea, n2o, fuel, burn, total: ch4Applied + lime + urea + n2o + fuel + burn };
}

// ---------- E-01 · ER ของแปลง-ฤดู ----------
function computePlotSeason(plot) {
  const sfWbl = resolveSfW(plot.bl.wwCode, 99);                       // กรณีฐานเป็นพฤติกรรมย้อนหลัง ไม่ต้องมีภาพ
  const sfWpj = resolveSfW(plot.pj.wwCode, plot.photosApproved || 0); // ฤดูโครงการต้องมีภาพครบ 4
  const BL = seasonSide("BL", { ...plot, ...plot.bl }, sfWbl);
  const PJ = seasonSide("PJ", { ...plot, ...plot.pj }, sfWpj);
  const er = Math.max(0, (BL.total - PJ.total - 0) * (1 - A.U_d));
  return { BL, PJ, sfWbl, sfWpj, be: BL.total, pe: PJ.total, le: 0, er };
}

// ---------- ตัวเลขจริงของโครงการ (ชีต 3.7 สรุปGHG) ----------
// โครงการทำนาลดโลกร้อนพื้นที่สุพรรณบุรี (อ.สามชุก) · 120 วันต่อรอบ · 2 ฤดูต่อปี
const GHG_2569 = {
  rows: [
    { name: "น้ำขัง (มีเทน)", s1: [648.9607, 136.0118], s2: [247.2942, 136.0118], eq: "E-06 · E-07" },
    { name: "สารปรับปรุงดิน (ปูน)", s1: [0.6497, 0.6497], s2: [0.6497, 0.6497], eq: "E-09" },
    { name: "ปุ๋ยยูเรีย", s1: [3.0774, 3.0774], s2: [3.0774, 3.0774], eq: "E-10" },
    { name: "ปุ๋ยไนโตรเจน", s1: [12.2560, 15.8437], s2: [12.2560, 15.8437], eq: "E-11 ถึง E-16" },
    { name: "การเผาไหม้เชื้อเพลิงฟอสซิล", s1: [0, 13.0219], s2: [0, 13.0219], eq: "E-17" },
    { name: "การเผาไหม้มวลชีวภาพ", s1: [0, 0], s2: [0, 0], eq: "E-18" }
  ],
  be: 829.6331, pe: 337.2090, le: 0, er: 418.5605
};

Object.assign(window, { A_CONST: A, SF_P, SF_W, CFOA, PHOTO_ROUNDS, sfOrganic, efCh4, ch4Soil, resolveSfW, computePlotSeason, GHG_2569 });
