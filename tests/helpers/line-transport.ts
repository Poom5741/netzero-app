/**
 * Fake LINE transport — captures outgoing pushMessage calls for assertion.
 *
 * In production, pushMessage() from src/line/reply.ts makes HTTP calls to LINE.
 * In tests, this fake captures the calls so tests can assert on reply payloads
 * without sending real messages.
 */

export interface PushedMessage {
  token: string;
  userId: string;
  messages: Array<{
    type: string;
    text?: string;
    altText?: string;
    contents?: unknown;
    quickReply?: unknown;
  }>;
}

/**
 * Fake LINE transport that captures all push calls.
 */
export class FakeLineTransport {
  public pushedMessages: PushedMessage[] = [];

  /**
   * Capture a push call (replaces pushMessage in tests).
   */
  async push(
    token: string,
    userId: string,
    messages: Array<{
      type: string;
      text?: string;
      altText?: string;
      contents?: unknown;
      quickReply?: unknown;
    }>,
  ): Promise<{ status: number; body: string }> {
    this.pushedMessages.push({ token, userId, messages });
    return { status: 200, body: "ok" };
  }

  /**
   * Get the last pushed message set.
   */
  getLastPush(): PushedMessage | undefined {
    return this.pushedMessages[this.pushedMessages.length - 1];
  }

  /**
   * Get all pushed messages for a specific user.
   */
  getPushesForUser(userId: string): PushedMessage[] {
    return this.pushedMessages.filter((m) => m.userId === userId);
  }

  /**
   * Clear all captured pushes.
   */
  reset(): void {
    this.pushedMessages = [];
  }
}

/**
 * Create a fake pushMessage function that can be injected into handleFlow.
 */
export function createFakePushMessage(transport: FakeLineTransport) {
  return async (
    token: string,
    userId: string,
    messages: Array<{
      type: string;
      text?: string;
      altText?: string;
      contents?: unknown;
      quickReply?: unknown;
    }>,
  ) => {
    return transport.push(token, userId, messages);
  };
}
