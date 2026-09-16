/**
 * LIFF Adapter — abstracts the LINE LIFF SDK for testability.
 *
 * Production uses RealLiffAdapter (wraps the actual LIFF SDK).
 * Tests use FakeLiffAdapter (returns deterministic test data).
 */

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl: string;
  statusMessage: string;
}

export interface OpenWindowOptions {
  url: string;
  external?: boolean;
}

export interface LiffAdapter {
  getProfile(): Promise<LiffProfile>;
  isInClient(): boolean;
  getAccessToken(): string | null;
  openWindow(options: OpenWindowOptions): void;
  closeWindow(): void;
}

/**
 * Production implementation using the real LIFF SDK.
 * ponytail: Only wraps liff.* calls; upgrade path is adding retry/error handling.
 */
export class RealLiffAdapter implements LiffAdapter {
  constructor(private liff: any) {}

  async getProfile(): Promise<LiffProfile> {
    return await this.liff.getProfile();
  }

  isInClient(): boolean {
    return this.liff.isInClient();
  }

  getAccessToken(): string | null {
    return this.liff.getAccessToken();
  }

  openWindow(options: OpenWindowOptions): void {
    this.liff.openWindow(options);
  }

  closeWindow(): void {
    this.liff.closeWindow();
  }
}

/**
 * Test implementation returning deterministic data.
 * Records all calls for assertion in tests.
 */
export class FakeLiffAdapter implements LiffAdapter {
  private callLog: Array<{ method: string; args: any[] }> = [];

  constructor(
    private profile: LiffProfile,
    private token: string,
  ) {}

  async getProfile(): Promise<LiffProfile> {
    this.callLog.push({ method: "getProfile", args: [] });
    return this.profile;
  }

  isInClient(): boolean {
    this.callLog.push({ method: "isInClient", args: [] });
    return true;
  }

  getAccessToken(): string | null {
    this.callLog.push({ method: "getAccessToken", args: [] });
    return this.token;
  }

  openWindow(options: OpenWindowOptions): void {
    this.callLog.push({ method: "openWindow", args: [options] });
  }

  closeWindow(): void {
    this.callLog.push({ method: "closeWindow", args: [] });
  }

  getCallLog(): Array<{ method: string; args: any[] }> {
    return this.callLog;
  }

  resetCallLog(): void {
    this.callLog = [];
  }
}

/**
 * Default test profile for use in tests.
 */
export const TEST_LIFF_PROFILE: LiffProfile = {
  userId: "U-test-user-001",
  displayName: "Test Farmer",
  pictureUrl: "https://example.com/picture.jpg",
  statusMessage: "Testing",
};

export const TEST_LIFF_TOKEN = "test-access-token-xxx";
