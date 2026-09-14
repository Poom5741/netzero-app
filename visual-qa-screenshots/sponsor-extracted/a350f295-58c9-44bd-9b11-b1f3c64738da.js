const { Logo, Button, Badge, Tag, Icon, Field, Input, Checkbox, GradientRule, StatTile } = window.NetZeroCarbonDesignSystem_f3e7a8;

// ----- F-34 · เข้าสู่ระบบด้วยบัญชีที่เข้าถึงได้ทุกอย่าง -----
function LoginScreen({ onLogin, role = "admin" }) {
  const admin = role === "admin";
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.05fr .95fr" }}>
      <div style={{ position: "relative", background: "var(--gradient-deep)", padding: "var(--space-16) var(--space-12)", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
        <img src="../../assets/imagery/renewables-wind-farm.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: .18 }} />
        <div style={{ position: "relative" }}><Logo assetBase="../../assets/logos" tone="white" height={36} /></div>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", color: "var(--teal-300)" }}>
            {admin ? "Admin Console" : "Sponsor Portal"}
          </span>
          <h1 style={{ margin: 0, fontSize: "var(--text-4xl)", fontWeight: "var(--weight-light)", lineHeight: "var(--leading-snug)", letterSpacing: "var(--tracking-display)", color: "#fff", maxWidth: "22ch" }}>
            {admin ? "โครงการทำนาลดโลกร้อน — ระบบหลังบ้าน" : "พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน"}
          </h1>
          <GradientRule width={120} />
          <p style={{ margin: 0, fontSize: "var(--text-md)", lineHeight: "var(--leading-relaxed)", color: "rgba(255,255,255,.82)", maxWidth: "44ch" }}>
            {admin
              ? "ตรวจภาพหลักฐาน อนุมัติใบสมัคร คำนวณเครดิต และส่งออกรายงานสำหรับขึ้นทะเบียน Premium T-VER"
              : "ดูได้เฉพาะพื้นที่และเกษตรกรที่บริษัทของท่านสนับสนุน ตามสิทธิ์ที่แอดมินตั้งค่าไว้"}
          </p>
        </div>
        <div style={{ position: "relative", fontSize: "var(--text-xs)", color: "rgba(255,255,255,.55)" }}>ระเบียบวิธี T-VER-P-METH-13-08 · บริษัท เนทซีโรคาร์บอน จำกัด</div>
      </div>
      <div style={{ display: "grid", placeItems: "center", padding: "var(--space-12)", background: "var(--surface-page)" }}>
        <form onSubmit={e => { e.preventDefault(); onLogin(); }} style={{ width: "100%", maxWidth: "392px", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div>
            <h2 style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-light)" }}>เข้าสู่ระบบ</h2>
            <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              {admin ? "บัญชีเจ้าหน้าที่ NZC · เข้าถึงได้ทุกพื้นที่และทุกเมนู" : "บัญชีบริษัทผู้สนับสนุน · ขอบเขตกำหนดโดยแอดมิน"}
            </p>
          </div>
          <Field label="อีเมลบริษัท" required htmlFor="lg-e"><Input id="lg-e" type="email" defaultValue={admin ? "admin@netzero-carbon.io" : "esg@company-a.example"} /></Field>
          <Field label="รหัสผ่าน" required htmlFor="lg-p"><Input id="lg-p" type="password" defaultValue="••••••••••" /></Field>
          <Field label="รหัส OTP จากแอป" hint="บังคับสำหรับบัญชีที่เห็นข้อมูลส่วนบุคคล" htmlFor="lg-o"><Input id="lg-o" placeholder="000000" /></Field>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Checkbox label="จำอุปกรณ์นี้ไว้ 30 วัน" />
            <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: "var(--text-sm)" }}>ลืมรหัสผ่าน</a>
          </div>
          <Button type="submit" size="lg" fullWidth iconRight={<Icon name="arrow-right" size={16} />}>เข้าสู่ระบบ</Button>
          <div style={{ display: "flex", gap: "var(--space-2)", padding: "var(--space-4)", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: "var(--leading-relaxed)" }}>
            <Icon name="shield-check" size={16} />
            <span>ทุกการเข้าดูและแก้ไขถูกบันทึกใน audit log (AD-11) พร้อมผู้ใช้ เวลา และค่าก่อน-หลัง</span>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----- โครงหน้าหลังบ้าน: sidebar + topbar -----
function ConsoleShell({ nav, screen, onNavigate, account, role, children, onLogout }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "232px minmax(0,1fr)", minHeight: "100vh", background: "var(--surface-sunken)" }}>
      <aside style={{ background: "var(--surface-inverse)", display: "flex", flexDirection: "column", padding: "var(--space-6) var(--space-4)", gap: "var(--space-6)", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "0 var(--space-2)" }}><Logo assetBase="../../assets/logos" tone="white" height={28} /></div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {nav.map(n => n.divider ? (
            <div key={n.label} style={{ fontSize: "10px", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", color: "rgba(255,255,255,.42)", fontWeight: "var(--weight-semibold)", padding: "var(--space-4) var(--space-3) var(--space-2)" }}>{n.label}</div>
          ) : (
            <button key={n.id} onClick={() => onNavigate(n.id)}
              style={{ display: "flex", alignItems: "center", gap: "10px", textAlign: "left", border: "none", borderRadius: "var(--radius-sm)", padding: "9px 11px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: "var(--weight-semibold)", background: screen === n.id ? "rgba(255,255,255,.12)" : "transparent", color: screen === n.id ? "#fff" : "rgba(255,255,255,.72)" }}>
              <Icon name={n.icon} size={16} />
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.count ? <span style={{ background: "var(--teal-500)", color: "#fff", fontSize: "10.5px", fontWeight: "var(--weight-bold)", borderRadius: "var(--radius-pill)", padding: "1px 7px" }}>{n.count}</span> : null}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-on-dark)", paddingTop: "var(--space-4)", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-circle)", background: "var(--teal-600)", color: "#fff", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: "var(--weight-bold)", flex: "none" }}>{account.initials}</span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span style={{ display: "block", fontSize: "12px", fontWeight: "var(--weight-semibold)", color: "#fff", overflow: "hidden", textOverflow: "ellipsis" }}>{account.name}</span>
            <span style={{ display: "block", fontSize: "10.5px", color: "rgba(255,255,255,.6)" }}>{role}</span>
          </span>
          <button onClick={onLogout} title="ออกจากระบบ" style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", cursor: "pointer" }}><Icon name="log-out" size={15} /></button>
        </div>
      </aside>
      <main style={{ minWidth: 0, padding: "var(--space-8) var(--space-10) var(--space-16)" }}>{children}</main>
    </div>
  );
}

function PageTitle({ eyebrow, title, sub, actions }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--space-8)", marginBottom: "var(--space-6)", flexWrap: "wrap" }}>
      <div>
        {eyebrow ? <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", color: "var(--text-accent)" }}>{eyebrow}</span> : null}
        <h1 style={{ margin: "var(--space-2) 0 0", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-light)", letterSpacing: "var(--tracking-display)" }}>{title}</h1>
        {sub ? <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{sub}</p> : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: "var(--space-2)" }}>{actions}</div> : null}
    </div>
  );
}

