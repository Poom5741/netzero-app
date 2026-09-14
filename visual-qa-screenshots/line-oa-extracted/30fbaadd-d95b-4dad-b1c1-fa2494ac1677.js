const { Button, Field, Input, Select, Checkbox, Badge, Tag, Icon, ProgressBar, GradientRule } = window.NetZeroCarbonDesignSystem_f3e7a8;

function LiffShell({ title, subtitle, onClose, children, footer }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--white)", display: "flex", flexDirection: "column", zIndex: 5 }}>
      <div style={{ background: "var(--gradient-deep)", color: "#fff", padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <span style={{ width: "26px", height: "26px", borderRadius: "var(--radius-circle)", background: "#fff", display: "grid", placeItems: "center", flex: "none", overflow: "hidden" }}>
          <img src="../../assets/logos/NZC-Mark-Full.png" alt="" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
        </span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: "block", fontSize: "14px", fontWeight: "var(--weight-bold)", lineHeight: 1.25 }}>{title}</span>
          {subtitle ? <span style={{ display: "block", fontSize: "10.5px", opacity: .82, marginTop: "2px" }}>{subtitle}</span> : null}
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: "17px", cursor: "pointer", lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "14px", background: "var(--grey-50)" }}>{children}</div>
      {footer ? <div style={{ borderTop: "1px solid var(--border-subtle)", background: "#fff", padding: "10px 14px" }}>{footer}</div> : null}
    </div>
  );
}

