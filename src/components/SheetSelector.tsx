import React from 'react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/cn'
import { CheckSquare, Square } from 'lucide-react'

export function SheetSelector() {
  const workbook = useAppStore((s) => s.workbook)
  const setActiveSheet = useAppStore((s) => s.setActiveSheet)
  const toggleSheetSelected = useAppStore((s) => s.toggleSheetSelected)

  if (!workbook) return null
  const multi = workbook.sheets.length > 1

  return (
    <div className="flex flex-wrap items-center gap-2">
      {workbook.sheets.map((sheet, idx) => (
        <button
          key={sheet.name + idx}
          onClick={() => setActiveSheet(idx)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            idx === workbook.activeSheetIndex
              ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300'
              : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
          )}
        >
          {multi && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                toggleSheetSelected(idx)
              }}
              className="text-slate-400 hover:text-brand-600"
              title={sheet.selected ? 'Excluir del formato final' : 'Incluir en el formato final'}
            >
              {sheet.selected ? <CheckSquare size={14} /> : <Square size={14} />}
            </span>
          )}
          {sheet.name}
          <span className="text-slate-400">({sheet.rows.length})</span>
        </button>
      ))}
    </div>
  )
}
