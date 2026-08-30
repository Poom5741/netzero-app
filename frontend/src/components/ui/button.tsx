import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "claymorphic text-white font-semibold",
  secondary: "neumorphic text-on-surface font-medium hover:shadow-lg transition-shadow",
  danger: "bg-gradient-to-b from-[#EF5350] to-[#BA1A1A] text-on-error font-semibold shadow-[0_4px_10px_rgba(186,26,26,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all",
  ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container-low transition-colors",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-label-md min-h-[36px]",
  md: "px-6 py-3 text-body-md min-h-[44px]",
  lg: "px-8 py-4 text-body-lg min-h-[48px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-xl transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          touch-target
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
