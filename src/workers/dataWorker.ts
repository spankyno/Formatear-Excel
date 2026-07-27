/// <reference lib="webworker" />
import { parseFileRaw, buildWorkbookFromRaw } from '../lib/fileParser'
import type { CleaningOptions } from '../lib/dataCleaner'
import type { RawWorkbook } from '../lib/types'

type Request =
  | { id: string; type: 'parse'; fileName: string; isCsv: boolean; buffer: ArrayBuffer }
  | { id: string; type: 'build'; raw: RawWorkbook; options: CleaningOptions }

type Response = { id: string; ok: true; result: unknown } | { id: string; ok: false; error: string }

const ctx = self as unknown as DedicatedWorkerGlobalScope

ctx.onmessage = (event: MessageEvent<Request>) => {
  const msg = event.data
  try {
    if (msg.type === 'parse') {
      const raw = parseFileRaw({ fileName: msg.fileName, buffer: msg.buffer, isCsv: msg.isCsv })
      const response: Response = { id: msg.id, ok: true, result: raw }
      ctx.postMessage(response)
    } else if (msg.type === 'build') {
      const result = buildWorkbookFromRaw(msg.raw, msg.options)
      const response: Response = { id: msg.id, ok: true, result }
      ctx.postMessage(response)
    }
  } catch (err) {
    const response: Response = { id: msg.id, ok: false, error: err instanceof Error ? err.message : String(err) }
    ctx.postMessage(response)
  }
}
