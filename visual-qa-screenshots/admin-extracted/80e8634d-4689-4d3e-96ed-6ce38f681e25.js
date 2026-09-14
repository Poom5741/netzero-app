const { Button, Badge, Tag, Icon, StatTile, FilterBar, DataTable, ProgressBar, Field, Select, Checkbox } = window.NetZeroCarbonDesignSystem_f3e7a8;
const f2 = (n, d = 2) => Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

// ===== AD-15 / AD-18 · เกษตรกรรายคน =====
function FarmersScreen({ filters, onFilter }) {
  const [sel, setSel] = React.useState(null);
  const [tab, setTab] = React.useState("แปลงและเอกสาร");
  const provFilter = filters.find(x => x.id === "prov").value;
  const rows = FARMERS.filter(f => provFilter.startsWith("ทั้งหมด") || f.prov === provFilter);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="ทะเบียนเกษตรกร" title="ดูราย CPA code · รายพื้นที่ · รายบริษัทผู้สนับสนุน"
        sub={rows.length + " ราย ตามตัวกรองปัจจุบัน · ชื่อและเลขบัตรเห็นได้เฉพาะบัญชีที่มีสิทธิ์ตรวจเอกสาร"}
        actions={<React.Fragment><Button size="sm" variant="outline" iconLeft={<Icon name="upload" size={15} />}>นำเข้าเป็นชุด (AD-13)</Button><Button size="sm" variant="outline" iconLeft={<Icon name="download" size={15} />}>ส่งออกราย CPA code</Button></React.Fragment>} />
      <FilterBar filters={filters} onChange={onFilter} />
      <PdpaNote>ตารางนี้แสดงชื่อได้เพราะเป็นบัญชีแอดมิน · ทุกไฟล์ที่ส่งออกและทุกหน้าที่ลูกค้าเห็น ใช้ CPA code แทนชื่อเสมอ (PDPA · CS-02)</PdpaNote>

      <Section title="เกษตรกร" pad={false}>
        <DataTable onRowClick={r => { setSel(r); setTab("แปลงและเอกสาร"); }}
          columns={[
            { key: "code", label: "CPA code", render: r => <b style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{r.code}</b> },
            { key: "name", label: "ชื่อ - นามสกุล" },
            { key: "tambon", label: "พื้นที่", render: r => "ต." + r.tambon + " อ." + r.district },
            { key: "sponsor", label: "ผู้สนับสนุน", render: r => <Tag tone="navy">{r.sponsor}</Tag> },
            { key: "np", label: "แปลงย่อย", align: "right", render: r => r.plots.length },
            { key: "rai", label: "ไร่", align: "right", render: r => f2(r.rai, 2) },
            { key: "ph", label: "ภาพหลักฐาน", align: "right", render: r => r.photos + "/" + r.need },
            { key: "be", label: "BE", align: "right", render: r => f2(r.be) },
            { key: "pe", label: "PE", align: "right", render: r => f2(r.pe) },
            { key: "er", label: "ER (tCO₂eq)", align: "right", render: r => <b style={{ color: "var(--text-accent)" }}>{f2(r.er, 3)}</b> },
            { key: "status", label: "สถานะหลักฐาน", render: r => <Badge tone={r.tone}>{r.status}</Badge> }
          ]}
          rows={rows} />
      </Section>

      {sel ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(6,30,92,.42)", zIndex: 40, display: "flex", justifyContent: "flex-end" }} onClick={() => setSel(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "min(760px,94vw)", background: "var(--surface-sunken)", height: "100%", overflowY: "auto", boxShadow: "var(--shadow-xl)" }}>
            <div style={{ background: "var(--gradient-deep)", color: "#fff", padding: "var(--space-6) var(--space-8)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-6)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--teal-300)" }}>{sel.code}</div>
                  <h2 style={{ margin: "3px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-light)", color: "#fff" }}>{sel.name}</h2>
                  <div style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,.75)", marginTop: "4px" }}>ต.{sel.tambon} อ.{sel.district} จ.{sel.prov} · ผู้สนับสนุน {sel.sponsor}</div>
                </div>
                <button onClick={() => setSel(null)} style={{ background: "rgba(255,255,255,.16)", border: "none", color: "#fff", width: "30px", height: "30px", borderRadius: "var(--radius-circle)", cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ display: "flex", gap: "var(--space-8)", marginTop: "var(--space-6)" }}>
                {[[sel.plots.length + " แปลง", "แปลงย่อย"], [f2(sel.rai, 2) + " ไร่", "เนื้อที่รวม"], [sel.photos + "/" + sel.need, "ภาพหลักฐาน (4 ต่อครอป)"], [f2(sel.er, 3), "ER tCO₂eq"]].map(([v, l]) => (
                  <div key={l}><div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-light)" }}>{v}</div><div style={{ fontSize: "11px", color: "rgba(255,255,255,.66)" }}>{l}</div></div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "var(--space-1)", padding: "0 var(--space-8)", background: "var(--white)", borderBottom: "1px solid var(--border-subtle)" }}>
              {["แปลงและเอกสาร", "การคำนวณเครดิต", "ที่มาของไนโตรเจน", "ภาพหลักฐาน", "ประวัติการแก้ไข"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: "2px solid " + (tab === t ? "var(--teal-600)" : "transparent"), padding: "13px 11px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: tab === t ? "var(--teal-700)" : "var(--text-muted)" }}>{t}</button>
              ))}
            </div>
            <div style={{ padding: "var(--space-6) var(--space-8) var(--space-16)", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              {tab === "แปลงและเอกสาร" ? (
                <React.Fragment>
                  <Section title="แปลงย่อยในทะเบียน" sub="รหัสแปลงระบบรันให้เอง เปลี่ยนไม่ได้ (SY-07)" pad={false}>
                    <DataTable dense columns={[
                      { key: "plot", label: "รหัสแปลงย่อย" }, { key: "deed", label: "เลขโฉนด" },
                      { key: "rai", label: "ไร่", align: "right", render: r => f2(r.rai, 2) },
                      { key: "rice", label: "พันธุ์ข้าว" }, { key: "days", label: "รอบปลูก (วัน)", align: "right" },
                      { key: "ph", label: "ภาพ", align: "right", render: r => r.photosApproved + "/4" },
                      { key: "wkt", label: "ขอบแปลง", render: () => <Badge tone="success">มี WKT</Badge> }
                    ]} rows={sel.plots} />
                  </Section>
                  <Section title="เอกสารสิทธิ์และความยินยอม (AD-15)" sub="ทุกฉบับต้องเซ็นรับรองสำเนาถูกต้อง และระบุว่าใช้สำหรับโครงการบริษัทเนทซีโรคาร์บอน จำกัด">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                      {[["DOC-01", "โฉนดที่ดิน หน้า-หลัง", "ตรวจแล้ว", "success"], ["DOC-03", "สำเนาบัตรประชาชน", "ตรวจแล้ว", "success"],
                        ["DOC-07", "สำเนาหน้าสมุดบัญชีธนาคาร", "ตรวจแล้ว", "success"], ["DOC-06", "หนังสือมอบอำนาจ (เจ้าของร่วม)", sel.plots.length > 1 ? "ตรวจแล้ว" : "ไม่บังคับ", sel.plots.length > 1 ? "success" : "neutral"],
                        ["DOC-05", "หนังสือรับรองตนเอง กรณีจำนอง", "ไม่บังคับ", "neutral"],
                        ["CS-01", "ยินยอม PDPA · v1.2", "19 ก.ค. 69 09:41", "success"], ["CS-03", "สิทธิ์ในคาร์บอนเครดิต · v1.1", "19 ก.ค. 69 09:43", "success"],
                        ["CS-04", "ภาพถ่ายและพิกัด · v1.1", "19 ก.ค. 69 09:43", "success"]].map(([c, n, st, tone]) => (
                        <div key={c} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px 12px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", background: "var(--white)" }}>
                          <Icon name={tone === "success" ? "file-check" : "file"} size={17} />
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-subtle)" }}>{c}</span>
                            <span style={{ display: "block", fontSize: "12.5px", fontWeight: "var(--weight-semibold)" }}>{n}</span>
                          </span>
                          <Badge tone={tone}>{st}</Badge>
                        </div>
                      ))}
                    </div>
                  </Section>
                </React.Fragment>
              ) : null}

              {tab === "การคำนวณเครดิต" ? <CalcTrace plot={sel.plots[0]} /> : null}

              {tab === "ที่มาของไนโตรเจน" ? (
                <Section title="ตรวจที่มาของไนโตรเจนรายครั้ง (AD-18 · F-71)" sub="แสดงเป็นสมการเต็ม ไม่ใช่แค่ผลลัพธ์ — กดดูได้ว่าตัวเลขมาจากไหน" pad={false}>
                  <DataTable dense
                    columns={[
                      { key: "no", label: "ครั้งที่", align: "right" }, { key: "stage", label: "ขั้น" },
                      { key: "formula", label: "สูตรที่เกษตรกรให้", render: r => <span><b>{r.formula}</b><br /><span style={{ fontSize: "10.5px", color: "var(--text-subtle)" }}>{r.src}</span></span> },
                      { key: "pctN", label: "%N ที่ระบบอ่านได้", align: "right" },
                      { key: "rate", label: "อัตรา (กก./ไร่)", align: "right" },
                      { key: "n", label: "ไนโตรเจนต่อครั้ง", align: "right", render: r => <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{r.rate} × {r.pctN} ÷ 100 = <b>{(r.rate * r.pctN / 100).toFixed(2)}</b></span> },
                      { key: "urea", label: "is_urea", render: r => r.urea ? <Badge tone="info">ยูเรีย</Badge> : <Badge tone="neutral" dot={false}>ไม่ใช่</Badge> },
                      { key: "photo", label: "ภาพถุงปุ๋ย", render: r => r.photo ? <Badge tone="success">มี</Badge> : <Badge tone="warning">ไม่มี</Badge> }
                    ]}
                    rows={NITROGEN_ROWS} />
                  <div style={{ padding: "var(--space-4) var(--space-6)", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-sm)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>ยอดรวมไนโตรเจนรายฤดู — ต้องเท่ากับผลรวมรายครั้งเสมอ</span>
                      <b style={{ fontFamily: "var(--font-mono)" }}>{NITROGEN_ROWS.reduce((s, r) => s + r.rate * r.pctN / 100, 0).toFixed(2)} กก.N/ไร่</b>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-subtle)", lineHeight: "var(--leading-relaxed)" }}>
                      ปริมาณปุ๋ยฝั่งกรณีฐานและฝั่งโครงการใช้ค่าเดียวกันโดยเจตนา — โครงการไม่มีวัตถุประสงค์ให้เกษตรกรลดปุ๋ย ไนโตรเจนจึงไม่ใช่แหล่งของเครดิต แต่ยังต้องบันทึกให้ครบเพราะเข้าสมการ N₂O ทั้งสองฝั่ง
                    </div>
                  </div>
                </Section>
              ) : null}

              {tab === "ภาพหลักฐาน" ? (
                <Section title="ภาพท่อวัดระดับน้ำ 4 รอบของครอปนี้" sub="เปียก 2 ครั้ง แห้ง 2 ครั้ง สลับกัน — ทุกภาพถ่ายผ่านกล้องของระบบ">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-3)" }}>
                    {PHOTO_ROUNDS.map((pr, i) => {
                      const ok = i < sel.plots[0].photosApproved;
                      return (
                        <div key={pr.code} style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid " + (ok ? "var(--border-subtle)" : "var(--status-warning)") }}>
                          <div style={{ position: "relative", aspectRatio: "4 / 3", background: ok ? "linear-gradient(180deg,#9FC7E8,#8FA95C)" : "var(--grey-100)" }}>
                            {ok ? <span style={{ position: "absolute", left: "50%", top: "22%", transform: "translateX(-50%)", width: "14px", height: "50px", background: "#E7EDF2", borderRadius: "2px", overflow: "hidden" }}>
                              <span style={{ position: "absolute", inset: pr.phase === "wet" ? "6% 0 0 0" : "58% 0 0 0", background: "rgba(56,120,160,.75)" }} />
                            </span> : <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--grey-400)", fontSize: "20px" }}>—</span>}
                          </div>
                          <div style={{ padding: "7px 8px", background: "#fff" }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "9.5px", color: "var(--text-subtle)" }}>{pr.code} · {pr.stage} · วันที่ {pr.day}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "3px" }}>
                              <span style={{ fontSize: "11px", fontWeight: "var(--weight-semibold)" }}>{pr.phase === "wet" ? "เปียก" : "แห้ง"}</span>
                              <Badge tone={ok ? "success" : "warning"}>{ok ? "อนุมัติ" : "ยังไม่ส่ง"}</Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              ) : null}

              {tab === "ประวัติการแก้ไข" ? (
                <Section title="Audit log (AD-11)" sub="ใคร เมื่อไร ค่าก่อน-หลัง — ใช้ตอบผู้ทวนสอบ" pad={false}>
                  <DataTable dense columns={[{ key: "t", label: "เวลา" }, { key: "who", label: "ผู้ใช้" }, { key: "what", label: "รายการ" }, { key: "before", label: "ก่อน" }, { key: "after", label: "หลัง" }]}
                    rows={[
                      { t: "20 ส.ค. 10:12", who: "admin@nzc", what: "อนุมัติภาพ PH-8841 (DRY-1)", before: "pending", after: "approved" },
                      { t: "20 ส.ค. 10:12", who: "ระบบ (calc_run)", what: "ตัดสิน SF_w ใหม่หลังอนุมัติภาพ", before: "0.71 (fallback)", after: "0.55" },
                      { t: "19 ส.ค. 07:42", who: "ระบบ (LIFF)", what: "บันทึกระดับน้ำ DRY-1", before: "—", after: "10 ซม." },
                      { t: "19 ก.ค. 09:43", who: "เกษตรกร", what: "ยินยอม CS-02 ถึง CS-04", before: "—", after: "v1.1" }
                    ]} />
                </Section>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ===== ลำดับการคำนวณ 12 ขั้น (ชีต 5_ลำดับการคำนวณ) กางให้เห็นทีละขั้น =====
function CalcTrace({ plot }) {
  const c = computePlotSeason(plot);
  const row = (k, v, eq) => (
    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", padding: "8px 0", borderBottom: "1px dashed var(--grey-200)", fontSize: "var(--text-xs)" }}>
      <span style={{ color: "var(--text-muted)" }}>{k}{eq ? <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-subtle)", marginLeft: "6px" }}>{eq}</span> : null}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: "var(--weight-semibold)", textAlign: "right" }}>{v}</span>
    </div>
  );
  return (
    <React.Fragment>
      <Section title={"การคำนวณของแปลง " + plot.plot} sub={"เนื้อที่ " + f2(plot.rai, 2) + " ไร่ · " + plot.rice + " · รอบปลูก " + plot.days + " วัน · แนวทางการประเมินที่ 3"}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
          <div>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)", marginBottom: "var(--space-2)" }}>กรณีฐาน (BL)</div>
            {row("การจัดการน้ำระหว่างฤดู", SF_W[plot.bl.wwCode].label, "B-02")}
            {row("SF_w", c.sfWbl.v.toFixed(2), "")}
            {row("SF_p", SF_P[plot.bl.sfP].v.toFixed(2), "B-01")}
            {row("SF_o", c.BL.sfO.toFixed(4), "E-08")}
            {row("EF_CH4", c.BL.ef.toFixed(6) + " กก./ไร่/วัน", "E-07")}
            {row("CH4_SOIL ก่อนคูณ CF", f2(c.BL.ch4, 4), "E-06")}
            {row("× CF = 0.89", f2(c.BL.ch4Applied, 4), "E-03")}
            {row("CO2_LIME", f2(c.BL.lime, 4), "E-09")}
            {row("CO2_UREA", f2(c.BL.urea, 4), "E-10")}
            {row("N2O_SOIL", f2(c.BL.n2o, 4), "E-11")}
            {row("BE_s รวม", f2(c.be, 4) + " tCO₂eq", "E-03")}
          </div>
          <div>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)", marginBottom: "var(--space-2)" }}>กรณีดำเนินโครงการ (PJ)</div>
            {row("การจัดการน้ำระหว่างฤดู", SF_W[plot.pj.wwCode].label, "B-02")}
            {row("SF_w ที่ใช้จริง", c.sfWpj.v.toFixed(2) + (c.sfWpj.fallback ? " ← fallback" : ""), "")}
            {row("SF_p", SF_P[plot.pj.sfP].v.toFixed(2), "B-01")}
            {row("SF_o", c.PJ.sfO.toFixed(4), "E-08")}
            {row("EF_CH4", c.PJ.ef.toFixed(6) + " กก./ไร่/วัน", "E-07")}
            {row("CH4_SOIL (ไม่คูณ CF)", f2(c.PJ.ch4Applied, 4), "E-06")}
            {row("CO2_LIME", f2(c.PJ.lime, 4), "E-09")}
            {row("CO2_UREA", f2(c.PJ.urea, 4), "E-10")}
            {row("N2O_SOIL", f2(c.PJ.n2o, 4), "E-11")}
            {row("CO2_FUEL (สูบน้ำเพิ่ม)", f2(c.PJ.fuel, 4), "E-17")}
            {row("PE_s รวม", f2(c.pe, 4) + " tCO₂eq", "E-05")}
          </div>
        </div>
        <div style={{ marginTop: "var(--space-6)", padding: "var(--space-5)", background: "var(--surface-accent-soft)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "7px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--teal-800)" }}>
            ER = (BE − PE − LE) × (1 − U_d) = ({f2(c.be, 4)} − {f2(c.pe, 4)} − 0) × 0.85
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
            <span style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-light)", color: "var(--teal-800)", fontFamily: "var(--font-mono)" }}>{f2(c.er, 4)}</span>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--teal-800)" }}>tCO₂eq ต่อฤดู</span>
          </div>
        </div>
      </Section>
      <Section title="ขั้นที่ 2 · ตรวจหลักฐานระดับน้ำและตัดสิน SF_w" sub="ต้องเกิดก่อนขั้นที่ 5 เสมอ มิฉะนั้นจะคำนวณด้วยค่าที่ยังไม่มีหลักฐานรองรับ"
        actions={<Badge tone={c.sfWpj.fallback ? "danger" : "success"}>{c.sfWpj.fallback ? "fallback_applied" : "ตามที่เลือก"}</Badge>}>
        <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
          {PHOTO_ROUNDS.map((pr, i) => {
            const ok = i < plot.photosApproved;
            return (
              <div key={pr.code} style={{ flex: 1, padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid " + (ok ? "var(--teal-200)" : "var(--border-default)"), background: ok ? "var(--teal-50)" : "var(--white)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-subtle)" }}>{pr.code} · {pr.stage}</div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", margin: "3px 0 5px" }}>{pr.name}</div>
                <Badge tone={ok ? "success" : "warning"}>{ok ? "อนุมัติแล้ว" : "ยังไม่มีภาพ"}</Badge>
                <div style={{ fontSize: "10.5px", color: "var(--text-subtle)", marginTop: "6px", lineHeight: "var(--leading-relaxed)" }}>วันที่ {pr.day} หลังหว่าน</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-relaxed)", color: c.sfWpj.fallback ? "#8C2830" : "var(--text-muted)", padding: "var(--space-4)", background: c.sfWpj.fallback ? "var(--status-danger-soft)" : "var(--surface-sunken)", borderRadius: "var(--radius-md)" }}>
          {c.sfWpj.reason} — {c.sfWpj.fallback
            ? "ระบบถอยไปใช้ SF_w = " + c.sfWpj.v.toFixed(2) + " (WW-2) และบันทึก fallback_applied พร้อมเหตุผลไว้ในตาราง calc_result ผู้ทวนสอบจะเห็นว่าทำไมเครดิตต่ำกว่าที่ควรได้"
            : "ใช้ SF_w = " + c.sfWpj.v.toFixed(2) + " ตามรหัส WW-3 (เปียกสลับแห้ง) ได้เต็มค่า"}
        </div>
      </Section>
    </React.Fragment>
  );
}

// ===== AD-07 · ส่งออกรายงาน =====
function ReportsScreen() {
  const [picked, setPicked] = React.useState("EX-2043");
  const ex = EXPORTS.find(e => e.id === picked);
  const complete = Math.round(FARMERS.reduce((s, f) => s + f.photos, 0) / FARMERS.reduce((s, f) => s + f.need, 0) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="AD-07 · ส่งออกรายงาน" title="รายงานและไฟล์สำหรับยื่นขึ้นทะเบียน"
        sub="โครงเดียวกับไฟล์คำนวณที่ใช้อยู่ · ทุกไฟล์ใช้ CPA code แทนชื่อ" />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: "var(--space-6)", alignItems: "start" }}>
        <Section title="ชุดรายงานที่ส่งออกได้" pad={false}>
          <DataTable onRowClick={r => setPicked(r.id)}
            columns={[
              { key: "name", label: "รายงาน", render: r => <span><b>{r.name}</b><br /><span style={{ fontSize: "11px", color: "var(--text-subtle)" }}>{r.note}</span></span> },
              { key: "fmt", label: "รูปแบบ", render: r => <Tag tone={r.fmt === "DOCX" ? "navy" : "teal"}>{r.fmt}</Tag> },
              { key: "scope", label: "ขอบเขต" }, { key: "who", label: "ใครดาวน์โหลดได้" }
            ]}
            rows={EXPORTS} />
        </Section>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <Section title="ยื่นขึ้นทะเบียน Premium T-VER" sub="T-VER-P-METH-13-08 ฉบับที่ 01">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                <ProgressBar label="ข้อมูลกรณีฐาน 3 ปี" value={71} max={100} valueLabel="71%" />
                <ProgressBar label="เอกสารสิทธิ์ครบ" value={88} max={100} valueLabel="88%" tone="mint" />
                <ProgressBar label="ภาพหลักฐาน 4 ภาพ/ครอป" value={complete} max={100} valueLabel={complete + "%"} tone="navy" />
              </div>
              <div style={{ padding: "var(--space-4)", background: "var(--status-warning-soft)", border: "1px solid #F2DDB4", borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)", lineHeight: "var(--leading-relaxed)", color: "#8A5B10" }}>
                ยังยื่นไม่ได้ — ต้องมีข้อมูลกรณีฐานครบ 100% และภาพหลักฐานครบ 4 รอบของทุกแปลง มิฉะนั้นแปลงที่ขาดจะถูกคิดด้วย SF_w = 0.71 ทำให้เครดิตรวมต่ำกว่าที่ควรได้
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Button variant="outline" fullWidth iconLeft={<Icon name="file-text" size={16} />}>ดาวน์โหลด Word · แบบฟอร์มขอขึ้นทะเบียน</Button>
                <Button variant="outline" fullWidth iconLeft={<Icon name="table" size={16} />}>ดาวน์โหลด Excel · ไฟล์คำนวณเครดิต</Button>
                <Button fullWidth disabled>สร้างชุดยื่น (ล็อกไว้จนข้อมูลครบ)</Button>
              </div>
            </div>
          </Section>
          <Section title={"ตัวอย่างที่เลือก · " + ex.id} sub={ex.name}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", fontSize: "var(--text-xs)" }}>
              {[["รูปแบบ", ex.fmt], ["ขอบเขต", ex.scope], ["สิทธิ์ดาวน์โหลด", ex.who], ["ตัวระบุเกษตรกร", "CPA code (PDPA)"], ["บันทึกการดาวน์โหลด", "ลง audit log ทุกครั้ง"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", paddingBottom: "7px", borderBottom: "1px dashed var(--grey-200)" }}>
                  <span style={{ color: "var(--text-muted)" }}>{k}</span><span style={{ fontWeight: "var(--weight-semibold)", textAlign: "right" }}>{v}</span>
                </div>
              ))}
              <div style={{ color: "var(--text-subtle)", lineHeight: "var(--leading-relaxed)" }}>{ex.note}</div>
              <Button size="sm" fullWidth iconLeft={<Icon name="download" size={15} />}>ส่งออกไฟล์นี้</Button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ===== F-65 · สิทธิ์ของบริษัทผู้สนับสนุน =====
function SponsorsScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="F-65 · สิทธิ์ของลูกค้า" title="บริษัทผู้สนับสนุนและขอบเขตที่มองเห็นได้"
        sub="แอดมินเป็นผู้กำหนดว่าบัญชีลูกค้าเห็นพื้นที่ใดได้ · ลูกค้าไม่เห็นพื้นที่ของผู้สนับสนุนรายอื่น"
        actions={<Button size="sm" iconLeft={<Icon name="plus" size={15} />}>เพิ่มบริษัท</Button>} />
      {SPONSORS.map(s => (
        <Section key={s.id} title={s.name} sub={"ครัวเรือน " + s.households + " · " + f2(s.rai, 1) + " ไร่ · ทวนสอบแล้ว " + f2(s.verified) + " tCO₂eq"}
          actions={<React.Fragment><Button size="sm" variant="ghost">ดูอย่างที่ลูกค้าเห็น</Button><Button size="sm" variant="outline">แก้ไขสิทธิ์</Button></React.Fragment>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>พื้นที่ที่เห็นได้</div>
              {PROVINCES.map(p => <Checkbox key={p.name} label={p.name + " · " + p.tambon + " ตำบล · " + f2(p.rai, 1) + " ไร่"} defaultChecked={s.areas.includes(p.name)} />)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>ระดับรายละเอียดที่เห็นได้</div>
              <Checkbox label="ยอดรวมรายพื้นที่และรายฤดู" defaultChecked />
              <Checkbox label="เครดิตประมาณการ (ก่อนทวนสอบ)" defaultChecked />
              <Checkbox label="เครดิตที่รับรองแล้ว" defaultChecked />
              <Checkbox label="ภาพถ่ายแปลง (ไม่ระบุตัวบุคคล)" defaultChecked />
              <Checkbox label="ข้อมูลรายเกษตรกร (ชื่อ เบอร์ เลขโฉนด)" />
              <div style={{ fontSize: "11px", color: "var(--text-subtle)", lineHeight: "var(--leading-relaxed)" }}>ช่องสุดท้ายปิดไว้ตามข้อตกลงความยินยอม CS-02 — เปิดได้เฉพาะเมื่อมีหลักฐานความยินยอมเพิ่มเติมรายบุคคล</div>
            </div>
          </div>
        </Section>
      ))}
    </div>
  );
}

Object.assign(window, { FarmersScreen, ReportsScreen, SponsorsScreen, CalcTrace });
