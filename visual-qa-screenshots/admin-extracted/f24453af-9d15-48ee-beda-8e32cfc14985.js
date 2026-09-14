const { Button, Badge, Tag, Icon, DataTable, Field, Input, Select, Checkbox, Textarea } = window.NetZeroCarbonDesignSystem_f3e7a8;

// ===== ตั้งค่าแอปและระดับสิทธิ์ของบัญชี =====
const ROLES = [
  { id: "admin", name: "ผู้ดูแลระบบ", who: "ทีม NZC ส่วนกลาง", n: 3, tone: "danger" },
  { id: "verifier", name: "เจ้าหน้าที่ทวนสอบ", who: "ทีมตรวจภาพและเอกสาร", n: 6, tone: "info" },
  { id: "field", name: "เจ้าหน้าที่ภาคสนาม", who: "ผู้ประสานงานพื้นที่", n: 11, tone: "success" },
  { id: "sponsor", name: "บัญชีลูกค้า", who: "บริษัทผู้สนับสนุน", n: 3, tone: "neutral" },
  { id: "auditor", name: "ผู้ประเมินภายนอก", who: "VVB / อบก. · อ่านอย่างเดียว", n: 2, tone: "warning" }
];

const PERMS = [
  ["ดูแดชบอร์ดรวมทุกพื้นที่", 1, 1, 0, 0, 1],
  ["ดูเฉพาะพื้นที่ที่ได้รับมอบหมาย", 1, 1, 1, 1, 1],
  ["เห็นชื่อ เบอร์ เลขบัตร เลขโฉนด", 1, 1, 1, 0, 0],
  ["ตรวจและอนุมัติภาพหลักฐาน", 1, 1, 0, 0, 0],
  ["ตรวจและอนุมัติใบสมัคร", 1, 1, 0, 0, 0],
  ["กรอกข้อมูลแทนเกษตรกร (BL-14)", 1, 0, 1, 0, 0],
  ["ตอบแชตแทนบอต (AD-12)", 1, 1, 1, 0, 0],
  ["นำเข้าข้อมูลเป็นชุด (AD-13)", 1, 0, 0, 0, 0],
  ["สั่งคำนวณเครดิตใหม่ (calc_run)", 1, 0, 0, 0, 0],
  ["แก้ค่าคงที่และตารางค้นค่า", 1, 0, 0, 0, 0],
  ["ส่งออกรายงานรายเกษตรกร", 1, 1, 0, 0, 0],
  ["ส่งออกชุดยื่น Premium T-VER", 1, 0, 0, 0, 0],
  ["ดูและส่งออกรายงานของตัวเอง", 1, 1, 0, 1, 1],
  ["ดู audit log ทั้งระบบ", 1, 0, 0, 0, 1],
  ["ตั้งค่าสิทธิ์ของบัญชีอื่น", 1, 0, 0, 0, 0]
];

