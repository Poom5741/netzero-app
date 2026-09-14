/**
 * LIFF Contact Page — shows coordinator info for the NetZeroCarbon project.
 * Provides offline/poor-signal mode information.
 */

const LIFF_STUB = `<script>\n  window.liff = window.liff || {};\n  window.liff.init = window.liff.init || function(cb) { cb(); };\n</script>`;

/**
 * Compose the contact page HTML for LIFF.
 * Shows coordinator info, project name, and offline queue status.
 */
export function composeContactPage(): string {
  return `<!DOCTYPE html>
<html lang="th">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:16px;background:#f5f5f5;">
<div style="max-width:400px;margin:0 auto;">
  <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.1);">
    <h1 style="margin:0 0 12px 0;font-size:20px;color:#333;">📞 ติดต่อเจ้าหน้าที่</h1>
    <p style="margin:0 0 8px 0;color:#666;font-size:14px;">โครงการ NetZeroCarbon</p>
    <div style="border-top:1px solid #eee;margin:12px 0;"></div>
    <div style="margin-bottom:12px;">
      <p style="margin:0 0 4px 0;font-size:13px;color:#888;">ผู้ประสานงานโครงการ</p>
      <p style="margin:0;font-size:15px;font-weight:500;">โครงการ NetZeroCarbon</p>
    </div>
    <div style="margin-bottom:12px;">
      <p style="margin:0 0 4px 0;font-size:13px;color:#888;">โทรศัพท์</p>
      <p style="margin:0;font-size:15px;">ติดต่อผ่าน LINE Official</p>
    </div>
    <div style="margin-bottom:12px;">
      <p style="margin:0 0 4px 0;font-size:13px;color:#888;">อีเมล</p>
      <p style="margin:0;font-size:15px;">โครงการ NetZeroCarbon</p>
    </div>
    <div style="margin-bottom:12px;">
      <p style="margin:0 0 4px 0;font-size:13px;color:#888;">เวลาทำการ</p>
      <p style="margin:0;font-size:15px;">จันทร์-ศุกร์ 8:00-17:00 น.</p>
    </div>
  </div>

  <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.1);">
    <h2 style="margin:0 0 8px 0;font-size:16px;color:#333;">📱 สถานะออฟไลน์</h2>
    <p style="margin:0 0 8px 0;font-size:13px;color:#666;">
      หากระบบอินเทอร์เน็ตช้า รูปที่ถ่ายจะถูกเก็บไว้ในคิวและส่งอัตโนมัติเมื่อเชื่อมต่อใหม่
    </p>
    <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
      <div style="width:10px;height:10px;border-radius:50%;background:#06c755;"></div>
      <span style="font-size:13px;color:#333;">ระบบพร้อมใช้งาน</span>
    </div>
  </div>
</div>
${LIFF_STUB}
</body>
</html>`;
}
