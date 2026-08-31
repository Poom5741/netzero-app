/**
 * LIFF Chat App — serves the HTML page + chat API endpoint.
 */

import { Hono } from "hono";
import { getStaticAssets } from "hono/static";
import { handleFlowApi, type FlowApiResult } from "../line/flow";
import { checkFarmerApproved } from "../chat/guard";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
  ENVIRONMENT: string;
  SECRET: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  LINE_CHANNEL_SECRET: string;
  OPENROUTER_API_KEY: string;
};

export const liffRoutes = new Hono<{ Bindings: Bindings }>();

// Serve the LIFF chat app HTML
liffRoutes.get("/", (c) => {
  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>NetZeroCarbon</title>
  <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0f2f5;height:100vh;display:flex;flex-direction:column}
    .header{background:linear-gradient(135deg,#06c755 0%,#00a854 100%);color:#fff;padding:12px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}
    .header-icon{font-size:24px}
    .header-title{font-size:16px;font-weight:600}
    .header-sub{font-size:11px;opacity:.85}
    .chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px}
    .msg{max-width:80%;padding:10px 14px;border-radius:18px;font-size:15px;line-height:1.5;word-wrap:break-word;white-space:pre-wrap}
    .msg.bot{align-self:flex-start;background:#fff;color:#333;border-bottom-left-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.1)}
    .msg.user{align-self:flex-end;background:#06c755;color:#fff;border-bottom-right-radius:4px}
    .msg.sys{align-self:center;background:rgba(0,0,0,.06);color:#666;font-size:12px;padding:6px 12px;border-radius:12px}
    .typing{align-self:flex-start;display:flex;gap:4px;padding:12px 16px;background:#fff;border-radius:18px;border-bottom-left-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.1)}
    .typing span{width:8px;height:8px;background:#ccc;border-radius:50%;animation:bounce 1.4s infinite ease-in-out}
    .typing span:nth-child(2){animation-delay:-.16s}
    .typing span:nth-child(3){animation-delay:-.32s}
    @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
    .input-wrap{background:#fff;padding:8px 12px;display:flex;gap:8px;border-top:1px solid #e0e0e0;flex-shrink:0}
    .input-wrap input{flex:1;border:1px solid #ddd;border-radius:20px;padding:10px 16px;font-size:15px;outline:none}
    .input-wrap input:focus{border-color:#06c755}
    .input-wrap button{background:#06c755;color:#fff;border:none;border-radius:50%;width:40px;height:40px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center}
    .input-wrap button:disabled{background:#ccc}
    .quick{display:flex;gap:6px;padding:8px 12px;overflow-x:auto;flex-shrink:0}
    .quick button{white-space:nowrap;background:#fff;border:1px solid #06c755;color:#06c755;border-radius:16px;padding:6px 14px;font-size:13px;cursor:pointer}
    .quick button:active{background:#e8f5e9}
    #loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:12px}
    #loading .spin{width:40px;height:40px;border:3px solid #e0e0e0;border-top-color:#06c755;border-radius:50%;animation:sp .8s linear infinite}
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
        const liffId="${c.env.LIFF_ID || ''}";
        if(liffId){await liff.init({liffId});uid=(await liff.getProfile()).userId}
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
        const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:t,userId:uid})});
        const d=await r.json();hideTyping();
        add('bot',d.reply||d.error||'ไม่สามารถประมวลผลได้');
      }catch(e){hideTyping();add('sys','เกิดข้อผิดพลาด กรุณาลองใหม่')}
      document.getElementById('btn').disabled=false;inp.focus();
    }
    function sendQ(t){document.getElementById('inp').value=t;send()}
    function add(type,text){const c=document.getElementById('chat'),d=document.createElement('div');d.className='msg '+type;d.textContent=text;c.appendChild(d);c.scrollTop=c.scrollHeight}
    function showTyping(){const c=document.getElementById('chat'),d=document.createElement('div');d.className='typing';d.id='typing';d.innerHTML='<span></span><span></span><span></span>';c.appendChild(d);c.scrollTop=c.scrollHeight}
    function hideTyping(){const e=document.getElementById('typing');if(e)e.remove()}
    document.addEventListener('DOMContentLoaded',()=>{document.getElementById('inp').addEventListener('keypress',e=>{if(e.key==='Enter')send()});init()});
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

    const body = await c.req.json<{ text: string; userId: string }>();
    const { text, userId } = body;

    if (!text || !userId) {
      return c.json({ error: "text and userId required" }, 400);
    }

    // Guard: block non-approved farmers from AI chat (resolve via line_link)
    const existingLink = await db
      .prepare("SELECT farmer_id FROM line_links WHERE line_user_id = ?")
      .bind(userId)
      .first<{ farmer_id: string }>();
    if (existingLink) {
      const guard = await checkFarmerApproved(existingLink.farmer_id, db);
      if (!guard.allowed) {
        return c.json({ error: "บัญชีรอการอนุมัติ", reason: guard.reason }, 403);
      }
    }

    // Get or create link
    let link = await db
      .prepare("SELECT id, farmer_id, status, conversation_state, selected_plot_id FROM line_links WHERE line_user_id = ?")
      .bind(userId)
      .first<{ id: string; farmer_id: string; status: string; conversation_state: string; selected_plot_id: string | null }>();

    if (!link) {
      const linkId = `link_${crypto.randomUUID()}`;
      await db
        .prepare(
          "INSERT INTO line_links (id, farmer_id, line_user_id, status, conversation_state) VALUES (?, ?, ?, 'pending', 'welcome')",
        )
        .bind(linkId, "farmer-001", userId)
        .run();

      link = {
        id: linkId,
        farmer_id: "farmer-001",
        status: "pending",
        conversation_state: "welcome",
        selected_plot_id: null,
      };
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
      .prepare("UPDATE line_links SET conversation_state = ?, selected_plot_id = COALESCE(?, selected_plot_id) WHERE id = ?")
      .bind(result.newState, result.selectedPlotId ?? null, link.id)
      .run();

    return c.json({ reply: result.reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});
