import * as XLSX from 'xlsx'
import type { ColumnMeta, SheetData, WorkbookData } from './types'
import { detectColumnType, estimateColumnWidth, guessCurrencySymbol } from './typeDetector'
import {
  cleanAoa,
  DEFAULT_CLEANING_OPTIONS,
  type CleaningOptions,
  type CleaningSummary,
  type MergeRange,
} from './dataCleaner'

export interface RawSheet {
  name: string
  aoa: unknown[][]
  merges: MergeRange[]
}

export interface RawWorkbook {
  fileName: string
  rawSheets: RawSheet[]
}

function slugKey(name: string, index: number): string {
  const base = name?.toString().trim() || `col_${index}`
  return base.replace(/\s+/g, '_').toLowerCase() + `__${index}`
}

function buildSheetData(name: string, aoa: unknown[][]): SheetData {
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

/** Lee el archivo y devuelve la matriz cruda por hoja (sin limpiar ni tipar), junto a sus celdas combinadas. */
export async function parseFileRaw(file: File): Promise<RawWorkbook> {
  const buffer = await file.arrayBuffer()
  const isCsv = file.name.toLowerCase().endsWith('.csv')

  const wb = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    raw: false,
    codepage: isCsv ? 65001 : undefined,
  })

  const rawSheets: RawSheet[] = wb.SheetNames.map((sheetName) => {
    const ws = wb.Sheets[sheetName]
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, {
      header: 1,
      raw: false,
      defval: '',
      blankrows: false,
    })
    const merges: MergeRange[] = (ws['!merges'] ?? []).map((m) => ({
      s: { r: m.s.r, c: m.s.c },
      e: { r: m.e.r, c: m.e.c },
    }))
    return { name: sheetName, aoa: aoa as unknown[][], merges }
  })

  return { fileName: file.name, rawSheets }
}

/** Aplica limpieza inteligente + detección de tipos sobre las hojas crudas y produce el WorkbookData final. */
export function buildWorkbookFromRaw(
  raw: RawWorkbook,
  options: CleaningOptions = DEFAULT_CLEANING_OPTIONS
): { workbook: WorkbookData; summaries: CleaningSummary[] } {
  const summaries: CleaningSummary[] = []

  const sheets: SheetData[] = raw.rawSheets.map((sheet) => {
    const { aoa, summary } = cleanAoa(sheet.aoa, sheet.merges, options)
    summaries.push(summary)
    return buildSheetData(sheet.name, aoa)
  })

  return {
    workbook: { fileName: raw.fileName, sheets, activeSheetIndex: 0 },
    summaries,
  }
}

/** Compatibilidad directa: parsea y limpia con las opciones por defecto en un solo paso. */
export async function parseFile(file: File): Promise<WorkbookData> {
  const raw = await parseFileRaw(file)
  return buildWorkbookFromRaw(raw).workbook
}
