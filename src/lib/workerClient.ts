import type { CleaningOptions } from './dataCleaner'
import type { GenerationOptions, RawWorkbook, SheetData, ThemeConfig, WorkbookData } from './types'
import type { CleaningSummary } from './dataCleaner'

let dataWorker: Worker | null = null
let exportWorker: Worker | null = null
let requestSeq = 0

function nextId(): string {
  requestSeq += 1
  return `req_${requestSeq}_${Date.now()}`
}

function getDataWorker(): Worker {
  if (!dataWorker) {
    dataWorker = new Worker(new URL('../workers/dataWorker.ts', import.meta.url), { type: 'module' })
  }
  return dataWorker
}

function getExportWorker(): Worker {
  if (!exportWorker) {
    exportWorker = new Worker(new URL('../workers/exportWorker.ts', import.meta.url), { type: 'module' })
  }
  return exportWorker
}

function callWorker<TResult>(worker: Worker, payload: Record<string, unknown>, transfer: Transferable[] = []): Promise<TResult> {
  return new Promise((resolve, reject) => {
    const id = nextId()

    const onMessage = (event: MessageEvent<{ id: string; ok: boolean; result?: TResult; error?: string }>) => {
      if (event.data.id !== id) return
      worker.removeEventListener('message', onMessage)
      worker.removeEventListener('error', onError)
      if (event.data.ok) resolve(event.data.result as TResult)
      else reject(new Error(event.data.error ?? 'Error desconocido en el worker'))
    }
    const onError = (err: ErrorEvent) => {
      worker.removeEventListener('message', onMessage)
      worker.removeEventListener('error', onError)
      reject(new Error(err.message || 'Error inesperado en el worker'))
    }

    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', onError)
    worker.postMessage({ ...payload, id }, transfer)
  })
}

/** Lee un archivo CSV/XLSX en un Web Worker (no bloquea la interfaz) y devuelve su estructura cruda. */
export async function parseFileInWorker(file: File): Promise<RawWorkbook> {
  const buffer = await file.arrayBuffer()
  const isCsv = file.name.toLowerCase().endsWith('.csv')
  return callWorker<RawWorkbook>(
    getDataWorker(),
    { type: 'parse', fileName: file.name, isCsv, buffer },
    [buffer]
  )
}

/** Aplica limpieza inteligente + detección de tipos en un Web Worker. */
export function buildWorkbookInWorker(
  raw: RawWorkbook,
  options: CleaningOptions
): Promise<{ workbook: WorkbookData; summaries: CleaningSummary[] }> {
  return callWorker(getDataWorker(), { type: 'build', raw, options })
}

/** Genera el libro final (.xlsx) en un Web Worker y devuelve su buffer, listo para descargar. */
export function generateWorkbookInWorker(
  sheets: SheetData[],
  theme: ThemeConfig,
  options: GenerationOptions,
  fileName: string
): Promise<{ buffer: ArrayBuffer; outputName: string }> {
  return callWorker(getExportWorker(), { sheets, theme, options, fileName })
}
