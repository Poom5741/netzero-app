/**
 * LIFF Chat App — serves the HTML page + chat API endpoint.
 */

import { Hono } from "hono";
import { extractLiffIdToken, verifyLiffIdToken } from "../auth/liff-jwt";
import { composeBackfillPrompt, validateBackfillEntry } from "../liff/backfill-api";
import { type CalendarStep, handleLiffCalendar } from "../liff/calendar-api";
import { composeContactBody } from "../liff/contact-page";
import { validateDocumentType, validateDocumentUpload } from "../liff/document-upload-validation";
import {
  mapDocTypeToCode,
  REQUIRED_DOCUMENTS,
  validateDocumentSubmission,
} from "../liff/documents-api";
import { resolveFarmerIdentity } from "../liff/identity-resolver";
import { generateObjectKey } from "../liff/r2-key-generator";
import { type RegistrationFormData, validateRegistrationForm } from "../liff/registration-api";
import { buildDocumentsPromptBubble, buildPendingReviewBubble } from "../line/flex-builders";
import { handleFlowApi } from "../line/flow";
import { pushMessage } from "../line/reply";
import { fetchResultsData } from "../line/results-api";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
  ENVIRONMENT: string;
  SECRET: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  LINE_CHANNEL_SECRET: string;
  OPENROUTER_API_KEY: string;
  LIFF_ID?: string;
};

export const liffRoutes = new Hono<{ Bindings: Bindings }>();

/**
 * BUG-017-B2: LIFF screens update D1 but the farmer only sees progress in the
 * chat if we push it. Resolve the farmer's LINE user from line_links and push.
 * Best-effort: a push failure must not fail the LIFF submission.
 */
async function pushToFarmer(
  db: D1Database,
  env: { LINE_CHANNEL_ACCESS_TOKEN?: string },
  farmerId: string,
  messages: Array<Record<string, unknown>>,
): Promise<void> {
  try {
    const link = await db
      .prepare(
        "SELECT line_user_id FROM line_links WHERE farmer_id = ? AND line_user_id IS NOT NULL ORDER BY updated_at DESC LIMIT 1",
      )
      .bind(farmerId)
      .first<{ line_user_id: string | null }>();
    if (!link?.line_user_id || !env.LINE_CHANNEL_ACCESS_TOKEN) return;
    await pushMessage(env.LINE_CHANNEL_ACCESS_TOKEN, link.line_user_id, messages);
  } catch (err) {
    console.error("pushToFarmer failed:", err);
  }
}

