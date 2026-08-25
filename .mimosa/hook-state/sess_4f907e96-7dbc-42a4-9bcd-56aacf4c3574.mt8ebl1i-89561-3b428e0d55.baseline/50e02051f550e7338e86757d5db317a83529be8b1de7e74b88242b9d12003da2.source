import { InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-on-surface-variant mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={error ? true : undefined}
          className={`
            w-full px-4 py-3 rounded-xl
            neumorphic-inset
            text-on-surface placeholder:text-outline
            focus:outline-none focus:ring-2 focus:ring-primary-container
            transition-all duration-200
            touch-target
            ${error ? "ring-2 ring-error" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-error" role="alert">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
