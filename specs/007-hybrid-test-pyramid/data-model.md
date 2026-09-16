# Data Model: Hybrid Test Pyramid

**Date**: 2026-09-16

## Test Fixture Schema

### WebhookFixture

Represents a single test scenario for the state machine.

```typescript
interface WebhookFixture {
  /** Unique identifier, kebab-case (e.g., "welcome-001") */
  id: string;
  
  /** Human-readable description of the scenario */
  description: string;
  
  /** State before the event is processed */
  initialState: ConversationState;
  
  /** The LINE webhook event to post */
  event: {
    type: "message" | "postback" | "follow" | "unfollow";
    source: {
      type: "user";
      userId: string;
    };
    message?: {
      type: "text";
      text: string;
      id?: string;
    };
    postback?: {
      data: string;
      params?: Record<string, string>;
    };
    timestamp: number;
  };
  
  /** Valid test signature for the event body */
  signature: string;
  
  /** Expected state after processing */
  expectedState: ConversationState;
  
  /** Expected reply payload */
  expectedReply: {
    type: "text" | "flex" | "sticker" | "image";
    text?: string;
    contents?: unknown;
    quickReply?: unknown;
  };
  
  /** Optional database changes to assert */
  databaseChanges?: Array<{
    table: string;
    operation: "insert" | "update" | "delete";
    where?: Record<string, unknown>;
    values?: Record<string, unknown>;
  }>;
}
```

### MessageSnapshot

Represents the expected output of a message builder.

```typescript
interface MessageSnapshot {
  /** Unique identifier, kebab-case (e.g., "welcome-bubble") */
  id: string;
  
  /** Builder function name (e.g., "buildWelcomeBubble") */
  builder: string;
  
  /** Input parameters for reproducibility */
  inputs: Record<string, unknown>;
  
  /** Golden JSON output */
  expectedJson: unknown;
  
  /** Optional LINE validation endpoint URL */
  validationEndpoint?: string;
}
```

### LiffAdapter

Interface abstracting the LINE LIFF SDK.

```typescript
interface LiffAdapter {
  getProfile(): Promise<{
    userId: string;
    displayName: string;
    pictureUrl: string;
    statusMessage: string;
  }>;
  
  isInClient(): boolean;
  
  getAccessToken(): string | null;
  
  openWindow(options: { url: string; external?: boolean }): void;
  
  closeWindow(): void;
}
```

## Entities

### ConversationState

The 18 states of the LINE bot conversation flow.

```typescript
type ConversationState =
  // Registration flow (OB-01 to OB-11)
  | "welcome"
  | "consent"
  | "phone"
  | "identity_confirm"
  | "conditions"
  | "registration"
  | "documents"
  | "pending_review"
  | "activation"
  | "season_setup"
  | "calendar"
  // Operational flows
  | "chat"
  | "confirm_draft"
  | "photo_report"
  | "results"
  // Legacy states (backward-compat)
  | "select_plot"
  | "identified"
  | "pending";
```

### TestUser

A test user fixture for seeding the database.

```typescript
interface TestUser {
  id: string;
  email: string;
  role: "admin" | "sponsor" | "farmer";
  name: string;
  phone?: string;
  farmerId?: string;
  lineUserId?: string;
}
```

### TestFarmer

A test farmer fixture with associated plots and seasons.

```typescript
interface TestFarmer {
  id: string;
  fullName: string;
  gender: "male" | "female" | "unspecified";
  phone: string;
  province: string;
  district: string;
  subdistrict: string;
  village: string;
  plots: TestPlot[];
  lineLinks: TestLineLink[];
}

interface TestPlot {
  id: string;
  code: string;
  deed: string;
  docType: "chanote" | "ns3k" | "ns3" | "sk1";
  tenure: "owner" | "tenant";
  areaRai: number;
  lat: number;
  lng: number;
}

interface TestLineLink {
  id: string;
  lineUserId: string;
  status: "verified" | "pending" | "rejected";
  conversationState: ConversationState;
  selectedPlotId?: string;
}
```

## Relationships

```
TestFarmer 1───* TestPlot
TestFarmer 1───* TestLineLink
TestLineLink *───1 TestUser (via lineUserId)
WebhookFixture *───1 ConversationState (initialState, expectedState)
MessageSnapshot *───1 MessageBuilder (builder)
```

## Validation Rules

1. **WebhookFixture.id**: Must be unique across all fixtures, kebab-case format
2. **WebhookFixture.initialState**: Must be one of the 18 `ConversationState` values
3. **WebhookFixture.signature**: Must be a valid HMAC-SHA256 signature of the event body using the test channel secret
4. **MessageSnapshot.id**: Must be unique across all snapshots, kebab-case format
5. **MessageSnapshot.expectedJson**: Must match the output of the specified builder with the given inputs
6. **TestUser.email**: Must be unique, format `test-{role}-{number}@netzero.test`
7. **TestFarmer.phone**: Must be a valid 10-digit Thai phone number starting with 0

## State Transitions

See `spec.md` Appendix A for the complete state transition diagram.

## Test Database Schema

The test database uses the same schema as production (D1), seeded with test fixtures:

- `users` — test admin/sponsor accounts
- `farmers` — test farmer records
- `plots` — test plot records
- `line_links` — test LINE linkage records
- `seasons` — test season records
- `photo_evidence` — test photo records
- `farmer_messages` — test message log

Each test creates a fresh database with this schema, seeds it with the required fixtures, runs the test, then destroys the database.
