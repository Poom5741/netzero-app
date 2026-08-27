import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VerdictResult } from "../verdict-result";
import { PhotoTypePicker } from "../photo-type-picker";

describe("PhotoTypePicker", () => {
  it("renders all three photo types", () => {
    const onChange = vi.fn();
    render(<PhotoTypePicker value={null} onChange={onChange} />);

    expect(screen.getByText("เตรียมดิน")).toBeInTheDocument();
    expect(screen.getByText("ท่อน้ำ/เปียก-แห้ง")).toBeInTheDocument();
    expect(screen.getByText("เก็บเกี่ยว")).toBeInTheDocument();
  });

  it("calls onChange when a type is selected", () => {
    const onChange = vi.fn();
    render(<PhotoTypePicker value={null} onChange={onChange} />);

    fireEvent.click(screen.getByText("ท่อน้ำ/เปียก-แห้ง"));
    expect(onChange).toHaveBeenCalledWith("wetdry");
  });

  it("highlights the selected type", () => {
    const onChange = vi.fn();
    render(<PhotoTypePicker value="prepare" onChange={onChange} />);

    const selected = screen.getByText("เตรียมดิน").closest("button");
    expect(selected).toHaveClass("bg-primary-container");
  });
});

describe("VerdictResult", () => {
  it("renders refused state with Thai reason and retake button", () => {
    const onRetake = vi.fn();
    render(
      <VerdictResult
        verdict="refused"
        reason="ไม่พบท่อวัด กรุณาถ่ายให้เห็นท่อ"
        onRetake={onRetake}
      />,
    );

    expect(screen.getByText("ไม่พบท่อวัด กรุณาถ่ายให้เห็นท่อ")).toBeInTheDocument();
    expect(screen.getByText("ถ่ายภาพใหม่")).toBeInTheDocument();
    fireEvent.click(screen.getByText("ถ่ายภาพใหม่"));
    expect(onRetake).toHaveBeenCalled();
  });

  it("renders flagged state with waiting message", () => {
    render(<VerdictResult verdict="flagged" />);

    expect(screen.getByText("รอเจ้าหน้าที่ตรวจ")).toBeInTheDocument();
  });

  it("renders pre_verified state with confirmation", () => {
    render(<VerdictResult verdict="pre_verified" water_state="flooded" />);

    expect(screen.getByText(/ยืนยัน/)).toBeInTheDocument();
    expect(screen.getByText(/ขั้งน้ำ/)).toBeInTheDocument();
  });

  it("renders queued state with staff review message", () => {
    render(<VerdictResult verdict="queued" />);

    expect(screen.getByText("รับภาพแล้ว — เจ้าหน้าที่จะตรวจสอบ")).toBeInTheDocument();
  });

  it("renders failure state with generic guidance", () => {
    render(<VerdictResult verdict="failure" />);

    expect(screen.getByText(/เกิดข้อผิดพลาด/)).toBeInTheDocument();
  });
});
