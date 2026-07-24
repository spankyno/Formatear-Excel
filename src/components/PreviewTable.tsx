import React, { useMemo } from 'react'
import type { ColumnMeta, SheetData, ThemeConfig } from '../lib/types'
import { parseNumericValue, parseDateValue } from '../lib/typeDetector'

function formatCellValue(raw: unknown, col: ColumnMeta): string {
  if (raw === null || raw === undefined || raw === '') return ''
  switch (col.dataType) {
    case 'currency': {
      const n = parseNumericValue(raw)
      if (n === null) return String(raw)
      const symbol = col.currencySymbol ?? '$'
      return `${symbol}${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    case 'percentage': {
      const n = parseNumericValue(raw)
      if (n === null) return String(raw)
      const pct = Math.abs(n) > 1 ? n : n * 100
      return `${pct.toFixed(2)}%`
    }
    case 'integer': {
      const n = parseNumericValue(raw)
      return n === null ? String(raw) : Math.round(n).toLocaleString('es-ES')
    }
    case 'decimal': {
      const n = parseNumericValue(raw)
      return n === null ? String(raw) : n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    case 'date': {
      const d = parseDateValue(raw)
      if (!d) return String(raw)
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      if (col.dateFormat === 'yyyy-mm-dd') return `${yyyy}-${mm}-${dd}`
      if (col.dateFormat === 'mm/dd/yyyy') return `${mm}/${dd}/${yyyy}`
      return `${dd}/${mm}/${yyyy}`
    }
    default:
      return String(raw)
  }
}

interface PreviewTableProps {
  sheet: SheetData
  theme?: ThemeConfig
  styled?: boolean
  maxRows?: number
  showTotals?: boolean
}

export function PreviewTable({ sheet, theme, styled = false, maxRows = 30, showTotals = false }: PreviewTableProps) {
  const rows = useMemo(() => sheet.rows.slice(0, maxRows), [sheet.rows, maxRows])

  const totals = useMemo(() => {
    if (!showTotals) return null
    const t: Record<string, number> = {}
    sheet.columns.forEach((col) => {
      if (col.aggregation === 'none') return
      const values = sheet.rows
        .map((r) => parseNumericValue(r[col.key]))
        .filter((v): v is number => v !== null)
      if (values.length === 0) return
      if (col.aggregation === 'sum') t[col.key] = values.reduce((a, b) => a + b, 0)
      if (col.aggregation === 'average') t[col.key] = values.reduce((a, b) => a + b, 0) / values.length
      if (col.aggregation === 'count') t[col.key] = values.length
    })
    return t
  }, [sheet, showTotals])

  const headerStyle: React.CSSProperties = styled
    ? {
        backgroundColor: theme?.headerBg,
        color: theme?.headerText,
        fontFamily: theme?.headerFont,
        fontSize: theme?.headerFontSize,
        fontWeight: theme?.headerBold ? 700 : 400,
      }
    : {}

  const borderColor = styled ? theme?.borderColor : '#e2e8f0'
  const borderWidth = styled && theme?.borderStyle !== 'none' ? 1 : 1

  return (
    <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-[62vh] scrollbar-thin">
      <table className="excel-table">
        <thead className="sticky top-0 z-10">
          <tr>
            {sheet.columns.map((col) => (
              <th
                key={col.key}
                style={{
                  ...headerStyle,
                  border: `${borderWidth}px solid ${borderColor}`,
                  textAlign:
                    styled && theme?.globalAlignment !== 'auto' ? (theme?.globalAlignment as any) : col.alignment,
                }}
                className="px-3 py-2 font-semibold"
              >
                {col.displayName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {sheet.columns.map((col) => {
                const zebraOn = styled && theme?.zebra && rIdx % 2 === 1
                return (
                  <td
                    key={col.key}
                    style={{
                      border: `1px solid ${borderColor}`,
                      backgroundColor: zebraOn ? theme?.zebraColor : undefined,
                      color: styled ? theme?.bodyText : undefined,
                      fontFamily: styled ? theme?.bodyFont : undefined,
                      fontSize: styled ? theme?.bodyFontSize : undefined,
                      textAlign:
                        styled && theme?.globalAlignment !== 'auto' ? (theme?.globalAlignment as any) : col.alignment,
                    }}
                    className="px-3 py-1.5"
                  >
                    {formatCellValue(row[col.key], col)}
                  </td>
                )
              })}
            </tr>
          ))}
          {totals && (
            <tr>
              {sheet.columns.map((col, idx) => (
                <td
                  key={col.key}
                  style={{
                    border: `1px solid ${borderColor}`,
                    backgroundColor: styled ? theme?.totalsBg : '#0f172a',
                    color: styled ? theme?.totalsText : '#fff',
                    fontWeight: 700,
                    textAlign: idx === 0 ? 'left' : col.alignment,
                  }}
                  className="px-3 py-1.5"
                >
                  {idx === 0 ? 'TOTAL' : totals[col.key] !== undefined ? formatCellValue(totals[col.key], col) : ''}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
      {sheet.rows.length > maxRows && (
        <div className="border-t border-slate-200 bg-slate-50 px-3 py-1.5 text-center text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-900">
          Mostrando {maxRows} de {sheet.rows.length} filas
        </div>
      )}
    </div>
  )
}
