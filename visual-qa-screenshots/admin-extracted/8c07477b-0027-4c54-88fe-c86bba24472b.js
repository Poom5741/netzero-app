const { Button, Badge, Tag, Icon, StatTile, DataTable, ProgressBar, Field, Input, Select, Textarea, Checkbox } = window.NetZeroCarbonDesignSystem_f3e7a8;
const f4 = (n, d = 2) => Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

function MockNote({ children }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", padding: "var(--space-4) var(--space-5)", background: "var(--status-warning-soft)", border: "1px dashed #E0BE7A", borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)", lineHeight: "var(--leading-relaxed)", color: "#8A5B10" }}>
      <span style={{ flex: "none", marginTop: "1px" }}>🚧</span><span><b>ยังเป็นตัวอย่าง (placeholder)</b> — {children}</span>
    </div>
  );
}

// ===== AD-10 · ตรวจและอนุมัติใบสมัคร =====
function ApplicationsScreen() {
  const apps = [
    { id: "AP-0312", code: "CPA1021", name: "สมพงษ์ ดีใจ", tambon: "หนองสะเดา", plots: 1, rai: 12.6, hold: "เจ้าของ", docs: 2, need: 3, age: "5 วัน", st: "เอกสารไม่ครบ", tone: "danger" },
    { id: "AP-0313", code: "CPA1022", name: "มาลี ศรีทอง", tambon: "หนองสะเดา", plots: 2, rai: 8.4, hold: "เจ้าของร่วม", docs: 4, need: 4, age: "2 วัน", st: "พร้อมอนุมัติ", tone: "success" },
    { id: "AP-0314", code: "CPA1023", name: "ประสิทธิ์ นากลาง", tambon: "หาดอาษา", plots: 1, rai: 5.1, hold: "ผู้เช่า", docs: 5, need: 6, age: "3 วัน", st: "รอสัญญาเช่า", tone: "warning" },
    { id: "AP-0315", code: "CPA1024", name: "จำรัส เทียนทอง", tambon: "หาดอาษา", plots: 3, rai: 19.8, hold: "ผู้รับมอบอำนาจ", docs: 6, need: 6, age: "1 วัน", st: "พร้อมอนุมัติ", tone: "success" }
  ];
  const [sel, setSel] = React.useState(apps[0]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="AD-10 · ใบสมัครรอตรวจ" title="ตรวจและอนุมัติใบสมัครเข้าร่วมโครงการ"
        sub="ชุดเอกสารที่บังคับเปลี่ยนตามสถานะการถือครอง (R-09) — เจ้าของ · เจ้าของร่วม · ผู้เช่า · ผู้รับมอบอำนาจ"
        actions={<Button size="sm" variant="outline" iconLeft={<Icon name="upload" size={15} />}>นำเข้าเป็นชุด</Button>} />
      <MockNote>หน้านี้ใช้ข้อมูลตัวอย่าง 4 ใบ ยังไม่ได้ต่อกับคิวใบสมัครจริง และยังไม่มีตัวอ่านเลขโฉนดจากภาพเพื่อเทียบกับ R-07 อัตโนมัติ</MockNote>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 400px", gap: "var(--space-6)", alignItems: "start" }}>
        <Section title="ใบสมัคร" pad={false}>
          <DataTable onRowClick={setSel}
            columns={[
              { key: "id", label: "เลขที่ใบสมัคร" }, { key: "code", label: "CPA code (จอง)" }, { key: "name", label: "ชื่อ - นามสกุล" },
              { key: "tambon", label: "ตำบล" }, { key: "hold", label: "สถานะการถือครอง", render: r => <Tag tone="neutral">{r.hold}</Tag> },
              { key: "rai", label: "ไร่", align: "right", render: r => f4(r.rai, 1) },
              { key: "docs", label: "เอกสาร", align: "right", render: r => r.docs + "/" + r.need },
              { key: "age", label: "ค้าง", align: "right" },
              { key: "st", label: "สถานะ", render: r => <Badge tone={r.tone}>{r.st}</Badge> }
            ]}
            rows={apps} />
        </Section>
        <Section title={sel.id} sub={sel.name + " · " + sel.hold}
          actions={<Badge tone={sel.tone}>{sel.st}</Badge>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {[["เบอร์ที่จับคู่ทะเบียน", "08x-xxx-5678 ✓"], ["เลขบัตรประชาชน", "•••••••••5678"], ["ที่อยู่", "ต." + sel.tambon + " อ.สามชุก"], ["แปลงในใบสมัคร", sel.plots + " แปลง · " + f4(sel.rai, 1) + " ไร่"], ["ความยินยอม CS-01 ถึง CS-04", "ครบ 4 ข้อ · v1.2"]].map(([k, v], i, arr) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", padding: "9px 12px", borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--grey-100)", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--text-muted)" }}>{k}</span><span style={{ fontWeight: "var(--weight-semibold)", textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {["DOC-01 โฉนด", "DOC-03 บัตร ปชช.", "DOC-07 สมุดบัญชี", "DOC-06 มอบอำนาจ", "DOC-02 สัญญาเช่า", "DOC-05 กรณีจำนอง"].slice(0, sel.need).map((d, i) => (
                <div key={d} style={{ display: "flex", gap: "8px", alignItems: "center", padding: "8px 10px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", background: i < sel.docs ? "var(--teal-50)" : "var(--white)" }}>
                  <span style={{ width: "24px", height: "30px", borderRadius: "3px", flex: "none", background: i < sel.docs ? "linear-gradient(160deg,#E7FCF7,#8FF3DE)" : "var(--grey-100)", display: "grid", placeItems: "center", fontSize: "11px", color: i < sel.docs ? "var(--teal-700)" : "var(--grey-400)" }}>{i < sel.docs ? "✓" : "—"}</span>
                  <span style={{ fontSize: "11px", fontWeight: "var(--weight-semibold)", color: i < sel.docs ? "var(--teal-800)" : "var(--text-subtle)" }}>{d}</span>
                </div>
              ))}
            </div>
            <Field label="ข้อความที่ส่งถึงเกษตรกร (OB-11)" hint={sel.docs < sel.need ? "กรณีขอข้อมูลเพิ่ม" : "กรณีผ่าน — ระบบจะแนบรหัสเกษตรกรให้เอง"}>
              <Textarea rows={2} defaultValue={sel.docs < sel.need ? "เอกสารยังไม่ครบครับ — ขอสำเนาหน้าสมุดบัญชีเพิ่มอีก 1 ฉบับ ช่วยแก้ไขและส่งใหม่นะครับ" : "บัญชีของคุณเปิดใช้งานแล้วครับ 🎉"} />
            </Field>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button variant="outline" fullWidth>ขอข้อมูลเพิ่ม</Button>
              <Button fullWidth disabled={sel.docs < sel.need} iconLeft={<Icon name="check" size={16} />}>อนุมัติและเปิดใช้งาน</Button>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-subtle)", lineHeight: "var(--leading-relaxed)" }}>
              อนุมัติแล้วระบบรัน CPA code และรหัสแปลงย่อยให้อัตโนมัติ (SY-07) แล้วเปลี่ยนสถานะจาก <code>pending_review</code> เป็น <code>active</code>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ===== AD-13 / LF-07 · นำเข้าใบสมัครเป็นชุด =====
