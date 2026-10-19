import { cn } from "@/lib/utils";

type Props = {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
};

export function Field({ label, error, hint, className, children, htmlFor }: Props) {
  return (
    <div className={cn("min-w-0", className)}>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-sale" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormAlert({ tone = "error", children }: { tone?: "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl px-4 py-3 text-sm",
        tone === "error" ? "bg-sale/10 text-sale" : "bg-sage/10 text-sage",
      )}
    >
      {children}
    </div>
  );
}
