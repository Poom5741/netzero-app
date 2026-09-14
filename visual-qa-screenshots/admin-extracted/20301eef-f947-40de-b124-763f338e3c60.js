const { Button, Badge, Tag, Icon, StatTile, DataTable, ProgressBar, Field, Input, Select, Checkbox } = window.NetZeroCarbonDesignSystem_f3e7a8;
const f5 = (n, d = 2) => Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

// ---------- ชิ้นส่วนกราฟ (SVG ล้วน ไม่พึ่งไลบรารี) ----------
function Gauge({ value, max, label, sub, size = 168 }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = size / 2 - 16, c = 2 * Math.PI * r, gap = c * 0.28;
  const arc = (c - gap) * pct;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
      <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ transform: "rotate(129.6deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--grey-200)" strokeWidth="15" strokeLinecap="round" strokeDasharray={(c - gap) + " " + c} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--teal-600)" strokeWidth="15" strokeLinecap="round" strokeDasharray={arc + " " + c} />
      </svg>
      <div style={{ marginTop: "-" + (size * 0.62) + "px", textAlign: "center", marginBottom: (size * 0.34) + "px" }}>
        <div style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-light)", color: "var(--teal-700)", lineHeight: 1 }}>{f5(value, 2)}</div>
        <div style={{ fontSize: "10.5px", color: "var(--text-subtle)", marginTop: "3px" }}>จาก {f5(max, 2)}</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>{label}</div>
        {sub ? <div style={{ fontSize: "10.5px", color: "var(--text-subtle)", marginTop: "2px" }}>{sub}</div> : null}
      </div>
    </div>
  );
}

function Donut({ slices, total, unit, size = 190 }) {
  const sum = slices.reduce((s, x) => s + x.v, 0) || 1;
  const r = size / 2 - 14, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {slices.map(s => {
            const len = (s.v / sum) * c, el = <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.c} strokeWidth="26" strokeDasharray={len + " " + (c - len)} strokeDashoffset={-off} />;
            off += len; return el;
          })}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-light)", color: "var(--text-heading)", lineHeight: 1 }}>{f5(total)}</div>
            <div style={{ fontSize: "10px", color: "var(--text-subtle)", marginTop: "3px" }}>{unit}</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "7px", flex: 1, minWidth: 0 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: s.c, flex: "none" }} />
            <span style={{ flex: 1, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
            <b style={{ fontFamily: "var(--font-mono)", color: "var(--text-heading)" }}>{f5(s.v)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bubbles({ points, height = 200 }) {
  const maxX = Math.max(...points.map(p => p.x)), maxY = Math.max(...points.map(p => p.y)), maxR = Math.max(...points.map(p => p.r));
  return (
    <div>
      <svg viewBox={"0 0 400 " + height} style={{ width: "100%", height: height + "px" }}>
        {[0, 1, 2, 3].map(i => <line key={i} x1="34" x2="396" y1={14 + i * (height - 40) / 3} y2={14 + i * (height - 40) / 3} stroke="var(--grey-200)" strokeWidth="1" />)}
        {points.map((p, i) => (
          <g key={p.label}>
            <circle cx={40 + (p.x / maxX) * 348} cy={height - 26 - (p.y / maxY) * (height - 46)} r={6 + (p.r / maxR) * 15} fill={p.c} fillOpacity=".72" stroke={p.c} />
          </g>
        ))}
        <line x1="34" x2="396" y1={height - 26} y2={height - 26} stroke="var(--border-default)" />
        <line x1="34" x2="34" y1="10" y2={height - 26} stroke="var(--border-default)" />
      </svg>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "10.5px", color: "var(--text-muted)" }}>
        {points.map(p => <span key={p.label} style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.c }} />{p.label}</span>)}
      </div>
    </div>
  );
}

function Treemap({ items, height = 190 }) {
  const sum = items.reduce((s, x) => s + x.v, 0) || 1;
  let x = 0;
  return (
    <div style={{ display: "flex", height: height + "px", borderRadius: "var(--radius-md)", overflow: "hidden", gap: "2px" }}>
      {items.map((it, i) => {
        const w = (it.v / sum) * 100;
        return (
          <div key={it.label} style={{ width: w + "%", background: it.c, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "9px 10px", minWidth: 0 }}>
            <span style={{ fontSize: w > 14 ? "13px" : "10px", fontWeight: "var(--weight-semibold)", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</span>
            <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,.82)" }}>{f5(w, 1)}%</span>
          </div>
        );
      })}
    </div>
  );
}

function BarSeries({ bars, height = 180, unit }) {
  const max = Math.max(...bars.map(b => b.v)) || 1;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-3)", height: height + "px", borderBottom: "1px solid var(--border-default)" }}>
        {bars.map(b => (
          <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "5px", height: "100%" }}>
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{f5(b.v, b.v < 10 ? 1 : 0)}</span>
            <span style={{ width: "100%", height: Math.max(3, (b.v / max) * (height - 26)) + "px", background: b.c || "var(--teal-500)", borderRadius: "4px 4px 0 0" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "6px" }}>
        {bars.map(b => <div key={b.label} style={{ flex: 1, fontSize: "10px", color: "var(--text-subtle)", textAlign: "center", lineHeight: 1.3 }}>{b.label}</div>)}
      </div>
      {unit ? <div style={{ fontSize: "10.5px", color: "var(--text-subtle)", marginTop: "6px" }}>{unit}</div> : null}
    </div>
  );
}

