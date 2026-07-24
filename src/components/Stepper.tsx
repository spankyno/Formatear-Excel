import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '../lib/cn'
import type { Step } from '../store/useAppStore'

const STEPS: { key: Step; label: string }[] = [
  { key: 'upload', label: 'Subir archivo' },
  { key: 'style', label: 'Diseñar reporte' },
  { key: 'done', label: 'Descargar' },
]

export function Stepper({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current)
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIndex
        const isActive = idx === currentIndex
        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                  isDone && 'bg-brand-600 text-white',
                  isActive && !isDone && 'bg-brand-600/15 text-brand-600 ring-1 ring-brand-500',
                  !isDone && !isActive && 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                )}
              >
                {isDone ? <Check size={12} /> : idx + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />}
          </React.Fragment>
        )
      })}
    </div>
  )
}
