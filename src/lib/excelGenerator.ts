import ExcelJS from 'exceljs'
import type { ColumnMeta, GenerationOptions, SheetData, ThemeConfig } from './types'
import { parseDateValue, parseNumericValue } from './typeDetector'

function hexToArgb(hex: string): string {
  const clean = hex.replace('#', '').toUpperCase()
  return 'FF' + (clean.length === 6 ? clean : 'FFFFFF')
}

function excelBorderStyle(style: ThemeConfig['borderStyle']): ExcelJS.BorderStyle | undefined {
  switch (style) {
    case 'thin':
      return 'thin'
    case 'medium':
      return 'medium'
    case 'dashed':
      return 'dashed'
    case 'dotted':
      return 'dotted'
    default:
      return undefined
  }
}

function buildBorder(theme: ThemeConfig): Partial<ExcelJS.Borders> | undefined {
  const style = excelBorderStyle(theme.borderStyle)
  if (!style) return undefined
  const side = { style, color: { argb: hexToArgb(theme.borderColor) } }
  return { top: side, left: side, bottom: side, right: side }
}

function numberFormatFor(col: ColumnMeta): string | undefined {
  switch (col.dataType) {
    case 'currency': {
      const symbol = col.currencySymbol ?? '$'
      return `${symbol}#,##0.00`
    }
    case 'percentage':
      return '0.00%'
    case 'integer':
      return '#,##0'
    case 'decimal':
      return '#,##0.00'
    case 'date':
      if (col.dateFormat === 'yyyy-mm-dd') return 'yyyy-mm-dd'
      if (col.dateFormat === 'mm/dd/yyyy') return 'mm/dd/yyyy'
      return 'dd/mm/yyyy'
    default:
      return undefined
  }
}

function excelAlignment(alignment: ColumnMeta['alignment']): Partial<ExcelJS.Alignment> {
  return { horizontal: alignment, vertical: 'middle' }
}

function coerceCellValue(raw: unknown, col: ColumnMeta): unknown {
  if (raw === null || raw === undefined || raw === '') return null
  switch (col.dataType) {
    case 'currency':
    case 'decimal':
    case 'integer': {
      const n = parseNumericValue(raw)
      return n === null ? raw : n
    }
    case 'percentage': {
      const n = parseNumericValue(raw)
      if (n === null) return raw
      // If value looks like "45%" -> 0.45 ; if it's already 0.45 keep it
      return Math.abs(n) > 1 ? n / 100 : n
    }
    case 'date': {
      const d = parseDateValue(raw)
      return d ?? raw
    }
    default:
      return raw
  }
}

const AGG_FORMULA: Record<string, (range: string) => string> = {
  sum: (range) => `SUM(${range})`,
  average: (range) => `AVERAGE(${range})`,
  count: (range) => `COUNTA(${range})`,
}

