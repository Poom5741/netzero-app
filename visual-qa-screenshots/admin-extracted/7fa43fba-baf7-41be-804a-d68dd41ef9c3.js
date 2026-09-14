// ข้อมูลจริงจาก NZC - การคำนวณ AWD.xlsx (ชีต Sheet32 · 1.ข้อมูลการทำนา_แปลงใหญ่ / _แปลงย่อย)
// ตัวระบุที่ใช้ในระบบคือ CPA code และรหัสแปลงย่อย CPA####/F## — ไม่ใช้ชื่อในทุกไฟล์ที่ส่งออกและทุกหน้าที่ลูกค้าเห็น (PDPA · CS-02)

const SPONSORS = [
  { id: "A", name: "บจก. A", areas: ["สุพรรณบุรี"], rai: 148.4, households: 13, verified: 355.8, estimate: 418.6, since: "2568", contact: "ฝ่าย ESG" },
  { id: "B", name: "บจก. B", areas: ["ชัยนาท"], rai: 62.8, households: 6, verified: 0, estimate: 176.3, since: "2569", contact: "ฝ่ายความยั่งยืน" },
  { id: "C", name: "บจก. C", areas: [], rai: 0, households: 0, verified: 0, estimate: 0, since: "2569", contact: "ฝ่ายจัดซื้อพลังงาน", pending: true }
];

const PROVINCES = [
  { name: "สุพรรณบุรี", districts: 1, tambon: 1, rai: 148.4, households: 13, credits: 418.5605, note: "ต.หนองสะเดา อ.สามชุก — พื้นที่ขึ้นทะเบียนแล้ว" },
  { name: "ชัยนาท", districts: 1, tambon: 1, rai: 62.8, households: 6, credits: 176.3, note: "กลุ่มใหม่ · ยังไม่เข้ารอบทวนสอบ" }
];

// แปลงย่อยจริง — เนื้อที่ พันธุ์ข้าว และวัสดุอินทรีย์ตามไฟล์
// bl / pj: รหัสพฤติกรรม (กลุ่ม B) · ปริมาณปุ๋ยฝั่ง BL และ PJ เท่ากันโดยเจตนา
// "การเข้าร่วมโครงการไม่มีวัตถุประสงค์ให้เกษตรกรปรับลดปริมาณการใช้ปุ๋ย" — ชีต 1.ข้อมูลการทำนา_แปลงย่อย
function mkPlot(cpa, plot, deed, rai, rice, roa, nSynth, ureaKg, doloKg, fuelL, photos) {
  return {
    cpa, plot, deed, rai, rice, days: 120, photosApproved: photos,
    organicRoa: roa,
    bl: { wwCode: "WW-1", sfP: "WP-1", organic: roa ? [{ code: "OM-3", roa }] : [], nSynth, ureaT: ureaKg / 1000, doloT: doloKg / 1000, limeT: 0 },
    pj: { wwCode: "WW-3", sfP: "WP-2", organic: roa ? [{ code: "OM-3", roa }] : [], nSynth, ureaT: ureaKg / 1000, doloT: doloKg / 1000, limeT: 0, fuelL, fuelType: "ดีเซล", kwh: 0 }
  };
}

const PLOTS = [
  mkPlot("CPA1001", "CPA1001/F01", "7218", 2.4, "หอมปทุม", 2500, 25, 20, 0, 20, 4),
  mkPlot("CPA1001", "CPA1001/F02", "7217, 7218, 40447", 6.25, "หอมปทุม", 2500, 25, 20, 0, 20, 4),
  mkPlot("CPA1002", "CPA1002/F01", "7224", 4.02, "หอมปทุม", 2500, 25, 20, 0, 20, 3),
  mkPlot("CPA1002", "CPA1002/F02", "7224", 2.28, "หอมปทุม", 2500, 25, 20, 0, 20, 4),
  mkPlot("CPA1003", "CPA1003/F01", "6814", 3.16, "กข85", 0, 20, 20, 0, 25, 4),
  mkPlot("CPA1003", "CPA1003/F02", "6814", 0.74, "กข85", 0, 20, 20, 0, 25, 2),
  mkPlot("CPA1004", "CPA1004/F01", "7235", 8.63, "กข85", 0, 20, 20, 5, 25, 4),
  mkPlot("CPA1005", "CPA1005/F01", "43720", 2.32, "กข85", 0, 20, 20, 5, 25, 4),
  mkPlot("CPA1006", "CPA1006/F01", "36135, 36136", 5.72, "กข85", 0, 20, 20, 5, 25, 1),
  mkPlot("CPA1007", "CPA1007/F01", "20833", 3.84, "กข85", 0, 20, 20, 5, 25, 4),
  mkPlot("CPA1010", "CPA1010/F01", "6799", 2.47, "หอมปทุม", 0, 25, 20, 0, 20, 4),
  mkPlot("CPA1012", "CPA1012/F01", "36400", 4.13, "หอมปทุม", 0, 25, 20, 25, 20, 0),
  mkPlot("CPA1013", "CPA1013/F02", "12533", 5.09, "กข85", 0, 20, 20, 5, 25, 3)
];

