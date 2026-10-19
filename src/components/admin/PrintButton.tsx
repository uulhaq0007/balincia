"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Print invoice" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-outline btn-sm">
      <Printer size={15} /> {label}
    </button>
  );
}
