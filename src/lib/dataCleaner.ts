export interface MergeRange {
  s: { r: number; c: number }
  e: { r: number; c: number }
}

export interface CleaningOptions {
  trimSpaces: boolean
  removeEmptyRows: boolean
  removeEmptyColumns: boolean
  unmergeCells: boolean
  removeDuplicates: boolean
  convertNumberFormat: boolean
}

export interface CleaningSummary {
  cellsTrimmed: number
  cellsUnmerged: number
  emptyRowsRemoved: number
  emptyColumnsRemoved: number
  duplicatesRemoved: number
  numbersConverted: number
}

export const DEFAULT_CLEANING_OPTIONS: CleaningOptions = {
  trimSpaces: true,
  removeEmptyRows: true,
  removeEmptyColumns: true,
  unmergeCells: true,
  removeDuplicates: false,
  convertNumberFormat: true,
}

function emptySummary(): CleaningSummary {
  return {
    cellsTrimmed: 0,
    cellsUnmerged: 0,
    emptyRowsRemoved: 0,
    emptyColumnsRemoved: 0,
    duplicatesRemoved: 0,
    numbersConverted: 0,
  }
}

function isBlank(v: unknown): boolean {
  return v === null || v === undefined || String(v).trim() === ''
}

/** Rellena las celdas combinadas con el valor de la celda superior-izquierda del rango. */
function fillMerges(aoa: unknown[][], merges: MergeRange[]): { aoa: unknown[][]; count: number } {
  if (!merges || merges.length === 0) return { aoa, count: 0 }
  const out = aoa.map((row) => [...row])
  let count = 0

  for (const range of merges) {
    const topValue = out[range.s.r]?.[range.s.c]
    if (isBlank(topValue)) continue
    for (let r = range.s.r; r <= range.e.r; r++) {
      if (!out[r]) out[r] = []
      for (let c = range.s.c; c <= range.e.c; c++) {
        if (r === range.s.r && c === range.s.c) continue
        if (isBlank(out[r][c])) {
          out[r][c] = topValue
          count++
        }
      }
    }
  }
  return { aoa: out, count }
}

/**
 * Intenta convertir un texto numérico (formatos europeo o anglosajón) a un número real.
 * Ej: "1.236,45" -> 1236.45  |  "1,236.45" -> 1236.45  |  "12.345.678" -> 12345678
 */
export function normalizeNumberString(raw: string): number | null {
  const s = raw.trim()
  if (s === '') return null
  if (/[a-zA-Z]/.test(s)) return null
  if (/[$€£%]/.test(s)) return null
  if (!/\d/.test(s)) return null

  const europeanFull = /^-?\d{1,3}(\.\d{3})+,\d+$/ // 1.236,45
  const usFull = /^-?\d{1,3}(,\d{3})+\.\d+$/ // 1,236.45
  const dotThousandsOnly = /^-?\d{1,3}(\.\d{3})+$/ // 12.345.678
  const commaThousandsOnly = /^-?\d{1,3}(,\d{3})+$/ // 1,236
  const commaDecimalShort = /^-?\d+,\d{1,2}$/ // 236,45
  const usDecimal = /^-?\d+\.\d+$/ // 1236.45
  const plainInt = /^-?\d+$/ // 1236

  if (europeanFull.test(s)) return parseFloat(s.replace(/\./g, '').replace(',', '.'))
  if (usFull.test(s)) return parseFloat(s.replace(/,/g, ''))
  if (dotThousandsOnly.test(s)) return parseFloat(s.replace(/\./g, ''))
  if (commaThousandsOnly.test(s)) return parseFloat(s.replace(/,/g, ''))
  if (commaDecimalShort.test(s)) return parseFloat(s.replace(',', '.'))
  if (usDecimal.test(s)) return parseFloat(s)
  if (plainInt.test(s)) return parseFloat(s)
  return null
}

function rowKey(row: unknown[]): string {
  return JSON.stringify(row.map((v) => (v === undefined ? null : v)))
}

/**
 * Aplica limpieza inteligente básica sobre una matriz cruda (fila 0 = cabecera).
 */
export function cleanAoa(
  rawAoa: unknown[][],
  merges: MergeRange[],
  options: CleaningOptions
): { aoa: unknown[][]; summary: CleaningSummary } {
  const summary = emptySummary()
  if (rawAoa.length === 0) return { aoa: rawAoa, summary }

  let aoa = rawAoa.map((row) => [...row])

  // 1. Desmerge de celdas combinadas
  if (options.unmergeCells) {
    const result = fillMerges(aoa, merges)
    aoa = result.aoa
    summary.cellsUnmerged = result.count
  }

  const header = aoa[0] ?? []
  let dataRows = aoa.slice(1)

  // 2. Trim de espacios en todas las celdas de texto
  if (options.trimSpaces) {
    dataRows = dataRows.map((row) =>
      row.map((cell) => {
        if (typeof cell === 'string') {
          const trimmed = cell.replace(/\s+/g, ' ').trim()
          if (trimmed !== cell) summary.cellsTrimmed++
          return trimmed
        }
        return cell
      })
    )
  }

  // 3. Conversión de texto numérico a número real
  if (options.convertNumberFormat) {
    dataRows = dataRows.map((row) =>
      row.map((cell) => {
        if (typeof cell !== 'string') return cell
        const num = normalizeNumberString(cell)
        if (num !== null && Number.isFinite(num)) {
          summary.numbersConverted++
          return num
        }
        return cell
      })
    )
  }

  // 4. Eliminar filas completamente vacías
  if (options.removeEmptyRows) {
    const before = dataRows.length
    dataRows = dataRows.filter((row) => row.some((cell) => !isBlank(cell)))
    summary.emptyRowsRemoved = before - dataRows.length
  }

  // 5. Eliminar columnas completamente vacías (según los datos, ignorando la cabecera)
  let finalHeader = header
  if (options.removeEmptyColumns) {
    const colCount = Math.max(header.length, ...dataRows.map((r) => r.length), 0)
    const emptyColIdx = new Set<number>()
    for (let c = 0; c < colCount; c++) {
      const allEmpty = dataRows.every((row) => isBlank(row[c]))
      if (allEmpty && isBlank(header[c])) emptyColIdx.add(c)
    }
    if (emptyColIdx.size > 0) {
      finalHeader = header.filter((_, idx) => !emptyColIdx.has(idx))
      dataRows = dataRows.map((row) => row.filter((_, idx) => !emptyColIdx.has(idx)))
      summary.emptyColumnsRemoved = emptyColIdx.size
    }
  }

  // 6. Eliminar filas duplicadas (comparación exacta tras la limpieza anterior)
  if (options.removeDuplicates) {
    const seen = new Set<string>()
    const before = dataRows.length
    dataRows = dataRows.filter((row) => {
      const key = rowKey(row)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    summary.duplicatesRemoved = before - dataRows.length
  }

  return { aoa: [finalHeader, ...dataRows], summary }
}
