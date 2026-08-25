import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LiffProvider, useLiff } from "@/lib/liff-context";

// Mock @line/liff
vi.mock("@line/liff", () => ({
  default: {
    init: vi.fn().mockResolvedValue(undefined),
    isLoggedIn: vi.fn().mockReturnValue(true),
    getProfile: vi.fn().mockResolvedValue({
      userId: "U1234567890",
      displayName: "Test User",
      pictureUrl: "https://example.com/photo.jpg",
    }),
    getAccessToken: vi.fn().mockReturnValue("test-token"),
    login: vi.fn(),
  },
}));

describe("LiffContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides default context values", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LiffProvider>{children}</LiffProvider>
    );

    const { result } = renderHook(() => useLiff(), { wrapper });

    // Wait for async init
    await new Promise((r) => setTimeout(r, 100));

    // In demo mode (no LIFF_ID), it should set demo user
    expect(result.current.userId).toBe("demo-user");
    expect(result.current.profile?.displayName).toBe("Demo User");
    expect(result.current.isLoading).toBe(false);
  });

  it("provides isLoading state", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LiffProvider>{children}</LiffProvider>
    );

    const { result } = renderHook(() => useLiff(), { wrapper });
    expect(typeof result.current.isLoading).toBe("boolean");
  });
});
