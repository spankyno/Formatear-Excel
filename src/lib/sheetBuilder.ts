import type { ColumnMeta, SheetData } from './types'
import { detectColumnType, estimateColumnWidth, guessCurrencySymbol } from './typeDetector'

function slugKey(name: string, index: number): string {
  const base = name?.toString().trim() || `col_${index}`
  return base.replace(/\s+/g, '_').toLowerCase() + `__${index}`
}

/** Construye las columnas tipadas y las filas indexadas por clave a partir de una matriz (fila 0 = cabecera). */
export function buildSheetData(name: string, aoa: unknown[][]): SheetData {
  const headerRow = (aoa[0] ?? []).map((h) => (h === undefined || h === null ? '' : String(h)))
  const dataRows = aoa.slice(1).filter((r) => r.some((cell) => cell !== undefined && cell !== null && cell !== ''))

  const colCount = Math.max(headerRow.length, ...dataRows.map((r) => r.length), 1)

  const columns: ColumnMeta[] = []
  const rows: Record<string, unknown>[] = dataRows.map(() => ({}))

  for (let c = 0; c < colCount; c++) {
    const originalName = headerRow[c] && headerRow[c] !== '' ? headerRow[c] : `Columna ${c + 1}`
    const key = slugKey(originalName, c)
    const colValues: unknown[] = []

    dataRows.forEach((row, rIdx) => {
      const val = row[c]
      rows[rIdx][key] = val
      colValues.push(val)
    })

    const detection = detectColumnType(colValues)
    const width = estimateColumnWidth(originalName, colValues, detection.dataType)

    const meta: ColumnMeta = {
      key,
      originalName: originalName.toString(),
      displayName: originalName.toString(),
      dataType: detection.dataType,
      alignment: detection.alignment,
      aggregation: detection.aggregation,
      width,
      conditionalFormat: 'none',
    }
    if (detection.dataType === 'currency') {
      meta.currencySymbol = guessCurrencySymbol(colValues)
    }
    if (detection.dataType === 'date') {
      meta.dateFormat = 'dd/mm/yyyy'
    }
    columns.push(meta)
  }

  return { name, rows, columns, selected: true }
}
