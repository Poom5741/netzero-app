const { Button, Badge, Tag, Icon, StatTile, FilterBar, DataTable, ProgressBar, Field, Textarea, Checkbox } = window.NetZeroCarbonDesignSystem_f3e7a8;

const fmt = (n, d = 2) => Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

// ===== AD-08 / AD-17 · ภาพรวมโครงการ =====
function OverviewScreen({ filters, onFilter, onNavigate }) {
  const totalRai = PROVINCES.reduce((s, p) => s + p.rai, 0);
  const needPhotos = FARMERS.reduce((s, f) => s + f.need, 0);
  const gotPhotos = FARMERS.reduce((s, f) => s + f.photos, 0);
  const fallbacks = FARMERS.reduce((s, f) => s + f.fallback, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="ภาพรวมโครงการ" title="โครงการทำนาลดโลกร้อน — ทุกพื้นที่"
        sub="ต.หนองสะเดา อ.สามชุก จ.สุพรรณบุรี และ จ.ชัยนาท · ระเบียบวิธี T-VER-P-METH-13-08 ฉบับที่ 01 · แนวทางการประเมินที่ 3 (ค่าแนะนำ)"
        actions={<React.Fragment><Button size="sm" variant="outline" onClick={() => onNavigate("charts")} iconLeft={<Icon name="chart-pie" size={15} />}>กราฟสรุปเครดิต</Button><Button size="sm" variant="outline" iconLeft={<Icon name="download" size={15} />} onClick={() => onNavigate("reports")}>ส่งออกรายงาน</Button><Button size="sm" onClick={() => onNavigate("review")}>คิวตรวจภาพ</Button></React.Fragment>} />
      <FilterBar filters={filters} onChange={onFilter} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-4)" }}>
        <StatTile label="ครัวเรือนที่เข้าร่วม" value={FARMERS.length + PROVINCES[1].households} unit="ครัวเรือน" delta={"+" + PROVINCES[1].households}
          note={"CPA code " + FARMERS.length + " ราย ในพื้นที่ที่ขึ้นทะเบียนแล้ว · " + PROVINCES[1].households + " รายในกลุ่มใหม่"} />
        <StatTile label="แปลงย่อยที่ดำเนินการ" value={PLOTS.length + 24} unit="แปลง" note={"ตามเอกสารสิทธิ์ " + new Set(PLOTS.map(p => p.deed.split(",")[0])).size + " เลขโฉนด · มี WKT ขอบแปลงครบทุกแปลง"} />
        <StatTile label="พื้นที่รวม" value={fmt(totalRai, 1)} unit="ไร่" note={fmt(totalRai * 0.16, 1) + " เฮกตาร์ · เฉลี่ย " + fmt(totalRai / (PLOTS.length + 24), 1) + " ไร่/แปลง · รอบปลูก 120 วัน"} />
        <StatTile label="เครดิตสุทธิปี 2569 (ER)" value={fmt(GHG_2569.er)} unit="tCO₂eq"
          note={"BE " + fmt(GHG_2569.be) + " − PE " + fmt(GHG_2569.pe) + " แล้วหัก U_d 15% · 2 ฤดู (นาปี + นาปรัง)"} />
      </div>

      <Section title="คิวงานที่ต้องดำเนินการ" sub='หน้าหลังบ้านที่ดีต้องบอกว่า "วันนี้ต้องทำอะไร" ไม่ใช่แค่ยอดรวม'
        actions={<Button size="sm" variant="ghost" onClick={() => onNavigate("review")}>เปิดคิวตรวจ</Button>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-4)" }}>
          {[["ใบสมัครรอตรวจ (AD-10)", "4", "ค้าง 5 วัน", "danger", "ในนี้ 2 ใบเอกสารไม่ครบ ต้องขอเพิ่ม"],
            ["ภาพหลักฐานรอตรวจ", String(QUEUE.length), "", "neutral", "เฉลี่ยรอ 1.2 วัน · เป้าหมายไม่เกิน 2 วัน"],
            ["แปลงที่หลักฐานยังไม่ครบ 4 ภาพ", String(needPhotos - gotPhotos), "กระทบเครดิต", "warning", "ต้องมีคู่ เปียก-แห้ง ครบ 2 รอบ จึงใช้ SF_w = 0.55 ได้"],
            ["แปลงที่ถอยไปใช้ SF_w = 0.71", String(fallbacks), "fallback", "danger", "ระบบบันทึก fallback_applied พร้อมเหตุผลไว้แล้ว"]].map(([t, v, tag, tone, note]) => (
            <div key={t} style={{ border: "1px solid " + (tone === "danger" ? "#EFC9CB" : tone === "warning" ? "#F2DDB4" : "var(--border-subtle)"), background: tone === "danger" ? "var(--status-danger-soft)" : tone === "warning" ? "var(--status-warning-soft)" : "var(--white)", borderRadius: "var(--radius-md)", padding: "var(--space-4) var(--space-5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>{t}</span>
                {tag ? <Badge tone={tone === "neutral" ? "neutral" : tone}>{tag}</Badge> : null}
              </div>
              <div style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-light)", lineHeight: 1.1, margin: "var(--space-2) 0", color: "var(--text-heading)" }}>{v}</div>
              <div style={{ fontSize: "11px", color: "var(--text-subtle)", lineHeight: "var(--leading-relaxed)" }}>{note}</div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "var(--space-6)", alignItems: "start" }}>
        <Section title="เครดิตรายฤดู — กรณีฐาน เทียบ ประมาณการ เทียบ ทวนสอบแล้ว" sub="หน่วย tCO₂eq · ฤดู 2569 ยังไม่เข้ารอบทวนสอบ">
          <CreditChart seasons={SEASONS} />
        </Section>
        <Section title="ปริมาณก๊าซเรือนกระจกแยกตามแหล่ง · ปี 2569" sub="ตรงกับชีต 3.7 สรุปGHG · หน่วย tCO₂eq" pad={false}>
          <DataTable dense
            columns={[
              { key: "name", label: "แหล่งการปล่อย" },
              { key: "be", label: "กรณีฐาน BE", align: "right", render: r => fmt(r.s1[0] + r.s2[0]) },
              { key: "pe", label: "โครงการ PE", align: "right", render: r => fmt(r.s1[1] + r.s2[1]) },
              { key: "d", label: "ส่วนต่าง", align: "right", render: r => { const d = (r.s1[0] + r.s2[0]) - (r.s1[1] + r.s2[1]); return <b style={{ color: d > 0 ? "var(--status-success)" : d < 0 ? "var(--status-danger)" : "var(--text-subtle)" }}>{d > 0 ? "−" : d < 0 ? "+" : ""}{fmt(Math.abs(d))}</b>; } },
              { key: "eq", label: "สมการ", render: r => <span style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--text-subtle)" }}>{r.eq}</span> }
            ]}
            rows={GHG_2569.rows} />
          <div style={{ padding: "var(--space-4) var(--space-6)", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "7px", fontSize: "var(--text-xs)" }}>
            {[["BE_y · การปล่อยกรณีฐาน", fmt(GHG_2569.be)], ["PE_y · การปล่อยจากการดำเนินโครงการ", fmt(GHG_2569.pe)], ["LE_y · นอกขอบเขตโครงการ", fmt(GHG_2569.le)], ["ส่วนหักความไม่แน่นอน U_d", "15%"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-muted)" }}>{k}</span><span style={{ fontFamily: "var(--font-mono)" }}>{v}</span></div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "7px", borderTop: "1px solid var(--grey-200)", fontSize: "var(--text-sm)" }}>
              <b>ER_y · เครดิตสุทธิ</b><b style={{ fontFamily: "var(--font-mono)", color: "var(--text-accent)" }}>{fmt(GHG_2569.er)} tCO₂eq</b>
            </div>
            <div style={{ color: "var(--text-subtle)", lineHeight: "var(--leading-relaxed)" }}>
              ปุ๋ยและยูเรียเท่ากันทั้งสองฝั่งโดยเจตนา — โครงการไม่ได้ขอให้เกษตรกรลดปุ๋ย ส่วนต่างเกือบทั้งหมดมาจากมีเทน (E-06 · E-07) และฝั่งโครงการมีเชื้อเพลิงสูบน้ำเพิ่มขึ้น
            </div>
          </div>
        </Section>
      </div>

      <Section title="แยกตามพื้นที่และบริษัทผู้สนับสนุน" pad={false}>
        <DataTable onRowClick={() => onNavigate("farmers")}
          columns={[{ key: "name", label: "จังหวัด" }, { key: "note", label: "ขอบเขต" }, { key: "households", label: "ครัวเรือน", align: "right" },
            { key: "rai", label: "ไร่", align: "right", render: r => fmt(r.rai, 1) }, { key: "credits", label: "ER (tCO₂eq)", align: "right", render: r => <b>{fmt(r.credits)}</b> }]}
          rows={PROVINCES} />
      </Section>
    </div>
  );
}

// ===== AD-01 / AD-02 / AD-04 · คิวตรวจภาพ 4 ภาพต่อครอป =====
function ReviewScreen() {
  const [sel, setSel] = React.useState(QUEUE[0]);
  const [rejecting, setRejecting] = React.useState(false);
  const [decided, setDecided] = React.useState({});
  const decide = (v) => { setDecided({ ...decided, [sel.id]: v }); setRejecting(false); };
  const wet = sel.phase === "wet";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="AD-01 · คิวตรวจภาพหลักฐาน" title="ตรวจภาพท่อวัดระดับน้ำและ metadata"
        sub="หนึ่งครอปต้องมี 4 ภาพ — เปียก 2 ครั้ง แห้ง 2 ครั้ง สลับกัน · ครบทั้ง 4 จึงใช้ SF_w = 0.55 ได้"
        actions={<Button size="sm" variant="outline" iconLeft={<Icon name="download" size={15} />}>ส่งออกรายงานการทวนสอบ</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 420px", gap: "var(--space-6)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <Section title={"ภาพรอตรวจ " + QUEUE.length + " รายการ"} sub="ระบุด้วย CPA code และรหัสแปลงย่อยเท่านั้น" pad={false}>
            <DataTable dense onRowClick={r => { setSel(r); setRejecting(false); }}
              columns={[
                { key: "id", label: "รหัสภาพ" }, { key: "code", label: "CPA code" }, { key: "plot", label: "แปลงย่อย" },
                { key: "round", label: "รอบ", render: r => <Tag tone={r.phase === "wet" ? "navy" : "teal"}>{r.round}</Tag> },
                { key: "water", label: "ระดับน้ำที่กรอก", align: "right" },
                { key: "gps", label: "พิกัด", render: r => r.inside ? <Badge tone="success">ในขอบเขต</Badge> : <Badge tone="danger">ไม่มีพิกัด</Badge> },
                { key: "age", label: "อายุคำร้อง", align: "right" },
                { key: "d", label: "ผล", render: r => decided[r.id] ? <Badge tone={decided[r.id] === "ok" ? "success" : "danger"}>{decided[r.id] === "ok" ? "อนุมัติ" : "ตีกลับ"}</Badge> : <Badge tone="neutral" dot={false}>รอตรวจ</Badge> }
              ]}
              rows={QUEUE} />
          </Section>
          <Section title="ความครบถ้วนของหลักฐานรายแปลง" sub="ต้องครบทั้ง 4 ภาพจึงจะปลดล็อก SF_w = 0.55 · ไม่ครบระบบถอยเป็น 0.71 อัตโนมัติ" pad={false}>
            <DataTable dense
              columns={[
                { key: "plot", label: "แปลงย่อย" }, { key: "rai", label: "ไร่", align: "right", render: r => fmt(r.rai, 2) },
                { key: "rounds", label: "รอบภาพ (เปียก1 · แห้ง1 · เปียก2 · แห้ง2)", render: r => (
                  <span style={{ display: "flex", gap: "5px" }}>{PHOTO_ROUNDS.map((pr, i) => (
                    <span key={pr.code} title={pr.name} style={{ width: "26px", height: "20px", borderRadius: "4px", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: 700, background: i < r.photosApproved ? (pr.phase === "wet" ? "var(--navy-600)" : "var(--teal-600)") : "var(--grey-200)", color: i < r.photosApproved ? "#fff" : "var(--grey-500)" }}>{pr.phase === "wet" ? "เปียก" : "แห้ง"}</span>
                  ))}</span>) },
                { key: "sfw", label: "SF_w ที่ใช้จริง", align: "right", render: r => <span style={{ fontFamily: "var(--font-mono)" }}>{r.calcSfW.v.toFixed(2)}</span> },
                { key: "fb", label: "", render: r => r.calcSfW.fallback ? <Badge tone="danger">fallback</Badge> : <Badge tone="success">ตามที่เลือก</Badge> },
                { key: "er", label: "ER (tCO₂eq)", align: "right", render: r => fmt(r.er, 3) }
              ]}
              rows={PLOTS.map(p => { const c = computePlotSeason(p); return { plot: p.plot, rai: p.rai, photosApproved: p.photosApproved, calcSfW: c.sfWpj, er: c.er }; })} />
          </Section>
        </div>

        <Section title={"ตรวจภาพ " + sel.id} sub={sel.round + " · " + sel.stageName + " (" + sel.stage + ")"}
          actions={<Tag tone="navy">{sel.code}</Tag>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", aspectRatio: "4 / 3", background: "linear-gradient(180deg,#9FC7E8 0%,#CFE3B9 52%,#8FA95C 100%)" }}>
              <span style={{ position: "absolute", left: "50%", top: "22%", transform: "translateX(-50%)", width: "30px", height: "132px", background: "#E7EDF2", borderRadius: "4px", boxShadow: "0 0 0 1px rgba(0,0,0,.18)", overflow: "hidden" }}>
                <span style={{ position: "absolute", inset: wet ? "4% 0 0 0" : "56% 0 0 0", background: "rgba(56,120,160,.72)" }} />
              </span>
              <span style={{ position: "absolute", left: "8px", bottom: "8px", background: "rgba(0,0,0,.6)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "10px", padding: "3px 7px", borderRadius: "5px" }}>{sel.gps} · {sel.when}</span>
              <span style={{ position: "absolute", right: "8px", top: "8px" }}><Badge tone={wet ? "info" : "success"}>{wet ? "รอบเปียก" : "รอบแห้ง"}</Badge></span>
            </div>
            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {[["ถ่ายผ่านกล้องของระบบ", sel.inside ? "ใช่ · LF-04" : "ไม่ใช่ — ส่งทางแชต", sel.inside],
                ["พิกัด ณ วินาทีที่กด", sel.gps, sel.inside],
                ["พิกัดอยู่ในขอบเขต WKT ของแปลง", sel.inside ? "อยู่ในขอบเขต" : "ตรวจไม่ได้", sel.inside],
                ["เวลาถ่าย", sel.when, true],
                ["ระดับน้ำในท่อที่เกษตรกรกรอก", sel.water, true],
                ["สอดคล้องกับรอบที่แจ้ง", wet ? "รอบเปียก · น้ำเต็มท่อ ✓" : "รอบแห้ง · น้ำต่ำกว่าผิวดิน ✓", true],
                ["อยู่ในช่วงกำหนดของรอบ", "อยู่ในช่วง", true]].map(([k, v, ok], i, arr) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", padding: "9px 12px", borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--grey-100)", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--text-muted)" }}>{k}</span>
                  <span style={{ fontWeight: "var(--weight-semibold)", color: ok ? "var(--text-heading)" : "var(--status-danger)", textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
            {rejecting ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "var(--space-4)", background: "var(--status-danger-soft)", borderRadius: "var(--radius-md)", border: "1px solid #EFC9CB" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "#8C2830" }}>เลือกเหตุผลที่ตีกลับ (AD-04)</div>
                {REJECT_REASONS.map(r => <Checkbox key={r} label={r} />)}
                <Field label="ข้อความที่ส่งถึงเกษตรกร" hint="เกษตรกรจะเห็นข้อความนี้ในแชต (PJ-09)"><Textarea rows={2} defaultValue="ช่วยถ่ายใหม่ให้เห็นขีดระดับน้ำในท่อชัด ๆ ภายในวันที่ 14 ก.ย. นะครับ" /></Field>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button variant="outline" size="sm" onClick={() => setRejecting(false)}>ยกเลิก</Button>
                  <Button size="sm" fullWidth onClick={() => decide("no")}>ส่งกลับให้ถ่ายใหม่</Button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="outline" fullWidth onClick={() => setRejecting(true)}>ตีกลับ</Button>
                <Button fullWidth onClick={() => decide("ok")} iconLeft={<Icon name="check" size={16} />}>อนุมัติและส่งเข้าคำนวณ</Button>
              </div>
            )}
            <div style={{ fontSize: "11px", color: "var(--text-subtle)", lineHeight: "var(--leading-relaxed)" }}>
              การอนุมัติ (AD-03) ส่งค่าเข้าระบบคำนวณทันที (SY-05) · ขั้นที่ 2 ของลำดับการคำนวณจะตัดสิน SF_w ใหม่ทุกครั้งที่จำนวนภาพที่อนุมัติเปลี่ยน
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

Object.assign(window, { OverviewScreen, ReviewScreen, fmtNum: fmt });
