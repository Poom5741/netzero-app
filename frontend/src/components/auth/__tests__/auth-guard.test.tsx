import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthGuard } from "../auth-guard";

// Mock apiRequest
vi.mock("@/lib/api", () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from "@/lib/api";
const mockApiRequest = vi.mocked(apiRequest);

describe("AuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href
    delete (window as any).location;
    (window as any).location = { href: "" };
  });

  it("redirects to /login when /me returns 401", async () => {
    mockApiRequest.mockResolvedValue({ ok: false, status: 401, data: {} });

    render(
      <AuthGuard requiredRole="admin">
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(window.location.href).toBe("/login");
    });
  });

  it("shows access denied when role mismatches", async () => {
    mockApiRequest.mockResolvedValue({ ok: true, status: 200, data: { email: "s@n.local", role: "sponsor" } });

    render(
      <AuthGuard requiredRole="admin">
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /ไม่มีสิทธิ์เข้าถึง/i })).toBeInTheDocument();
    });
  });

  it("renders children when role matches", async () => {
    mockApiRequest.mockResolvedValue({ ok: true, status: 200, data: { email: "a@n.local", role: "admin" } });

    render(
      <AuthGuard requiredRole="admin">
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  it("allows admin role to access sponsor pages", async () => {
    mockApiRequest.mockResolvedValue({ ok: true, status: 200, data: { email: "a@n.local", role: "admin" } });

    render(
      <AuthGuard requiredRole="sponsor">
        <div>Sponsor Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText("Sponsor Content")).toBeInTheDocument();
    });
  });
});
