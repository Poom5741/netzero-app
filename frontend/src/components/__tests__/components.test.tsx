import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Input } from "../ui/input";

describe("Input", () => {
  it("renders input field", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Input label="Email" id="email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders error message", () => {
    render(<Input error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("applies touch-target minimum size", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveClass("touch-target");
  });
});
