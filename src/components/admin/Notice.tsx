import { CircleCheck } from "lucide-react";

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" className="mb-6 flex items-start gap-2.5 rounded-2xl border border-sage/25 bg-emerald-50 px-4 py-3 text-sm text-sage">
      <CircleCheck size={17} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
