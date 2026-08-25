import { HTMLAttributes, forwardRef } from "react";

type CardVariant = "default" | "neumorphic" | "glass" | "glass-dark";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white rounded-xl shadow-sm border border-surface-container-high",
  neumorphic: "neumorphic",
  glass: "glass rounded-xl",
  "glass-dark": "glass-dark rounded-xl text-white",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-4 ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
