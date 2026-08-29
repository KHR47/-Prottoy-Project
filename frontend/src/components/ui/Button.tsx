import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-teal-600 text-white shadow-sm shadow-teal-900/10 hover:bg-teal-700 focus-visible:outline-teal-600 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400",
  secondary:
    "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--bg-hover)] focus-visible:outline-teal-600",
  danger:
    "bg-red-600 text-white shadow-sm shadow-red-900/10 hover:bg-red-700 focus-visible:outline-red-600 dark:bg-red-500 dark:hover:bg-red-400",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus-visible:outline-teal-600",
};

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
