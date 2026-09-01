import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock liff-context
vi.mock("@/lib/liff-context", () => ({
  LiffProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLiff: () => ({ userId: "test-user", isLoading: false }),
}));

// Mock photo module
const mockUploadPhoto = vi.fn<(...args: unknown[]) => Promise<unknown>>();
vi.mock("@/lib/photo", () => ({
  uploadPhoto: (...args: unknown[]) => mockUploadPhoto(...args),
}));

// Mock BottomNav
vi.mock("@/components/ui/bottom-nav", () => ({
  BottomNav: () => <div data-testid="bottom-nav" />,
}));

import UploadPage from "../page";

// Helper to simulate file selection
function simulateFileSelect() {
  const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(input, "files", {
    value: [file],
    writable: false,
  });
  fireEvent.change(input);
}

describe("Upload page feedback states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock FileReader with proper event target
    vi.spyOn(FileReader.prototype, "readAsDataURL").mockImplementation(function (this: FileReader) {
      const result = "data:image/jpeg;base64,fakedata";
      Object.defineProperty(this, "result", { value: result, writable: false });
      const event = new Event("load");
      Object.defineProperty(event, "target", { value: this });
      this.onload?.(event as ProgressEvent<FileReader>);
    });
    // Mock fetch for data URL → blob conversion
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(["test"], { type: "image/jpeg" })),
    } as Response);
    // Mock geolocation to succeed by default
    Object.defineProperty(global.navigator, "geolocation", {
      value: {
        getCurrentPosition: (success: (pos: GeolocationPosition) => void) => {
          success({
            coords: { latitude: 13.75, longitude: 100.5, accuracy: 10 },
            timestamp: Date.now(),
          } as GeolocationPosition);
        },
      },
      writable: true,
      configurable: true,
    });
  });

  it("shows photo preview with retake and upload buttons after capture", async () => {
    render(<UploadPage />);

    // Select photo type first
    await waitFor(() => {
      expect(screen.getByText("เตรียมดิน")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("เตรียมดิน"));

    // Wait for capture button to be enabled
    await waitFor(() => {
      expect(screen.getByText("ถ่ายรูป")).toBeInTheDocument();
    });

    // Click capture button
    fireEvent.click(screen.getByText("ถ่ายรูป"));

    // Simulate file selection
    simulateFileSelect();

    // Should show preview with retake and upload buttons
    await waitFor(() => {
      expect(screen.getByAltText("Preview")).toBeInTheDocument();
      expect(screen.getByText("ถ่ายใหม่")).toBeInTheDocument();
      expect(screen.getByText("อัปโหลด")).toBeInTheDocument();
    });
  });

  it("shows loading state on upload button during upload", async () => {
    let resolveUpload: (() => void) | null = null;
    (mockUploadPhoto as any).mockImplementation(() => new Promise((resolve) => { 
      resolveUpload = () => resolve({ verdict: "pre_verified" }); 
    }));
    render(<UploadPage />);

    // Select photo type
    await waitFor(() => expect(screen.getByText("เตรียมดิน")).toBeInTheDocument());
    fireEvent.click(screen.getByText("เตรียมดิน"));

    await waitFor(() => expect(screen.getByText("ถ่ายรูป")).toBeInTheDocument());
    fireEvent.click(screen.getByText("ถ่ายรูป"));
    simulateFileSelect();

    await waitFor(() => expect(screen.getByText("อัปโหลด")).toBeInTheDocument());
    fireEvent.click(screen.getByText("อัปโหลด"));

    // Button should show loading spinner
    await waitFor(() => {
      const btn = screen.getByText("อัปโหลด").closest("button");
      expect(btn?.querySelector("svg.animate-spin")).toBeInTheDocument();
    });

    // Cleanup
    (resolveUpload as (() => void) | null)?.();
  });

  it("shows success screen with green checkmark and navigate-to-chat button after successful upload", async () => {
    (mockUploadPhoto as any).mockResolvedValue({
      verdict: "pre_verified",
      water_state: "flooded",
    });
    render(<UploadPage />);

    // Select photo type
    await waitFor(() => expect(screen.getByText("เตรียมดิน")).toBeInTheDocument());
    fireEvent.click(screen.getByText("เตรียมดิน"));

    await waitFor(() => expect(screen.getByText("ถ่ายรูป")).toBeInTheDocument());
    fireEvent.click(screen.getByText("ถ่ายรูป"));
    simulateFileSelect();

    await waitFor(() => expect(screen.getByText("อัปโหลด")).toBeInTheDocument());
    fireEvent.click(screen.getByText("อัปโหลด"));

    // Should show success state
    await waitFor(() => {
      expect(screen.getByText("อัปโหลดสำเร็จ")).toBeInTheDocument();
      expect(screen.getByText("กลับไปแชท")).toBeInTheDocument();
    });

    // Click navigate button
    fireEvent.click(screen.getByText("กลับไปแชท"));
    expect(mockPush).toHaveBeenCalledWith("/chat");
  });

  it("shows error banner with retry on upload failure", async () => {
    (mockUploadPhoto as any).mockRejectedValue(new Error("Network error"));
    render(<UploadPage />);

    // Select photo type
    await waitFor(() => expect(screen.getByText("เตรียมดิน")).toBeInTheDocument());
    fireEvent.click(screen.getByText("เตรียมดิน"));

    await waitFor(() => expect(screen.getByText("ถ่ายรูป")).toBeInTheDocument());
    fireEvent.click(screen.getByText("ถ่ายรูป"));
    simulateFileSelect();

    await waitFor(() => expect(screen.getByText("อัปโหลด")).toBeInTheDocument());
    fireEvent.click(screen.getByText("อัปโหลด"));

    // Should show error state
    await waitFor(() => {
      expect(screen.getByText("อัปโหลดไม่สำเร็จ กรุณาลองใหม่")).toBeInTheDocument();
    });

    // Retry button should be present
    expect(screen.getByText("ลองใหม่")).toBeInTheDocument();
  });

  it("shows GPS warning in orange with actionable text when GPS fails", async () => {
    // Override geolocation to fail
    Object.defineProperty(global.navigator, "geolocation", {
      value: {
        getCurrentPosition: (_success: unknown, error: (err: { code: number; message: string }) => void) => {
          error({ code: 1, message: "User denied" });
        },
      },
      writable: true,
      configurable: true,
    });

    render(<UploadPage />);

    await waitFor(() => {
      expect(
        screen.getByText("ไม่มี GPS — เปิด Location Services เพื่อระบุตำแหน่ง"),
      ).toBeInTheDocument();
    });

    // Check that the warning has orange styling (not red/error)
    const warningEl = screen.getByText("ไม่มี GPS — เปิด Location Services เพื่อระบุตำแหน่ง");
    const container = warningEl.closest("div");
    expect(container).not.toHaveClass("bg-error-container/20");
    expect(container).toHaveClass("bg-orange-50");
  });
});
