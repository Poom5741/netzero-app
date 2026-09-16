/**
 * LIFF Adapter Contract
 * 
 * This interface abstracts the LINE LIFF SDK for testability.
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
  /**
   * Get the current user's profile.
   * Production: calls liff.getProfile()
   * Test: returns the profile provided in constructor
   */
  getProfile(): Promise<LiffProfile>;

  /**
   * Check if the app is running inside the LINE client.
   * Production: returns liff.isInClient()
   * Test: always returns true
   */
  isInClient(): boolean;

  /**
   * Get the LIFF access token.
   * Production: returns liff.getAccessToken()
   * Test: returns the token provided in constructor
   */
  getAccessToken(): string | null;

  /**
   * Open a URL in the LINE browser or external browser.
   * Production: calls liff.openWindow(options)
   * Test: logs the call for assertion
   */
  openWindow(options: OpenWindowOptions): void;

  /**
   * Close the LIFF app window.
   * Production: calls liff.closeWindow()
   * Test: no-op
   */
  closeWindow(): void;
}

/**
 * Production implementation using the real LIFF SDK.
 */
export class RealLiffAdapter implements LiffAdapter {
  constructor(private liff: any) {
    // In production, this would be the actual liff object from @line/liff
  }

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
 */
export class FakeLiffAdapter implements LiffAdapter {
  private callLog: Array<{ method: string; args: any[] }> = [];

  constructor(
    private profile: LiffProfile,
    private token: string
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

  /**
   * Get the call log for test assertions.
   */
  getCallLog(): Array<{ method: string; args: any[] }> {
    return this.callLog;
  }

  /**
   * Reset the call log.
   */
  resetCallLog(): void {
    this.callLog = [];
  }
}

/**
 * Factory function to create the appropriate adapter based on environment.
 */
export function createLiffAdapter(): LiffAdapter {
  if (process.env.NODE_ENV === "test") {
    return new FakeLiffAdapter(
      {
        userId: "U-test-user-001",
        displayName: "Test Farmer",
        pictureUrl: "https://example.com/picture.jpg",
        statusMessage: "Testing",
      },
      "test-access-token-xxx"
    );
  }

  // Production: would import and use the actual LIFF SDK
  // const liff = await import("@line/liff");
  // return new RealLiffAdapter(liff);
  throw new Error("RealLiffAdapter requires @line/liff SDK");
}
