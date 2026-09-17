# Contract: Workers AI Integration Test

**Requirement**: R5 | **Date**: 2026-09-17

## Purpose

Verify Workers AI vision model works with real API (or mock in CI).

## Interface

### Classify Photo

**Endpoint**: `POST /photo/classify`

**Request**:
```
Content-Type: multipart/form-data
Fields:
  - photo: File (JPEG, <10MB)
```

**Response** (200 OK):
```json
{
  "valid": true,
  "water_state": "flooded|dry|partially_flooded",
  "confidence": 0.95,
  "reason": "เห็นน้ำขังชัดเจน"
}
```

**Response** (Timeout >10s):
```json
{
  "error": "AI_TIMEOUT",
  "message": "Vision model took >10s to respond"
}
```

## Test Scenarios

### Scenario 1: Successful Classification

**Given**: Test photo with clear flooded field
**When**: POST `/photo/classify`
**Then**:
- Response status: 200
- Response contains `valid: true`
- Response contains `water_state` (enum)
- Response contains `confidence` (0.0-1.0)
- Response contains `reason` (string)

### Scenario 2: Timeout Handling

**Given**: Mock AI that delays >10s
**When**: POST `/photo/classify`
**Then**:
- Response status: 200 (not 500)
- Response contains `error: "AI_TIMEOUT"`
- No crash or unhandled exception

### Scenario 3: Response Shape Validation

**Given**: AI classification response
**When**: Parse response
**Then**:
- `valid` is boolean
- `water_state` is one of: flooded, dry, partially_flooded
- `confidence` is number between 0.0 and 1.0
- `reason` is non-empty string

## Test Data

**Photo**: `tests/fixtures/test-photo.jpg` (1MB JPEG)
**Mock AI Response**:
```json
{
  "valid": true,
  "water_state": "flooded",
  "confidence": 0.95,
  "reason": "เห็นน้ำขังชัดเจน"
}
```

## Assertions

```typescript
expect(res.status).toBe(200);
expect(body.valid).toBe(true);
expect(body.water_state).toMatch(/^(flooded|dry|partially_flooded)$/);
expect(body.confidence).toBeGreaterThanOrEqual(0);
expect(body.confidence).toBeLessThanOrEqual(1);
expect(body.reason).toBeTruthy();
```

## Mock Strategy

**Unit Tests**: Use deterministic fixtures (no real AI call)
**Integration Tests**: Use miniflare mock (no real Cloudflare account)
**Production**: Use real Workers AI binding

**Mock Implementation**:
```typescript
// tests/helpers/mock-ai.ts
export function createMockAI() {
  return {
    run: async (model: string, inputs: any) => {
      // Simulate 100ms delay
      await new Promise(r => setTimeout(r, 100));
      return {
        valid: true,
        water_state: "flooded",
        confidence: 0.95,
        reason: "เห็นน้ำขังชัดเจน"
      };
    }
  };
}
```

## Timeout Test

```typescript
it("handles timeout gracefully", async () => {
  const slowAI = {
    run: async () => {
      await new Promise(r => setTimeout(r, 11000)); // >10s
      return { valid: true, water_state: "flooded", confidence: 0.9, reason: "test" };
    }
  };
  
  const res = await classifyPhoto(slowAI, testPhoto);
  expect(res.error).toBe("AI_TIMEOUT");
});
```