// ชื่อเกษตรกรตามไฟล์ — ใช้เฉพาะหน้ารายละเอียดของแอดมิน
const FARMER_NAMES = {
  CPA1001: "วิชา ทองโสภา", CPA1002: "วิชา ทองโสภา", CPA1003: "อุดมทรัพย์ เตียวเจริญสิน",
  CPA1004: "ชูเกียรติ เนียมแก้ว", CPA1005: "ชูเกียรติ เนียมแก้ว", CPA1006: "ชูเกียรติ เนียมแก้ว",
  CPA1007: "ชูเกียรติ เนียมแก้ว", CPA1010: "กนกอร ทองโสภา", CPA1012: "ไชยา ตะมะณี", CPA1013: "ชูศักดิ์ เนียมแก้ว"
};

// รวมรายแปลง → รายเกษตรกร (CPA code) พร้อมผลคำนวณจริง
const FARMERS = (() => {
  const by = {};
  for (const p of PLOTS) {
    const r = computePlotSeason(p);
    const k = p.cpa;
    by[k] = by[k] || { code: k, name: FARMER_NAMES[k] || "—", prov: "สุพรรณบุรี", tambon: "หนองสะเดา", district: "สามชุก", sponsor: "บจก. A", plots: [], rai: 0, er: 0, be: 0, pe: 0, photos: 0, need: 0, fallback: 0 };
    by[k].plots.push({ ...p, calc: r });
    by[k].rai += p.rai; by[k].er += r.er; by[k].be += r.be; by[k].pe += r.pe;
    by[k].photos += p.photosApproved; by[k].need += 4;
    if (r.sfWpj.fallback) by[k].fallback++;
    by[k].rice = p.rice;
  }
  return Object.values(by).map(f => {
    f.rai = +f.rai.toFixed(2); f.er = +f.er.toFixed(3); f.be = +f.be.toFixed(3); f.pe = +f.pe.toFixed(3);
    f.status = f.photos === f.need ? "หลักฐานครบ" : f.fallback ? "หลักฐานไม่ครบ · ถอย SF_w" : "กำลังเก็บหลักฐาน";
    f.tone = f.photos === f.need ? "success" : f.fallback ? "danger" : "warning";
    return f;
  });
})();

// คิวตรวจภาพ — 4 ภาพต่อครอป · เปียก 2 แห้ง 2 สลับกัน
const QUEUE = [
  { id: "PH-8841", code: "CPA1001", plot: "CPA1001/F01", round: "DRY-1", stage: "SG-05", stageName: "รอบที่ 1 · แห้ง", phase: "dry", water: "10 ซม.", when: "19 ส.ค. 07:41", gps: "14.9231, 100.1042", inside: true, age: "รอ 1 วัน", tone: "warning" },
  { id: "PH-8840", code: "CPA1002", plot: "CPA1002/F01", round: "WET-2", stage: "SG-07", stageName: "รอบที่ 2 · เปียก", phase: "wet", water: "0 ซม. (น้ำเต็ม)", when: "18 ส.ค. 08:02", gps: "ไม่มีพิกัด (ส่งทางแชต)", inside: false, age: "รอ 2 วัน", tone: "danger" },
  { id: "PH-8838", code: "CPA1004", plot: "CPA1004/F01", round: "DRY-2", stage: "SG-08", stageName: "รอบที่ 2 · แห้ง", phase: "dry", water: "14 ซม.", when: "18 ส.ค. 06:55", gps: "15.1802, 100.1265", inside: true, age: "รอ 2 วัน", tone: "warning" },
  { id: "PH-8835", code: "CPA1006", plot: "CPA1006/F01", round: "WET-1", stage: "SG-04", stageName: "รอบที่ 1 · เปียก", phase: "wet", water: "0 ซม. (น้ำเต็ม)", when: "17 ส.ค. 16:20", gps: "14.9410, 100.0988", inside: true, age: "รอ 3 วัน", tone: "warning" },
  { id: "PH-8830", code: "CPA1013", plot: "CPA1013/F02", round: "DRY-1", stage: "SG-05", stageName: "รอบที่ 1 · แห้ง", phase: "dry", water: "8 ซม.", when: "17 ส.ค. 07:12", gps: "14.9302, 100.1120", inside: true, age: "รอ 3 วัน", tone: "warning" }
];