function ImportScreen() {
  const [stage, setStage] = React.useState("pick");
  const rows = [
    { r: 2, code: "CPA1031", name: "บุญส่ง แก้วใส", deed: "8841", rai: "6.20", rice: "หอมปทุม", st: "ผ่าน", tone: "success", why: "—" },
    { r: 3, code: "CPA1032", name: "เพ็ญศรี ทองดี", deed: "8842", rai: "3.10", rice: "กข85", st: "ผ่าน", tone: "success", why: "—" },
    { r: 4, code: "—", name: "สมหมาย ใจงาม", deed: "8843", rai: "0", rice: "หอมปทุม", st: "ติดปัญหา", tone: "danger", why: "เนื้อที่แปลงเป็น 0 — ต้องมากกว่า 0 ไร่" },
    { r: 5, code: "—", name: "วิไล นาคอินทร์", deed: "7218", rai: "2.40", rice: "หอมปทุม", st: "ติดปัญหา", tone: "danger", why: "เลขโฉนด 7218 มีในระบบแล้ว (CPA1001) — ต้องระบุว่าเป็นแปลงใหม่หรือแก้ของเดิม" },
    { r: 6, code: "CPA1033", name: "ธนา พูลสุข", deed: "8845", rai: "11.75", rice: "กข43", st: "เตือน", tone: "warning", why: "ไม่มีเบอร์โทร — จับคู่ทะเบียนอัตโนมัติไม่ได้ ต้องให้ผู้ประสานงานยืนยันตัวตน" }
  ];
  const ok = rows.filter(r => r.st !== "ติดปัญหา").length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="AD-13 · LF-07" title="นำเข้าใบสมัครเป็นชุดจากไฟล์"
        sub="อัปโหลด .xlsx หรือ .csv ตามแม่แบบ 21 คอลัมน์ · ตรวจรายแถวก่อนนำเข้าจริง (dry-run)"
        actions={<Button size="sm" variant="outline" iconLeft={<Icon name="download" size={15} />}>ดาวน์โหลดแม่แบบ</Button>} />
      <MockNote>ยังไม่ได้ต่อกับ API จริง (<code>POST /api/farmer/import</code> และ <code>/commit</code>) ผลตรวจด้านล่างเป็นตัวอย่างผลลัพธ์ที่หน้านี้ต้องแสดง</MockNote>
      {stage === "pick" ? (
        <Section title="เลือกไฟล์">
          <div style={{ border: "2px dashed var(--border-default)", borderRadius: "var(--radius-lg)", padding: "var(--space-16)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
            <span style={{ width: "56px", height: "56px", borderRadius: "var(--radius-circle)", background: "var(--surface-accent-soft)", color: "var(--teal-700)", display: "grid", placeItems: "center" }}><Icon name="upload-cloud" size={26} /></span>
            <div>
              <div style={{ fontSize: "var(--text-md)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>ลากไฟล์มาวาง หรือกดเลือกไฟล์</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-subtle)", marginTop: "4px" }}>.xlsx หรือ .csv · ไม่เกิน 5,000 แถวต่อครั้ง · ต้องมีหัวคอลัมน์ตรงกับแม่แบบ</div>
            </div>
            <Button onClick={() => setStage("review")}>เลือกไฟล์ตัวอย่าง (5 แถว)</Button>
          </div>
        </Section>
      ) : (
        <React.Fragment>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-4)" }}>
            <StatTile label="แถวในไฟล์" value="5" unit="แถว" note="farmers_import_2569-08.xlsx · 21 คอลัมน์ครบ" />
            <StatTile label="ผ่านการตรวจ" value="2" unit="แถว" note="พร้อมนำเข้าเป็น pending_review" />
            <StatTile label="เตือน" value="1" unit="แถว" note="นำเข้าได้ แต่ต้องให้ผู้ประสานงานยืนยันตัวตน" />
            <StatTile label="ติดปัญหา" value="2" unit="แถว" note="นำเข้าไม่ได้จนแก้ไฟล์ต้นทาง" />
          </div>
          <Section title="ผลตรวจรายแถว (dry-run)" sub="ยังไม่มีการเขียนข้อมูลลงระบบ" pad={false}
            actions={<Button size="sm" variant="ghost" onClick={() => setStage("pick")}>เลือกไฟล์ใหม่</Button>}>
            <DataTable dense
              columns={[
                { key: "r", label: "แถว", align: "right" },
                { key: "code", label: "CPA code ที่จะรัน", render: r => <span style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>{r.code}</span> },
                { key: "name", label: "ชื่อ - นามสกุล" }, { key: "deed", label: "เลขโฉนด" },
                { key: "rai", label: "ไร่", align: "right" }, { key: "rice", label: "พันธุ์ข้าว" },
                { key: "st", label: "ผล", render: r => <Badge tone={r.tone}>{r.st}</Badge> },
                { key: "why", label: "เหตุผล" }
              ]}
              rows={rows} />
          </Section>
          <Section title="นำเข้าจริง">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <Field label="สถานะของบัญชีที่นำเข้า" hint="แนะนำให้เป็น pending_review เพื่อให้ผู้ประสานงานยืนยันตัวตนก่อน">
                <Select defaultValue="pending_review"><option value="pending_review">pending_review — รอยืนยันตัวตน</option><option value="active">active ทันที (ต้องมีหลักฐานการยืนยันแล้ว)</option></Select>
              </Field>
              <Checkbox label="ข้ามแถวที่ติดปัญหา และนำเข้าเฉพาะแถวที่ผ่าน" defaultChecked />
              <Checkbox label="ส่งไฟล์รายงานผลนำเข้าให้ดาวน์โหลดหลังเสร็จ (ทั้งแถวที่สำเร็จและแถวที่ติดปัญหาพร้อมเหตุผล)" defaultChecked />
              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="outline">ยกเลิก</Button>
                <Button iconLeft={<Icon name="check" size={16} />}>นำเข้า {ok} แถว</Button>
              </div>
            </div>
          </Section>
        </React.Fragment>
      )}
    </div>
  );
}

