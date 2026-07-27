/// <reference lib="webworker" />
import { buildWorkbookBuffer } from '../lib/excelGenerator'
import type { GenerationOptions, SheetData, ThemeConfig } from '../lib/types'

interface Request {
  id: string
  sheets: SheetData[]
  theme: ThemeConfig
  options: GenerationOptions
  fileName: string
}

type Response =
  | { id: string; ok: true; result: { buffer: ArrayBuffer; outputName: string } }
  | { id: string; ok: false; error: string }

const ctx = self as unknown as DedicatedWorkerGlobalScope

ctx.onmessage = async (event: MessageEvent<Request>) => {
  const { id, sheets, theme, options, fileName } = event.data
  try {
    const result = await buildWorkbookBuffer(sheets, theme, options, fileName)
    const response: Response = { id, ok: true, result }
    ctx.postMessage(response, [result.buffer])
  } catch (err) {
    const response: Response = { id, ok: false, error: err instanceof Error ? err.message : String(err) }
    ctx.postMessage(response)
  }
}
