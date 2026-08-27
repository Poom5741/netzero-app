import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

describe("Card", () => {
  it("renders with default variant", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders with neumorphic variant", () => {
    render(<Card variant="neumorphic">Neumorphic</Card>);
    expect(screen.getByText("Neumorphic")).toHaveClass("neumorphic");
  });

  it("renders with glass variant", () => {
    render(<Card variant="glass">Glass</Card>);
    expect(screen.getByText("Glass")).toHaveClass("glass");
  });
});

describe("Badge", () => {
  it("renders verified badge", () => {
    render(<Badge variant="verified">Verified</Badge>);
    expect(screen.getByText("Verified")).toHaveClass("badge-verified");
  });

  it("renders pending badge", () => {
    render(<Badge variant="pending">Pending</Badge>);
    expect(screen.getByText("Pending")).toHaveClass("badge-pending");
  });

  it("renders rejected badge", () => {
    render(<Badge variant="rejected">Rejected</Badge>);
    expect(screen.getByText("Rejected")).toHaveClass("badge-rejected");
  });

  it("renders flagged badge", () => {
    render(<Badge variant="flagged">Flagged</Badge>);
    expect(screen.getByText("Flagged")).toHaveClass("badge-flagged");
  });
});

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