// Serve the LIFF chat app HTML
liffRoutes.get("/", (c) => {
  // FINDING-G fix: redirect liff.state deep-link to the right page so
  // `https://liff.line.me/{liffId}/liff/documents?farmer_id=…` reaches
  // the document upload form (instead of the chat interface at /liff/).
  const liffState = c.req.query("liff.state");
  if (liffState && liffState !== "/" && liffState !== "") {
    const queryString = c.req.url.includes("?")
      ? c.req.url.substring(c.req.url.indexOf("?") + 1)
      : "";
    const params = new URLSearchParams(queryString);
    params.delete("liff.state");
    const remaining = params.toString();
    // liff.line.me already passes the path with /liff prefix (because endpoint is
    // `https://...workers.dev/liff`); just redirect to that exact path on this origin.
    const target = liffState + (remaining ? `?${remaining}` : "");
    return c.redirect(target);
  }

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>NetZeroCarbon</title>
  <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
  <style>
    /* Artifact tokens — design-artifacts/2026-09-28/line-oa-farmer.html
       (module c087a24f-4179-4a49-849a-6c05aafd7d3a.js, --line-* block).
       This is the page farmers reach from the bot's deep link, so it is the
       surface that must match the artifact, not the Next.js app. */
    :root{
      --line-green:#06C755;--line-green-dark:#04A344;--line-chat-bg:#8FAAD0;
      --line-chat-ink:#16202C;--line-bubble-me:#A9E86B;--line-bubble-you:#FFFFFF;
      --line-hairline:#EEF2F6;--line-qr-border:#D6DFE9;--line-muted:#94A2B2;
    }
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--line-chat-bg);height:100vh;display:flex;flex-direction:column}
    .header{background:linear-gradient(135deg,var(--line-green) 0%,var(--line-green-dark) 100%);color:#fff;padding:12px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}
    .header-icon{font-size:24px}
    .header-title{font-size:16px;font-weight:600}
    .header-sub{font-size:11px;opacity:.85}
    .chat{flex:1;overflow-y:auto;padding:14px 12px 16px;display:flex;flex-direction:column;gap:11px}
    .msg{max-width:232px;padding:9px 12px;border-radius:13px;font-size:13px;line-height:1.55;word-wrap:break-word;white-space:pre-wrap}
    .msg.bot{align-self:flex-start;background:var(--line-bubble-you);color:var(--line-chat-ink);border-bottom-left-radius:4px;box-shadow:0 1px 1px rgba(0,0,0,.06)}
    .msg.user{align-self:flex-end;background:var(--line-bubble-me);color:var(--line-chat-ink);border-bottom-right-radius:4px;box-shadow:0 1px 1px rgba(0,0,0,.06)}
    .msg.sys{align-self:center;background:rgba(0,0,0,0.22);color:#fff;font-size:11px;padding:3px 12px;border-radius:999px}
    .typing{align-self:flex-start;display:flex;gap:4px;padding:9px 12px;background:var(--line-bubble-you);border-radius:13px;border-bottom-left-radius:4px;box-shadow:0 1px 1px rgba(0,0,0,.06)}
    .typing span{width:8px;height:8px;background:var(--line-muted);border-radius:50%;animation:bounce 1.4s infinite ease-in-out}
    .typing span:nth-child(2){animation-delay:-.16s}
    .typing span:nth-child(3){animation-delay:-.32s}
    @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
    .input-wrap{background:#fff;padding:8px 12px;display:flex;gap:8px;border-top:1px solid var(--line-hairline);flex-shrink:0}
    .input-wrap input{flex:1;border:1px solid var(--line-qr-border);border-radius:999px;padding:6px 12px;font-size:12px;outline:none}
    .input-wrap input:focus{border-color:var(--line-green)}
    .input-wrap button{background:var(--line-green);color:#fff;border:none;border-radius:50%;width:40px;height:40px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center}
    .input-wrap button:disabled{background:var(--line-muted)}
    .quick{display:flex;gap:6px;padding:8px 12px;overflow-x:auto;flex-shrink:0}
    .quick button{white-space:nowrap;background:#fff;border:1px solid var(--line-qr-border);color:var(--line-green-dark);border-radius:999px;padding:6px 13px;font-size:12px;font-weight:600;cursor:pointer}
    .quick button:active{background:var(--line-chat-ink)}
    #loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:12px}
    #loading .spin{width:40px;height:40px;border:3px solid var(--line-hairline);border-top-color:var(--line-green);border-radius:50%;animation:sp .8s linear infinite}
    @keyframes sp{to{transform:rotate(360deg)}}
  </style>
</head>
<body>
  <div id="loading"><div class="spin"></div><div>กำลังเชื่อมต่อ...</div></div>
  <div id="app" style="display:none;flex-direction:column;height:100vh;">
    <div class="header">
      <div class="header-icon">🌱</div>
      <div><div class="header-title">NetZeroCarbon</div><div class="header-sub">ผู้ช่วยเกษตรกรโครงการ AWD</div></div>
    </div>
    <div class="chat" id="chat"></div>
    <div class="quick" id="quickActions">
      <button onclick="sendQ('สวัสดี')">👋 สวัสดี</button>
      <button onclick="sendQ('ช่วย')">❓ ช่วย</button>
      <button onclick="sendQ('ถ่ายรูป')">📸 ถ่ายรูป</button>
      <button onclick="sendQ('เลือกแปลง')">🌾 เลือกแปลง</button>
    </div>
    <div class="input-wrap">
      <input type="text" id="inp" placeholder="พิมพ์ข้อความ..." autocomplete="off">
      <button id="btn" onclick="send()">➤</button>
    </div>
  </div>
  <script>
    let uid=null;
    async function init(){
      try{
        const liffId="${c.env.LIFF_ID || ""}";
        if(liffId){await liff.init({liffId});const profile=await liff.getProfile();uid=profile.userId}
        else{uid='demo'}
      }catch(e){uid='demo'}
      document.getElementById('loading').style.display='none';
      document.getElementById('app').style.display='flex';
      add('bot','🌱 สวัสดีค่ะ! ยินดีต้อนรับสู่ NetZeroCarbon\\n\\nพิมพ์ข้อความหรือกดปุ่มด้านล่างเพื่อเริ่มต้นค่ะ');
    }
    async function send(){
      const inp=document.getElementById('inp');
      const t=inp.value.trim();if(!t)return;
      inp.value='';document.getElementById('btn').disabled=true;
      add('user',t);showTyping();
      try{
        const r=await fetch('/liff/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:t,userId:uid})});
        const d=await r.json();hideTyping();
        add('bot',d.reply||d.error||'ไม่สามารถประมวลผลได้');
      }catch(e){hideTyping();add('sys','เกิดข้อผิดพลาด กรุณาลองใหม่')}
      document.getElementById('btn').disabled=false;inp.focus();
    }
    function sendQ(t){document.getElementById('inp').value=t;send()}
    function add(type,text){const c=document.getElementById('chat'),d=document.createElement('div');d.className='msg '+type;d.textContent=text;c.appendChild(d);c.scrollTop=c.scrollHeight}
    function showTyping(){const c=document.getElementById('chat'),d=document.createElement('div');d.className='typing';d.id='typing';const s1=document.createElement('span'),s2=document.createElement('span'),s3=document.createElement('span');d.appendChild(s1);d.appendChild(s2);d.appendChild(s3);c.appendChild(d);c.scrollTop=c.scrollHeight}
    function hideTyping(){const e=document.getElementById('typing');if(e)e.remove()}
    document.addEventListener('DOMContentLoaded',()=>{document.getElementById('inp').addEventListener('keypress',e=>{if(e.key==='Enter')send()});init()});
  </script>
</body>
</html>`;
  return c.html(html);
});

// Registration form — LIFF deep-link target for /register
export function renderRegistrationForm(liffId: string): string {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>สมัครเข้าร่วมโครงการ</title>
  <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F2F2F2;min-height:100vh}
    .header{background:linear-gradient(135deg,#06C755 0%,#04A344 100%);color:#fff;padding:16px;text-align:center}
    .header h1{font-size:18px;font-weight:600;margin-bottom:4px}
    .header p{font-size:13px;opacity:.9}
    .form-wrap{max-width:500px;margin:0 auto;padding:16px}
    .card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.08);margin-bottom:16px}
    .card h2{font-size:15px;color:#333;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #06c755}
    .field{margin-bottom:14px}
    .field label{display:block;font-size:13px;color:#555;margin-bottom:6px;font-weight:500}
    .field input,.field select{width:100%;padding:10px 12px;border:1px solid #D6DFE9;border-radius:8px;font-size:14px;outline:none;transition:border .2s}
    .field input:focus,.field select:focus{border-color:#06c755}
    .field .hint{font-size:11px;color:#888;margin-top:4px}
    .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .btn{width:100%;padding:14px;background:#06c755;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;margin-top:8px}
    .btn:disabled{background:#ccc}
    .btn:active{background:#05b34c}
    .success{background:#E7FCF7;border:1px solid #0AA8A3;border-radius:8px;padding:16px;text-align:center;margin-bottom:16px}
    .success h3{color:#06c755;margin-bottom:8px}
    .error{background:#FDEBEB;border:1px solid #C8464F;border-radius:8px;padding:12px;margin-bottom:16px;color:#C8464F;font-size:13px}
    #loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:12px}
    #loading .spin{width:40px;height:40px;border:3px solid #EEF2F6;border-top-color:#06c755;border-radius:50%;animation:sp .8s linear infinite}
    @keyframes sp{to{transform:rotate(360deg)}}
  </style>
</head>
<body>
  <div id="loading"><div class="spin"></div><div>กำลังโหลด...</div></div>
  <div id="app" style="display:none">
    <div class="header">
      <h1>🌱 สมัครเข้าร่วมโครงการ</h1>
      <p>NetZeroCarbon — โครงการข้าวรักษ์โลก AWD</p>
    </div>
    <div class="form-wrap">
      <div id="errorBox" class="error" style="display:none"></div>
      <form id="regForm">
        <div class="card">
          <h2>ข้อมูลส่วนตัว</h2>
          <div class="field">
            <label for="full_name">ชื่อ-นามสกุล *</label>
            <input type="text" id="full_name" name="full_name" required>
          </div>
          <div class="row">
            <div class="field">
              <label for="gender">เพศ *</label>
              <select id="gender" name="gender" required>
                <option value="">-- เลือก --</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
            <div class="field">
              <label for="phone">เบอร์โทรศัพท์ *</label>
              <input type="tel" id="phone" name="phone" required pattern="[0-9]{9,10}" placeholder="0812345678">
            </div>
          </div>
          <div class="field">
            <label for="national_id">เลขบัตรประชาชน *</label>
            <input type="text" id="national_id" name="national_id" required pattern="[0-9]{13}" placeholder="1234567890123" maxlength="13">
          </div>
        </div>
        <div class="card">
          <h2>ที่อยู่</h2>
          <div class="row">
            <div class="field">
              <label for="addr_province">จังหวัด *</label>
              <input type="text" id="addr_province" name="addr_province" required>
            </div>
            <div class="field">
              <label for="addr_district">อำเภอ *</label>
              <input type="text" id="addr_district" name="addr_district" required>
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label for="addr_subdistrict">ตำบล *</label>
              <input type="text" id="addr_subdistrict" name="addr_subdistrict" required>
            </div>
            <div class="field">
              <label for="addr_village">หมู่บ้าน *</label>
              <input type="text" id="addr_village" name="addr_village" required>
            </div>
          </div>
        </div>
        <div class="card">
          <h2>ข้อมูลที่ดิน</h2>
          <div class="row">
            <div class="field">
              <label for="deed_no">เลขที่โฉนด *</label>
              <input type="text" id="deed_no" name="deed_no" required>
            </div>
            <div class="field">
              <label for="deed_type">ประเภทโฉนด *</label>
              <select id="deed_type" name="deed_type" required>
                <option value="">-- เลือก --</option>
                <option value="chanote">โฉนดที่ดิน (น.ส. 4)</option>
                <option value="ns3k">น.ส. 3 ก</option>
                <option value="spk">ส.ป.ก.</option>
                <option value="rental">เช่า</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="holding_status">สถานะการถือครอง *</label>
            <select id="holding_status" name="holding_status" required>
              <option value="">-- เลือก --</option>
              <option value="owner">เจ้าของ</option>
              <option value="tenant">ผู้เช่า</option>
              <option value="proxy">ตัวแทน</option>
              <option value="renter">ผู้เช่า</option>
            </select>
          </div>
          <div class="field">
            <label for="area_rai">พื้นที่ (ไร่) *</label>
            <input type="number" id="area_rai" name="area_rai" required step="0.01" min="0" placeholder="0.00">
          </div>
        </div>
        <button type="submit" class="btn" id="submitBtn">ส่งข้อมูลสมัคร</button>
      </form>
    </div>
  </div>
  <script>
    let farmerId = null;
    async function init() {
      try {
        const liffId = "${liffId}";
        if (liffId) {
          await liff.init({ liffId });
          const profile = await liff.getProfile();
          // Try to resolve farmer from LINE userId
          const res = await fetch('/liff/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: '__resolve_farmer__', userId: profile.userId })
          });
          const data = await res.json();
          if (data.farmerId) farmerId = data.farmerId;
        }
      } catch (e) {
        console.error('LIFF init error:', e);
      }
      document.getElementById('loading').style.display = 'none';
      document.getElementById('app').style.display = 'block';
    }
    document.getElementById('regForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      const errBox = document.getElementById('errorBox');
      btn.disabled = true;
      btn.textContent = 'กำลังส่งข้อมูล...';
      errBox.style.display = 'none';
      const form = e.target;
      const data = {
        full_name: form.full_name.value.trim(),
        gender: form.gender.value,
        phone: form.phone.value.trim(),
        national_id: form.national_id.value.trim(),
        addr_province: form.addr_province.value.trim(),
        addr_district: form.addr_district.value.trim(),
        addr_subdistrict: form.addr_subdistrict.value.trim(),
        addr_village: form.addr_village.value.trim(),
        deed_no: form.deed_no.value.trim(),
        deed_type: form.deed_type.value,
        holding_status: form.holding_status.value,
        area_rai: parseFloat(form.area_rai.value),
        centroid_lat: 0,
        centroid_lng: 0
      };
      if (farmerId) data.farmer_id = farmerId;
      try {
        const res = await fetch('/liff/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok) {
          form.innerHTML = '<div class="success"><h3>✅ สมัครสำเร็จ!</h3><p>ขอบคุณที่เข้าร่วมโครงการ NetZeroCarbon</p><p style="margin-top:12px;font-size:13px;color:#666">คุณสามารถเริ่มถ่ายภาพแปลงนาได้ทันที</p></div>';
          document.querySelector('.form-wrap').insertBefore(form, document.querySelector('.form-wrap').firstChild);
          document.querySelectorAll('.card').forEach(c => c.remove());
          btn.remove();
        } else {
          errBox.textContent = result.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
          errBox.style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'ส่งข้อมูลสมัคร';
        }
      } catch (err) {
        errBox.textContent = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
        errBox.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'ส่งข้อมูลสมัคร';
      }
    });
    document.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>`;
}

liffRoutes.get("/register", (c) => {
  return c.html(renderRegistrationForm(c.env.LIFF_ID || ""));
});

// Camera page — opens device camera for photo evidence
liffRoutes.get("/camera", (c) => {
  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>ถ่ายรูป — NetZeroCarbon</title>
  <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F2F2F2;height:100vh;display:flex;flex-direction:column}
    .header{background:linear-gradient(135deg,#06C755 0%,#04A344 100%);color:#fff;padding:12px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}
    .header-icon{font-size:24px}
    .header-title{font-size:16px;font-weight:600}
    .header-sub{font-size:11px;opacity:.85}
    .camera-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;gap:12px}
    video{width:100%;max-width:400px;border-radius:16px;background:#000;object-fit:cover}
    canvas{display:none}
    .btn-row{display:flex;gap:12px}
    .btn{padding:14px 28px;border:none;border-radius:24px;font-size:16px;font-weight:600;cursor:pointer}
    .btn-primary{background:#06c755;color:#fff}
    .btn-secondary{background:#fff;color:#333;border:1px solid #D6DFE9}
    .preview{width:100%;max-width:400px;border-radius:16px;margin-top:8px}
    .status{font-size:14px;color:#666;text-align:center}
    #loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:12px}
    #loading .spin{width:40px;height:40px;border:3px solid #EEF2F6;border-top-color:#06c755;border-radius:50%;animation:sp .8s linear infinite}
    @keyframes sp{to{transform:rotate(360deg)}}
  </style>
</head>
<body>
  <div id="loading"><div class="spin"></div><div>กำลังเชื่อมต่อ...</div></div>
  <div id="app" style="display:none;flex-direction:column;height:100vh;">
    <div class="header">
      <div class="header-icon">📸</div>
      <div><div class="header-title">ถ่ายรูปหลักฐาน</div><div class="header-sub">NetZeroCarbon</div></div>
    </div>
    <div class="camera-wrap">
      <video id="video" autoplay playsinline></video>
      <canvas id="canvas"></canvas>
      <img id="preview" class="preview" style="display:none">
      <input type="file" id="fileInput" accept="image/*" style="display:none">
      <div class="btn-row">
        <button class="btn btn-primary" id="captureBtn">📷 ถ่ายรูป</button>
        <button class="btn btn-secondary" id="uploadBtn">📁 อัพโหลดรูป</button>
        <button class="btn btn-secondary" id="retakeBtn" style="display:none">🔄 ถ่ายใหม่</button>
        <button class="btn btn-primary" id="sendBtn" style="display:none">✅ ส่งรูป</button>
      </div>
      <div class="status" id="status">กำลังเปิดกล้อง...</div>
    </div>
  </div>
  <script>
    let stream=null, capturedBlob=null;
    const video=document.getElementById('video');
    const canvas=document.getElementById('canvas');
    const preview=document.getElementById('preview');
    const captureBtn=document.getElementById('captureBtn');
    const uploadBtn=document.getElementById('uploadBtn');
    const fileInput=document.getElementById('fileInput');
    const retakeBtn=document.getElementById('retakeBtn');
    const sendBtn=document.getElementById('sendBtn');
    const status=document.getElementById('status');

    async function init(){
      try{
        const liffId="${c.env.LIFF_ID || ""}";
        if(liffId){await liff.init({liffId})}
      }catch(e){}
      document.getElementById('loading').style.display='none';
      document.getElementById('app').style.display='flex';
      try{
        stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});
        video.srcObject=stream;
        status.textContent='พร้อมถ่ายรูป — ชี้กล้องไปที่ท่อ PVC แล้วกดถ่ายรูป';
      }catch(e){
        status.textContent='ไม่สามารถเปิดกล้องได้ — ใช้อัพโหลดรูปแทน';
        captureBtn.style.display='none';
      }
    }

    captureBtn.onclick=()=>{
      if(!stream) return;
      canvas.width=video.videoWidth;
      canvas.height=video.videoHeight;
      canvas.getContext('2d').drawImage(video,0,0);
      canvas.toBlob(blob=>{
        capturedBlob=blob;
        preview.src=URL.createObjectURL(blob);
        preview.style.display='block';
        video.style.display='none';
        captureBtn.style.display='none';
        uploadBtn.style.display='none';
        retakeBtn.style.display='inline-block';
        sendBtn.style.display='inline-block';
        status.textContent='ถ่ายรูปแล้ว — กดส่งรูปเพื่อบันทึก';
      },'image/jpeg',0.9);
    };

    uploadBtn.onclick=()=>fileInput.click();
    fileInput.onchange=(e)=>{
      const file=e.target.files[0];
      if(!file) return;
      capturedBlob=file;
      preview.src=URL.createObjectURL(file);
      preview.style.display='block';
      video.style.display='none';
      captureBtn.style.display='none';
      uploadBtn.style.display='none';
      retakeBtn.style.display='inline-block';
      sendBtn.style.display='inline-block';
      status.textContent='เลือกรูปแล้ว — กดส่งรูปเพื่อบันทึก';
    };

    retakeBtn.onclick=()=>{
      preview.style.display='none';
      video.style.display='block';
      captureBtn.style.display=stream?'inline-block':'none';
      uploadBtn.style.display='inline-block';
      retakeBtn.style.display='none';
      sendBtn.style.display='none';
      capturedBlob=null;
      fileInput.value='';
      status.textContent=stream?'พร้อมถ่ายรูป — ชี้กล้องไปที่ท่อ PVC แล้วกดถ่ายรูป':'ไม่สามารถเปิดกล้องได้ — ใช้อัพโหลดรูปแทน';
    };

    sendBtn.onclick=async()=>{
      if(!capturedBlob) return;
      status.textContent='กำลังส่งรูป...';
      sendBtn.disabled=true;
      try{
        const plotId="${c.req.query("plot_id") || "plot-001"}";
        const seasonId="${c.req.query("season_id") || "2568-napi"}";
        const stepCode="${c.req.query("step") || "SG-04"}";

        const fd=new FormData();
        fd.append('photo',capturedBlob,'photo.jpg');
        fd.append('plot_id',plotId);
        fd.append('season_id',seasonId);
        fd.append('gps_lat','0');
        fd.append('gps_lng','0');
        fd.append('photo_type',stepCode==='SG-01'?'prepare':stepCode==='SG-09'?'harvest':'wetdry');
        fd.append('step_code',stepCode);
        fd.append('taken_at',new Date().toISOString());
        const r=await fetch('/api/photo/upload',{method:'POST',body:fd});
        const d=await r.json();
        if(d.id||d.ok){
          status.textContent='✅ ส่งรูปเรียบร้อยแล้ว!';
          sendBtn.style.display='none';
          retakeBtn.style.display='none';
        }else{
          status.textContent='❌ '+ (d.error||'ส่งรูปไม่สำเร็จ');
          sendBtn.disabled=false;
        }
      }catch(e){
        status.textContent=' เกิดข้อผิดพลาด';
        sendBtn.disabled=false;
      }
    };

    document.addEventListener('DOMContentLoaded',init);
  </script>
</body>
</html>`;
  return c.html(html);
});

// Chat API endpoint
liffRoutes.post("/api/chat", async (c) => {
  try {
    const db = c.env.DB;
    const token = c.env.LINE_CHANNEL_ACCESS_TOKEN;
    const apiKey = c.env.OPENROUTER_API_KEY;

    const body = await c.req.json<{ text: string; userId: string; farmer_id?: string }>();
    const { text, userId } = body;

    if (!text || !userId) {
      return c.json({ error: "text and userId required" }, 400);
    }

    // Resolve farmer: explicit farmer_id wins, else first registered farmer.
    // No hardcoded farmer-001 — chat must work with whatever real farmers exist.
    const requestedFarmerId = typeof body.farmer_id === "string" ? body.farmer_id : undefined;
    let farmerId = requestedFarmerId;
    if (!farmerId) {
      const fallback = await db
        .prepare("SELECT id FROM farmers ORDER BY id LIMIT 1")
        .first<{ id: string }>();
      farmerId = fallback?.id;
    }
    if (!farmerId) {
      return c.json({ error: "No registered farmer found" }, 400);
    }

    // Get or create link — INSERT OR IGNORE prevents race condition on concurrent requests
    const linkId = `link_${crypto.randomUUID()}`;
    await db
      .prepare(
        "INSERT OR IGNORE INTO line_links (id, farmer_id, line_user_id, status, conversation_state) VALUES (?, ?, ?, 'pending', 'welcome')",
      )
      .bind(linkId, farmerId, userId)
      .run();

    const link = await db
      .prepare(
        "SELECT id, farmer_id, status, conversation_state, selected_plot_id FROM line_links WHERE line_user_id = ?",
      )
      .bind(userId)
      .first<{
        id: string;
        farmer_id: string;
        status: string;
        conversation_state: string;
        selected_plot_id: string | null;
      }>();

    if (!link) {
      return c.json({ error: "Failed to create link" }, 500);
    }

    // Special case: return context for camera upload
    if (text === "__context__") {
      const plot = await db
        .prepare("SELECT id FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1")
        .bind(link.farmer_id)
        .first<{ id: string }>();
      const season = await db
        .prepare(
          "SELECT season_id FROM season_inputs WHERE plot_id = ? ORDER BY created_at DESC LIMIT 1",
        )
        .bind(plot?.id)
        .first<{ season_id: string }>();
      return c.json({
        plot_id: plot?.id || "plot-001",
        season_id: season?.season_id || "2568-napi",
        farmer_id: link.farmer_id,
      });
    }

    // Handle via state machine (API mode — returns reply text)
    const result = await handleFlowApi({
      db,
      token,
      apiKey,
      userId,
      linkId: link.id,
      farmerId: link.farmer_id,
      state: link.conversation_state as any,
      selectedPlotId: link.selected_plot_id,
      text,
    });

    // Update state
    await db
      .prepare(
        "UPDATE line_links SET conversation_state = ?, selected_plot_id = COALESCE(?, selected_plot_id) WHERE id = ?",
      )
      .bind(result.newState, result.selectedPlotId ?? null, link.id)
      .run();

    return c.json({ reply: result.reply, state: result.newState });
  } catch (err) {
    console.error("Chat API error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Registration form API (LF-01)
// ---------------------------------------------------------------------------

liffRoutes.post("/api/register", async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json<RegistrationFormData & { farmer_id?: string }>();
    const { farmer_id, ...formData } = body;

    // Validate required fields
    const validation = validateRegistrationForm(formData);
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400);
    }

    // Resolve farmer_id: explicit wins, else from link
    let resolvedFarmerId = farmer_id;
    if (!resolvedFarmerId) {
      // Try to find farmer by phone
      const farmer = await db
        .prepare("SELECT id FROM farmers WHERE phone = ?")
        .bind(formData.phone)
        .first<{ id: string }>();
      resolvedFarmerId = farmer?.id;
    }

    if (!resolvedFarmerId) {
      return c.json({ error: "No farmer found for this phone number" }, 404);
    }

    // Update farmer record with registration data
    await db
      .prepare(
        `UPDATE farmers SET
          full_name = COALESCE(NULLIF(?, ''), full_name),
          gender = COALESCE(NULLIF(?, ''), gender),
          addr_province = COALESCE(NULLIF(?, ''), addr_province),
          addr_district = COALESCE(NULLIF(?, ''), addr_district),
          addr_subdistrict = COALESCE(NULLIF(?, ''), addr_subdistrict),
          addr_village = COALESCE(NULLIF(?, ''), addr_village),
          national_id_enc = COALESCE(NULLIF(?, ''), national_id_enc),
          updated_at = datetime('now')
        WHERE id = ?`,
      )
      .bind(
        formData.full_name,
        formData.gender,
        formData.addr_province,
        formData.addr_district,
        formData.addr_subdistrict,
        formData.addr_village,
        formData.national_id,
        resolvedFarmerId,
      )
      .run();

    // Create or update plot with deed info
    const existingPlot = await db
      .prepare("SELECT id FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1")
      .bind(resolvedFarmerId)
      .first<{ id: string }>();

    if (existingPlot) {
      await db
        .prepare(
          `UPDATE plots SET
            deed_no = COALESCE(NULLIF(?, ''), deed_no),
            doc_type = COALESCE(NULLIF(?, ''), doc_type),
            tenure = COALESCE(NULLIF(?, ''), tenure),
            area_rai = COALESCE(NULLIF(?, 0), area_rai),
            centroid_lat = COALESCE(NULLIF(?, 0), centroid_lat),
            centroid_lng = COALESCE(NULLIF(?, 0), centroid_lng),
            updated_at = datetime('now')
          WHERE id = ?`,
        )
        .bind(
          formData.deed_no,
          formData.deed_type,
          formData.holding_status,
          formData.area_rai,
          formData.centroid_lat,
          formData.centroid_lng,
          existingPlot.id,
        )
        .run();
    } else {
      // Create new plot
      const plotId = `plot_${crypto.randomUUID()}`;
      await db
        .prepare(
          `INSERT INTO plots (id, farmer_id, plot_code, deed_no, doc_type, tenure, area_rai, centroid_lat, centroid_lng)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          plotId,
          resolvedFarmerId,
          `SPB-${String(Date.now()).slice(-4)}`,
          formData.deed_no,
          formData.deed_type,
          formData.holding_status,
          formData.area_rai,
          formData.centroid_lat,
          formData.centroid_lng,
        )
        .run();
    }

    // Update conversation state to "documents" after successful registration
    const link = await db
      .prepare("SELECT id FROM line_links WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1")
      .bind(resolvedFarmerId)
      .first<{ id: string }>();

    if (link) {
      await db
        .prepare("UPDATE line_links SET conversation_state = 'documents' WHERE id = ?")
        .bind(link.id)
        .run();
    }

    // BUG-017-B2: tell the farmer in the chat (OB-13) — the state flip alone is
    // invisible to them.
    const documentsUrl = c.env.LIFF_ID
      ? `https://liff.line.me/${c.env.LIFF_ID}/liff/documents?farmer_id=${encodeURIComponent(resolvedFarmerId)}`
      : `${c.env.APP_URL}/liff/documents?farmer_id=${encodeURIComponent(resolvedFarmerId)}`;
    await pushToFarmer(db, c.env, resolvedFarmerId, [
      buildDocumentsPromptBubble(documentsUrl),
      { type: "text", text: 'พิมพ์ "อัปโหลด" เมื่ออัปโหลดเอกสารครบแล้วครับ' },
    ]);

    return c.json({ ok: true, farmer_id: resolvedFarmerId });
  } catch (err) {
    console.error("Registration API error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Document upload API (OB-13)
// ---------------------------------------------------------------------------

liffRoutes.get("/api/documents/:farmerId", async (c) => {
  try {
    const db = c.env.DB;
    const farmerId = c.req.param("farmerId");

    const docs = await db
      .prepare(
        "SELECT id, doc_type, submitted_at, review_status FROM application_documents WHERE farmer_id = ?",
      )
      .bind(farmerId)
      .all<{ id: string; doc_type: string; submitted_at: string; review_status: string }>();

    const required = REQUIRED_DOCUMENTS.filter((d) => d.required);
    const submittedTypes = docs.results.map((d) => d.doc_type);
    const allRequiredAttached = required.every((d) => submittedTypes.includes(d.code));

    return c.json({
      documents: docs.results,
      required: REQUIRED_DOCUMENTS,
      allRequiredAttached,
    });
  } catch (err) {
    console.error("Documents API error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

liffRoutes.post("/api/documents/submit", async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json<{
      farmer_id: string;
      doc_type: string;
      r2_key: string;
    }>();

    const validation = validateDocumentSubmission({
      plot_id: body.farmer_id, // farmer_id used as context
      doc_type: body.doc_type,
    });

    if (!validation.valid) {
      return c.json({ error: validation.error }, 400);
    }

    // Map doc_type string to DOC code
    const docCodeMap: Record<string, string> = {
      chanote: "DOC-01",
      id_copy: "DOC-03",
      power_of_attorney: "DOC-06",
    };

    const docCode = docCodeMap[body.doc_type] || body.doc_type;

    // Upsert document record
    const docId = `doc_${crypto.randomUUID()}`;
    await db
      .prepare(
        `INSERT INTO application_documents (id, farmer_id, doc_type, r2_key, submitted_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT(farmer_id, doc_type)
         DO UPDATE SET r2_key = excluded.r2_key, submitted_at = datetime('now'), review_status = 'pending'`,
      )
      .bind(docId, body.farmer_id, docCode, body.r2_key)
      .run();

    // Check if all required docs are now attached
    const docs = await db
      .prepare("SELECT doc_type FROM application_documents WHERE farmer_id = ?")
      .bind(body.farmer_id)
      .all<{ doc_type: string }>();

    const submittedTypes = docs.results.map((d) => d.doc_type);
    const required = REQUIRED_DOCUMENTS.filter((d) => d.required);
    const allRequiredAttached = required.every((d) => submittedTypes.includes(d.code));

    if (allRequiredAttached) {
      // BUG-017-B2: all required documents are in — move to pending_review and
      // show the OB-10 grey card (same as the typed "อัปโหลด" path).
      await db
        .prepare("UPDATE line_links SET conversation_state = 'pending_review' WHERE farmer_id = ?")
        .bind(body.farmer_id)
        .run();
      const baselineUrl = c.env.LIFF_ID
        ? `https://liff.line.me/${c.env.LIFF_ID}/liff/baseline?plot_id=`
        : `${c.env.APP_URL}/liff/baseline?plot_id=`;
      await pushToFarmer(db, c.env, body.farmer_id, [
        { type: "text", text: "✅ ได้รับเอกสารแล้วครับ" },
        buildPendingReviewBubble(baselineUrl),
      ]);
    }

    return c.json({
      ok: true,
      doc_type: docCode,
      allRequiredAttached,
    });
  } catch (err) {
    console.error("Document submit API error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Document file upload API (real file upload with R2 persistence)
// ---------------------------------------------------------------------------

liffRoutes.post("/api/documents/upload", async (c) => {
  try {
    const db = c.env.DB;
    const r2 = c.env.R2;

    // FINDING-D fix: authenticate the request via the LIFF idToken (JWT).
    // The form-field farmer_id is no longer trusted — the farmer is
    // resolved server-side from the verified JWT.
    //
    // Authentication runs before any body parsing: an unauthenticated or
    // malformed request must fail with 401, not surface as a 500 from the
    // catch block when `formData()` rejects a non-multipart body.
    //
    // FINDING-H dev bypass: if ENVIRONMENT=development, accept
    // `X-Dev-Line-User-Id: <line_user_id>` header instead of JWT. This lets
    // QA / walk-through tests bypass the LIFF in-app browser requirement
    // for the parts of the flow that don't depend on JWT validation itself.
    // The header is rejected if ENVIRONMENT is anything else.
    const isDev = c.env.ENVIRONMENT === "development";
    const devLineUserId = isDev ? c.req.raw.headers.get("X-Dev-Line-User-Id") : null;
    let lineUserId: string | undefined;
    let formData: FormData;

    if (devLineUserId) {
      lineUserId = devLineUserId.trim();
      formData = await c.req.formData();
    } else {
      // Peek at the headers only; the body is parsed once the caller is
      // known to be authenticated.
      const rawContentType = c.req.raw.headers.get("Content-Type") ?? "";
      const hasFormBody = rawContentType.includes("multipart/form-data");
      const idToken = hasFormBody
        ? extractLiffIdToken(c.req.raw.headers, await c.req.formData())
        : extractLiffIdToken(c.req.raw.headers, null);
      if (!idToken) {
        return c.json({ error: "ต้องระบุ LIFF access token" }, 401);
      }
      const verifyResult = await verifyLiffIdToken(idToken, c.env.LIFF_ID);
      if (!verifyResult.ok || !verifyResult.lineUserId) {
        return c.json({ error: verifyResult.error || "LIFF access token ไม่ถูกต้อง" }, 401);
      }
      lineUserId = verifyResult.lineUserId;
      formData = hasFormBody ? await c.req.formData() : new FormData();
    }

    const file = formData.get("file") as File | null;
    const docType = formData.get("doc_type") as string | null;
    const farmerIdParam = formData.get("farmer_id") as string | null;

    // Resolve farmer from authenticated LINE user. We ignore the form-field
    // farmer_id except for the ownership check below — server-side
    // resolution prevents the client from spoofing farmer_id.
    const identityResult = await resolveFarmerIdentity(db, lineUserId, null);
    if (!identityResult.success || !identityResult.farmerId) {
      return c.json({ error: identityResult.error || "ไม่พบข้อมูลเกษตรกร" }, 401);
    }
    const farmerId = identityResult.farmerId;

    // If the form-field farmer_id was supplied, it must match the JWT-derived
    // farmer. Reject mismatches to defend against a compromised LIFF SDK
    // (or a non-LIFF client that obtained a valid token for farmer A but
    // is trying to upload against farmer B).
    if (farmerIdParam && farmerIdParam !== farmerId) {
      return c.json({ error: "farmer_id ไม่ตรงกับบัญชีที่ลงชื่อเข้าใช้" }, 403);
    }

    // Validate document type
    const docTypeValidation = validateDocumentType(docType);
    if (!docTypeValidation.valid) {
      return c.json({ error: docTypeValidation.error }, 400);
    }

    // Validate file
    const fileValidation = validateDocumentUpload(file);
    if (!fileValidation.valid || !file) {
      return c.json({ error: fileValidation.error }, 400);
    }

    // Map doc_type to DOC code
    const docCode = mapDocTypeToCode(docType!);

    // Generate safe R2 object key
    const r2Key = generateObjectKey(farmerId, docCode, file.name);

    // Upload to R2
    try {
      await r2.put(r2Key, file.stream(), {
        httpMetadata: {
          contentType: file.type,
        },
      });
    } catch (r2Err) {
      console.error("R2 upload error:", r2Err);
      return c.json({ error: "ไม่สามารถอัปโหลดไฟล์ได้" }, 500);
    }

    // Upsert document record in database
    const docId = `doc_${crypto.randomUUID()}`;
    try {
      await db
        .prepare(
          `INSERT INTO application_documents (id, farmer_id, doc_type, r2_key, submitted_at, review_status)
           VALUES (?, ?, ?, ?, datetime('now'), 'pending')
           ON CONFLICT(farmer_id, doc_type)
           DO UPDATE SET r2_key = excluded.r2_key, submitted_at = datetime('now'), review_status = 'pending'`,
        )
        .bind(docId, farmerId, docCode, r2Key)
        .run();
    } catch (dbErr) {
      console.error("Database error:", dbErr);
      return c.json({ error: "ไม่สามารถบันทึกข้อมูลได้" }, 500);
    }

    // Calculate document count and check if all required documents attached
    const docs = await db
      .prepare("SELECT doc_type FROM application_documents WHERE farmer_id = ?")
      .bind(farmerId)
      .all<{ doc_type: string }>();

    const submittedTypes = docs.results.map((d) => d.doc_type);
    const required = REQUIRED_DOCUMENTS.filter((d) => d.required);
    const allRequiredAttached = required.every((d) => submittedTypes.includes(d.code));

    if (allRequiredAttached) {
      // BUG-017-B2: all required documents are in — move to pending_review and
      // show the OB-10 grey card (same as the typed "อัปโหลด" path).
      await db
        .prepare("UPDATE line_links SET conversation_state = 'pending_review' WHERE farmer_id = ?")
        .bind(farmerId)
        .run();
      const baselineUploadUrl = c.env.LIFF_ID
        ? `https://liff.line.me/${c.env.LIFF_ID}/liff/baseline?plot_id=`
        : `${c.env.APP_URL}/liff/baseline?plot_id=`;
      await pushToFarmer(db, c.env, farmerId, [
        { type: "text", text: "✅ ได้รับเอกสารแล้วครับ" },
        buildPendingReviewBubble(baselineUploadUrl),
      ]);
    }

    return c.json({
      ok: true,
      doc_type: docCode,
      r2_key: r2Key,
      document_count: docs.results.length,
      all_required_attached: allRequiredAttached,
    });
  } catch (err) {
    console.error("Document upload error:", err);
    return c.json({ error: "ไม่สามารถอัปโหลดไฟล์ได้" }, 500);
  }
});

// ---------------------------------------------------------------------------
// LIFF Document Upload Form
// ---------------------------------------------------------------------------

liffRoutes.get("/documents", (c) => {
  const farmerId = c.req.query("farmer_id") || "";
  const liffId = c.env.LIFF_ID || "";

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>อัปโหลดเอกสาร — NetZeroCarbon</title>
  <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F2F2F2;min-height:100vh}
    .header{background:linear-gradient(135deg,#06C755 0%,#04A344 100%);color:#fff;padding:16px;text-align:center}
    .header h1{font-size:18px;font-weight:600;margin-bottom:4px}
    .header p{font-size:13px;opacity:.9}
    .form-wrap{max-width:500px;margin:0 auto;padding:16px}
    .card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.08);margin-bottom:16px}
    .card h2{font-size:15px;color:#333;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #06c755}
    .field{margin-bottom:14px}
    .field label{display:block;font-size:13px;color:#555;margin-bottom:6px;font-weight:500}
    .field input[type="file"]{width:100%;padding:10px 12px;border:1px solid #D6DFE9;border-radius:8px;font-size:14px;outline:none}
    .field .hint{font-size:11px;color:#888;margin-top:4px}
    .field .status{font-size:12px;color:#06c755;margin-top:4px;font-weight:500}
    .btn{width:100%;padding:14px;background:#06c755;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;margin-top:8px}
    .btn:disabled{background:#ccc}
    .btn:active{background:#05b34c}
    .success{background:#E7FCF7;border:1px solid #0AA8A3;border-radius:8px;padding:16px;text-align:center;margin-bottom:16px}
    .success h3{color:#06c755;margin-bottom:8px}
    .error{background:#FDEBEB;border:1px solid #C8464F;border-radius:8px;padding:12px;margin-bottom:16px;color:#C8464F;font-size:13px}
    #loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:12px}
    #loading .spin{width:40px;height:40px;border:3px solid #EEF2F6;border-top-color:#06c755;border-radius:50%;animation:sp .8s linear infinite}
    @keyframes sp{to{transform:rotate(360deg)}}
  </style>
</head>
<body>
  <div id="loading"><div class="spin"></div><div>กำลังโหลด...</div></div>
  <div id="app" style="display:none">
    <div class="header">
      <h1>📄 อัปโหลดเอกสารสิทธิ์</h1>
      <p>NetZeroCarbon — โครงการข้าวรักษ์โลก AWD</p>
    </div>
    <div class="form-wrap">
      <div id="errorBox" class="error" style="display:none"></div>
      <div id="successBox" class="success" style="display:none">
        <h3>✅ อัปโหลดสำเร็จ!</h3>
        <p>ขอบคุณที่อัปโหลดเอกสาร</p>
      </div>
      <form id="uploadForm">
        <div class="card">
          <h2>เอกสารสิทธิ์ (อัปโหลดทีละไฟล์)</h2>
          <div class="field">
            <label for="chanote">DOC-01: โฉนดที่ดิน *</label>
            <input type="file" id="chanote" name="chanote" accept=".pdf,.jpg,.jpeg,.png" data-doc-type="chanote">
            <div class="hint">รองรับ PDF, JPEG, PNG (ไม่เกิน 10MB)</div>
            <div class="status" id="chanote-status"></div>
          </div>
          <div class="field">
            <label for="id_copy">DOC-03: สำเนาบัตรประชาชน *</label>
            <input type="file" id="id_copy" name="id_copy" accept=".pdf,.jpg,.jpeg,.png" data-doc-type="id_copy">
            <div class="hint">รองรับ PDF, JPEG, PNG (ไม่เกิน 10MB)</div>
            <div class="status" id="id_copy-status"></div>
          </div>
          <div class="field">
            <label for="power_of_attorney">DOC-06: หนังสือมอบอำนาจ (ถ้าไม่ใช่เจ้าของ)</label>
            <input type="file" id="power_of_attorney" name="power_of_attorney" accept=".pdf,.jpg,.jpeg,.png" data-doc-type="power_of_attorney">
            <div class="hint">รองรับ PDF, JPEG, PNG (ไม่เกิน 10MB)</div>
            <div class="status" id="power_of_attorney-status"></div>
          </div>
        </div>
        <button type="submit" class="btn" id="submitBtn">อัปโหลดเอกสาร</button>
      </form>
    </div>
  </div>
  <script>
    let farmerId = "${farmerId}";
    let liffIdToken = null;
    async function init() {
      try {
        const liffId = "${liffId}";
        if (liffId) {
          await liff.init({ liffId });
          const profile = await liff.getProfile();
          // FINDING-D fix: capture the LIFF idToken so the upload can
          // authenticate the request server-side. The Worker verifies
          // the JWT via LINE's verify endpoint and resolves farmer_id
          // from line_links.line_user_id — never trusting the form field.
          try {
            liffIdToken = liff.getIDToken ? liff.getIDToken() : null;
          } catch (_) { liffIdToken = null; }
          if (!liffIdToken) {
            // Fall back to access token for older LIFF SDKs that don't
            // expose getIDToken (it's still a valid bearer credential).
            try { liffIdToken = liff.getAccessToken(); } catch (_) {}
          }
          if (!liffIdToken) {
            // Show a clear message instead of the misleading "missing token".
            // In Orion/Brave/Safari (not LINE in-app), liff.isInClient() is false
            // and getIDToken() returns null. The user must tap from inside LINE.
            const inClient = (liff.isInClient && liff.isInClient()) === true;
            const msg = inClient
              ? '⚠️ Authentication failed — close this window and reopen from the LINE chat link.'
              : '⚠️ กรุณาเปิดลิงก์นี้จากแอป LINE (ไม่ใช่เบราว์เซอร์) — แตะลิงก์จากแชท LINE ในแอป LINE';
            document.getElementById('chanote-status').textContent = msg;
            document.getElementById('chanote-status').style.color = '#C8464F';
            document.getElementById('id_copy-status').textContent = msg;
            document.getElementById('id_copy-status').style.color = '#C8464F';
          }
          // Resolve farmer_id from LINE userId (display only — backend
          // re-derives this from the JWT)
          const res = await fetch('/liff/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: '__resolve_farmer__', userId: profile.userId })
          });
          const data = await res.json();
          if (data.farmerId) farmerId = data.farmerId;
        }
      } catch (e) {
        console.error('LIFF init error:', e);
      }
      document.getElementById('loading').style.display = 'none';
      document.getElementById('app').style.display = 'block';
    }

    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      const errBox = document.getElementById('errorBox');
      const successBox = document.getElementById('successBox');
      btn.disabled = true;
      btn.textContent = 'กำลังอัปโหลด...';
      errBox.style.display = 'none';
      successBox.style.display = 'none';

      const files = [
        { input: document.getElementById('chanote'), docType: 'chanote', status: document.getElementById('chanote-status') },
        { input: document.getElementById('id_copy'), docType: 'id_copy', status: document.getElementById('id_copy-status') },
        { input: document.getElementById('power_of_attorney'), docType: 'power_of_attorney', status: document.getElementById('power_of_attorney-status') }
      ];

      let uploadedCount = 0;
      let errors = [];

      for (const { input, docType, status } of files) {
        const file = input.files[0];
        if (!file) continue;

        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('doc_type', docType);
        if (farmerId) formData.append('farmer_id', farmerId);

        // FINDING-D fix: include the LIFF bearer token so the backend can
        // verify the caller before accepting the upload.
        const headers = {};
        if (liffIdToken) headers['Authorization'] = 'Bearer ' + liffIdToken;

        try {
          const res = await fetch('/liff/api/documents/upload', {
            method: 'POST',
            headers,
            body: formData
          });
          const result = await res.json();
          if (res.ok && result.ok) {
            status.textContent = '✅ อัปโหลดสำเร็จ';
            status.style.color = '#06c755';
            uploadedCount++;
          } else {
            status.textContent = '❌ ' + (result.error || 'เกิดข้อผิดพลาด');
            status.style.color = '#C8464F';
            errors.push(docType + ': ' + (result.error || 'เกิดข้อผิดพลาด'));
          }
        } catch (err) {
          status.textContent = '❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
          status.style.color = '#C8464F';
          errors.push(docType + ': ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        }
      }

      if (uploadedCount > 0) {
        successBox.style.display = 'block';
        successBox.querySelector('p').textContent = 'อัปโหลดสำเร็จ ' + uploadedCount + ' ไฟล์';
      }
      if (errors.length > 0) {
        errBox.textContent = errors.join('\\n');
        errBox.style.display = 'block';
      }

      btn.disabled = false;
      btn.textContent = 'อัปโหลดเอกสาร';
    });

    document.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>`;

  return c.html(html);
});

// ---------------------------------------------------------------------------
// Artifact LIFF screens — LiffShell + calendar/summary/fields/contact/baseline/docs
//
// Design source: design-artifacts/2026-09-28/line-oa-farmer.html, module
// 30fbaadd-d95b-4dad-b1c1-fa2494ac1677.js (LiffShell + LiffCalendar +
// LiffSummary + LiffFields + LiffContact + LiffBaseline + LiffDocs) and
// specs/016-flow-parity/node-design-spec.md. Tokens are the artifact's
// :root block; layout mirrors the decoded React components.
//
// These pages render the shell immediately (no eternal spinner): LIFF init
// only wires the close button and optional identity resolution, so the page
// works outside the LINE client too.
// ---------------------------------------------------------------------------

/** JSON safe for embedding inside a <script> block. */
function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

interface LiffScreenInput {
  title: string;
  subtitle?: string;
  body: string;
  footer?: string;
  /** Query param the client should resolve via __context__ when missing. */
  resolveParam?: string;
  /** Path the client relocates to after resolving resolveParam. */
  resolvePath?: string;
  liffId: string;
}

function liffScreenHtml(input: LiffScreenInput): string {
  const subtitle = input.subtitle ? `<span class="shell-subtitle">${input.subtitle}</span>` : "";
  const footer = input.footer ? `<div class="shell-footer">${input.footer}</div>` : "";
  const boot = {
    liffId: input.liffId,
    resolveParam: input.resolveParam || "",
    resolvePath: input.resolvePath || "",
  };
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${input.title} — NetZeroCarbon</title>
  <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
  <style>
    :root{
      --line-green:#06C755;--line-green-dark:#04A344;--line-chat-bg:#8FAAD0;--line-chat-ink:#16202C;
      --line-bubble-me:#A9E86B;--line-bubble-you:#FFFFFF;--line-hairline:#EEF2F6;--line-qr-border:#D6DFE9;
      --line-input-pill:#F1F4F8;--line-muted:#94A2B2;
      --gradient-deep:linear-gradient(150deg,#061E5C 0%,#0B2A72 45%,#027276 100%);
      --teal-50:#E7FCF7;--teal-200:#8FF3DE;--teal-300:#52ECCA;--teal-600:#028E91;--teal-700:#027276;--teal-800:#01565F;
      --status-success:#0AA8A3;--status-success-soft:#E7FCF7;--status-warning:#E2A33C;--status-warning-soft:#FCF2E0;
      --status-danger:#C8464F;--status-danger-soft:#FBECEC;
      --navy-50:#EEF2FB;--navy-700:#123787;--navy-900:#061E5C;
      --grey-50:#F2F2F2;--grey-100:#EDEFF3;--grey-200:#DDE1E8;--grey-300:#C2C8D2;--grey-400:#9AA3B2;
      --grey-500:#737E91;--grey-600:#566277;--grey-700:#3C4A5C;--grey-800:#273343;
      --text-heading:#061E5C;--text-body:#273343;--text-muted:#566277;--text-subtle:#737E91;
      --border-subtle:#DDE1E8;--border-default:#C2C8D2;--border-accent:#028E91;
      --radius-sm:8px;--radius-md:12px;--radius-lg:16px;--radius-pill:999px;
      --weight-light:300;--weight-semibold:600;--weight-bold:700;
      --shadow-xs:0 1px 2px rgba(6,30,92,.06);
      --tracking-eyebrow:.14em;
      --font-mono:'SF Mono',ui-monospace,Menlo,Consolas,monospace;
    }
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{height:100%}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans Thai',sans-serif;background:#fff;color:var(--text-body)}
    .shell{position:absolute;inset:0;background:#fff;display:flex;flex-direction:column}
    .shell-header{background:var(--gradient-deep);color:#fff;padding:12px 14px;display:flex;align-items:flex-start;gap:10px}
    .shell-logo{width:26px;height:26px;border-radius:50%;background:#fff;display:grid;place-items:center;flex:none;font-size:13px;line-height:1}
    .shell-titles{min-width:0;flex:1}
    .shell-title{display:block;font-size:14px;font-weight:var(--weight-bold);line-height:1.25}
    .shell-subtitle{display:block;font-size:10.5px;opacity:.82;margin-top:2px}
    .shell-close{background:none;border:none;color:#fff;font-size:17px;cursor:pointer;line-height:1;padding:0}
    .shell-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:14px;background:var(--grey-50)}
    .shell-footer{border-top:1px solid var(--border-subtle);background:#fff;padding:10px 14px}
    .panel{background:#fff;border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:12px 13px;display:flex;flex-direction:column;gap:9px}
    .panel.warn{background:var(--status-warning-soft);border-color:#F2DDB4}
    .panel-title{font-size:13px;font-weight:var(--weight-semibold);color:var(--text-heading)}
    .panel-hint{font-size:11px;color:var(--text-subtle);line-height:1.55;margin-top:-4px}
    .btn{background:var(--teal-600);color:#fff;border:none;border-radius:var(--radius-pill);padding:9px 14px;font-size:12.5px;font-weight:var(--weight-semibold);cursor:pointer;font-family:inherit;text-decoration:none;display:inline-block;text-align:center}
    .btn:active{background:var(--teal-800)}
    .btn.outline{background:#fff;color:var(--teal-700);border:1px solid var(--border-default)}
    .btn.sm{padding:6px 12px;font-size:11.5px}
    .btn.full{width:100%}
    .btn:disabled{background:var(--grey-200);color:var(--grey-500);border:none;cursor:default}
    .badge{display:inline-block;padding:3px 9px;border-radius:var(--radius-pill);font-size:10px;font-weight:var(--weight-semibold);white-space:nowrap}
    .badge.success{background:var(--status-success-soft);color:var(--teal-800)}
    .badge.warning{background:var(--status-warning-soft);color:#8A5B10}
    .badge.danger{background:var(--status-danger-soft);color:var(--status-danger)}
    .tag{display:inline-block;padding:4px 10px;border-radius:var(--radius-pill);font-size:10.5px;font-weight:var(--weight-semibold)}
    .tag.neutral{background:var(--grey-100);color:var(--grey-700)}
    .tag.teal{background:var(--teal-50);color:var(--teal-800)}
    .mono{font-family:var(--font-mono)}
    .progress-label{display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:4px}
    .progress-track{height:6px;background:var(--grey-100);border-radius:var(--radius-pill);overflow:hidden}
    .progress-fill{height:100%;background:var(--teal-600);border-radius:var(--radius-pill)}
    .empty{background:#fff;border:1px dashed var(--border-default);border-radius:var(--radius-md);padding:18px 14px;text-align:center;font-size:12px;color:var(--text-subtle);line-height:1.6}
  </style>
</head>
<body>
  <div class="shell">
    <div class="shell-header">
      <span class="shell-logo">🌱</span>
      <span class="shell-titles">
        <span class="shell-title">${input.title}</span>
        ${subtitle}
      </span>
      <button class="shell-close" id="shellClose" aria-label="ปิด">✕</button>
    </div>
    <div class="shell-body">
${input.body}
    </div>
${footer}
  </div>
  <script>window.__BOOT__ = ${safeJson(boot)};</script>
  <script>
    (function(){
      var boot = window.__BOOT__ || {};
      var liffId = boot.liffId || "";
      var state = { ready: false };
      function initLiff(){
        if(!liffId || !window.liff) return Promise.resolve(false);
        return window.liff.init({ liffId: liffId }).then(function(){ return true; }).catch(function(){ return false; });
      }
      initLiff().then(function(ok){
        state.ready = ok;
        if (window.__onLiffReady) window.__onLiffReady(ok);
      });
      var closeBtn = document.getElementById('shellClose');
      if (closeBtn) closeBtn.addEventListener('click', function(){
        if (state.ready && window.liff && window.liff.closeWindow) { window.liff.closeWindow(); }
        else { history.back(); }
      });
      window.__nzc = {
        ready: function(){ return state.ready; },
        profile: function(){
          if (!state.ready || !window.liff || !window.liff.getProfile) return Promise.reject(new Error('no-liff'));
          return window.liff.getProfile();
        },
        // Resolve the farmer's working context and reload this screen with it.
        resolveAndGo: function(){
          if (!boot.resolveParam) return Promise.resolve(false);
          return window.__nzc.profile().then(function(p){
            return fetch('/liff/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: '__context__', userId: p.userId })
            });
          }).then(function(r){ return r.json(); }).then(function(d){
            var v = d && d[boot.resolveParam];
            if (v) { location.replace(boot.resolvePath + '?' + boot.resolveParam + '=' + encodeURIComponent(v)); return true; }
            return false;
          }).catch(function(){ return false; });
        }
      };
    })();
  </script>
</body>
</html>`;
}

// -- /liff/calendar — PJ-13 · ปฏิทินฤดูนี้ 9 ขั้นตอน -------------------------

const CALENDAR_PHOTO_STEPS: Record<string, string> = {
  "SG-04": "เปียก 1",
  "SG-05": "แห้ง 1",
  "SG-07": "เปียก 2",
  "SG-08": "แห้ง 2",
};

function calendarRowHtml(
  step: CalendarStep,
  mark: "done" | "now" | "next" | "lock",
  cameraQuery: string,
): string {
  const marks = {
    done: ["✓", "var(--teal-600)", "#fff"],
    now: ["●", "var(--status-warning)", "#fff"],
    next: ["○", "#fff", "var(--text-subtle)"],
    lock: ["🔒", "var(--grey-100)", "var(--grey-500)"],
  } as const;
  const [glyph, bg, fg] = marks[mark];
  const border = mark === "next" ? "border:1px solid var(--border-default);" : "";
  const rowBg = mark === "now" ? "var(--status-warning-soft)" : "#fff";
  const phase = CALENDAR_PHOTO_STEPS[step.step_code]
    ? step.step_code === "SG-04" || step.step_code === "SG-07"
      ? " · 📷 น้ำเต็มท่อ"
      : " · 📷 น้ำต่ำกว่าผิวดิน"
    : "";
  const due = step.due_date ? ` · ${step.due_date}` : "";
  const action =
    mark === "now" && CALENDAR_PHOTO_STEPS[step.step_code]
      ? `<a class="btn sm" href="/liff/camera?${cameraQuery}">บันทึก</a>`
      : "";
  return `<div style="display:flex;gap:11px;align-items:center;padding:11px 13px;background:${rowBg};border-bottom:1px solid var(--grey-100);">
        <span style="width:24px;height:24px;flex:none;border-radius:50%;background:${bg};color:${fg};${border}display:grid;place-items:center;font-size:11px;">${glyph}</span>
        <span style="flex:1;min-width:0;">
          <span style="display:block;font-size:12.5px;font-weight:var(--weight-semibold);color:var(--text-heading);">${step.step_name}</span>
          <span style="display:block;font-size:10.5px;color:var(--text-subtle);">${step.step_code} · วันที่ ${step.due_day}${due}${phase}</span>
        </span>
        ${action}
      </div>`;
}

liffRoutes.get("/calendar", async (c) => {
  const liffId = c.env.LIFF_ID || "";
  const db = c.env.DB;
  const seasonInputId = c.req.query("season_input_id") || "";
  const plotId = c.req.query("plot_id") || "";
  try {
    let inputId = seasonInputId;
    let plotCode = "";
    let seasonKey = "";
    if (!inputId && plotId) {
      const row = await db
        .prepare(
          "SELECT id, season_id FROM season_inputs WHERE plot_id = ? ORDER BY created_at DESC LIMIT 1",
        )
        .bind(plotId)
        .first<{ id: string; season_id: string }>();
      if (row) {
        inputId = row.id;
        seasonKey = row.season_id;
      }
    }
    if (plotId) {
      const plot = await db
        .prepare("SELECT plot_code FROM plots WHERE id = ?")
        .bind(plotId)
        .first<{ plot_code: string }>();
      plotCode = plot?.plot_code || "";
    }

    const steps = inputId ? (await handleLiffCalendar(db, inputId)).steps : [];
    const doneCount = steps.filter((s) => s.status === "completed").length;
    const nowIdx = steps.findIndex((s) => s.status !== "completed");

    const cameraParams = new URLSearchParams();
    if (nowIdx >= 0) cameraParams.set("step", steps[nowIdx].step_code);
    if (plotId) cameraParams.set("plot_id", plotId);
    if (seasonKey) cameraParams.set("season_id", seasonKey);
    const cameraQuery = cameraParams.toString();

    const chips = Object.entries(CALENDAR_PHOTO_STEPS)
      .map(([code, label]) => {
        const ok = steps.some((s) => s.step_code === code && s.status === "completed");
        const bg = ok ? "var(--teal-600)" : "#fff";
        const fg = ok ? "#fff" : "var(--text-subtle)";
        const border = ok ? "1px solid var(--teal-600)" : "1px solid var(--border-default)";
        return `<span style="flex:1;text-align:center;padding:7px 4px;border-radius:var(--radius-sm);font-size:11px;font-weight:var(--weight-semibold);background:${bg};color:${fg};border:${border};">${label}</span>`;
      })
      .join("\n        ");

    const rows = steps
      .map((s, i) => {
        const mark =
          i < nowIdx || nowIdx < 0
            ? "done"
            : i === nowIdx
              ? "now"
              : i === nowIdx + 1
                ? "next"
                : "lock";
        return calendarRowHtml(s, mark, cameraQuery);
      })
      .join("\n        ");

    const body = steps.length
      ? `<div class="panel">
        <div class="panel-title">ความคืบหน้า ${doneCount}/9 ขั้นตอน</div>
        <div class="panel-hint">กำหนดของแต่ละขั้นคำนวณจากวันหว่านบวกอายุของพันธุ์ข้าว (120 วัน)</div>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.round((doneCount / 9) * 100)}%;"></div></div>
      </div>
      <div class="panel warn">
        <div class="panel-title">ภาพท่อวัดระดับน้ำ 4 รอบต่อครอป</div>
        <div class="panel-hint">เปียก 2 ครั้ง แห้ง 2 ครั้ง สลับกัน — ต้องครบทั้ง 4 ภาพ เครดิตจึงคิดได้เต็ม ถ้าไม่ครบระบบจะคิดให้ต่ำลงโดยอัตโนมัติ</div>
        <div style="display:flex;gap:6px;">
        ${chips}
        </div>
      </div>
      <div style="background:#fff;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;">
        ${rows}
      </div>`
      : `<div class="empty">ยังไม่มีปฏิทินฤดูให้แสดง<br>เริ่มฤดูจากแชท LINE โดยพิมพ์ "เริ่มปลูก" หรือแตะลิงก์จากบอตอีกครั้ง</div>`;

    const subtitle = plotCode
      ? `${plotCode} · ${seasonKey || "ฤดูโครงการ"} · 9 ขั้นตอน`
      : "ฤดูโครงการ · 9 ขั้นตอน";

    const nowStep = nowIdx >= 0 ? steps[nowIdx] : null;
    const footer =
      nowStep && CALENDAR_PHOTO_STEPS[nowStep.step_code]
        ? `<a class="btn full" href="/liff/camera?${cameraQuery}">ถ่ายภาพ · ${nowStep.step_name} (${nowStep.step_code})</a>`
        : "";

    return c.html(
      liffScreenHtml({
        title: "ปฏิทินฤดูนี้",
        subtitle,
        body,
        footer,
        resolveParam: steps.length || plotId || seasonInputId ? undefined : "plot_id",
        resolvePath: "/liff/calendar",
        liffId,
      }),
    );
  } catch (err) {
    console.error("LIFF calendar page error:", err);
    return c.html(
      liffScreenHtml({
        title: "ปฏิทินฤดูนี้",
        subtitle: "ฤดูโครงการ · 9 ขั้นตอน",
        body: `<div class="empty">โหลดปฏิทินไม่สำเร็จ — ปิดหน้านี้แล้วแตะลิงก์จากแชทอีกครั้ง</div>`,
        liffId,
      }),
    );
  }
});

// -- /liff/summary — RP-05 · แดชบอร์ดของฉัน ----------------------------------

function summaryTabHtml(tab: string, active: boolean): string {
  const bg = active ? "#fff" : "transparent";
  const color = active ? "var(--teal-700)" : "var(--text-muted)";
  const shadow = active ? "var(--shadow-xs)" : "none";
  return `<button type="button" data-tab="${tab}" style="flex:1;border:none;border-radius:var(--radius-pill);padding:7px 4px;font-family:inherit;font-size:12px;font-weight:var(--weight-semibold);cursor:pointer;background:${bg};color:${color};box-shadow:${shadow};">${tab}</button>`;
}

liffRoutes.get("/summary", async (c) => {
  const liffId = c.env.LIFF_ID || "";
  const db = c.env.DB;
  const plotId = c.req.query("plot_id") || "";
  const farmerId = c.req.query("farmer_id") || "";
  try {
    let plotCode = "";
    let seasonKey = "";
    if (plotId) {
      const plot = await db
        .prepare("SELECT plot_code FROM plots WHERE id = ?")
        .bind(plotId)
        .first<{ plot_code: string }>();
      plotCode = plot?.plot_code || "";
      const season = await db
        .prepare(
          "SELECT season_id FROM season_inputs WHERE plot_id = ? ORDER BY created_at DESC LIMIT 1",
        )
        .bind(plotId)
        .first<{ season_id: string }>();
      seasonKey = season?.season_id || "";
    }

    const results = plotId ? await fetchResultsData(db, farmerId, plotId) : null;

    const subtitle = plotCode ? `${plotCode} · นาปี ${seasonKey || "ปัจจุบัน"}` : "แดชบอร์ดความคืบหน้า";

    let body: string;
    if (!results) {
      body = `<div class="empty">ยังไม่มีข้อมูลผลให้แสดง<br>เปิดหน้านี้จากลิงก์ในแชท LINE เพื่อดูแดชบอร์ดของแปลงคุณ</div>`;
    } else {
      const sfNote =
        results.sfW < 0.6
          ? `ภาพไม่ครบ ระบบคำนวณต่ำลง (SF_w = ${results.sfW})`
          : "ถ้าส่งภาพครบ 4 รอบจะได้เต็มค่านี้";
      const tasks: string[] = [];
      if (results.pendingPhotos > 0) tasks.push(`ถ่ายภาพอีก ${results.pendingPhotos} ภาพ`);
      if (results.backfillCount > 0) tasks.push(`กรอกข้อมูลย้อนหลังอีก ${results.backfillCount} ฤดู`);
      const taskRows = tasks.length
        ? tasks
            .map(
              (t) =>
                `<div style="display:flex;gap:8px;font-size:12px;color:var(--text-body);"><span>⏱</span><span>${t}</span></div>`,
            )
            .join("\n          ")
        : `<div style="display:flex;gap:8px;font-size:12px;color:var(--text-body);"><span>🎉</span><span>ครบทุกรายการแล้วครับ</span></div>`;
      const photoPct = results.totalPhotos
        ? Math.round((results.approvedPhotos / results.totalPhotos) * 100)
        : 0;
      const tiles = ["เปียก 1", "แห้ง 1", "เปียก 2", "แห้ง 2"]
        .map((label, i) => {
          const passed = i < results.approvedPhotos;
          const st = passed ? "ผ่าน" : "ยังไม่ส่ง";
          const stColor = passed ? "#8FF3DE" : "#FFE29A";
          return `<div style="position:relative;border-radius:var(--radius-sm);overflow:hidden;aspect-ratio:1/1;background:linear-gradient(180deg,#9FC7E8,#8FA95C);">
            <span style="position:absolute;left:50%;top:24%;transform:translateX(-50%);width:9px;height:34px;background:#E7EDF2;border-radius:2px;"></span>
            <span style="position:absolute;inset:auto 0 0 0;background:rgba(0,0,0,.55);color:#fff;font-size:9px;padding:2px 4px;display:flex;justify-content:space-between;">
              <span>${label}</span><span style="color:${stColor};">${st}</span>
            </span>
          </div>`;
        })
        .join("\n          ");

      body = `<div style="display:flex;gap:4px;background:var(--grey-100);padding:3px;border-radius:var(--radius-pill);">
        ${summaryTabHtml("ผล", true)}
        ${summaryTabHtml("เครดิต", false)}
        ${summaryTabHtml("ภาพ", false)}
      </div>
      <div data-tab-page="ผล" style="display:flex;flex-direction:column;gap:14px;">
        <div style="background:var(--gradient-deep);color:#fff;border-radius:var(--radius-md);padding:15px 14px;">
          <div style="font-size:11px;letter-spacing:var(--tracking-eyebrow);text-transform:uppercase;color:var(--teal-300);font-weight:var(--weight-semibold);">คาร์บอนที่ลดได้ (ประมาณการ)</div>
          <div style="display:flex;align-items:baseline;gap:7px;margin-top:5px;">
            <span style="font-size:38px;font-weight:var(--weight-light);line-height:1;">${results.totalOffset.toFixed(2)}</span>
            <span style="font-size:13px;opacity:.8;">tCO₂eq</span>
          </div>
          <div style="font-size:10.5px;opacity:.72;margin-top:6px;line-height:1.5;">ประมาณการก่อนทวนสอบ · ${sfNote}</div>
        </div>
        <div class="panel warn">
          <div class="panel-title">สิ่งที่ต้องทำต่อไป</div>
          ${taskRows}
        </div>
        <div class="panel">
          <div class="panel-title">ภาพหลักฐานครอปนี้ ${results.approvedPhotos} จาก ${results.totalPhotos} ภาพ</div>
          <div class="panel-hint">เปียก 2 ครั้ง แห้ง 2 ครั้ง สลับกัน</div>
          <div>
            <div class="progress-label"><span>ภาพที่อนุมัติแล้ว</span><span>${results.approvedPhotos}/${results.totalPhotos}</span></div>
            <div class="progress-track"><div class="progress-fill" style="width:${photoPct}%;"></div></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);">
            <span>ข้อมูลย้อนหลังที่ยังไม่กรอก</span><span>${results.backfillCount} ฤดู</span>
          </div>
        </div>
      </div>
      <div data-tab-page="เครดิต" style="display:none;flex-direction:column;gap:14px;">
        <div class="panel">
          <div class="panel-title">เครดิตของคุณมาจากไหน</div>
          <div class="panel-hint">เกือบทั้งหมดมาจากมีเทนในนาข้าวที่ลดลงเพราะปล่อยแห้งสลับเปียก</div>
          <div style="font-size:11.5px;color:var(--text-muted);line-height:1.6;">
            โครงการ<b style="color:var(--text-heading);">ไม่ได้ขอให้ลดปุ๋ย</b> — ยอดปุ๋ยของคุณจะถูกบันทึกเท่าเดิมทั้งก่อนและระหว่างโครงการ แต่ยังต้องกรอกให้ครบ เพราะปุ๋ยเข้าสมการอีกก๊าซหนึ่ง (N₂O)
          </div>
        </div>
        <div class="panel">
          <div class="panel-title">ภาพครบ 4 รอบ = เครดิตเต็ม</div>
          <div class="panel-hint">ถ้าภาพไม่ครบ ระบบจะถือว่าปล่อยแห้งได้แค่ 1 ครั้ง ทำให้เครดิตลดลง</div>
          <div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;padding:7px 9px;border-radius:var(--radius-sm);background:var(--teal-50);">
            <span style="color:var(--teal-800);">ตัวคูณน้ำ (SF_w) ตอนนี้</span>
            <b class="mono" style="color:var(--teal-800);">${results.sfW}</b>
          </div>
          <div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;padding:7px 9px;border-radius:var(--radius-sm);background:var(--grey-100);">
            <span style="color:var(--text-muted);">ภาพที่อนุมัติแล้ว</span>
            <b class="mono" style="color:var(--text-muted);">${results.approvedPhotos}/${results.totalPhotos}</b>
          </div>
        </div>
      </div>
      <div data-tab-page="ภาพ" style="display:none;flex-direction:column;gap:14px;">
        <div class="panel">
          <div class="panel-title">ภาพท่อวัดระดับน้ำ 4 รอบของครอปนี้</div>
          <div class="panel-hint">ภาพที่ตีกลับต้องถ่ายใหม่ — ดูสถานะได้จากแชท</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
          ${tiles}
          </div>
        </div>
      </div>
      <script>
        (function(){
          var buttons = document.querySelectorAll('[data-tab]');
          for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function(){
              var tab = this.getAttribute('data-tab');
              for (var j = 0; j < buttons.length; j++) {
                var on = buttons[j] === this;
                buttons[j].style.background = on ? '#fff' : 'transparent';
                buttons[j].style.color = on ? 'var(--teal-700)' : 'var(--text-muted)';
                buttons[j].style.boxShadow = on ? 'var(--shadow-xs)' : 'none';
              }
              var pages = document.querySelectorAll('[data-tab-page]');
              for (var k = 0; k < pages.length; k++) {
                pages[k].style.display = pages[k].getAttribute('data-tab-page') === tab ? 'flex' : 'none';
              }
            });
          }
        })();
      </script>`;
    }

    return c.html(
      liffScreenHtml({
        title: "แดชบอร์ดของฉัน",
        subtitle,
        body,
        resolveParam: results ? undefined : "plot_id",
        resolvePath: "/liff/summary",
        liffId,
      }),
    );
  } catch (err) {
    console.error("LIFF summary page error:", err);
    return c.html(
      liffScreenHtml({
        title: "แดชบอร์ดของฉัน",
        subtitle: "แดชบอร์ดความคืบหน้า",
        body: `<div class="empty">โหลดแดชบอร์ดไม่สำเร็จ — ปิดหน้านี้แล้วแตะลิงก์จากแชทอีกครั้ง</div>`,
        liffId,
      }),
    );
  }
});

// -- /liff/fields — RP-02 · แปลงของฉัน ---------------------------------------

const TENURE_LABELS: Record<string, string> = {
  owner: "เจ้าของ",
  tenant: "ผู้เช่า",
  proxy: "ผู้รับมอบอำนาจ",
};

liffRoutes.get("/fields", async (c) => {
  const liffId = c.env.LIFF_ID || "";
  const db = c.env.DB;
  const farmerId = c.req.query("farmer_id") || "";
  try {
    let body: string;
    let plotCount = 0;

    if (farmerId) {
      const { results: plots } = await db
        .prepare(
          "SELECT id, plot_code, deed_no, area_rai, tenure FROM plots WHERE farmer_id = ? ORDER BY created_at ASC",
        )
        .bind(farmerId)
        .all<{
          id: string;
          plot_code: string;
          deed_no: string;
          area_rai: number;
          tenure: string | null;
        }>();
      plotCount = plots.length;

      const varietyByPlot = new Map<string, string>();
      const photoByPlot = new Map<string, { approved: number; total: number }>();
      if (plots.length > 0) {
        const ids = plots.map((p) => p.id);
        const placeholders = ids.map(() => "?").join(",");
        const { results: seasons } = await db
          .prepare(
            `SELECT plot_id, rice_variety FROM season_inputs WHERE plot_id IN (${placeholders}) ORDER BY created_at DESC`,
          )
          .bind(...ids)
          .all<{ plot_id: string; rice_variety: string | null }>();
        for (const s of seasons) {
          if (!varietyByPlot.has(s.plot_id) && s.rice_variety)
            varietyByPlot.set(s.plot_id, s.rice_variety);
        }
        const { results: photos } = await db
          .prepare(
            `SELECT plot_id,
                    COUNT(DISTINCT CASE WHEN admin_status = 'verified' THEN step_code END) AS approved,
                    COUNT(DISTINCT step_code) AS total
             FROM photo_evidence WHERE plot_id IN (${placeholders}) GROUP BY plot_id`,
          )
          .bind(...ids)
          .all<{ plot_id: string; approved: number; total: number }>();
        for (const p of photos)
          photoByPlot.set(p.plot_id, { approved: p.approved, total: p.total });
      }

      body = plots.length
        ? plots
            .map((p) => {
              const photos = photoByPlot.get(p.id);
              const approved = photos?.approved ?? 0;
              const total = photos?.total ?? 0;
              const badge =
                total > 0 && approved >= 4
                  ? `<span class="badge success">ภาพครบ 4/4</span>`
                  : approved > 0
                    ? `<span class="badge warning">ภาพ ${approved}/4 ครอปนี้</span>`
                    : "";
              const tenure = p.tenure ? TENURE_LABELS[p.tenure] : "";
              const variety = varietyByPlot.get(p.id);
              return `<div style="background:#fff;border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:12px 13px;display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <span style="min-width:0;">
              <span style="display:block;font-size:13px;font-weight:var(--weight-semibold);color:var(--text-heading);">${p.plot_code}</span>
              <span class="mono" style="display:block;font-size:10px;color:var(--text-subtle);">${p.deed_no}</span>
            </span>
            ${badge}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span class="tag neutral">${p.area_rai} ไร่</span>
            ${variety ? `<span class="tag teal">${variety}</span>` : ""}
            ${tenure ? `<span class="tag neutral">${tenure}</span>` : ""}
          </div>
          <a class="btn outline sm full" href="/liff/calendar?plot_id=${encodeURIComponent(p.id)}">เลือกแปลงนี้</a>
        </div>`;
            })
            .join("\n        ")
        : `<div class="empty">ยังไม่มีแปลงในระบบ<br>เปิดหน้านี้จากแชท LINE หลังลงทะเบียนแปลงแล้ว</div>`;
    } else {
      body = `<div class="empty">กำลังหาแปลงของคุณ…<br>ถ้าหน้านี้ไม่เปลี่ยน ให้เปิดลิงก์จากแชท LINE ในแอป LINE</div>`;
    }

    return c.html(
      liffScreenHtml({
        title: "แปลงของฉัน",
        subtitle: plotCount ? `${plotCount} แปลง · เลือกแปลงที่จะทำงานด้วย` : "เลือกแปลงที่จะทำงานด้วย",
        body,
        resolveParam: farmerId ? undefined : "farmer_id",
        resolvePath: "/liff/fields",
        liffId,
      }),
    );
  } catch (err) {
    console.error("LIFF fields page error:", err);
    return c.html(
      liffScreenHtml({
        title: "แปลงของฉัน",
        subtitle: "เลือกแปลงที่จะทำงานด้วย",
        body: `<div class="empty">โหลดรายการแปลงไม่สำเร็จ — ปิดหน้านี้แล้วแตะลิงก์จากแชทอีกครั้ง</div>`,
        liffId,
      }),
    );
  }
});

// -- /liff/contact — RP-04 · ติดต่อเจ้าหน้าที่ -------------------------------

liffRoutes.get("/contact", (c) => {
  return c.html(
    liffScreenHtml({
      title: "ติดต่อเจ้าหน้าที่",
      subtitle: "จันทร์-ศุกร์ 8:00-17:00 น.",
      body: composeContactBody(),
      liffId: c.env.LIFF_ID || "",
    }),
  );
});

// -- /liff/baseline — BL · ข้อมูลย้อนหลัง 3 ปี --------------------------------

const BACKFILL_YEARS = ["2567", "2568", "2569"];

liffRoutes.get("/baseline", (c) => {
  const liffId = c.env.LIFF_ID || "";
  const plotId = c.req.query("plot_id") || "";
  const intro = composeBackfillPrompt({
    plotName: "แปลงของคุณ",
    missingSeasons: BACKFILL_YEARS.length,
    availableYears: BACKFILL_YEARS,
  });

  const rows = BACKFILL_YEARS.map((year) => {
    const opts = [
      `<option value="">— เลือก —</option>`,
      `<option>เปียกสลับแห้ง</option>`,
      `<option>น้ำขังตลอด</option>`,
    ].join("");
    return `<div class="panel">
        <div class="panel-title">ปี ${year}</div>
        <label style="display:flex;flex-direction:column;gap:4px;font-size:11.5px;color:var(--text-muted);">วันหว่าน
          <input type="date" id="sow-${year}" style="border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:8px 10px;font-size:12.5px;font-family:inherit;background:var(--line-input-pill);">
        </label>
        <label style="display:flex;flex-direction:column;gap:4px;font-size:11.5px;color:var(--text-muted);">การจัดการน้ำ
          <select id="wm-${year}" style="border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:8px 10px;font-size:12.5px;font-family:inherit;background:var(--line-input-pill);">${opts}</select>
        </label>
        <label style="display:flex;flex-direction:column;gap:4px;font-size:11.5px;color:var(--text-muted);">ผลผลิต (กก./ไร่)
          <input type="number" min="0" inputmode="decimal" id="yield-${year}" placeholder="ถ้าทราบ" style="border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:8px 10px;font-size:12.5px;font-family:inherit;background:var(--line-input-pill);">
        </label>
        <div style="display:flex;align-items:center;gap:10px;">
          <button type="button" class="btn sm" data-season="${year}">บันทึก</button>
          <span id="st-${year}" style="font-size:11px;"></span>
        </div>
      </div>`;
  }).join("\n      ");

  const body = `<div class="panel">
        <div class="panel-title">ข้อมูลย้อนหลัง 3 ปี</div>
        <div class="panel-hint" style="white-space:pre-wrap;margin-top:0;">${intro}</div>
      </div>
      ${rows}
      <script>
        (function(){
          var errorText = {
            'sow_date is required': '❌ กรุณากรอกวันหว่าน',
            'water_management is required': '❌ กรุณาเลือกการจัดการน้ำ'
          };
          var buttons = document.querySelectorAll('button[data-season]');
          for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function(){
              var b = this;
              var y = b.getAttribute('data-season');
              var status = document.getElementById('st-' + y);
              var payload = {
                plot_id: new URLSearchParams(location.search).get('plot_id') || '',
                season_name: 'นาปี ' + y,
                sow_date: document.getElementById('sow-' + y).value,
                water_management: document.getElementById('wm-' + y).value,
                yield_kg_per_rai: parseFloat(document.getElementById('yield-' + y).value) || undefined
              };
              b.disabled = true;
              status.textContent = 'กำลังตรวจ…';
              fetch('/liff/api/backfill/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              }).then(function(r){ return r.json(); }).then(function(d){
                if (d.valid) {
                  status.textContent = '✓ ข้อมูลครบ — พร้อมส่งให้เจ้าหน้าที่ยืนยัน';
                  status.style.color = 'var(--status-success)';
                } else {
                  status.textContent = errorText[d.error] || ('❌ ' + (d.error || 'ข้อมูลไม่ครบ'));
                  status.style.color = 'var(--status-danger)';
                }
              }).catch(function(){
                status.textContent = '❌ เชื่อมต่อเซิร์ฟเวอร์ไม่ได้';
                status.style.color = 'var(--status-danger)';
              }).finally(function(){ b.disabled = false; });
            });
          }
        })();
      </script>`;

  return c.html(
    liffScreenHtml({
      title: "ข้อมูลย้อนหลัง 3 ปี",
      subtitle: "กรอกย้อนหลังได้ 3 ฤดู · ทำให้คำนวณเครดิตแม่นขึ้น",
      body,
      resolveParam: plotId ? undefined : "plot_id",
      resolvePath: "/liff/baseline",
      liffId,
    }),
  );
});

liffRoutes.post("/api/backfill/validate", async (c) => {
  try {
    const body = await c.req.json<{
      plot_id?: string;
      season_name?: string;
      sow_date?: string;
      water_management?: string;
      yield_kg_per_rai?: number;
      straw_management?: string;
      fuel_liters_per_rai?: number;
      electricity_kwh_per_rai?: number;
    }>();
    return c.json(
      validateBackfillEntry({
        plot_id: body.plot_id ?? "",
        season_name: body.season_name ?? "",
        sow_date: body.sow_date ?? "",
        water_management: body.water_management ?? "",
        yield_kg_per_rai: body.yield_kg_per_rai,
        straw_management: body.straw_management,
        fuel_liters_per_rai: body.fuel_liters_per_rai,
        electricity_kwh_per_rai: body.electricity_kwh_per_rai,
      }),
    );
  } catch (err) {
    console.error("Backfill validate error:", err);
    return c.json({ valid: false, error: "Internal server error" }, 500);
  }
});

// -- /liff/docs — OB-13 · แนบเอกสารสิทธิ์ (same upload API as /documents) ----

const DOCS_PAGE_ITEMS = [
  { docType: "chanote", code: "DOC-01", name: "โฉนดที่ดิน หน้า-หลัง", by: "เกษตรกร", required: true },
  { docType: "id_copy", code: "DOC-03", name: "สำเนาบัตรประชาชน", by: "เกษตรกร", required: true },
  {
    docType: "power_of_attorney",
    code: "DOC-06",
    name: "หนังสือมอบอำนาจ",
    by: "บริษัทมีแบบฟอร์มให้",
    required: false,
  },
];

liffRoutes.get("/docs", (c) => {
  const liffId = c.env.LIFF_ID || "";

  const rows = DOCS_PAGE_ITEMS.map((d) => {
    const requiredMark = d.required ? " *" : "";
    return `<div style="background:#fff;border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:12px 13px;display:flex;gap:11px;align-items:center;">
          <span id="thumb-${d.docType}" style="width:44px;height:56px;border-radius:4px;flex:none;background:var(--grey-100);border:1px solid var(--border-subtle);display:grid;place-items:center;color:var(--grey-400);font-size:19px;">＋</span>
          <span style="flex:1;min-width:0;">
            <span class="mono" style="display:block;font-size:10px;color:var(--text-subtle);">${d.code}${requiredMark}</span>
            <span style="display:block;font-size:13px;font-weight:var(--weight-semibold);color:var(--text-heading);">${d.name}</span>
            <span style="display:block;font-size:10.5px;color:var(--text-subtle);">${d.by}</span>
            <span id="status-${d.docType}" style="display:block;font-size:10.5px;margin-top:2px;"></span>
          </span>
          <input type="file" id="file-${d.docType}" accept=".pdf,.jpg,.jpeg,.png" data-doc-type="${d.docType}" style="display:none;">
          <button type="button" class="btn sm" id="btn-${d.docType}" onclick="document.getElementById('file-${d.docType}').click()">แนบไฟล์</button>
        </div>`;
  }).join("\n        ");

  const body = `<div class="panel warn">
        <div class="panel-title">เอกสารไม่ครบ = ส่งใบสมัครไม่ได้</div>
        <div class="panel-hint">ทุกฉบับต้องเซ็นรับรองสำเนาถูกต้อง และระบุว่าใช้สำหรับโครงการบริษัทเนทซีโรคาร์บอน จำกัด · รองรับ PDF, JPEG, PNG (ไม่เกิน 10MB)</div>
      </div>
      ${rows}
      <script>
        (function(){
          var items = ${safeJson(DOCS_PAGE_ITEMS)};
          var boot = window.__BOOT__ || {};
          var token = null;
          var farmerId = boot.farmerId || "";

          window.__onLiffReady = function(ok){
            if (!ok) return;
            try { token = window.liff.getIDToken ? window.liff.getIDToken() : null; } catch (e) { token = null; }
            if (!token) { try { token = window.liff.getAccessToken(); } catch (e2) { token = null; } }
          };

          function setDone(item){
            var thumb = document.getElementById('thumb-' + item.docType);
            thumb.textContent = '✓';
            thumb.style.background = 'linear-gradient(160deg,#E7FCF7,#8FF3DE)';
            thumb.style.color = 'var(--teal-700)';
            var btn = document.getElementById('btn-' + item.docType);
            btn.textContent = 'แนบแล้ว';
            btn.disabled = true;
            document.getElementById('status-' + item.docType).textContent = '✅ อัปโหลดสำเร็จ';
            document.getElementById('status-' + item.docType).style.color = 'var(--status-success)';
          }

          function refreshFooter(){
            var footer = document.getElementById('docsFooter');
            var missing = 0;
            for (var i = 0; i < items.length; i++) {
              if (items[i].required && !document.getElementById('btn-' + items[i].docType).disabled) missing++;
            }
            if (missing === 0) {
              footer.textContent = '✓ แนบครบเอกสารบังคับ — รอเจ้าหน้าที่ตรวจเอกสาร';
              footer.style.color = 'var(--teal-700)';
            } else {
              footer.textContent = 'ยังต้องแนบอีก ' + missing + ' รายการ (DOC-01 · DOC-03 บังคับ)';
            }
          }

          for (var i = 0; i < items.length; i++) {
            (function(item){
              var input = document.getElementById('file-' + item.docType);
              input.addEventListener('change', function(){
                var file = input.files[0];
                if (!file) return;
                var status = document.getElementById('status-' + item.docType);
                var btn = document.getElementById('btn-' + item.docType);
                btn.disabled = true;
                status.textContent = 'กำลังอัปโหลด…';
                status.style.color = 'var(--text-muted)';
                var form = new FormData();
                form.append('file', file, file.name);
                form.append('doc_type', item.docType);
                if (farmerId) form.append('farmer_id', farmerId);
                var headers = {};
                if (token) headers['Authorization'] = 'Bearer ' + token;
                fetch('/liff/api/documents/upload', { method: 'POST', headers: headers, body: form })
                  .then(function(r){ return r.json().then(function(d){ return { ok: r.ok, data: d }; }); })
                  .then(function(res){
                    if (res.ok && res.data.ok) {
                      setDone(item);
                    } else {
                      status.textContent = '❌ ' + (res.data.error || 'อัปโหลดไม่สำเร็จ');
                      status.style.color = 'var(--status-danger)';
                    }
                  })
                  .catch(function(){
                    status.textContent = '❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
                    status.style.color = 'var(--status-danger)';
                  })
                  .finally(function(){
                    if (!document.getElementById('btn-' + item.docType).disabled) btn.disabled = false;
                    refreshFooter();
                  });
              });
            })(items[i]);
          }
          refreshFooter();
        })();
      </script>`;

  return c.html(
    liffScreenHtml({
      title: "แนบเอกสารสิทธิ์",
      subtitle: "DOC-01 · DOC-03 · DOC-06 — แนบให้ครบตามรายการ",
      body,
      footer: `<span id="docsFooter" style="font-size:12px;color:var(--text-muted);"></span>`,
      liffId,
    }),
  );
});