function colLetter(index: number): string {
  let n = index + 1
  let s = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    s = String.fromCharCode(65 + rem) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

const NUMERIC_TYPES = new Set<ColumnMeta['dataType']>(['integer', 'decimal', 'currency', 'percentage'])

/** Aplica formato condicional real de Excel (escala de color o barra de datos) por columna. */
function applyConditionalFormatting(
  ws: ExcelJS.Worksheet,
  columns: ColumnMeta[],
  lastDataRowNumber: number,
  theme: ThemeConfig
) {
  if (lastDataRowNumber < 2) return
  let priority = 1

  columns.forEach((col, idx) => {
    if (!col.conditionalFormat || col.conditionalFormat === 'none') return
    if (!NUMERIC_TYPES.has(col.dataType)) return

    const letter = colLetter(idx)
    const ref = `${letter}2:${letter}${lastDataRowNumber}`

    if (col.conditionalFormat === 'colorScale') {
      ws.addConditionalFormatting({
        ref,
        rules: [
          {
            type: 'colorScale',
            priority: priority++,
            cfvo: [{ type: 'min' }, { type: 'percentile', value: 50 }, { type: 'max' }],
            color: [{ argb: 'FFF8696B' }, { argb: 'FFFFEB84' }, { argb: 'FF63BE7B' }],
          },
        ],
      })
    } else if (col.conditionalFormat === 'dataBar') {
      ws.addConditionalFormatting({
        ref,
        rules: [
          {
            type: 'dataBar',
            priority: priority++,
            gradient: true,
            minLength: 0,
            maxLength: 100,
            cfvo: [{ type: 'min' }, { type: 'max' }],
            color: { argb: hexToArgb(theme.accentColor) },
          } as unknown as ExcelJS.DataBarRuleType,
        ],
      })
    }
  })
}

function applySheet(workbook: ExcelJS.Workbook, sheet: SheetData, theme: ThemeConfig, options: GenerationOptions) {
  const ws = workbook.addWorksheet(sheet.name.slice(0, 31) || 'Hoja', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  const columns = sheet.columns
  ws.columns = columns.map((col) => ({
    header: col.displayName,
    key: col.key,
    width: col.width ?? 16,
  }))

  const headerRow = ws.getRow(1)
  headerRow.height = 22
  headerRow.eachCell((cell) => {
    if (options.applyStyles) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(theme.headerBg) } }
      cell.font = {
        name: theme.headerFont,
        size: theme.headerFontSize,
        bold: theme.headerBold,
        color: { argb: hexToArgb(theme.headerText) },
      }
      cell.alignment = excelAlignment(theme.globalAlignment === 'auto' ? 'center' : theme.globalAlignment)
      const border = buildBorder(theme)
      if (border) cell.border = border
    }
  })

  sheet.rows.forEach((row) => {
    const rowValues: Record<string, unknown> = {}
    columns.forEach((col) => {
      rowValues[col.key] = coerceCellValue(row[col.key], col)
    })
    ws.addRow(rowValues)
  })

  const lastDataRowNumber = sheet.rows.length + 1

  // Body styling
  if (options.applyStyles || options.applyFormats) {
    for (let r = 2; r <= lastDataRowNumber; r++) {
      const row = ws.getRow(r)
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const col = columns[colNumber - 1]
        if (!col) return

        if (options.applyFormats) {
          const fmt = numberFormatFor(col)
          if (fmt) cell.numFmt = fmt
        }

        if (options.applyStyles) {
          cell.font = { name: theme.bodyFont, size: theme.bodyFontSize, color: { argb: hexToArgb(theme.bodyText) } }
          cell.alignment = excelAlignment(theme.globalAlignment === 'auto' ? col.alignment : theme.globalAlignment)
          const border = buildBorder(theme)
          if (border) cell.border = border
          if (theme.zebra && r % 2 === 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(theme.zebraColor) } }
          }
        }
      })
    }
  }

  // Totals row with real Excel formulas
  if (options.insertTotals) {
    const totalsRowNumber = lastDataRowNumber + 1
    const totalsRow = ws.getRow(totalsRowNumber)

    columns.forEach((col, idx) => {
      const cell = totalsRow.getCell(idx + 1)
      if (idx === 0) {
        cell.value = 'TOTAL'
      } else if (col.aggregation !== 'none') {
        const letter = colLetter(idx)
        const range = `${letter}2:${letter}${lastDataRowNumber}`
        const formulaBuilder = AGG_FORMULA[col.aggregation]
        if (formulaBuilder) {
          cell.value = { formula: formulaBuilder(range) }
          const fmt = numberFormatFor(col)
          if (fmt) cell.numFmt = fmt
        }
      }
      if (options.applyStyles) {
        cell.font = {
          name: theme.headerFont,
          size: theme.bodyFontSize,
          bold: true,
          color: { argb: hexToArgb(theme.totalsText) },
        }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(theme.totalsBg) } }
        cell.alignment = excelAlignment(idx === 0 ? 'left' : col.alignment)
        const border = buildBorder(theme)
        if (border) cell.border = border
      }
    })
    totalsRow.height = 20
  }

  if (options.applyStyles) {
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    }
    applyConditionalFormatting(ws, columns, lastDataRowNumber, theme)
  }
}

/** Genera el libro final y devuelve su contenido como ArrayBuffer (pensado para ejecutarse dentro de un Web Worker). */
export async function buildWorkbookBuffer(
  sheets: SheetData[],
  theme: ThemeConfig,
  options: GenerationOptions,
  fileName: string
): Promise<{ buffer: ArrayBuffer; outputName: string }> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Formatear Excel'
  workbook.created = new Date()

  const targetSheets = sheets.filter((s) => s.selected)
  for (const sheet of targetSheets) {
    applySheet(workbook, sheet, theme, options)
  }

  const raw = await workbook.xlsx.writeBuffer()
  const uint8 = raw instanceof Uint8Array ? raw : new Uint8Array(raw as ArrayBuffer)
  const arrayBuffer = uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength) as ArrayBuffer

  const base = fileName.replace(/\.(csv|xlsx|xls)$/i, '')
  return { buffer: arrayBuffer, outputName: `${base}_reporte_ejecutivo.xlsx` }
}
