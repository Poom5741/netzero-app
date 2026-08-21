import { HTMLAttributes, forwardRef } from "react";

type BadgeVariant = "verified" | "pending" | "rejected" | "flagged";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  verified: "badge-verified",
  pending: "badge-pending",
  rejected: "badge-rejected",
  flagged: "badge-flagged",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, className = "", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
