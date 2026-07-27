import * as XLSX from 'xlsx'
import type { MergeRange, RawSheet, RawWorkbook, SheetData, WorkbookData } from './types'
import { buildSheetData } from './sheetBuilder'
import { cleanAoa, DEFAULT_CLEANING_OPTIONS, type CleaningOptions, type CleaningSummary } from './dataCleaner'

export interface ParseInput {
  fileName: string
  buffer: ArrayBuffer
  isCsv: boolean
}

/** Lee el archivo y devuelve la matriz cruda por hoja (sin limpiar ni tipar), junto a sus celdas combinadas. */
export function parseFileRaw(input: ParseInput): RawWorkbook {
  const { fileName, buffer, isCsv } = input

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

  return { fileName, rawSheets }
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