// ===== AD-16 · แผนที่ขอบแปลงรายโฉนด (เฟส 2) =====
function MapScreen() {
  const [sel, setSel] = React.useState(PLOTS[0].plot);
  // ขอบแปลงจำลอง — ไฟล์จริงมี WKT MULTIPOLYGON ครบทุกแปลง แต่เป็นพิกัด UTM zone 47N ต้องแปลงเป็น WGS84 ก่อน
  const shapes = PLOTS.slice(0, 10).map((p, i) => ({
    plot: p.plot, rai: p.rai, cpa: p.cpa,
    d: [[8, 14, 22, 16], [30, 10, 18, 24], [52, 18, 26, 14], [12, 44, 20, 20], [38, 40, 24, 18],
      [66, 36, 20, 26], [16, 70, 26, 16], [46, 66, 18, 22], [70, 68, 22, 18], [84, 20, 12, 30]][i]
  }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="AD-16 · เฟส 2" title="แผนที่ขอบแปลงรายโฉนด"
        sub="ใช้ตรวจว่าพิกัดของภาพหลักฐานตกในขอบเขตแปลงจริงหรือไม่ · ขอบแปลงมาจากคอลัมน์ WKT ในไฟล์คำนวณ"
        actions={<React.Fragment><Button size="sm" variant="outline" iconLeft={<Icon name="download" size={15} />}>ส่งออก GeoJSON</Button><Button size="sm" variant="outline">ซ้อนภาพดาวเทียม</Button></React.Fragment>} />
      <MockNote>
        แผนผังด้านล่างเป็นภาพจำลอง ไม่ใช่แผนที่จริง — ไฟล์ <code>NZC - การคำนวณ AWD.xlsx</code> มี <code>WKT MULTIPOLYGON</code> ของทุกแปลงพร้อมใช้แล้ว
        แต่พิกัดเป็น UTM zone 47N ต้องแปลงเป็น WGS84 ก่อนวางบนแผนที่จริง และยังไม่มีชั้นภาพถ่ายดาวเทียม/โดรนในชุดที่ให้มา
      </MockNote>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: "var(--space-6)", alignItems: "start" }}>
        <Section title="ต.หนองสะเดา อ.สามชุก จ.สุพรรณบุรี" sub="10 แปลงย่อยที่แสดงอยู่ · กดที่รูปแปลงเพื่อเลือก" pad={false}>
          <div style={{ position: "relative", aspectRatio: "16 / 10", background: "linear-gradient(160deg,#E9F0E2,#D6E4C8 55%,#C3D6B2)", overflow: "hidden" }}>
            {[18, 38, 58, 78].map(t => <span key={t} style={{ position: "absolute", left: 0, right: 0, top: t + "%", height: "3px", background: "rgba(120,140,110,.35)" }} />)}
            {[26, 62].map(l => <span key={l} style={{ position: "absolute", top: 0, bottom: 0, left: l + "%", width: "4px", background: "rgba(110,150,190,.45)" }} />)}
            {shapes.map(s => {
              const on = s.plot === sel;
              return (
                <button key={s.plot} onClick={() => setSel(s.plot)} title={s.plot}
                  style={{ position: "absolute", left: s.d[0] + "%", top: s.d[1] + "%", width: s.d[2] + "%", height: s.d[3] + "%", border: "2px solid " + (on ? "var(--teal-600)" : "rgba(6,30,92,.5)"), background: on ? "rgba(2,142,145,.34)" : "rgba(6,30,92,.13)", borderRadius: "3px", cursor: "pointer", padding: 0, display: "grid", placeItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, color: on ? "#fff" : "var(--navy-900)", background: on ? "var(--teal-700)" : "rgba(255,255,255,.7)", padding: "1px 4px", borderRadius: "3px" }}>{s.plot.split("/")[1]}</span>
                  {on ? <span style={{ position: "absolute", left: "52%", top: "48%", width: "9px", height: "9px", borderRadius: "50%", background: "var(--status-danger)", boxShadow: "0 0 0 3px rgba(255,255,255,.8)" }} /> : null}
                </button>
              );
            })}
            <span style={{ position: "absolute", left: "12px", bottom: "12px", background: "rgba(255,255,255,.9)", borderRadius: "var(--radius-sm)", padding: "8px 11px", fontSize: "11px", display: "flex", flexDirection: "column", gap: "5px" }}>
              {[["rgba(6,30,92,.5)", "ขอบแปลงจาก WKT"], ["var(--teal-600)", "แปลงที่เลือก"], ["var(--status-danger)", "พิกัดของภาพหลักฐาน"]].map(([c, l]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "2px", background: c }} />{l}</span>
              ))}
            </span>
            <span style={{ position: "absolute", right: "12px", bottom: "12px", background: "rgba(255,255,255,.9)", borderRadius: "var(--radius-sm)", padding: "6px 10px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)" }}>UTM 47N → ยังไม่แปลงเป็น WGS84</span>
          </div>
        </Section>
        <Section title={sel} sub="ข้อมูลแปลงที่เลือก">
          {(() => {
            const p = PLOTS.find(x => x.plot === sel);
            const c = computePlotSeason(p);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", fontSize: "var(--text-xs)" }}>
                {[["CPA code", p.cpa], ["เลขโฉนด", p.deed], ["เนื้อที่", f4(p.rai, 2) + " ไร่"], ["พันธุ์ข้าว", p.rice], ["ภาพหลักฐาน", p.photosApproved + "/4 รอบ"], ["SF_w ที่ใช้จริง", c.sfWpj.v.toFixed(2) + (c.sfWpj.fallback ? " (fallback)" : "")], ["ER ฤดูนี้", f4(c.er, 3) + " tCO₂eq"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", paddingBottom: "7px", borderBottom: "1px dashed var(--grey-200)" }}>
                    <span style={{ color: "var(--text-muted)" }}>{k}</span><span style={{ fontWeight: "var(--weight-semibold)", textAlign: "right" }}>{v}</span>
                  </div>
                ))}
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9.5px", color: "var(--text-subtle)", background: "var(--grey-50)", padding: "8px 9px", borderRadius: "var(--radius-sm)", wordBreak: "break-all", lineHeight: 1.5 }}>
                  MULTIPOLYGON (((606807.999 1636052.415, 606691.291 1635846.094, …)))
                </div>
                <Button size="sm" variant="outline" fullWidth iconLeft={<Icon name="image" size={14} />}>ดูภาพหลักฐานของแปลงนี้</Button>
              </div>
            );
          })()}
        </Section>
      </div>
    </div>
  );
}

