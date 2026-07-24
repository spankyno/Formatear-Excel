import React, { useState } from 'react'
import { Info } from 'lucide-react'

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Info size={13} className="text-slate-400 cursor-help" />
      {open && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] leading-snug text-white shadow-panel animate-fade-in dark:bg-slate-100 dark:text-slate-900">
          {text}
          <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-slate-900 dark:bg-slate-100" />
        </span>
      )}
    </span>
  )
}
