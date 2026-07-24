import React from 'react'
import { cn } from '../../lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  disabled?: boolean
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <label className={cn('flex items-center gap-2.5 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200',
          checked ? 'bg-brand-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
        )}
      >
        <span className="block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200" />
      </button>
      {label && <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>}
    </label>
  )
}
