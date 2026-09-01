import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/upload",
}));

// Mock the liff-context
vi.mock("@/lib/liff-context", () => ({
  LiffProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLiff: () => ({ userId: "test-user", isLoading: false }),
}));

// Mock photo lib
vi.mock("@/lib/photo", () => ({
  uploadPhoto: vi.fn(),
}));

// Mock BottomNav
vi.mock("@/components/ui/bottom-nav", () => ({
  BottomNav: () => <nav data-testid="bottom-nav" />,
}));

// Mock Button
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, loading, ...rest }: any) => (
    <button onClick={onClick} disabled={disabled || loading} className={className} data-loading={loading}>
      {children}
    </button>
  ),
}));

// Import after mocks
import UploadPage from "@/app/upload/page";

describe("Upload page — camera frame", () => {
  beforeEach(() => {
    // Mock geolocation
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (success: any) =>
          success({ coords: { latitude: 13.75, longitude: 100.5, accuracy: 10 } }),
      },
      configurable: true,
    });
  });

  it("opens file input when camera frame is tapped", () => {
    render(<UploadPage />);

    // The camera frame area should be tappable
    const cameraFrame = screen.getByTestId("camera-frame");
    const clickSpy = vi.fn();

    // Replace onClick by wrapping — but we just need to verify the element is interactive
    // and clicking it triggers the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const fileInputClick = vi.spyOn(fileInput, "click");

    fireEvent.click(cameraFrame);

    expect(fileInputClick).toHaveBeenCalled();
  });

  it("camera frame has button role for accessibility", () => {
    render(<UploadPage />);
    const cameraFrame = screen.getByTestId("camera-frame");
    expect(cameraFrame.getAttribute("role")).toBe("button");
  });
});