function Section({ title, sub, actions, children, pad = true }) {
  return (
    <section style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-xs)", overflow: "hidden" }}>
      {title ? (
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-6)", padding: "var(--space-5) var(--space-6)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "var(--text-md)", fontWeight: "var(--weight-semibold)" }}>{title}</h2>
            {sub ? <p style={{ margin: "3px 0 0", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>{sub}</p> : null}
          </div>
          {actions ? <div style={{ display: "flex", gap: "var(--space-2)" }}>{actions}</div> : null}
        </header>
      ) : null}
      <div style={{ padding: pad ? "var(--space-6)" : 0 }}>{children}</div>
    </section>
  );
}

function PdpaNote({ children }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", padding: "var(--space-4) var(--space-5)", background: "var(--status-info-soft)", border: "1px solid var(--navy-100)", borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)", lineHeight: "var(--leading-relaxed)", color: "var(--navy-800)" }}>
      <span style={{ flex: "none", marginTop: "1px" }}>🔒</span><span>{children}</span>
    </div>
  );
}

// เส้นกราฟแท่งเทียบเครดิต — ใช้ทั้งฝั่งแอดมินและฝั่งลูกค้า
function CreditChart({ seasons, showBaseline = true, height = 190 }) {
  const max = Math.max(...seasons.map(s => Math.max(s.baseline, s.estimate, s.verified))) || 1;
  const bar = (v, fill, label) => (
    <span title={label} style={{ flex: 1, height: Math.max(2, (v / max) * height) + "px", background: fill, borderRadius: "4px 4px 0 0", minWidth: "8px" }} />
  );
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-6)", height: height + "px", borderBottom: "1px solid var(--border-default)", paddingBottom: "1px" }}>
        {seasons.map(s => (
          <div key={s.label} style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "3px", height: "100%" }}>
            {showBaseline ? bar(s.baseline, "var(--grey-200)", "กรณีฐาน (BE)") : null}
            {bar(s.estimate, "var(--teal-300)", "ประมาณการ (ER)")}
            {bar(s.verified, "var(--teal-700)", "ทวนสอบแล้ว")}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "var(--space-6)", marginTop: "var(--space-2)" }}>
        {seasons.map(s => <div key={s.label} style={{ flex: 1, fontSize: "10.5px", color: "var(--text-subtle)", textAlign: "center", lineHeight: 1.35 }}>{s.label}</div>)}
      </div>
      <div style={{ display: "flex", gap: "var(--space-5)", marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--text-muted)", flexWrap: "wrap" }}>
        {(showBaseline ? [["var(--grey-200)", "กรณีฐาน BE (tCO₂eq)"]] : []).concat([["var(--teal-300)", "ประมาณการ ER"], ["var(--teal-700)", "ทวนสอบแล้ว"]]).map(([c, l]) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: c }} />{l}</span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, ConsoleShell, PageTitle, Section, PdpaNote, CreditChart });
