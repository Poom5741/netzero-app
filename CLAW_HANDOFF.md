# Claw Agent Handoff: NetZeroCarbon Browser Testing

## Environment Status
✅ Backend running: http://localhost:8787 (Cloudflare Workers)
✅ Frontend running: http://localhost:3000 (Next.js 16.3)
✅ Database initialized: D1 with demo data (3 farmers, 3 plots)
✅ API proxy configured: /api/* routes to backend

## Test Flows

### Flow 1: Chat Interface (/chat)
**URL**: http://localhost:3000/chat

**Steps**:
1. Navigate to /chat
2. Wait for welcome message: "สวัสดีครับ! 🌿 ยินดีต้อนรับสู่ NetZeroCarbon"
3. Type "สวัสดี" in input field (placeholder: "พิมพ์ข้อความ...")
4. Click send button (icon: "send")
5. Expect bot response: "กรุณายอมรับเงื่อนไขก่อนใช้งาน พิมพ์ 'ยอมรับ' เพื่อยอมรับเงื่อนไขทั้งหมด"
6. Type "ยอมรับ" and send
7. Expect: "✅ ยอมรับเงื่อนไขเรียบร้อยแล้วค่ะ กรุณาพิมพ์เบอร์โทรศัพท์ของท่านเพื่อผูกบัญชี (เช่น 0812345678)"
8. Type "0812345678" and send
9. Expect: Phone verification response

**UI Elements**:
- Header: "Chat Hub" with eco icon
- Bottom nav: แชท (chat), อัปโหลด (upload), สรุป (summary)
- Quick actions: ส่งรูปถ่าย, สรุปฤดู, สอบถาม
- Input bar: text input + send button

### Flow 2: Photo Upload (/upload)
**URL**: http://localhost:3000/upload

**Steps**:
1. Navigate to /upload
2. See camera viewfinder with message: "แตะเพื่อถ่ายรูปแปลงนา"
3. Click "ถ่ายรูป" button
4. Note: Camera requires browser permissions (may fail in headless mode)
5. Location section shows: "กำลังค้นหาตำแหน่ง..."

**UI Elements**:
- Camera viewfinder (center)
- Location status (below camera)
- Bottom nav same as /chat

### Flow 3: Sponsor Dashboard (/sponsor)
**URL**: http://localhost:3000/sponsor

**Steps**:
1. Navigate to /sponsor
2. Verify KPI cards display:
   - "CO₂ ที่ลดทั้งหมด": 78 ตัน (+12%)
   - "แปลงที่ได้รับการสนับสนุน": 8 แปลง
   - "การลงทุนทั้งหมด": $16,000
3. Scroll to see regional breakdown:
   - พระนครศรีอยุธยา: 3 แปลง, 30.50 ตัน
   - สุพรรณบุรี: 3 แปลง, 32.70 ตัน
   - นครปฐม: 2 แปลง, 14.90 ตัน
4. Check real-time calculation panel (bottom right)

**UI Elements**:
- Sidebar: NetZero logo, navigation links
- Header: search bar, notifications, settings
- Main content: KPI cards, regional groups, progress bars

### Flow 4: Admin Dashboard (/admin)
**URL**: http://localhost:3000/admin

**Steps**:
1. Navigate to /admin
2. Expect 401 error (requires authentication)
3. Console will show: "Failed to load resource: 401 (Unauthorized)"
4. This is expected behavior - admin routes require session cookie

**Note**: Admin dashboard UI loads but API calls fail without auth. To test fully, need to implement login flow first.

## API Endpoints (via proxy)

All API calls from frontend automatically proxy to backend:

- `POST /api/chat` - Send chat message, get AI response
- `GET /api/admin/review` - Get photo review queue (requires auth)
- `POST /api/admin/review/:photoId` - Review a photo (requires auth)
- `GET /api/photo/:photoId` - Get photo from R2 storage

## Demo User Context

The frontend runs in **demo mode** (no LIFF ID configured):
- User ID: `demo-user`
- Display Name: `Demo User`
- No LINE login required

## Expected Behavior

### Working Features
✅ Chat with AI (OpenRouter integration)
✅ Photo upload UI (camera interface)
✅ Sponsor dashboard (static data)
✅ Admin dashboard UI (API requires auth)
✅ Bottom navigation
✅ Glassmorphic/claymorphic design

### Known Limitations
⚠️ Camera requires browser permissions
⚠️ Admin API requires authentication (not implemented in frontend)
⚠️ AI responses depend on OpenRouter API availability

## Troubleshooting

**Backend errors**: Check `/tmp/backend.log`
**Frontend errors**: Check `/tmp/frontend.log`
**Database issues**: Run `npm run db:init` to reset

## Success Criteria

Agent should verify:
1. ✅ Can navigate between all pages
2. ✅ Chat accepts input and displays messages
3. ✅ Bot responds to user messages
4. ✅ Sponsor dashboard shows KPI data
5. ✅ UI renders with correct styling (glassmorphism, claymorphism)
6. ✅ Bottom navigation works
7. ✅ No JavaScript errors in console (except expected 401 on /admin)

## Restart Commands

If servers stop:
```bash
# Start both
npm run dev:all

# Or separately
npm run dev          # Backend on :8787
npm run dev:frontend # Frontend on :3000
```
