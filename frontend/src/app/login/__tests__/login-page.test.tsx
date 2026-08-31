import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../page";

// Mock apiRequest
vi.mock("@/lib/api", () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from "@/lib/api";
const mockApiRequest = vi.mocked(apiRequest);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).location;
    (window as any).location = { href: "" };
  });

  it("renders Thai login form", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /เข้าสู่ระบบ/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/อีเมล/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/รหัสผ่าน/i)).toBeInTheDocument();
  });

  it("redirects to /admin on successful admin login", async () => {
    mockApiRequest.mockResolvedValue({ ok: true, status: 200, data: { email: "a@n.local", role: "admin" } });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/อีเมล/i), { target: { value: "admin@netzero.local" } });
    fireEvent.change(screen.getByLabelText(/รหัสผ่าน/i), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: /เข้าสู่ระบบ/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("/admin");
    });
  });

  it("redirects to /sponsor on successful sponsor login", async () => {
    mockApiRequest.mockResolvedValue({ ok: true, status: 200, data: { email: "s@n.local", role: "sponsor" } });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/อีเมล/i), { target: { value: "sponsor@netzero.local" } });
    fireEvent.change(screen.getByLabelText(/รหัสผ่าน/i), { target: { value: "sponsor123" } });
    fireEvent.click(screen.getByRole("button", { name: /เข้าสู่ระบบ/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("/sponsor");
    });
  });

  it("shows error message on failed login", async () => {
    mockApiRequest.mockResolvedValue({ ok: false, status: 401, data: { error: "Invalid credentials" } });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/อีเมล/i), { target: { value: "wrong@netzero.local" } });
    fireEvent.change(screen.getByLabelText(/รหัสผ่าน/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /เข้าสู่ระบบ/i }));

    await waitFor(() => {
      expect(screen.getByText(/อีเมลหรือรหัสผ่านไม่ถูกต้อง/i)).toBeInTheDocument();
    });
  });
});
