export type ColumnDataType =
  | 'text'
  | 'integer'
  | 'decimal'
  | 'currency'
  | 'percentage'
  | 'date'

export type Alignment = 'left' | 'center' | 'right'

export type AggregationType = 'sum' | 'average' | 'count' | 'none'

export type ConditionalFormatType = 'none' | 'colorScale' | 'dataBar'

export interface ColumnMeta {
  key: string
  originalName: string
  displayName: string
  dataType: ColumnDataType
  alignment: Alignment
  aggregation: AggregationType
  currencySymbol?: '$' | '€' | '£'
  dateFormat?: 'dd/mm/yyyy' | 'yyyy-mm-dd' | 'mm/dd/yyyy'
  width?: number
  conditionalFormat?: ConditionalFormatType
}

export interface SheetData {
  name: string
  rows: Record<string, unknown>[]
  columns: ColumnMeta[]
  selected: boolean
}

export interface WorkbookData {
  fileName: string
  sheets: SheetData[]
  activeSheetIndex: number
}

export type BorderStyle = 'none' | 'thin' | 'medium' | 'dashed' | 'dotted'

export interface ThemeConfig {
  id: string
  name: string
  isCustom?: boolean
  headerBg: string
  headerText: string
  headerFont: string
  headerFontSize: number
  headerBold: boolean
  bodyFont: string
  bodyFontSize: number
  bodyText: string
  zebra: boolean
  zebraColor: string
  borderStyle: BorderStyle
  borderColor: string
  totalsBg: string
  totalsText: string
  globalAlignment: Alignment | 'auto'
  accentColor: string
}

export interface GenerationOptions {
  applyStyles: boolean
  applyFormats: boolean
  insertTotals: boolean
  mode: 'once' | 'template'
}

/** Estructuras crudas compartidas entre el hilo principal y los Web Workers (sin depender de xlsx/ExcelJS). */
export interface MergeRange {
  s: { r: number; c: number }
  e: { r: number; c: number }
}

export interface RawSheet {
  name: string
  aoa: unknown[][]
  merges: MergeRange[]
}

export interface RawWorkbook {
  fileName: string
  rawSheets: RawSheet[]
}