function SettingsScreen() {
  const [tab, setTab] = React.useState("สิทธิ์การเข้าถึง");
  const tabs = ["สิทธิ์การเข้าถึง", "บัญชีผู้ใช้", "ค่าคงที่การคำนวณ", "การแจ้งเตือน", "ทั่วไป"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="ตั้งค่าระบบ" title="ตั้งค่าแอปและระดับสิทธิ์ของบัญชี"
        sub="ทุกการเปลี่ยนแปลงในหน้านี้ถูกบันทึกลง audit log พร้อมค่าก่อน-หลัง (AD-11)"
        actions={<React.Fragment><Button size="sm" variant="outline">ยกเลิกการแก้ไข</Button><Button size="sm">บันทึกการตั้งค่า</Button></React.Fragment>} />
      <div style={{ display: "flex", gap: "var(--space-1)", borderBottom: "1px solid var(--border-subtle)" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: "2px solid " + (tab === t ? "var(--teal-600)" : "transparent"), padding: "11px 14px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: tab === t ? "var(--teal-700)" : "var(--text-muted)" }}>{t}</button>
        ))}
      </div>

      {tab === "สิทธิ์การเข้าถึง" ? (
        <React.Fragment>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "var(--space-3)" }}>
            {ROLES.map(r => (
              <div key={r.id} style={{ background: "var(--white)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-4)" }}>
                <Badge tone={r.tone}>{r.n} บัญชี</Badge>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)", marginTop: "var(--space-2)" }}>{r.name}</div>
                <div style={{ fontSize: "10.5px", color: "var(--text-subtle)", marginTop: "3px", lineHeight: "var(--leading-relaxed)" }}>{r.who}</div>
              </div>
            ))}
          </div>
          <Section title="ตารางสิทธิ์" sub="ติ๊กเพื่อเปิดสิทธิ์ · ช่องที่ล็อกไว้เปลี่ยนไม่ได้เพราะขัดกับ PDPA หรือหลักการแยกหน้าที่" pad={false}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", background: "var(--grey-50)", padding: "11px 14px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)", minWidth: "260px" }}>สิทธิ์</th>
                    {ROLES.map(r => <th key={r.id} style={{ background: "var(--grey-50)", padding: "11px 10px", fontSize: "11px", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)", borderBottom: "1px solid var(--border-subtle)", borderLeft: "1px solid var(--grey-200)", textAlign: "center", lineHeight: 1.3 }}>{r.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PERMS.map((row, i) => {
                    const locked = row[0].indexOf("เห็นชื่อ") === 0 || row[0].indexOf("ตั้งค่าสิทธิ์") === 0;
                    return (
                      <tr key={row[0]}>
                        <td style={{ padding: "9px 14px", borderBottom: "1px solid var(--grey-100)", color: "var(--text-body)" }}>
                          {row[0]}{locked ? <span title="ล็อกไว้" style={{ marginLeft: "7px", fontSize: "11px", color: "var(--text-subtle)" }}>🔒</span> : null}
                        </td>
                        {ROLES.map((r, j) => (
                          <td key={r.id} style={{ padding: "9px 10px", borderBottom: "1px solid var(--grey-100)", borderLeft: "1px solid var(--grey-100)", textAlign: "center" }}>
                            <Checkbox defaultChecked={!!row[j + 1]} disabled={locked} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "var(--space-4) var(--space-6)", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-subtle)", lineHeight: "var(--leading-relaxed)" }}>
              บัญชีลูกค้าถูกล็อกไม่ให้เห็นข้อมูลระบุตัวบุคคลตามข้อตกลงความยินยอม CS-02 · ขอบเขตพื้นที่ของแต่ละบัญชีลูกค้าตั้งค่าได้ที่หน้า "บริษัทผู้สนับสนุน"
            </div>
          </Section>
        </React.Fragment>
      ) : null}

      {tab === "บัญชีผู้ใช้" ? (
        <Section title="บัญชีในระบบ" pad={false}
          actions={<Button size="sm" iconLeft={<Icon name="user-plus" size={15} />}>เชิญบัญชีใหม่</Button>}>
          <DataTable
            columns={[
              { key: "email", label: "อีเมล" }, { key: "name", label: "ชื่อที่แสดง" },
              { key: "role", label: "ประเภทบัญชี", render: r => <Tag tone={r.role === "บัญชีลูกค้า" ? "navy" : "teal"}>{r.role}</Tag> },
              { key: "scope", label: "ขอบเขตที่เห็น" },
              { key: "mfa", label: "OTP", render: r => r.mfa ? <Badge tone="success">เปิด</Badge> : <Badge tone="danger">ปิด</Badge> },
              { key: "last", label: "เข้าใช้ล่าสุด" },
              { key: "a", label: "", align: "right", render: () => <Button size="sm" variant="ghost">แก้ไข</Button> }
            ]}
            rows={[
              { email: "admin@netzero-carbon.io", name: "ทีมทวนสอบ NZC", role: "ผู้ดูแลระบบ", scope: "ทุกพื้นที่", mfa: true, last: "วันนี้ 09:12" },
              { email: "verify1@netzero-carbon.io", name: "กมล ตรวจสอบ", role: "เจ้าหน้าที่ทวนสอบ", scope: "สุพรรณบุรี · ชัยนาท", mfa: true, last: "วันนี้ 08:40" },
              { email: "field.spb@netzero-carbon.io", name: "วิภา ภาคสนาม", role: "เจ้าหน้าที่ภาคสนาม", scope: "ต.หนองสะเดา", mfa: false, last: "เมื่อวาน" },
              { email: "esg@company-a.example", name: "บจก. A · ฝ่าย ESG", role: "บัญชีลูกค้า", scope: "สุพรรณบุรี", mfa: true, last: "3 วันก่อน" },
              { email: "sustain@company-b.example", name: "บจก. B · ฝ่ายความยั่งยืน", role: "บัญชีลูกค้า", scope: "ชัยนาท", mfa: true, last: "1 สัปดาห์ก่อน" },
              { email: "procure@company-c.example", name: "บจก. C · ฝ่ายจัดซื้อพลังงาน", role: "บัญชีลูกค้า", scope: "ยังไม่กำหนด", mfa: false, last: "ยังไม่เคยเข้า" },
              { email: "vvb@verifier.example", name: "ผู้ประเมินภายนอก", role: "ผู้ประเมินภายนอก", scope: "อ่านอย่างเดียว · ทุกพื้นที่", mfa: true, last: "2 สัปดาห์ก่อน" }
            ]} />
        </Section>
      ) : null}

      {tab === "ค่าคงที่การคำนวณ" ? (
        <React.Fragment>
          <MockNote>แก้ค่าในหน้านี้ = ออก <code>mapping_version</code> ใหม่ ไม่ใช่เขียนทับแถวเดิม ผลคำนวณเดิมจะยังอ้างเวอร์ชันเก่าไว้ · ยังไม่ได้ต่อกับตาราง <code>calc_constant</code> จริง</MockNote>
          <Section title="กลุ่ม A · ค่าคงที่" sub="เวอร์ชันปัจจุบัน v1.0 · มีผลตั้งแต่ 20 ส.ค. 2569" pad={false}>
            <DataTable dense
              columns={[{ key: "k", label: "ตัวแปร" }, { key: "v", label: "ค่า", align: "right" }, { key: "u", label: "หน่วย" }, { key: "src", label: "แหล่งอ้างอิง" }]}
              rows={[
                { k: "EF_BL,c", v: "0.1952", u: "กก.CH₄/ไร่/วัน", src: "IPCC 2019 V4 Ch5 Table 5.11" },
                { k: "CF", v: "0.89", u: "—", src: "UNFCCC/FCCC/SBSTA/2015/L.13" },
                { k: "U_d", v: "15%", u: "—", src: "แนวทางการประเมินที่ 3 บังคับ" },
                { k: "GWP_CH4", v: "28", u: "—", src: "IPCC AR5" },
                { k: "EF_Urea", v: "0.20", u: "ตัน C/ตันยูเรีย", src: "IPCC 2019" },
                { k: "Frac_GASF / Frac_GASM", v: "0.11 / 0.21", u: "—", src: "IPCC 2019" }
              ]} />
          </Section>
          <Section title="กลุ่ม B · ตารางค้นค่าตามพฤติกรรม" sub="SF_w และ EF_N2ODirect เก็บคู่กันในแถวเดียว เพื่อกันการเลือกแยกจนได้ค่าที่ขัดกันเอง" pad={false}>
            <DataTable dense
              columns={[{ key: "code", label: "รหัส" }, { key: "label", label: "รูปแบบ" }, { key: "v", label: "SF_w", align: "right" }, { key: "n2o", label: "EF_N2ODirect", align: "right" }, { key: "ph", label: "ภาพที่ต้องมี", align: "right" }]}
              rows={Object.keys(SF_W).map(k => ({ code: k, label: SF_W[k].label, v: SF_W[k].v.toFixed(2), n2o: SF_W[k].n2o, ph: SF_W[k].photos + " ภาพ" }))} />
          </Section>
        </React.Fragment>
      ) : null}

      {tab === "การแจ้งเตือน" ? (
        <Section title="ตัวเตือนอัตโนมัติ" sub="cron รายวัน 06:00 · ข้อความส่งผ่าน LINE OA">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: "620px" }}>
            {[["เตือนถึงกำหนดถ่ายภาพ (PJ-02)", "ล่วงหน้า 3 วันก่อนหมดกำหนดของแต่ละรอบ", true],
              ["เตือนซ้ำเมื่อยังไม่ส่ง (PJ-10)", "ทุก 2 วันจนกว่าจะส่ง หรือจนพ้นกำหนด", true],
              ["เตือนภาพถูกตีกลับ (PJ-09)", "ส่งทันทีที่แอดมินกดตีกลับ", true],
              ["เตือนเอกสารใกล้หมดอายุ (F-62 · SY-08)", "ล่วงหน้า 90 วันก่อนสัญญาเช่าหมดอายุ", true],
              ["เตือนกรอกข้อมูลย้อนหลังที่ค้าง", "สัปดาห์ละครั้ง จนกว่าจะครบ 6 ฤดู", false],
              ["สรุปรายสัปดาห์ถึงแอดมิน", "ทุกวันจันทร์ 08:00 · ส่งเข้าอีเมล", true]].map(([t, d, on]) => (
              <div key={t} style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start", padding: "var(--space-4)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--white)" }}>
                <Checkbox defaultChecked={on} />
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>{t}</span>
                  <span style={{ display: "block", fontSize: "11.5px", color: "var(--text-subtle)", marginTop: "2px" }}>{d}</span>
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {tab === "ทั่วไป" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)", alignItems: "start" }}>
          <Section title="ข้อมูลโครงการ">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <Field label="ชื่อโครงการ"><Input defaultValue="โครงการทำนาลดโลกร้อนพื้นที่สุพรรณบุรี (อำเภอสามชุก)" /></Field>
              <Field label="ระเบียบวิธี"><Select defaultValue="T-VER-P-METH-13-08"><option>T-VER-P-METH-13-08</option></Select></Field>
              <Field label="แนวทางการประเมิน" hint="แนวทางที่ 3 บังคับ U_d = 15%"><Select defaultValue="3"><option value="3">แนวทางที่ 3 — ค่าแนะนำ</option><option value="2">แนวทางที่ 2</option></Select></Field>
              <Field label="อายุโครงการ"><Input defaultValue="2569 - 2575 (7 ปี)" /></Field>
              <Field label="ฤดูต่อปี"><Select defaultValue="2"><option value="2">2 ฤดู — นาปี (S1) และ นาปรัง (S2)</option><option value="1">1 ฤดู</option></Select></Field>
            </div>
          </Section>
          <Section title="ความเป็นส่วนตัวและการเก็บข้อมูล">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <Field label="ตัวระบุที่ใช้ในไฟล์ส่งออก" hint="ล็อกไว้ตาม CS-02 เปลี่ยนไม่ได้"><Select defaultValue="cpa" disabled><option value="cpa">CPA code เท่านั้น</option></Select></Field>
              <Field label="เกณฑ์รวมกลุ่มพื้นที่" hint="กลุ่มที่มีเกษตรกรน้อยกว่าค่านี้จะถูกรวมเข้าตำบลข้างเคียงในมุมมองลูกค้า"><Input defaultValue="5" /></Field>
              <Field label="ระยะเก็บภาพหลักฐาน" hint="ต้องไม่น้อยกว่าอายุโครงการบวก 2 ปี ตามข้อกำหนดการทวนสอบ"><Input defaultValue="9 ปี" /></Field>
              <Checkbox label="บังคับ OTP สำหรับบัญชีที่เห็นข้อมูลส่วนบุคคล" defaultChecked />
              <Checkbox label="บันทึกการดาวน์โหลดทุกครั้งลง audit log" defaultChecked />
              <Checkbox label="อนุญาตให้ผู้ประเมินภายนอกเข้าดูแบบอ่านอย่างเดียว" defaultChecked />
            </div>
          </Section>
        </div>
      ) : null}
    </div>
  );
}

Object.assign(window, { SettingsScreen, ROLES, PERMS });
