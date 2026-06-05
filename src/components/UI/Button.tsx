import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "soft";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-45",
          variant === "primary" &&
            "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/30 hover:bg-cyan-200",
          variant === "ghost" &&
            "border border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]",
          variant === "soft" &&
            "bg-amber-300/15 text-amber-100 ring-1 ring-amber-200/20 hover:bg-amber-300/20",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
