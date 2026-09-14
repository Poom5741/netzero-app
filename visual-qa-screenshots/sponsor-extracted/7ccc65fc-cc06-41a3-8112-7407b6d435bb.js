const { Button, Badge, Tag, Icon, StatTile, FilterBar, DataTable, ProgressBar, GradientRule } = window.NetZeroCarbonDesignSystem_f3e7a8;
const f3 = (n, d = 2) => Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

const ME = SPONSORS[0];                       // บัญชีตัวอย่าง: บจก. A — แอดมินให้สิทธิ์เห็นเฉพาะ ต.หนองสะเดา จ.สุพรรณบุรี
const MY_PROVINCES = PROVINCES.filter(p => ME.areas.includes(p.name));
const MY_FARMERS = FARMERS.filter(f => ME.areas.includes(f.prov));
const MY_PLOTS = MY_FARMERS.reduce((a, f) => a.concat(f.plots.map(p => ({ ...p, cpa: f.code }))), []);
const VERIFIED = SEASONS.reduce((s, x) => s + x.verified, 0);
const ESTIMATE = GHG_2569.er;

function SponsorOverview({ filters, onFilter, onNavigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="Sponsor Portal" title="พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน"
        sub={"โครงการทำนาลดโลกร้อน · ต.หนองสะเดา อ.สามชุก จ.สุพรรณบุรี · ระเบียบวิธี T-VER-P-METH-13-08 ฉบับที่ 01"}
        actions={<Button size="sm" variant="outline" iconLeft={<Icon name="download" size={15} />} onClick={() => onNavigate("reports")}>ดาวน์โหลดสรุป</Button>} />
      <FilterBar filters={filters} onChange={onFilter} />
      <PdpaNote>
        มุมมองนี้แสดงผลรวมรายพื้นที่และรายแปลงที่ระบุด้วย CPA code เท่านั้น — ไม่แสดงชื่อ เบอร์โทร เลขบัตรประชาชน หรือเลขที่โฉนด และเจาะดูรายบุคคลไม่ได้ ตามข้อตกลงความยินยอม CS-02 · ท่านเห็นเฉพาะพื้นที่ที่บริษัทของท่านสนับสนุน ไม่เห็นพื้นที่ของผู้สนับสนุนรายอื่น
      </PdpaNote>

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr 1fr", gap: "var(--space-4)" }}>
        <div style={{ background: "var(--gradient-deep)", color: "#fff", borderRadius: "var(--radius-card)", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--teal-300)" }}>เครดิตที่รับรองแล้ว (ทวนสอบและออกใบรับรอง)</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
            <span style={{ fontSize: "var(--text-5xl)", fontWeight: "var(--weight-light)", lineHeight: 1, letterSpacing: "var(--tracking-display)" }}>{f3(VERIFIED)}</span>
            <span style={{ fontSize: "var(--text-md)", opacity: .82 }}>tCO₂eq</span>
          </div>
          <div><Badge tone="success">รอบ 2568 (นาปี + นาปรัง) · ออกใบรับรองครบแล้ว</Badge></div>
          <GradientRule width="100%" thickness={2} />
          <div style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-relaxed)", color: "rgba(255,255,255,.74)" }}>
            ประมาณการปี 2569 อีก <b style={{ color: "#fff" }}>{f3(ESTIMATE)} tCO₂eq</b> (BE {f3(GHG_2569.be)} − PE {f3(GHG_2569.pe)} แล้วหัก U_d 15%) — ยังจัดสรรไม่ได้จนกว่าผู้ประเมินภายนอกจะทวนสอบและ อบก. ออกใบรับรอง
          </div>
        </div>
        <StatTile label="พื้นที่ที่สนับสนุน" value={f3(ME.rai, 1)} unit="ไร่"
          note={f3(ME.rai * 0.16, 1) + " เฮกตาร์ · " + MY_PLOTS.length + " แปลงย่อย · รอบปลูก 120 วัน · 2 ฤดูต่อปี"} />
        <StatTile label="ครัวเรือนที่ได้รับประโยชน์" value={MY_FARMERS.length} unit="ครัวเรือน"
          note={"นับตาม CPA code ของผู้ถือเอกสารสิทธิ์ที่เข้าร่วม · พันธุ์ข้าวหอมปทุม และ กข85"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "var(--space-6)", alignItems: "start" }}>
        <Section title="เครดิตรายฤดูของพื้นที่ท่าน" sub="หน่วย tCO₂eq · ประมาณการเทียบกับที่รับรองแล้ว">
          <CreditChart seasons={SEASONS} showBaseline={false} />
          <div style={{ marginTop: "var(--space-5)", padding: "var(--space-4)", background: "var(--surface-accent-soft)", borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)", lineHeight: "var(--leading-relaxed)", color: "var(--teal-800)" }}>
            <b>ประมาณการ</b> คำนวณจากข้อมูลที่เกษตรกรบันทึกและภาพหลักฐานที่ผ่านการตรวจแล้ว ตามสมการของระเบียบวิธี แต่ยังไม่ผ่านผู้ประเมินภายนอก · <b>รับรองแล้ว</b> คือเครดิตที่ อบก. ออกให้หลังการทวนสอบ · ตัวเลขประมาณการอาจลดลงได้ถ้าหลักฐานภาพไม่ครบ 4 รอบ เพราะระบบจะถอยไปใช้ตัวปรับการจัดการน้ำที่อนุรักษ์นิยมกว่า
          </div>
        </Section>
        <Section title="ที่มาของส่วนต่าง · ปี 2569" sub="ส่วนต่างเกือบทั้งหมดมาจากมีเทน — ปุ๋ยเท่ากันทั้งสองฝั่งโดยเจตนา" pad={false}>
          <DataTable dense
            columns={[
              { key: "name", label: "แหล่งการปล่อย" },
              { key: "be", label: "กรณีฐาน", align: "right", render: r => f3(r.s1[0] + r.s2[0]) },
              { key: "pe", label: "โครงการ", align: "right", render: r => f3(r.s1[1] + r.s2[1]) },
              { key: "d", label: "ส่วนต่าง", align: "right", render: r => { const d = (r.s1[0] + r.s2[0]) - (r.s1[1] + r.s2[1]); return <b style={{ color: d > 0 ? "var(--status-success)" : d < 0 ? "var(--status-danger)" : "var(--text-subtle)" }}>{d > 0 ? "−" : d < 0 ? "+" : ""}{f3(Math.abs(d))}</b>; } }
            ]}
            rows={GHG_2569.rows} />
          <div style={{ padding: "var(--space-4) var(--space-6)", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>ความคืบหน้าฤดูปัจจุบัน</div>
            <ProgressBar label="แปลงที่แจ้งวันหว่าน" value={MY_PLOTS.length - 1} max={MY_PLOTS.length} valueLabel={(MY_PLOTS.length - 1) + "/" + MY_PLOTS.length} />
            <ProgressBar label="ภาพหลักฐาน 4 รอบ/ครอป" value={MY_FARMERS.reduce((s, f) => s + f.photos, 0)} max={MY_FARMERS.reduce((s, f) => s + f.need, 0)}
              valueLabel={MY_FARMERS.reduce((s, f) => s + f.photos, 0) + "/" + MY_FARMERS.reduce((s, f) => s + f.need, 0)} tone="mint" />
            <ProgressBar label="ข้อมูลปัจจัยการผลิตครบ" value={54} max={100} valueLabel="54%" tone="navy" />
          </div>
        </Section>
      </div>

      <Section title="ผลลัพธ์ร่วมของพื้นที่ที่ท่านสนับสนุน" sub="ค่าเฉลี่ยถ่วงน้ำหนักตามเนื้อที่ · เทียบกับกรณีฐานย้อนหลัง 3 ปี">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-6)" }}>
          {[["ลดมีเทนจากนาข้าว", "69.6%", "896.25 → 272.02 tCO₂eq · ตัวปรับ SF_w ลดจาก 1.00 เหลือ 0.55"],
            ["ลดการใช้น้ำ", "43%", "เทียบกับการขังน้ำต่อเนื่องตลอดฤดู"],
            ["เชื้อเพลิงที่เพิ่มขึ้น", "+26.0", "tCO₂eq จากการสูบน้ำเข้า-ออกตามรอบเปียกสลับแห้ง (E-17)"],
            ["ปริมาณปุ๋ย", "ไม่เปลี่ยน", "โครงการไม่ขอให้เกษตรกรลดปุ๋ย — ยอดปุ๋ยฝั่งกรณีฐานและโครงการเท่ากัน"]].map(([t, v, n]) => (
            <div key={t}>
              <div style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-light)", color: t === "เชื้อเพลิงที่เพิ่มขึ้น" ? "var(--status-warning)" : "var(--text-accent)", lineHeight: 1.1 }}>{v}</div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)", marginTop: "var(--space-2)" }}>{t}</div>
              <div style={{ fontSize: "11px", color: "var(--text-subtle)", marginTop: "3px", lineHeight: "var(--leading-relaxed)" }}>{n}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function SponsorAreas() {
  const rows = MY_PLOTS.map(p => { const c = computePlotSeason(p); return { cpa: p.cpa, plot: p.plot, rai: p.rai, rice: p.rice, photos: p.photosApproved, sfw: c.sfWpj, er: c.er }; });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="พื้นที่ของท่าน" title="รายแปลงย่อยในพื้นที่ที่บริษัทของท่านสนับสนุน"
        sub="ระบุด้วย CPA code และรหัสแปลงย่อยเท่านั้น · ไม่มีชื่อ ไม่มีเลขโฉนด" />
      <PdpaNote>CPA code (เช่น CPA1001) และรหัสแปลงย่อย (CPA1001/F01) เป็นตัวระบุที่ใช้ในรายงานทุกฉบับ รวมถึงไฟล์คำนวณเครดิตที่ยื่น อบก. — ทำให้ตรวจย้อนกลับได้โดยไม่เปิดเผยตัวบุคคล</PdpaNote>
      {MY_PROVINCES.map(p => (
        <Section key={p.name} title={p.name} sub={p.note + " · " + p.households + " ครัวเรือน · " + f3(p.rai, 1) + " ไร่ · ER " + f3(p.credits) + " tCO₂eq"} pad={false}>
          <DataTable dense
            columns={[
              { key: "cpa", label: "CPA code", render: r => <b style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{r.cpa}</b> },
              { key: "plot", label: "แปลงย่อย", render: r => <span style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{r.plot}</span> },
              { key: "rai", label: "ไร่", align: "right", render: r => f3(r.rai, 2) },
              { key: "rice", label: "พันธุ์ข้าว" },
              { key: "photos", label: "ภาพหลักฐาน", render: r => (
                <span style={{ display: "flex", gap: "4px" }}>{PHOTO_ROUNDS.map((pr, i) => (
                  <span key={pr.code} title={pr.name} style={{ width: "24px", height: "18px", borderRadius: "3px", display: "grid", placeItems: "center", fontSize: "9px", fontWeight: 700, background: i < r.photos ? (pr.phase === "wet" ? "var(--navy-600)" : "var(--teal-600)") : "var(--grey-200)", color: i < r.photos ? "#fff" : "var(--grey-500)" }}>{pr.phase === "wet" ? "เปียก" : "แห้ง"}</span>
                ))}</span>) },
              { key: "sfw", label: "ตัวปรับการจัดการน้ำ", align: "right", render: r => <span style={{ fontFamily: "var(--font-mono)" }}>{r.sfw.v.toFixed(2)}{r.sfw.fallback ? " ⚠" : ""}</span> },
              { key: "er", label: "ER (tCO₂eq)", align: "right", render: r => f3(r.er, 3) }
            ]}
            rows={rows} />
        </Section>
      ))}
      <Section title="ภาพถ่ายแปลงจากพื้นที่ของท่าน" sub="CU-02 · ผูกภาพถ่ายแปลงเข้ากับตัวเลขเครดิต · ภาพไม่ระบุตัวบุคคล">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-3)" }}>
          {PHOTO_ROUNDS.map(pr => (
            <div key={pr.code} style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
              <div style={{ position: "relative", aspectRatio: "4 / 3", background: "linear-gradient(180deg,#9FC7E8,#8FA95C)" }}>
                <span style={{ position: "absolute", left: "50%", top: "22%", transform: "translateX(-50%)", width: "16px", height: "54px", background: "#E7EDF2", borderRadius: "2px", overflow: "hidden" }}>
                  <span style={{ position: "absolute", inset: pr.phase === "wet" ? "6% 0 0 0" : "58% 0 0 0", background: "rgba(56,120,160,.75)" }} />
                </span>
              </div>
              <div style={{ padding: "7px 9px", background: "#fff" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-subtle)" }}>CPA1001/F01 · {pr.code}</div>
                <div style={{ fontSize: "11.5px", fontWeight: "var(--weight-semibold)", marginTop: "2px" }}>{pr.name}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function SponsorReports() {
  const allowed = EXPORTS.filter(e => e.who.includes("ลูกค้า"));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="รายงาน" title="ไฟล์ที่บริษัทของท่านดาวน์โหลดได้"
        sub="ขอบเขตจำกัดอยู่ที่พื้นที่ที่ท่านสนับสนุน · ทุกไฟล์ใช้ CPA code แทนชื่อ" />
      <Section title="รายงานที่เปิดให้ดาวน์โหลด" pad={false}>
        <DataTable
          columns={[
            { key: "name", label: "รายงาน", render: r => <span><b>{r.name}</b><br /><span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>{r.note}</span></span> },
            { key: "fmt", label: "รูปแบบ", render: r => <Tag tone="teal">{r.fmt}</Tag> },
            { key: "scope", label: "ขอบเขต" },
            { key: "a", label: "", align: "right", render: () => <Button size="sm" variant="outline" iconLeft={<Icon name="download" size={14} />}>ดาวน์โหลด</Button> }
          ]}
          rows={allowed} />
      </Section>
      <Section title="ใบรับรองเครดิตที่ออกแล้ว" sub="ออกโดยองค์การบริหารจัดการก๊าซเรือนกระจก (อบก.) หลังการทวนสอบ" pad={false}>
        <DataTable dense
          columns={[{ key: "id", label: "เลขที่ใบรับรอง" }, { key: "season", label: "ฤดู" }, { key: "vol", label: "tCO₂eq", align: "right" }, { key: "status", label: "สถานะ", render: r => <Badge tone={r.tone}>{r.status}</Badge> }, { key: "d", label: "วันที่ออก" }]}
          rows={[
            { id: "TVER-2568-0142", season: "นาปี 2568", vol: f3(SEASONS[0].verified), status: "คงเหลือในบัญชี", tone: "success", d: "12 มี.ค. 2569" },
            { id: "TVER-2568-0143", season: "นาปรัง 2568", vol: f3(SEASONS[1].verified), status: "ยกเลิกเพื่อชดเชยแล้ว", tone: "neutral", d: "20 พ.ค. 2569" },
            { id: "TVER-2569-xxxx", season: "นาปี + นาปรัง 2569", vol: f3(ESTIMATE) + " (ประมาณการ)", status: "รอทวนสอบ", tone: "warning", d: "—" }
          ]} />
      </Section>
    </div>
  );
}

Object.assign(window, { SponsorOverview, SponsorAreas, SponsorReports });
