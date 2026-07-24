import React from 'react'
import { useAppStore } from '../store/useAppStore'
import type { ColumnDataType, Alignment, AggregationType } from '../lib/types'
import { InfoTooltip } from './ui/Tooltip'

const TYPE_OPTIONS: { value: ColumnDataType; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'integer', label: 'Número entero' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'currency', label: 'Moneda' },
  { value: 'percentage', label: 'Porcentaje' },
  { value: 'date', label: 'Fecha' },
]

const ALIGN_OPTIONS: { value: Alignment; label: string }[] = [
  { value: 'left', label: 'Izquierda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Derecha' },
]

const AGG_OPTIONS: { value: AggregationType; label: string }[] = [
  { value: 'none', label: 'Sin total' },
  { value: 'sum', label: 'Suma' },
  { value: 'average', label: 'Promedio' },
  { value: 'count', label: 'Contar' },
]

export function ColumnTypeEditor() {
  const workbook = useAppStore((s) => s.workbook)
  const updateColumn = useAppStore((s) => s.updateColumn)

  if (!workbook) return null
  const sheetIndex = workbook.activeSheetIndex
  const sheet = workbook.sheets[sheetIndex]

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 pb-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Columnas detectadas</p>
        <InfoTooltip text="Formatear Excel detecta el tipo de cada columna automáticamente. Corrígelo si algo no se ve bien." />
      </div>
      <div className="max-h-[38vh] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
        {sheet.columns.map((col) => (
          <div
            key={col.key}
            className="grid grid-cols-12 items-center gap-2 rounded-lg border border-slate-200 p-2.5 text-xs dark:border-slate-800"
          >
            <input
              className="col-span-4 truncate rounded-md border border-slate-200 bg-transparent px-2 py-1.5 text-xs font-medium focus:border-brand-500 focus:outline-none dark:border-slate-700"
              value={col.displayName}
              onChange={(e) => updateColumn(sheetIndex, col.key, { displayName: e.target.value })}
              title={col.originalName}
            />
            <select
              className="col-span-3 rounded-md border border-slate-200 bg-transparent px-1.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-[#12151d]"
              value={col.dataType}
              onChange={(e) => updateColumn(sheetIndex, col.key, { dataType: e.target.value as ColumnDataType })}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className="col-span-2 rounded-md border border-slate-200 bg-transparent px-1.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-[#12151d]"
              value={col.alignment}
              onChange={(e) => updateColumn(sheetIndex, col.key, { alignment: e.target.value as Alignment })}
            >
              {ALIGN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className="col-span-3 rounded-md border border-slate-200 bg-transparent px-1.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-[#12151d]"
              value={col.aggregation}
              onChange={(e) => updateColumn(sheetIndex, col.key, { aggregation: e.target.value as AggregationType })}
            >
              {AGG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {col.dataType === 'currency' && (
              <div className="col-span-12 flex gap-1.5 pt-0.5">
                {(['$', '€', '£'] as const).map((sym) => (
                  <button
                    key={sym}
                    onClick={() => updateColumn(sheetIndex, col.key, { currencySymbol: sym })}
                    className={`rounded-md border px-2 py-0.5 text-[11px] ${
                      col.currencySymbol === sym
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30'
                        : 'border-slate-200 text-slate-500 dark:border-slate-700'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            )}
            {col.dataType === 'date' && (
              <div className="col-span-12 flex gap-1.5 pt-0.5">
                {(['dd/mm/yyyy', 'yyyy-mm-dd', 'mm/dd/yyyy'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => updateColumn(sheetIndex, col.key, { dateFormat: fmt })}
                    className={`rounded-md border px-2 py-0.5 text-[11px] ${
                      col.dateFormat === fmt
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30'
                        : 'border-slate-200 text-slate-500 dark:border-slate-700'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
