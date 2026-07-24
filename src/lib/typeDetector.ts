import type { ColumnDataType, Alignment, AggregationType } from './types'

const CURRENCY_REGEX = /^[\s]*[$€£]\s?-?[\d.,]+\s*$/
const PERCENT_REGEX = /^[\s]*-?[\d.,]+\s?%\s*$/
const DATE_REGEXES = [
  /^\d{4}-\d{2}-\d{2}$/, // yyyy-mm-dd
  /^\d{2}\/\d{2}\/\d{4}$/, // dd/mm/yyyy or mm/dd/yyyy
  /^\d{1,2}-\d{1,2}-\d{4}$/,
]

function isExcelDateSerial(v: unknown): boolean {
  // Excel serial dates roughly 1900-2100
  return typeof v === 'number' && v > 20000 && v < 60000
}

function sampleValue(v: unknown): string {
  return typeof v === 'string' ? v.trim() : String(v ?? '')
}

export function detectColumnType(values: unknown[]): {
  dataType: ColumnDataType
  alignment: Alignment
  aggregation: AggregationType
} {
  const nonEmpty = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
  if (nonEmpty.length === 0) {
    return { dataType: 'text', alignment: 'left', aggregation: 'none' }
  }

  let currencyHits = 0
  let percentHits = 0
  let dateHits = 0
  let intHits = 0
  let decimalHits = 0
  let numericHits = 0

  for (const raw of nonEmpty) {
    const str = sampleValue(raw)

    if (CURRENCY_REGEX.test(str)) {
      currencyHits++
      continue
    }
    if (PERCENT_REGEX.test(str)) {
      percentHits++
      continue
    }
    if (DATE_REGEXES.some((r) => r.test(str)) || raw instanceof Date || isExcelDateSerial(raw)) {
      dateHits++
      continue
    }

    const numeric = typeof raw === 'number' ? raw : Number(str.replace(/,/g, ''))
    if (!Number.isNaN(numeric) && str !== '') {
      numericHits++
      if (Number.isInteger(numeric)) intHits++
      else decimalHits++
    }
  }

  const total = nonEmpty.length
  const majority = (n: number) => n / total >= 0.6

  if (majority(currencyHits)) {
    return { dataType: 'currency', alignment: 'right', aggregation: 'sum' }
  }
  if (majority(percentHits)) {
    return { dataType: 'percentage', alignment: 'right', aggregation: 'average' }
  }
  if (majority(dateHits)) {
    return { dataType: 'date', alignment: 'center', aggregation: 'none' }
  }
  if (majority(numericHits)) {
    if (majority(intHits)) {
      return { dataType: 'integer', alignment: 'right', aggregation: 'sum' }
    }
    return { dataType: 'decimal', alignment: 'right', aggregation: 'sum' }
  }
  return { dataType: 'text', alignment: 'left', aggregation: 'none' }
}

export function guessCurrencySymbol(values: unknown[]): '$' | '€' | '£' {
  for (const v of values) {
    const s = sampleValue(v)
    if (s.includes('€')) return '€'
    if (s.includes('£')) return '£'
    if (s.includes('$')) return '$'
  }
  return '$'
}

export function parseNumericValue(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'number') return raw
  const cleaned = String(raw)
    .replace(/[€$£%\s]/g, '')
    .replace(/,/g, '')
  const num = Number(cleaned)
  return Number.isNaN(num) ? null : num
}

export function parseDateValue(raw: unknown): Date | null {
  if (raw instanceof Date) return raw
  if (isExcelDateSerial(raw)) {
    // Excel epoch 1899-12-30
    const utcDays = Math.floor(Number(raw) - 25569)
    const utcValue = utcDays * 86400
    return new Date(utcValue * 1000)
  }
  if (typeof raw === 'string') {
    const s = raw.trim()
    const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (isoMatch) return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
    const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]))
    const parsed = new Date(s)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return null
}

export function estimateColumnWidth(header: string, values: unknown[], dataType: ColumnDataType): number {
  const lengths = values
    .slice(0, 200)
    .map((v) => (v === null || v === undefined ? 0 : String(v).length))
  const maxContentLen = Math.max(header.length, ...lengths, 0)

  let padding = 4
  if (dataType === 'currency' || dataType === 'percentage') padding = 5
  if (dataType === 'date') padding = 3

  const width = Math.min(Math.max(maxContentLen + padding, 10), 42)
  return width
}
