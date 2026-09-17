# Contract: LINE Webhook Integration Test

**Requirement**: R6 | **Date**: 2026-09-17

## Purpose

Verify LINE webhook signature verification works with real LINE API (or test channel).

## Interface

### Webhook Endpoint

**Endpoint**: `POST /line/webhook`

**Headers**:
```
Content-Type: application/json
X-Line-Signature: <base64-hmac-sha256>
```

**Request Body** (LINE Message Event):
```json
{
  "destination": "U1234567890abcdef",
  "events": [
    {
      "type": "message",
      "mode": "active",
      "timestamp": 1234567890123,
      "source": {
        "type": "user",
        "userId": "U1234567890abcdef"
      },
      "replyToken": "0f3779fba3b349968c5d07db31eabcd5",
      "message": {
        "type": "text",
        "id": "1234567890",
        "text": "สวัสดี"
      }
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "status": "ok"
}
```

**Response** (401 Unauthorized):
```json
{
  "error": "Invalid signature"
}
```

## Signature Algorithm

**Input**:
- `channelSecret`: string (from `.dev.vars`)
- `body`: JSON string (request body)

**Process**:
```typescript
import { createHmac } from 'crypto';

const signature = createHmac('sha256', channelSecret)
  .update(body)
  .digest('base64');
```

**Output**: Base64-encoded HMAC-SHA256

**Header**: `X-Line-Signature: <signature>`

## Test Scenarios

### Scenario 1: Valid Signature

**Given**: Test payload with valid signature
**When**: POST `/line/webhook` with `X-Line-Signature` header
**Then**:
- Response status: 200
- Response body: `{ "status": "ok" }`
- Audit log entry created
- Webhook processed (reply sent or state updated)

### Scenario 2: Invalid Signature

**Given**: Test payload with invalid signature
**When**: POST `/line/webhook` with wrong `X-Line-Signature`
**Then**:
- Response status: 401
- Response body: `{ "error": "Invalid signature" }`
- No audit log entry
- Webhook not processed

### Scenario 3: Missing Signature

**Given**: Test payload without `X-Line-Signature` header
**When**: POST `/line/webhook`
**Then**:
- Response status: 401
- Response body: `{ "error": "Missing signature" }`
- No audit log entry

### Scenario 4: Malformed JSON

**Given**: Invalid JSON body
**When**: POST `/line/webhook`
**Then**:
- Response status: 400
- Response body: `{ "error": "Malformed JSON" }`

## Test Data

**Payload**: `tests/fixtures/line-webhook-payload.json`
**Channel Secret**: `.dev.vars` → `LINE_CHANNEL_SECRET`
**Fallback**: If missing, skip test with warning

**Payload Structure**:
```json
{
  "destination": "U1234567890abcdef",
  "events": [
    {
      "type": "message",
      "mode": "active",
      "timestamp": 1234567890123,
      "source": {
        "type": "user",
        "userId": "U1234567890abcdef"
      },
      "replyToken": "0f3779fba3b349968c5d07db31eabcd5",
      "message": {
        "type": "text",
        "id": "1234567890",
        "text": "สวัสดี"
      }
    }
  ]
}
```

## Assertions

```typescript
// Valid signature
expect(res.status).toBe(200);
expect(body.status).toBe("ok");

// Invalid signature
expect(res.status).toBe(401);
expect(body.error).toBe("Invalid signature");

// Audit log
const auditEntry = await db.prepare(
  "SELECT * FROM audit_log WHERE actor_type = 'machine' AND action = 'webhook_received'"
).first();
expect(auditEntry).not.toBeNull();
```

## Signature Generation

```typescript
import { createHmac } from 'crypto';

function generateSignature(body: string, channelSecret: string): string {
  return createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');
}

// Test usage
const payload = JSON.stringify(lineWebhookPayload);
const signature = generateSignature(payload, process.env.LINE_CHANNEL_SECRET);

const res = await fetch('http://localhost:8787/line/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Line-Signature': signature
  },
  body: payload
});
```

## Fallback Strategy

**If LINE_CHANNEL_SECRET missing**:
```typescript
it("processes webhook with valid signature", async () => {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    console.warn("LINE_CHANNEL_SECRET not set, skipping test");
    return;
  }
  
  // ... test code
});
```

## Security Notes

- Never commit `LINE_CHANNEL_SECRET` to source
- Use `.dev.vars` for local development
- Use GitHub Secrets for CI
- Test with test channel, not production channel
