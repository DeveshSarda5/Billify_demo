import { ButtonHTMLAttributes, ReactNode } from "react";

interface CatButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function CatButton({ children, disabled, ...props }: CatButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}