function Panel({ title, hint, children, tone }) {
  return (
    <div style={{ background: tone === "warn" ? "var(--status-warning-soft)" : "var(--white)", border: "1px solid " + (tone === "warn" ? "#F2DDB4" : "var(--border-subtle)"), borderRadius: "var(--radius-md)", padding: "12px 13px", display: "flex", flexDirection: "column", gap: "9px" }}>
      {title ? <div style={{ fontSize: "13px", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>{title}</div> : null}
      {hint ? <div style={{ fontSize: "11px", color: "var(--text-subtle)", lineHeight: 1.55, marginTop: "-4px" }}>{hint}</div> : null}
      {children}
    </div>
  );
}

// LF-01 · หน้าสมัครบัญชีด้วยตัวเอง
function LiffRegister({ onClose }) {
  const [step, setStep] = React.useState(1);
  return (
    <LiffShell title="ฟอร์มสมัครเข้าร่วมโครงการ" subtitle={"LF-01 · ขั้นที่ " + step + " จาก 2"} onClose={onClose}
      footer={step === 1
        ? <Button fullWidth onClick={() => setStep(2)} iconRight={<Icon name="arrow-right" size={15} />}>ต่อไป · ข้อมูลแปลง</Button>
        : <div style={{ display: "flex", gap: "8px" }}><Button variant="outline" onClick={() => setStep(1)}>ย้อนกลับ</Button><Button fullWidth onClick={onClose}>ส่งใบสมัคร</Button></div>}>
      <div style={{ display: "flex", gap: "6px" }}>
        {[1, 2].map(i => <span key={i} style={{ flex: 1, height: "4px", borderRadius: "var(--radius-pill)", background: i <= step ? "var(--teal-600)" : "var(--grey-200)" }} />)}
      </div>
      {step === 1 ? (
        <React.Fragment>
          <Panel title="ข้อมูลของท่าน" hint="R-01 ถึง R-06 · กรอกให้ตรงกับบัตรประชาชน">
            <Field label="ชื่อ - นามสกุล" required><Input defaultValue="สมชาย ใจดี" /></Field>
            <Field label="เพศ"><Select defaultValue="ชาย"><option>ชาย</option><option>หญิง</option><option>ไม่ระบุ</option></Select></Field>
            <Field label="เบอร์โทรศัพท์" hint="มาจากปุ่มแชร์เบอร์ของ LINE"><Input defaultValue="081-234-5678" readOnly /></Field>
            <Field label="เลขบัตรประชาชน" required hint="เก็บแบบเข้ารหัส แสดงเฉพาะ 4 ตัวท้าย"><Input defaultValue="•••••••••5678" /></Field>
            <Field label="ที่อยู่ตามทะเบียนบ้าน" required><Input defaultValue="ต.หนองผักนาก อ.สามชุก จ.สุพรรณบุรี" /></Field>
            <Field label="กลุ่ม / สหกรณ์"><Input defaultValue="วิสาหกิจชุมชนสามชุกร่วมใจ" /></Field>
          </Panel>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Panel title="ทะเบียนโฉนด" hint="R-07 ถึง R-14 · เพิ่มได้หลายใบ แต่ละใบระบุจำนวนแปลง">
            <Field label="เลขโฉนด" required><Input defaultValue="7218" /></Field>
            <Field label="ประเภทเอกสารสิทธิ์"><Select defaultValue="โฉนด"><option>โฉนด</option><option>น.ส.3ก</option><option>ส.ป.ก.</option></Select></Field>
            <Field label="สถานะการถือครอง" required><Select defaultValue="เจ้าของ"><option>เจ้าของ</option><option>เจ้าของร่วม</option><option>ผู้เช่า</option><option>ผู้รับมอบอำนาจ</option></Select></Field>
            <Field label="โฉนดใบนี้มีกี่แปลง" hint="ระบบรันรหัสแปลงให้เอง: CPA1001/F01, CPA1001/F02"><Select defaultValue="1 แปลง"><option>1 แปลง</option><option>2 แปลง</option><option>3 แปลง</option></Select></Field>
            <Field label="เนื้อที่รายแปลง (ไร่)" required><Input defaultValue="2.40" /></Field>
            <Field label="พันธุ์ข้าว" hint="R-14 · บันทึกซ้ำทุกฤดู · กำหนดรอบปลูก 120 วัน"><Select defaultValue="หอมปทุม"><option>หอมปทุม</option><option>กข85</option><option>กข43</option><option>พิมพ์เอง</option></Select></Field>
          </Panel>
          <Panel title="พิกัดกลางแปลง" hint="กดปุ่มแล้วยืนที่กลางแปลง ระบบจะจับพิกัดให้">
            <div style={{ height: "84px", borderRadius: "var(--radius-sm)", background: "linear-gradient(150deg,#CFE3B9,#8FA95C)", position: "relative" }}>
              <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", color: "#fff", fontSize: "20px" }}>◉</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>14.9231, 100.1042</div>
          </Panel>
        </React.Fragment>
      )}
    </LiffShell>
  );
}

// OB-13 · แนบเอกสารสิทธิ์
function LiffDocs({ onClose }) {
  const [done, setDone] = React.useState({ "DOC-01": true, "DOC-03": false, "DOC-06": false });
  const list = [["DOC-01", "โฉนดที่ดิน หน้า-หลัง", "เกษตรกร"], ["DOC-03", "สำเนาบัตรประชาชน", "เกษตรกร"], ["DOC-06", "หนังสือมอบอำนาจ", "บริษัทมีแบบฟอร์มให้"]];
  const n = Object.values(done).filter(Boolean).length;
  return (
    <LiffShell title="แนบเอกสารสิทธิ์" subtitle={"แปลง CPA1001/F01 · ครบแล้ว " + n + "/3 รายการ"} onClose={onClose}
      footer={<Button fullWidth disabled={n < 3} onClick={onClose}>{n < 3 ? "ยังแนบไม่ครบ" : "ส่งใบสมัคร"}</Button>}>
      <Panel tone="warn" title="เอกสารไม่ครบ = ส่งใบสมัครไม่ได้" hint="ทุกฉบับต้องเซ็นรับรองสำเนาถูกต้อง และระบุว่าใช้สำหรับโครงการบริษัทเนทซีโรคาร์บอน จำกัด" />
      {list.map(([code, name, by]) => (
        <div key={code} style={{ background: "#fff", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "12px 13px", display: "flex", gap: "11px", alignItems: "center" }}>
          <span style={{ width: "44px", height: "56px", borderRadius: "4px", flex: "none", background: done[code] ? "linear-gradient(160deg,#E7FCF7,#8FF3DE)" : "var(--grey-100)", border: "1px solid var(--border-subtle)", display: "grid", placeItems: "center", color: done[code] ? "var(--teal-700)" : "var(--grey-400)" }}>
            <Icon name={done[code] ? "file-check" : "file-plus"} size={19} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-subtle)" }}>{code}</span>
            <span style={{ display: "block", fontSize: "13px", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>{name}</span>
            <span style={{ display: "block", fontSize: "10.5px", color: "var(--text-subtle)" }}>{by}</span>
          </span>
          {done[code]
            ? <Badge tone="success">แนบแล้ว</Badge>
            : <Button size="sm" onClick={() => setDone({ ...done, [code]: true })}>ถ่าย</Button>}
        </div>
      ))}
    </LiffShell>
  );
}

// LF-04 · หน้ากล้องบังคับ — หัวใจของหลักฐาน
function LiffCamera({ onClose }) {
  const [shot, setShot] = React.useState(false);
  return (
    <LiffShell title="กล้องของระบบ" subtitle="LF-04 · DRY-1 · รอบที่ 1 ช่วงแห้ง (SG-05)" onClose={onClose}
      footer={shot
        ? <div style={{ display: "flex", gap: "8px" }}><Button variant="outline" onClick={() => setShot(false)}>ถ่ายใหม่</Button><Button fullWidth onClick={onClose}>ใช้ภาพนี้</Button></div>
        : <Button fullWidth onClick={() => setShot(true)} iconLeft={<Icon name="camera" size={16} />}>ถ่ายภาพ</Button>}>
      <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", height: "240px", background: "linear-gradient(180deg,#9FC7E8 0%,#CFE3B9 52%,#8FA95C 100%)" }}>
        <span style={{ position: "absolute", left: "50%", top: "22%", transform: "translateX(-50%)", width: "26px", height: "122px", background: "#E7EDF2", borderRadius: "4px", boxShadow: "0 0 0 1px rgba(0,0,0,.18)" }} />
        <span style={{ position: "absolute", inset: "18px", border: "2px dashed rgba(255,255,255,.72)", borderRadius: "var(--radius-sm)" }} />
        <span style={{ position: "absolute", left: "50%", bottom: "44px", transform: "translateX(-50%)", background: "rgba(0,0,0,.5)", color: "#fff", fontSize: "11px", padding: "3px 9px", borderRadius: "var(--radius-pill)" }}>วางท่อ PVC ให้อยู่ในกรอบ</span>
        <span style={{ position: "absolute", left: "8px", bottom: "8px", background: "rgba(0,0,0,.58)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "10px", padding: "3px 7px", borderRadius: "5px" }}>14.9231, 100.1042 · 07:41</span>
        {shot ? <span style={{ position: "absolute", right: "8px", top: "8px" }}><Badge tone="success">มีพิกัดและเวลา</Badge></span> : null}
      </div>
      <Panel title="รอบนี้คือช่วงแห้ง — ถ่ายให้เห็นระดับน้ำต่ำกว่าผิวดิน" hint="ยืนห่างประมาณ 1 เมตร · ต้องเปิด GPS · ภาพที่ส่งทางแชตใช้เป็นหลักฐานไม่ได้ เพราะ LINE ตัดพิกัดและเวลาถ่ายทิ้ง · ครอปนี้ต้องส่งครบ 4 ภาพ (เปียก 2 · แห้ง 2)" />
      {shot ? (
        <Panel title="ระดับน้ำในท่อ (ซม.)" hint="อ่านจากขีดบนท่อ — ต่ำกว่าผิวดินกี่เซนติเมตร">
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["0", "5", "10", "15", ">15", "พิมพ์เอง"].map((v, i) => (
              <span key={v} style={{ padding: "7px 13px", borderRadius: "var(--radius-pill)", border: "1px solid " + (i === 2 ? "var(--teal-600)" : "var(--border-default)"), background: i === 2 ? "var(--teal-600)" : "#fff", color: i === 2 ? "#fff" : "var(--text-body)", fontSize: "12px", fontWeight: "var(--weight-semibold)" }}>{v}</span>
            ))}
          </div>
        </Panel>
      ) : null}
    </LiffShell>
  );
}

// PJ-13 · ปฏิทิน 9 ขั้น
function LiffCalendar({ onClose }) {
  const stages = [
    ["SG-01", "เตรียมแปลง", "วันที่ -20 ถึง -1", "done", ""],
    ["SG-02", "หว่าน / ปักดำ", "วันที่ 0 · 1 ก.ค.", "done", ""],
    ["SG-03", "ใส่ปุ๋ยเคมีครั้งที่ 1", "อายุ 15-25 วัน", "done", ""],
    ["SG-04", "ภาพรอบที่ 1 · เปียก", "วันที่ 28 · ส่งแล้ว", "done", "wet"],
    ["SG-05", "ภาพรอบที่ 1 · แห้ง", "วันที่ 42 · เหลือ 3 วัน", "now", "dry"],
    ["SG-06", "ใส่ปุ๋ยเคมีครั้งที่ 2", "อายุ 45-55 วัน", "next", ""],
    ["SG-07", "ภาพรอบที่ 2 · เปียก", "วันที่ 61", "lock", "wet"],
    ["SG-08", "ภาพรอบที่ 2 · แห้ง", "วันที่ 75", "lock", "dry"],
    ["SG-09", "เก็บเกี่ยว และจัดการฟาง", "ตามพันธุ์ข้าว 120 วัน", "lock", ""]
  ];
  const mark = { done: ["✓", "var(--teal-600)", "#fff"], now: ["●", "var(--status-warning)", "#fff"], next: ["○", "var(--white)", "var(--text-subtle)"], lock: ["🔒", "var(--grey-100)", "var(--grey-500)"] };
  return (
    <LiffShell title="ปฏิทินฤดูนี้" subtitle="แปลงนาหลังบ้าน · นาปี 2569 · 9 ขั้นตอน" onClose={onClose}
      footer={<Button fullWidth onClick={onClose}>ถ่ายภาพรอบที่ 1 · แห้ง (SG-05)</Button>}>
      <Panel title="ความคืบหน้า 4/9 ขั้นตอน" hint="กำหนดของแต่ละขั้นคำนวณจากวันหว่านบวกอายุของพันธุ์ข้าว (120 วัน)">
        <ProgressBar value={4} max={9} valueLabel="4/9" />
      </Panel>
      <Panel tone="warn" title="ภาพท่อวัดระดับน้ำ 4 รอบต่อครอป" hint="เปียก 2 ครั้ง แห้ง 2 ครั้ง สลับกัน — ต้องครบทั้ง 4 ภาพ เครดิตจึงคิดได้เต็ม ถ้าไม่ครบระบบจะคิดให้ต่ำลงโดยอัตโนมัติ">
        <div style={{ display: "flex", gap: "6px" }}>
          {[["เปียก 1", true], ["แห้ง 1", false], ["เปียก 2", false], ["แห้ง 2", false]].map(([l, ok]) => (
            <span key={l} style={{ flex: 1, textAlign: "center", padding: "7px 4px", borderRadius: "var(--radius-sm)", fontSize: "11px", fontWeight: "var(--weight-semibold)", background: ok ? "var(--teal-600)" : "var(--white)", color: ok ? "#fff" : "var(--text-subtle)", border: "1px solid " + (ok ? "var(--teal-600)" : "var(--border-default)") }}>{l}</span>
          ))}
        </div>
      </Panel>
      <div style={{ background: "#fff", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        {stages.map(([code, name, when, st, phase], i) => {
          const [g, bg, fg] = mark[st];
          return (
            <div key={code} style={{ display: "flex", gap: "11px", alignItems: "center", padding: "11px 13px", borderBottom: i === stages.length - 1 ? "none" : "1px solid var(--grey-100)", background: st === "now" ? "var(--status-warning-soft)" : "#fff" }}>
              <span style={{ width: "24px", height: "24px", flex: "none", borderRadius: "var(--radius-circle)", background: bg, color: fg, display: "grid", placeItems: "center", fontSize: "11px", border: st === "next" ? "1px solid var(--border-default)" : "none" }}>{g}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "12.5px", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>{name}</span>
                <span style={{ display: "block", fontSize: "10.5px", color: "var(--text-subtle)" }}>{code} · {when}{phase ? (phase === "wet" ? " · 📷 น้ำเต็มท่อ" : " · 📷 น้ำต่ำกว่าผิวดิน") : ""}</span>
              </span>
              {st === "now" ? <Button size="sm">บันทึก</Button> : null}
            </div>
          );
        })}
      </div>
    </LiffShell>
  );
}

// RP-05 / LF-12 · แดชบอร์ดความคืบหน้าของฉัน
function LiffSummary({ onClose }) {
  const [tab, setTab] = React.useState("ผล");
  return (
    <LiffShell title="แดชบอร์ดของฉัน" subtitle="CPA1001 · แปลงนาหลังบ้าน · นาปี 2569" onClose={onClose}>
      <div style={{ display: "flex", gap: "4px", background: "var(--grey-100)", padding: "3px", borderRadius: "var(--radius-pill)" }}>
        {["ผล", "เครดิต", "ภาพ"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, border: "none", borderRadius: "var(--radius-pill)", padding: "7px 4px", fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: "var(--weight-semibold)", cursor: "pointer", background: tab === t ? "#fff" : "transparent", color: tab === t ? "var(--teal-700)" : "var(--text-muted)", boxShadow: tab === t ? "var(--shadow-xs)" : "none" }}>{t}</button>
        ))}
      </div>
      {tab === "ผล" ? (
        <React.Fragment>
          <div style={{ background: "var(--gradient-deep)", color: "#fff", borderRadius: "var(--radius-md)", padding: "15px 14px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", color: "var(--teal-300)", fontWeight: "var(--weight-semibold)" }}>คาร์บอนที่ลดได้ (ประมาณการ)</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "7px", marginTop: "5px" }}>
              <span style={{ fontSize: "38px", fontWeight: "var(--weight-light)", lineHeight: 1 }}>9.42</span>
              <span style={{ fontSize: "13px", opacity: .8 }}>tCO₂eq</span>
            </div>
            <div style={{ fontSize: "10.5px", opacity: .72, marginTop: "6px", lineHeight: 1.5 }}>ประมาณการก่อนทวนสอบ · ถ้าส่งภาพครบ 4 รอบจะได้เต็มค่านี้ ถ้าไม่ครบจะลดลงเหลือประมาณ 6.1 tCO₂eq</div>
          </div>
          <Panel title="สิ่งที่ต้องทำต่อไป" tone="warn">
            <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--text-body)" }}><span>⏱</span><span>ถ่ายภาพรอบที่ 2 · เปียก (SG-07) — วันที่ 61 หลังหว่าน</span></div>
            <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--text-body)" }}><span>⏱</span><span>ถ่ายภาพรอบที่ 2 · แห้ง (SG-08) — วันที่ 75 หลังหว่าน</span></div>
            <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--text-body)" }}><span>⏱</span><span>กรอกข้อมูลย้อนหลังอีก 2 ฤดู</span></div>
          </Panel>
          <Panel title="ภาพหลักฐานครอปนี้ 2 จาก 4 ภาพ" hint="เปียก 2 ครั้ง แห้ง 2 ครั้ง สลับกัน">
            <ProgressBar label="ภาพที่อนุมัติแล้ว" value={2} max={4} valueLabel="2/4" />
            <ProgressBar label="ข้อมูลย้อนหลัง" value={4} max={6} valueLabel="4/6 ฤดู" tone="mint" />
            <ProgressBar label="ปัจจัยการผลิตครบ" value={7} max={12} valueLabel="7/12" tone="navy" />
          </Panel>
        </React.Fragment>
      ) : null}
      {tab === "เครดิต" ? (
        <React.Fragment>
          <Panel title="เครดิตของคุณมาจากไหน" hint="เกือบทั้งหมดมาจากมีเทนในนาข้าวที่ลดลงเพราะปล่อยแห้งสลับเปียก">
            <div style={{ fontSize: "12px", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)", display: "flex", justifyContent: "space-between" }}><span>มีเทนจากนาข้าว</span><span style={{ color: "var(--status-success)" }}>ลดลง 70%</span></div>
            <ProgressBar label="ก่อนเข้าโครงการ" value={100} max={100} valueLabel="100" tone="grey" />
            <ProgressBar label="ฤดูนี้ (ทำ AWD)" value={30} max={100} valueLabel="30" />
            <div style={{ height: "1px", background: "var(--grey-100)", margin: "4px 0" }} />
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              โครงการ<b style={{ color: "var(--text-heading)" }}>ไม่ได้ขอให้ลดปุ๋ย</b> — ยอดปุ๋ยของคุณจะถูกบันทึกเท่าเดิมทั้งก่อนและระหว่างโครงการ แต่ยังต้องกรอกให้ครบ เพราะปุ๋ยเข้าสมการอีกก๊าซหนึ่ง (N₂O)
            </div>
          </Panel>
          <Panel title="ภาพครบ 4 รอบ = เครดิตเต็ม" hint="ถ้าภาพไม่ครบ ระบบจะถือว่าปล่อยแห้งได้แค่ 1 ครั้ง ทำให้เครดิตลดลง">
            {[["ส่งครบ 4 ภาพ (เปียก 2 · แห้ง 2)", "9.42 tCO₂eq", true], ["ส่งไม่ครบ", "6.12 tCO₂eq", false]].map(([a, b, ok]) => (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", padding: "7px 9px", borderRadius: "var(--radius-sm)", background: ok ? "var(--teal-50)" : "var(--grey-100)" }}>
                <span style={{ color: ok ? "var(--teal-800)" : "var(--text-muted)" }}>{a}</span>
                <b style={{ color: ok ? "var(--teal-800)" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{b}</b>
              </div>
            ))}
          </Panel>
          <Panel title="บันทึกปุ๋ยฤดูนี้" hint="3 ครั้งต่อฤดู · ระบบคิดไนโตรเจนให้เอง = อัตรา × %N ÷ 100">
            {[["ครั้งที่ 1 · รองพื้น", "16-8-8", "25 กก./ไร่", "4.00 กก.N"], ["ครั้งที่ 2 · แตกกอ", "46-0-0 ยูเรีย", "20 กก./ไร่", "9.20 กก.N"], ["ครั้งที่ 3", "ยังไม่บันทึก", "—", "—"]].map(([a, b, c, d]) => (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "11.5px", padding: "5px 0", borderBottom: "1px dashed var(--grey-100)" }}>
                <span style={{ color: "var(--text-muted)" }}>{a}</span>
                <span style={{ textAlign: "right" }}><b style={{ fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>{b}</b><br /><span style={{ color: "var(--text-subtle)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>{c} → {d}</span></span>
              </div>
            ))}
          </Panel>
        </React.Fragment>
      ) : null}
      {tab === "ภาพ" ? (
        <Panel title="ภาพท่อวัดระดับน้ำ 4 รอบของครอปนี้" hint="แตะภาพเพื่อดูพิกัดและเวลา · ภาพที่ตีกลับต้องถ่ายใหม่">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
            {[["เปียก 1", "ผ่าน"], ["แห้ง 1", "ผ่าน"], ["เปียก 2", "ตีกลับ"], ["แห้ง 2", "ยังไม่ส่ง"]].map(([c, st], i) => (
              <div key={i} style={{ position: "relative", borderRadius: "var(--radius-sm)", overflow: "hidden", aspectRatio: "1 / 1", background: "linear-gradient(180deg,#9FC7E8,#8FA95C)" }}>
                <span style={{ position: "absolute", left: "50%", top: "24%", transform: "translateX(-50%)", width: "9px", height: "34px", background: "#E7EDF2", borderRadius: "2px" }} />
                <span style={{ position: "absolute", inset: "auto 0 0 0", background: "rgba(0,0,0,.55)", color: "#fff", fontSize: "9px", padding: "2px 4px", display: "flex", justifyContent: "space-between" }}>
                  <span>{c}</span><span style={{ color: st === "ผ่าน" ? "#8FF3DE" : st === "ตีกลับ" ? "#FFB4B4" : "#FFE29A" }}>{st}</span>
                </span>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
    </LiffShell>
  );
}

// RP-02 · แปลงของฉัน
function LiffFields({ onClose }) {
  const fields = [["CPA1001/F01", "แปลงนาหลังบ้าน", "2.40 ไร่", "หอมปทุม", "ภาพ 2/4 ครอปนี้", "warning"], ["CPA1001/F02", "แปลงติดคลอง", "6.25 ไร่", "หอมปทุม", "ภาพครบ 4/4", "success"], ["CPA1002/F01", "แปลงเช่า", "4.02 ไร่", "หอมปทุม", "สัญญาเช่าใกล้หมดอายุ", "danger"]];
  return (
    <LiffShell title="แปลงของฉัน" subtitle="3 แปลงย่อย · เลือกแปลงที่จะทำงานด้วย" onClose={onClose}>
      {fields.map(([code, name, area, rice, st, tone]) => (
        <div key={code} style={{ background: "#fff", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "12px 13px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
            <span>
              <span style={{ display: "block", fontSize: "13px", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>{name}</span>
              <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-subtle)" }}>{code}</span>
            </span>
            <Badge tone={tone}>{st}</Badge>
          </div>
          <div style={{ display: "flex", gap: "6px" }}><Tag tone="neutral">{area}</Tag><Tag tone="teal">{rice}</Tag></div>
          <Button size="sm" variant="outline" fullWidth onClick={onClose}>เลือกแปลงนี้</Button>
        </div>
      ))}
    </LiffShell>
  );
}

// RP-04 · ติดต่อเจ้าหน้าที่
function LiffContact({ onClose }) {
  return (
    <LiffShell title="ติดต่อเจ้าหน้าที่" subtitle="จ-ศ 08:30-17:00" onClose={onClose}
      footer={<Button fullWidth onClick={onClose}>คุยกับเจ้าหน้าที่ในแชต</Button>}>
      <Panel title="ผู้ประสานงานพื้นที่ของคุณ" hint="อ.สามชุก จ.สุพรรณบุรี">
        <div style={{ display: "flex", gap: "11px", alignItems: "center" }}>
          <span style={{ width: "42px", height: "42px", borderRadius: "var(--radius-circle)", background: "var(--navy-50)", color: "var(--navy-700)", display: "grid", placeItems: "center", flex: "none" }}><Icon name="user" size={19} /></span>
          <span><span style={{ display: "block", fontSize: "13px", fontWeight: "var(--weight-semibold)" }}>คุณวิภา เจ้าหน้าที่ภาคสนาม</span><span style={{ display: "block", fontSize: "11px", color: "var(--text-subtle)" }}>+66 (0) 63-298-4955</span></span>
        </div>
      </Panel>
      <Panel title="วิธีใช้ LINE OA" hint="วิดีโอสั้น 2 นาที — แสดงตอนเพิ่มเพื่อนครั้งแรก และเปิดดูซ้ำได้ทุกเมื่อ">
        <div style={{ position: "relative", borderRadius: "var(--radius-sm)", overflow: "hidden", aspectRatio: "16 / 9", background: "linear-gradient(150deg,#061E5C,#027276)", display: "grid", placeItems: "center" }}>
          <span style={{ width: "44px", height: "44px", borderRadius: "var(--radius-circle)", background: "rgba(255,255,255,.92)", color: "var(--teal-700)", display: "grid", placeItems: "center", fontSize: "15px" }}>▶</span>
          <span style={{ position: "absolute", left: "9px", bottom: "8px", color: "#fff", fontSize: "11px", fontWeight: "var(--weight-semibold)" }}>สอนใช้งานทีละขั้น · 2:14</span>
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-subtle)", lineHeight: 1.6 }}>🚧 ไฟล์วิดีโอจริงยังไม่ได้ส่งมา — ช่องนี้เป็นที่วางไว้ · ตอนใช้จริงวิดีโอจะเล่นอัตโนมัติในการ์ดทักทายตอนเพิ่มเพื่อน (OB-01) และเปิดซ้ำได้จากเมนูนี้</div>
      </Panel>
      <Panel tone="warn" title="โหมดสัญญาณไม่ดี (SY-06)" hint="ถ่ายไว้ก่อนได้ ระบบเก็บภาพในเครื่องแล้วส่งเองเมื่อมีสัญญาณ">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--text-body)" }}>
          <span>ภาพที่ค้างรอส่ง</span><b>1 ภาพ</b>
        </div>
        <Button size="sm" variant="outline" fullWidth>ส่งภาพที่ค้างอยู่</Button>
      </Panel>
    </LiffShell>
  );
}


// BL-01 ถึง BL-15 · กรอกข้อมูลย้อนหลัง 3 ปี (8 ชุด × 6 ฤดู)
function LiffBaseline({ onClose }) {
  const seasons = [["2566", "นาปี", "done"], ["2566", "นาปรัง", "done"], ["2567", "นาปี", "done"], ["2567", "นาปรัง", "done"], ["2568", "นาปี", "now"], ["2568", "นาปรัง", "todo"]];
  const sets = [
    ["ข้อ 1/8", "การขังน้ำก่อนฤดูปลูก", "SF_p", "เลือก 1 จาก 4 แบบ"],
    ["ข้อ 2/8", "การจัดการน้ำระหว่างฤดู", "SF_w", "เลือก 1 จาก 3 แบบ"],
    ["ข้อ 3/8", "วัสดุอินทรีย์ที่ใส่ลงแปลง", "SF_o", "เลือกได้หลายชนิด + ปริมาณ กก./ไร่"],
    ["ข้อ 4/8", "ปุ๋ยอินทรีย์", "N₂O", "ปริมาณ กก./ไร่ + %N จากฉลาก"],
    ["ข้อ 5/8", "ปูนขาว และ โดโลไมต์", "CO₂", "กก./ไร่ อย่างละช่อง"],
    ["ข้อ 6/8", "ไฟฟ้าและน้ำมัน", "CO₂", "ลิตร/ไร่ และ kWh/ไร่"],
    ["ข้อ 7/8", "การจัดการฟางหลังเก็บเกี่ยว", "เผา / ไม่เผา", "ถ้าเผาต้องกรอกมวลฟาง"],
    ["ข้อ 8/8", "ปุ๋ยเคมี 3 ครั้งต่อฤดู", "N₂O + ยูเรีย", "ตารางคงที่ 3 แถว"]
  ];
  const [open, setOpen] = React.useState(1);
  return (
    <LiffShell title="ข้อมูลย้อนหลัง 3 ปี" subtitle="BL-01 ถึง BL-15 · 8 ชุดคำถาม × 6 ฤดู" onClose={onClose}
      footer={<Button fullWidth onClick={onClose}>บันทึกและไปต่อ</Button>}>
      <Panel title="กรอกแล้ว 4 จาก 6 ฤดู" hint="กรอกทีละนิดก็ได้ครับ ไม่ต้องรีบ · ระบบจำที่กรอกไว้ให้">
        <ProgressBar value={4} max={6} valueLabel="4/6 ฤดู" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px", marginTop: "4px" }}>
          {seasons.map(([y, s2, st], i) => (
            <span key={i} style={{ textAlign: "center", padding: "7px 4px", borderRadius: "var(--radius-sm)", fontSize: "10.5px", fontWeight: "var(--weight-semibold)", lineHeight: 1.35,
              background: st === "done" ? "var(--teal-600)" : st === "now" ? "var(--status-warning)" : "var(--white)",
              color: st === "todo" ? "var(--text-subtle)" : "#fff", border: "1px solid " + (st === "todo" ? "var(--border-default)" : "transparent") }}>
              {y}<br />{s2}
            </span>
          ))}
        </div>
      </Panel>
      <Panel tone="warn" title="ทางลัด: เหมือนฤดูที่กรอกไว้แล้วไหม (BL-02)" hint="ถ้าฤดูนี้ทำเหมือนฤดูก่อน กดปุ่มเดียวจบ ไม่ต้องตอบใหม่ทั้ง 8 ข้อ">
        <div style={{ display: "flex", gap: "7px" }}>
          <Button size="sm" variant="outline" fullWidth>เหมือน 2567 นาปี</Button>
          <Button size="sm" fullWidth>ตอบใหม่ทีละข้อ</Button>
        </div>
      </Panel>
      <div style={{ fontSize: "11px", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-subtle)", fontWeight: 600 }}>ฤดู 2568 นาปี</div>
      {sets.map(([no, name, eq, how], i) => {
        const done = i < 2, isOpen = open === i;
        return (
          <div key={no} style={{ background: "#fff", border: "1px solid " + (isOpen ? "var(--border-accent)" : "var(--border-subtle)"), borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: "100%", textAlign: "left", border: "none", background: "none", padding: "11px 13px", cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ width: "22px", height: "22px", flex: "none", borderRadius: "var(--radius-circle)", background: done ? "var(--teal-600)" : isOpen ? "var(--status-warning)" : "var(--grey-100)", color: done || isOpen ? "#fff" : "var(--text-subtle)", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: 700 }}>{done ? "✓" : i + 1}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "12.5px", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>{name}</span>
                <span style={{ display: "block", fontSize: "10.5px", color: "var(--text-subtle)" }}>{no} · เข้าสมการ {eq}</span>
              </span>
              <span style={{ color: "var(--text-subtle)", fontSize: "12px" }}>{isOpen ? "▴" : "▾"}</span>
            </button>
            {isOpen ? (
              <div style={{ padding: "0 13px 13px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-subtle)" }}>{how}</div>
                {i === 1 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {[["WW-1", "ขังน้ำต่อเนื่องตลอดฤดู", true], ["WW-2", "ระบายน้ำ / ปล่อยแห้ง 1 ครั้ง", false], ["WW-3", "ปล่อยแห้งหลายครั้ง / เปียกสลับแห้ง", false]].map(([c, l, on]) => (
                      <span key={c} style={{ display: "flex", gap: "9px", alignItems: "center", padding: "9px 11px", borderRadius: "var(--radius-sm)", border: "1px solid " + (on ? "var(--teal-600)" : "var(--border-default)"), background: on ? "var(--teal-50)" : "#fff" }}>
                        <span style={{ width: "16px", height: "16px", borderRadius: "50%", border: "1px solid " + (on ? "var(--teal-600)" : "var(--border-default)"), background: on ? "var(--teal-600)" : "#fff", flex: "none" }} />
                        <span style={{ fontSize: "12px", color: "var(--text-body)" }}>{l}</span>
                      </span>
                    ))}
                    <div style={{ fontSize: "10.5px", color: "var(--text-subtle)", lineHeight: 1.5 }}>ข้อนี้ไม่ต้องมีภาพหลักฐาน เพราะเป็นพฤติกรรมย้อนหลัง — ภาพบังคับเฉพาะฤดูโครงการ</div>
                  </div>
                ) : (
                  <div style={{ padding: "16px 12px", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-sm)", fontSize: "11.5px", color: "var(--text-subtle)", textAlign: "center", lineHeight: 1.6 }}>
                    🚧 ยังเป็นที่วางไว้ — ฟอร์มของข้อนี้ยังไม่ได้ทำ<br />ต้องเก็บ: {how}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
      <Panel title="กรอกเองไม่ไหว?" hint="เจ้าหน้าที่ภาคสนามกรอกแทนได้ (BL-14) โดยใช้บัญชีเจ้าหน้าที่ ระบบบันทึกไว้ว่าใครกรอก">
        <Button size="sm" variant="outline" fullWidth>ขอให้เจ้าหน้าที่กรอกแทน</Button>
      </Panel>
    </LiffShell>
  );
}

const LIFF = { register: LiffRegister, baseline: LiffBaseline, docs: LiffDocs, camera: LiffCamera, calendar: LiffCalendar, summary: LiffSummary, fields: LiffFields, contact: LiffContact };
Object.assign(window, { LIFF, LiffShell, Panel });
