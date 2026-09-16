# Real-Device Smoke Test Checklist

**Purpose**: Verify the complete farmer experience on a physical iPhone or Android phone before each release.

**Estimated Time**: 10-15 minutes

**Prerequisites**:
- Test OA credentials (from team password manager, NOT in source code)
- Test LIFF channel configured
- Test database seeded with test farmer accounts
- Physical device with LINE app installed

---

## Pre-Flight Checks

- [ ] **1. Test OA Setup**: Verify test OA webhook points to test environment (not production)
- [ ] **2. Test Account**: Confirm test farmer account exists in test database with phone "0812345678"
- [ ] **3. LINE App**: Ensure LINE app is logged in with test user account

---

## Welcome & Registration Flow

- [ ] **4. Welcome Message**: Add test OA as friend → verify welcome message renders with farmer name and "เริ่มผูกบัญชี" button
- [ ] **5. Consent Flow**: Tap "เริ่มผูกบัญชี" → verify PDPA consent message appears with 4 checkboxes
- [ ] **6. Phone Verification**: Send phone number "0812345678" → verify identity confirmation shows farmer name and location
- [ ] **7. Conditions Acceptance**: Tap "ใช่" → verify 3 project conditions appear → tap "ยอมรับ"
- [ ] **8. Registration Link**: Verify LIFF registration form link appears → tap and verify form opens in LINE browser

---

## Rich Menu Verification

- [ ] **9. Rich Menu Rendering**: Verify 6-item rich menu displays correctly (3x2 grid)
- [ ] **10. Calendar Tap**: Tap "ปฏิทิน" region → verify calendar page opens with season data
- [ ] **11. Camera Tap**: Tap "ถ่ายรูป" region → verify camera page opens with GPS permission prompt
- [ ] **12. Summary Tap**: Tap "สรุปผล" region → verify dashboard shows carbon estimate and photo progress
- [ ] **13. Contact Tap**: Tap "ติดต่อเจ้าหน้าที่" region → verify contact information appears

---

## Photo Upload & GPS

- [ ] **14. Photo Upload**: From camera page, select a photo → verify upload succeeds with EXIF coordinates
- [ ] **15. GPS Metadata**: Verify photo confirmation shows plot location from GPS coordinates
- [ ] **16. GPS Denied**: Reopen camera with GPS permission denied → verify photo uploads but shows "GPS ไม่พร้อมใช้งาน"

---

## Thai Text Rendering

- [ ] **17. Small Screen (iPhone SE)**: Verify Thai text wraps correctly in Flex messages without truncation
- [ ] **18. Large Screen (iPhone Pro Max)**: Verify Thai text displays properly with no layout breakage

---

## Rejection & Retake Flow

- [ ] **19. Rejection Message**: Trigger a photo rejection → verify rejection message shows reason and retake link
- [ ] **20. Retake Link**: Tap retake link → verify LIFF camera opens with correct plot and season context

---

## Blocked & Pending States

- [ ] **21. Pending Review**: Send any message while in `pending_review` state → verify waiting message appears
- [ ] **22. Blocked Account**: Verify blocked account cannot send messages (test with admin-blocked user)

---

## Edge Cases

- [ ] **23. Expired LIFF Session**: Open LIFF page after session expires → verify error state with retry option
- [ ] **24. Duplicate Photo**: Upload same photo twice → verify system handles duplicate gracefully
- [ ] **25. Network Loss**: Start photo upload then disconnect network → verify error message and retry option

---

## Post-Test

- [ ] **26. Cleanup**: Reset test farmer state to `welcome` for next test run
- [ ] **27. Log Results**: Record any failures or issues in test report

---

## Notes

- **Test OA Credentials**: Stored in team password manager (1Password/Bitwarden) under "NetZeroCarbon Test OA"
- **Test Database**: Separate from production, reset before each test cycle
- **Device Sharing**: Single physical device shared among team — coordinate schedule
- **Frequency**: Complete this checklist before each production release

---

## Troubleshooting

**Welcome message doesn't appear**:
- Check webhook URL in LINE Developers Console points to test environment
- Verify test OA is not in development mode (must be published)

**Rich menu doesn't display**:
- Rich menus are unavailable in LINE for Mac/Windows — use mobile device
- Verify rich menu is uploaded via LINE Messaging API

**LIFF page shows blank**:
- Check LIFF channel ID matches test environment
- Verify LIFF URL is whitelisted in LINE Developers Console

**GPS coordinates not captured**:
- Ensure device location services are enabled for LINE app
- Check photo EXIF data is preserved during upload
