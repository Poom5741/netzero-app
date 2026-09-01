import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChatBubble } from "../ui/chat-bubble";
import { QuickActions } from "../ui/quick-actions";
import { BottomNav } from "../ui/bottom-nav";
import { TypingIndicator } from "../ui/typing-indicator";
import { getQuickActions } from "../ui/quick-actions";

describe("ChatBubble", () => {
  it("renders system message with glassmorphic style", () => {
    render(
      <ChatBubble type="system" timestamp="09:00">
        <p>Hello</p>
      </ChatBubble>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
  });

  it("renders user message with claymorphic style", () => {
    render(
      <ChatBubble type="user" timestamp="09:05">
        <p>Hi there</p>
      </ChatBubble>,
    );
    expect(screen.getByText("Hi there")).toBeInTheDocument();
    expect(screen.getByText("09:05")).toBeInTheDocument();
  });

  it("renders with custom avatar", () => {
    render(
      <ChatBubble type="system" avatar={<span data-testid="custom-avatar">AV</span>}>
        <p>Message</p>
      </ChatBubble>,
    );
    expect(screen.getByTestId("custom-avatar")).toBeInTheDocument();
  });
});

describe("QuickActions", () => {
  it("renders action buttons", () => {
    const actions = [
      { icon: "camera", label: "Photo", onClick: () => {} },
      { icon: "help", label: "Help", onClick: () => {} },
    ];
    render(<QuickActions actions={actions} />);
    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("Help")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    let clicked = false;
    const actions = [{ icon: "camera", label: "Photo", onClick: () => { clicked = true; } }];
    render(<QuickActions actions={actions} />);
    screen.getByText("Photo").click();
    expect(clicked).toBe(true);
  });
});

describe("BottomNav", () => {
  it("renders nav items", () => {
    const items = [
      { icon: "chat", label: "แชท", href: "/chat", active: true },
      { icon: "camera", label: "อัปโหลด", href: "/upload" },
    ];
    render(<BottomNav items={items} />);
    expect(screen.getByText("แชท")).toBeInTheDocument();
    expect(screen.getByText("อัปโหลด")).toBeInTheDocument();
  });

  it("marks active item", () => {
    const items = [{ icon: "chat", label: "แชท", href: "/chat", active: true }];
    render(<BottomNav items={items} />);
    const link = screen.getByText("แชท").closest("a");
    expect(link).toHaveClass("claymorphic");
    expect(link).toHaveClass("text-white");
  });

  it("has aria-label", () => {
    render(<BottomNav items={[]} />);
    expect(screen.getByLabelText("นำทางหลัก")).toBeInTheDocument();
  });
});

describe("TypingIndicator", () => {
  it("renders three dots", () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll(".typing-dot");
    expect(dots.length).toBe(3);
  });
});

describe("getQuickActions", () => {
  it("returns consent actions for welcome state", () => {
    const actions = getQuickActions("welcome", () => {}, () => {});
    expect(actions.map(a => a.label)).toEqual(["ยอมรับเงื่อนไข", "สอบถาม"]);
  });

  it("returns consent actions for phone state", () => {
    const actions = getQuickActions("phone", () => {}, () => {});
    expect(actions.map(a => a.label)).toEqual(["ยอมรับเงื่อนไข", "สอบถาม"]);
  });

  it("returns navigation actions for chat state", () => {
    const actions = getQuickActions("chat", () => {}, () => {});
    expect(actions.map(a => a.label)).toEqual(["บันทึกข้อมูล", "ถ่ายรูป", "สอบถาม"]);
  });

  it("returns navigation actions for confirm_draft state", () => {
    const actions = getQuickActions("confirm_draft", () => {}, () => {});
    expect(actions.map(a => a.label)).toEqual(["บันทึกข้อมูล", "ถ่ายรูป", "สอบถาม"]);
  });

  it("consent action sends ยอมรับ text", () => {
    let sent = "";
    const actions = getQuickActions("welcome", (t) => { sent = t; }, () => {});
    actions[0].onClick();
    expect(sent).toBe("ยอมรับ");
  });

  it("navigation actions call navigate callback", () => {
    const navigated: string[] = [];
    const actions = getQuickActions("chat", () => {}, (href) => { navigated.push(href); });
    actions[0].onClick(); // บันทึกข้อมูล → /summary
    actions[1].onClick(); // ถ่ายรูป → /upload
    expect(navigated).toEqual(["/summary", "/upload"]);
  });
});
