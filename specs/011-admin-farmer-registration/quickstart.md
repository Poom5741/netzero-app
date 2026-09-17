# Quickstart: Admin Farmer Registration Validation

## Prerequisites

- Node.js 18+ installed
- Wrangler CLI installed for Cloudflare Workers
- Access to the admin dashboard with appropriate permissions
- Valid database connection with farmers table schema

## Setup Commands

```bash
# Install dependencies
npm install

# Run database migrations (if needed)
wrangler d1 migrations apply

# Start development server
npm run dev
```

## Validation Scenarios

### Scenario 1: Admin Creates New Farmer Successfully

1. Navigate to admin farmers page (`/admin/farmers`)
2. Click "Add Farmer" button
3. Fill in required fields:
   - Full name: "Test Farmer"
   - Phone: "0812345678" (10 digits, starts with 0)
   - Gender: Select from dropdown
   - Address fields: Fill as needed
4. Submit the form
5. Verify farmer appears in the farmer list
6. Verify success message is displayed

**Expected outcome**: Farmer is created in the database with status "Newly Created"

### Scenario 2: Admin Attempts to Create Farmer with Existing Phone

1. Create a farmer with phone number "0812345678"
2. Attempt to create another farmer with the same phone number
3. Submit the form

**Expected outcome**: Error message "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว" (Phone number already in use) is displayed

### Scenario 3: Admin Enters Invalid Phone Format

1. Navigate to add farmer form
2. Enter phone number that doesn't match format (e.g., "12345", "081234567890")
3. Submit the form

**Expected outcome**: Error message "เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้ยต้นด้วย 0 และมีความยาว 10 หลัก)" (Invalid phone format) is displayed

### Scenario 4: Farmer Created via Admin Registers via LINE

1. Create a farmer via admin dashboard
2. Use LINE chat to register with the same phone number
3. Follow the existing LINE registration flow

**Expected outcome**: LINE flow recognizes the farmer and allows registration to proceed normally

### Scenario 5: Audit Log Verification

1. Create a farmer via admin dashboard
2. Check audit logs in the system
3. Verify entry exists with action "farmer.create"

**Expected outcome**: Audit log entry exists with admin user ID, timestamp, and farmer details

## Test Commands

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests for admin functionality
npm run test:e2e

# Run specific farmer creation tests
npm run test -t "farmer creation"
```

## API Endpoint Validation

```bash
# Test farmer creation endpoint directly
curl -X POST http://localhost:8787/api/admin/farmers \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Farmer",
    "phone": "0812345678",
    "gender": "male",
    "addr_province": "Bangkok",
    "addr_district": "Phaya Thai",
    "addr_subdistrict": "Thanon Phaya Thai"
  }'

# Expected response: 201 Created with farmer object
```

## Success Criteria

- [ ] Admin can create new farmers through the dashboard UI
- [ ] Phone number validation works on both client and server side
- [ ] Duplicate phone numbers are prevented with appropriate error messages
- [ ] Newly created farmers can register via LINE immediately
- [ ] Audit logs capture farmer creation activities
- [ ] Form submission completes within 2 seconds
- [ ] All validation scenarios pass
- [ ] All tests pass (unit, integration, e2e)