const REJECT_REASONS = [
  "มองไม่เห็นขีดระดับน้ำในท่อ",
  "ภาพเบลอ / มืดเกินไป",
  "พิกัดตกนอกขอบเขตแปลง",
  "เวลาถ่ายไม่อยู่ในช่วงกำหนดของรอบนี้",
  "รอบแห้งแต่ในภาพน้ำยังเต็มท่อ (หรือกลับกัน)",
  "ไม่ใช่ท่อวัดระดับน้ำของแปลงนี้",
  "ส่งภาพจากคลังภาพ ไม่ได้ถ่ายผ่านกล้องของระบบ"
];

// เครดิตรายฤดู — ปี 2569 เป็นค่าจริงจากชีต 3.7 สรุปGHG ส่วนฤดูก่อนหน้าเป็นรอบที่ทวนสอบแล้ว
const SEASONS = [
  { label: "นาปี 2568", baseline: 652.3, estimate: 342.1, verified: 323.4 },
  { label: "นาปรัง 2568", baseline: 251.0, estimate: 39.6, verified: 32.4 },
  { label: "นาปี 2569 (S1)", baseline: 664.9, estimate: 249.4, verified: 0 },
  { label: "นาปรัง 2569 (S2)", baseline: 263.3, estimate: 169.2, verified: 0 }
];

const EXPORTS = [
  { id: "EX-2041", name: "รายงานเกษตรกรรายบุคคล", fmt: "XLSX", scope: "ราย CPA code · ทุกพื้นที่", note: "หนึ่งชีตต่อหนึ่ง CPA code · หัวชีตใช้รหัส ไม่ใช้ชื่อ", who: "แอดมิน" },
  { id: "EX-2042", name: "สรุปเครดิตประมาณการรายฤดู", fmt: "XLSX", scope: "รายพื้นที่ · รายฤดู", note: "BE_s / PE_s / ER_y ต่อแปลง พร้อมค่ากลางทุกตัว (ef_ch4, sf_w, sf_o)", who: "แอดมิน · ลูกค้า" },
  { id: "EX-2043", name: "แบบฟอร์มขอขึ้นทะเบียน Premium T-VER", fmt: "DOCX", scope: "ทั้งโครงการ", note: "T-VER-P-METH-13-08 ฉบับที่ 01 · เติมข้อมูลโครงการและ WKT ขอบแปลงอัตโนมัติ", who: "แอดมิน" },
  { id: "EX-2044", name: "ไฟล์คำนวณเครดิต Premium T-VER", fmt: "XLSX", scope: "ทั้งโครงการ", note: "โครงเดียวกับ NZC - การคำนวณ AWD.xlsx · ชีต 3.1 ถึง 3.7 · ไล่ย้อนได้ทุกค่า", who: "แอดมิน" },
  { id: "EX-2045", name: "ทะเบียนเอกสารสิทธิ์และความยินยอม", fmt: "XLSX", scope: "รายโฉนด", note: "DOC-01 ถึง DOC-06 · CS-01 ถึง CS-04 พร้อมวันเวลาและเวอร์ชันข้อความ", who: "แอดมิน" },
  { id: "EX-2046", name: "รายงานการทวนสอบภาพหลักฐาน", fmt: "XLSX", scope: "รายภาพ · 4 ภาพต่อครอป", note: "พิกัด เวลา ผู้ตรวจ เหตุผลที่ตีกลับ และ SF_w ที่ใช้จริง", who: "แอดมิน · ผู้ประเมินภายนอก" }
];

// รายแถวปุ๋ย — หน้าตรวจที่มาของไนโตรเจน (AD-18 · F-71)
const NITROGEN_ROWS = [
  { no: 1, formula: "16-8-8", src: "รายการมาตรฐาน FT-03", pctN: 16, rate: 25, urea: false, stage: "SG-03 · รองพื้น", photo: true },
  { no: 2, formula: "46-0-0", src: "รายการมาตรฐาน FT-02", pctN: 46, rate: 20, urea: true, stage: "SG-06 · แตกกอ", photo: true },
  { no: 3, formula: "18-12-6", src: "เกษตรกรพิมพ์เอง", pctN: 18, rate: 20, urea: false, stage: "SG-09 · ก่อนออกรวง", photo: false }
];

Object.assign(window, { SPONSORS, PROVINCES, PLOTS, FARMERS, FARMER_NAMES, QUEUE, REJECT_REASONS, SEASONS, EXPORTS, NITROGEN_ROWS });
