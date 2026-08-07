import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
        {title}<ChevronDown size={13} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}
