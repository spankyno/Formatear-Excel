import React, { useMemo } from 'react'
import { Sparkles, Eraser } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { Card, CardBody, CardHeader, CardTitle } from './ui/Card'
import { Switch } from './ui/Switch'
import { InfoTooltip } from './ui/Tooltip'
import type { CleaningSummary } from '../lib/dataCleaner'

const TOGGLES: {
  key: keyof ReturnType<typeof useAppStore.getState>['cleaningOptions']
  label: string
  tooltip: string
}[] = [
  {
    key: 'trimSpaces',
    label: 'Quitar espacios sobrantes (TRIM)',
    tooltip: 'Elimina espacios al inicio, al final y duplicados dentro del texto de cada celda.',
  },
  {
    key: 'unmergeCells',
    label: 'Separar celdas combinadas',
    tooltip: 'Rellena cada celda de un rango combinado con el valor de la celda superior-izquierda, en vez de dejarlas vacías.',
  },
  {
    key: 'removeEmptyRows',
    label: 'Eliminar filas vacías',
    tooltip: 'Quita filas donde todas las celdas están vacías.',
  },
  {
    key: 'removeEmptyColumns',
    label: 'Eliminar columnas vacías',
    tooltip: 'Quita columnas sin cabecera y sin ningún dato en toda la hoja.',
  },
  {
    key: 'convertNumberFormat',
    label: 'Convertir texto a número',
    tooltip: 'Detecta números escritos como texto (ej. "1.236,45" o "1,236.45") y los convierte a valores numéricos reales.',
  },
  {
    key: 'removeDuplicates',
    label: 'Eliminar filas duplicadas',
    tooltip: 'Quita filas exactamente iguales, conservando la primera aparición. Actívalo con cuidado si esperas registros repetidos legítimos.',
  },
]

function sumSummaries(summaries: CleaningSummary[]): CleaningSummary {
  return summaries.reduce(
    (acc, s) => ({
      cellsTrimmed: acc.cellsTrimmed + s.cellsTrimmed,
      cellsUnmerged: acc.cellsUnmerged + s.cellsUnmerged,
      emptyRowsRemoved: acc.emptyRowsRemoved + s.emptyRowsRemoved,
      emptyColumnsRemoved: acc.emptyColumnsRemoved + s.emptyColumnsRemoved,
      duplicatesRemoved: acc.duplicatesRemoved + s.duplicatesRemoved,
      numbersConverted: acc.numbersConverted + s.numbersConverted,
    }),
    {
      cellsTrimmed: 0,
      cellsUnmerged: 0,
      emptyRowsRemoved: 0,
      emptyColumnsRemoved: 0,
      duplicatesRemoved: 0,
      numbersConverted: 0,
    }
  )
}

export function DataCleaningPanel() {
  const cleaningOptions = useAppStore((s) => s.cleaningOptions)
  const setCleaningOptions = useAppStore((s) => s.setCleaningOptions)
  const cleaningSummaries = useAppStore((s) => s.cleaningSummaries)

  const total = useMemo(() => sumSummaries(cleaningSummaries), [cleaningSummaries])

  const summaryItems = [
    { label: 'espacios limpiados', value: total.cellsTrimmed },
    { label: 'celdas desmarcadas', value: total.cellsUnmerged },
    { label: 'filas vacías eliminadas', value: total.emptyRowsRemoved },
    { label: 'columnas vacías eliminadas', value: total.emptyColumnsRemoved },
    { label: 'números convertidos', value: total.numbersConverted },
    { label: 'duplicados eliminados', value: total.duplicatesRemoved },
  ].filter((i) => i.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={14} /> Limpieza inteligente de datos
        </CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {TOGGLES.map((t) => (
            <div
              key={t.key}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
            >
              <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                {t.label}
                <InfoTooltip text={t.tooltip} />
              </span>
              <Switch
                checked={cleaningOptions[t.key]}
                onChange={(v) => setCleaningOptions({ [t.key]: v })}
              />
            </div>
          ))}
        </div>

        {summaryItems.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <Eraser size={13} className="shrink-0" />
            {summaryItems.map((i, idx) => (
              <span key={i.label}>
                <strong>{i.value}</strong> {i.label}
                {idx < summaryItems.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">No se detectaron elementos que limpiar con las opciones actuales.</p>
        )}
      </CardBody>
    </Card>
  )
}
