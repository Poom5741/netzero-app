import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BottomNav } from "../ui/bottom-nav";

/**
 * Farmer web navigation. The chat surface itself was removed with the /chat
 * route — farmers talk to the bot inside LINE, and the web app serves only the
 * admin and sponsor consoles (see frontend/src/app/login/page.tsx).
 */
describe("BottomNav", () => {
  it("renders nav items", () => {
    const items = [
      { icon: "photo_camera", label: "อัปโหลด", href: "/upload" },
      { icon: "bar_chart", label: "สรุปผล", href: "/summary" },
    ];
    render(<BottomNav items={items} />);
    expect(screen.getByText("อัปโหลด")).toBeInTheDocument();
    expect(screen.getByText("สรุปผล")).toBeInTheDocument();
  });

  it("marks active item", () => {
    const items = [{ icon: "bar_chart", label: "สรุปผล", href: "/summary", active: true }];
    render(<BottomNav items={items} />);
    const link = screen.getByText("สรุปผล").closest("a");
    expect(link).toHaveClass("bg-[var(--action-primary)]");
    expect(link).toHaveClass("text-white");
  });

  it("has aria-label", () => {
    render(<BottomNav items={[]} />);
    expect(screen.getByLabelText("นำทางหลัก")).toBeInTheDocument();
  });
});