// ===== AD-12 · โหมดเจ้าหน้าที่ตอบแชต =====
function ChatModeScreen() {
  const threads = [
    { code: "CPA1001", last: "ถ่ายรูปแล้วแต่ส่งไม่ได้ครับ สัญญาณไม่ดี", at: "09:12", unread: 2, on: true },
    { code: "CPA1006", last: "ท่อวัดระดับน้ำหักครับ ขอใหม่ได้ไหม", at: "08:40", unread: 1, on: false },
    { code: "CPA1012", last: "ยังไม่ได้หว่านครับ ฝนไม่มา", at: "เมื่อวาน", unread: 0, on: false }
  ];
  const [sel, setSel] = React.useState(threads[0]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="AD-12 · โหมดเจ้าหน้าที่ตอบแชต" title="รับช่วงคุยกับเกษตรกรจากบอต"
        sub="เมื่อเจ้าหน้าที่เข้ารับ บอตจะหยุดตอบอัตโนมัติจนกดคืนให้บอต · เวลาทำการ จ-ศ 08:30-17:00" />
      <MockNote>ยังไม่ได้ต่อกับ LINE Messaging API — ข้อความในหน้านี้เป็นตัวอย่าง และยังไม่มีระบบมอบหมายงาน (assign) หรือแม่แบบคำตอบ</MockNote>
      <div style={{ display: "grid", gridTemplateColumns: "300px minmax(0,1fr)", gap: "var(--space-6)", alignItems: "start" }}>
        <Section title="ห้องแชต" sub="ระบุด้วย CPA code" pad={false}>
          <div>
            {threads.map(t => (
              <button key={t.code} onClick={() => setSel(t)} style={{ width: "100%", textAlign: "left", border: "none", borderBottom: "1px solid var(--grey-100)", background: sel.code === t.code ? "var(--navy-50)" : "#fff", padding: "12px 14px", cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ width: "34px", height: "34px", borderRadius: "var(--radius-circle)", background: "var(--teal-600)", color: "#fff", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: 700, flex: "none" }}>{t.code.slice(-2)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", justifyContent: "space-between", gap: "6px" }}>
                    <b style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{t.code}</b>
                    <span style={{ fontSize: "10px", color: "var(--text-subtle)" }}>{t.at}</span>
                  </span>
                  <span style={{ display: "block", fontSize: "11.5px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.last}</span>
                  <span style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                    {t.unread ? <Badge tone="danger">{t.unread} ใหม่</Badge> : null}
                    {t.on ? <Badge tone="info">เจ้าหน้าที่รับแล้ว</Badge> : <Badge tone="neutral" dot={false}>บอตตอบอยู่</Badge>}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Section>
        <Section title={sel.code} sub={sel.on ? "โหมดเจ้าหน้าที่ — บอตหยุดตอบอัตโนมัติ" : "บอตตอบอยู่ — กดรับเพื่อคุยเอง"}
          actions={<Button size="sm" variant={sel.on ? "outline" : "primary"}>{sel.on ? "คืนให้บอต" : "รับเรื่องนี้"}</Button>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", minHeight: "280px" }}>
            {[["farmer", "ถ่ายรูปแล้วแต่ส่งไม่ได้ครับ สัญญาณไม่ดี", "09:12"],
              ["bot", "ระบบมีโหมดสัญญาณไม่ดีครับ (SY-06) ภาพจะเก็บไว้ในเครื่องแล้วส่งอัตโนมัติเมื่อมีสัญญาณ", "09:12"],
              ["farmer", "กดที่ไหนครับ", "09:13"],
              ["staff", "สวัสดีครับ เจ้าหน้าที่รับเรื่องแล้วครับ — กดที่เมนู 'บันทึกงานในแปลง' แล้วดูแถบสีเหลืองด้านบน จะมีปุ่ม 'ส่งภาพที่ค้างอยู่' ครับ", "09:15"]].map(([who, text, at], i) => (
              <div key={i} style={{ display: "flex", justifyContent: who === "farmer" ? "flex-start" : "flex-end" }}>
                <div style={{ maxWidth: "68%", padding: "10px 13px", borderRadius: "14px", fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)", background: who === "farmer" ? "var(--grey-100)" : who === "bot" ? "var(--navy-50)" : "var(--teal-600)", color: who === "staff" ? "#fff" : "var(--text-body)" }}>
                  <div style={{ fontSize: "10px", fontWeight: "var(--weight-semibold)", opacity: .72, marginBottom: "3px" }}>{who === "farmer" ? "เกษตรกร" : who === "bot" ? "บอต (ตอบอัตโนมัติ)" : "เจ้าหน้าที่"} · {at}</div>
                  {text}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "var(--space-4)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border-subtle)" }}>
            <Input placeholder="พิมพ์ข้อความถึงเกษตรกร…" />
            <Button iconLeft={<Icon name="send" size={15} />}>ส่ง</Button>
          </div>
        </Section>
      </div>
    </div>
  );
}

Object.assign(window, { ApplicationsScreen, ImportScreen, MapScreen, ChatModeScreen, MockNote });