// ===== หน้ากราฟสรุปเครดิต =====
function ChartsScreen({ filters, onFilter }) {
  const totalRai = PROVINCES.reduce((s, p) => s + p.rai, 0);
  const totalHa = totalRai * 0.16;
  const ch4 = GHG_2569.rows[0], lime = GHG_2569.rows[1], urea = GHG_2569.rows[2], n2o = GHG_2569.rows[3], fuel = GHG_2569.rows[4];
  const be = r => r.s1[0] + r.s2[0], pe = r => r.s1[1] + r.s2[1];
  const riceMix = [
    { label: "หอมปทุม", v: PLOTS.filter(p => p.rice === "หอมปทุม").reduce((s, p) => s + p.rai, 0), c: "var(--teal-700)" },
    { label: "กข85", v: PLOTS.filter(p => p.rice === "กข85").reduce((s, p) => s + p.rai, 0), c: "var(--teal-400)" }
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <PageTitle eyebrow="แดชบอร์ดกราฟ" title="สรุปเครดิตและผลการดำเนินโครงการ"
        sub="ทุกตัวเลขคำนวณสดจากสมการ T-VER-P-METH-13-08 · ฤดูนาปี + นาปรัง 2569"
        actions={<Button size="sm" variant="outline" iconLeft={<Icon name="download" size={15} />}>ส่งออกภาพแดชบอร์ด</Button>} />
      <FilterBarLite filters={filters} onFilter={onFilter} />

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.3fr", gap: "var(--space-5)", alignItems: "stretch" }}>
        <Section title="พื้นที่ทั้งหมดในโครงการ">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <div style={{ fontSize: "58px", fontWeight: "var(--weight-light)", lineHeight: 1, letterSpacing: "var(--tracking-display)", color: "var(--text-heading)", fontVariantNumeric: "tabular-nums" }}>{f5(totalHa, 2)}</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>เฮกตาร์</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-subtle)", lineHeight: "var(--leading-relaxed)" }}>
              {f5(totalRai, 1)} ไร่ · {PLOTS.length + 24} แปลงย่อย · {FARMERS.length + PROVINCES[1].households} ครัวเรือน · รอบปลูก 120 วัน 2 ฤดูต่อปี
            </div>
            <div style={{ marginTop: "var(--space-3)", display: "flex", flexDirection: "column", gap: "7px" }}>
              <ProgressBar label="แจ้งวันหว่านแล้ว" value={92} max={100} valueLabel="92%" />
              <ProgressBar label="หลักฐานครบ 4 ภาพ" value={Math.round(FARMERS.reduce((s, f) => s + f.photos, 0) / FARMERS.reduce((s, f) => s + f.need, 0) * 100)} max={100} valueLabel={Math.round(FARMERS.reduce((s, f) => s + f.photos, 0) / FARMERS.reduce((s, f) => s + f.need, 0) * 100) + "%"} tone="mint" />
            </div>
          </div>
        </Section>
        <Section title="เครดิตที่ทำได้เทียบกับศักยภาพ" sub="ER จริง เทียบกับกรณีที่ทุกแปลงส่งหลักฐานครบ">
          <Gauge value={GHG_2569.er} max={GHG_2569.er * 1.18} label="tCO₂eq ที่คิดได้จริง" sub={"ศักยภาพเต็ม " + f5(GHG_2569.er * 1.18) + " หากหลักฐานครบทุกแปลง"} />
        </Section>
        <Section title="ส่วนต่างมาจากแหล่งไหน" sub="ผลต่าง BE − PE รายแหล่ง · หน่วย tCO₂eq">
          <Donut total={GHG_2569.be - GHG_2569.pe} unit="tCO₂eq ก่อนหัก U_d"
            slices={[
              { label: "มีเทนจากนาข้าว (E-06)", v: be(ch4) - pe(ch4), c: "var(--teal-700)" },
              { label: "N₂O จากปุ๋ย (เพิ่มขึ้น)", v: Math.max(0.01, pe(n2o) - be(n2o)), c: "var(--status-warning)" },
              { label: "เชื้อเพลิงสูบน้ำ (เพิ่มขึ้น)", v: Math.max(0.01, pe(fuel) - be(fuel)), c: "var(--status-danger)" }
            ]} />
          <div style={{ marginTop: "var(--space-4)", fontSize: "11px", color: "var(--text-subtle)", lineHeight: "var(--leading-relaxed)" }}>
            สองรายการหลังเป็นค่าที่ <b>หักออก</b> จากมีเทน — ฝั่งโครงการปล่อยมากกว่ากรณีฐาน
          </div>
        </Section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--space-5)", alignItems: "start" }}>
        <Section title="เครดิตรายฤดู" sub="กรณีฐาน · ประมาณการ · ทวนสอบแล้ว">
          <CreditChart seasons={SEASONS} />
        </Section>
        <Section title="เครดิตรายบริษัทผู้สนับสนุน" sub="tCO₂eq ที่จัดสรรตามพื้นที่ที่สนับสนุน">
          <BarSeries unit="แท่งเข้ม = ทวนสอบแล้ว · แท่งอ่อน = ประมาณการฤดูปัจจุบัน"
            bars={SPONSORS.flatMap(s => ([
              { label: s.name + "\nรับรอง", v: s.verified, c: "var(--teal-700)" },
              { label: s.name + "\nประมาณการ", v: s.estimate, c: "var(--teal-300)" }
            ]))} />
        </Section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-5)", alignItems: "start" }}>
        <Section title="สัดส่วนพันธุ์ข้าวตามเนื้อที่" sub="มีผลต่อรอบปลูกและกำหนดถ่ายภาพ">
          <Treemap items={riceMix} />
        </Section>
        <Section title="ผลตอบแทนเทียบเนื้อที่รายเกษตรกร" sub="แกนนอน = ไร่ · แกนตั้ง = ER tCO₂eq · ขนาดวง = จำนวนแปลง">
          <Bubbles points={FARMERS.slice(0, 8).map((f, i) => ({ label: f.code, x: f.rai, y: f.er, r: f.plots.length, c: ["#028E91", "#52ECCA", "#1C489F", "#24C4B2", "#7C9AD8", "#027276", "#0AA8A3", "#123787"][i] }))} />
        </Section>
        <Section title="ความครบถ้วนของภาพหลักฐาน" sub="นับรายรอบทั้งโครงการ · 4 รอบต่อครอป">
          <BarSeries unit="จำนวนแปลงที่ภาพผ่านการตรวจในแต่ละรอบ"
            bars={PHOTO_ROUNDS.map(pr => ({
              label: pr.name.replace("รอบที่ ", "ร."),
              v: PLOTS.filter(p => p.photosApproved > PHOTO_ROUNDS.indexOf(pr)).length,
              c: pr.phase === "wet" ? "var(--navy-600)" : "var(--teal-600)"
            }))} />
        </Section>
      </div>

      <Section title="ตารางสรุปแหล่งการปล่อยรายฤดู" sub="ค่าจริงจากชีต 3.7 สรุปGHG · หน่วย tCO₂eq" pad={false}>
        <DataTable dense
          columns={[
            { key: "name", label: "แหล่งการปล่อย" },
            { key: "a", label: "นาปี BE", align: "right", render: r => f5(r.s1[0], 4) },
            { key: "b", label: "นาปี PE", align: "right", render: r => f5(r.s1[1], 4) },
            { key: "c", label: "นาปรัง BE", align: "right", render: r => f5(r.s2[0], 4) },
            { key: "d", label: "นาปรัง PE", align: "right", render: r => f5(r.s2[1], 4) },
            { key: "e", label: "รวม BE", align: "right", render: r => <b>{f5(be(r), 4)}</b> },
            { key: "f", label: "รวม PE", align: "right", render: r => <b>{f5(pe(r), 4)}</b> },
            { key: "eq", label: "สมการ", render: r => <span style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--text-subtle)" }}>{r.eq}</span> }
          ]}
          rows={GHG_2569.rows} />
      </Section>
    </div>
  );
}

function FilterBarLite({ filters, onFilter }) {
  const { FilterBar } = window.NetZeroCarbonDesignSystem_f3e7a8;
  return <FilterBar filters={filters} onChange={onFilter} />;
}

Object.assign(window, { ChartsScreen, Gauge, Donut, Bubbles, Treemap, BarSeries });
