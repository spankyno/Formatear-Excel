import { create } from 'zustand'
import type { ColumnMeta, GenerationOptions, RawWorkbook, ThemeConfig, WorkbookData } from '../lib/types'
import { PRESET_THEMES } from '../lib/themes'
import { loadCustomThemes } from '../lib/styleLibrary'
import { buildWorkbookInWorker } from '../lib/workerClient'
import { DEFAULT_CLEANING_OPTIONS, type CleaningOptions, type CleaningSummary } from '../lib/dataCleaner'

export type Step = 'upload' | 'style' | 'done'

interface AppState {
  step: Step
  rawWorkbook: RawWorkbook | null
  workbook: WorkbookData | null
  cleaningOptions: CleaningOptions
  cleaningSummaries: CleaningSummary[]
  isProcessing: boolean
  theme: ThemeConfig
  customThemes: ThemeConfig[]
  options: GenerationOptions
  isGenerating: boolean
  error: string | null

  ingestFile: (raw: RawWorkbook) => Promise<void>
  setCleaningOptions: (patch: Partial<CleaningOptions>) => Promise<void>
  setActiveSheet: (index: number) => void
  toggleSheetSelected: (index: number) => void
  updateColumn: (sheetIndex: number, colKey: string, patch: Partial<ColumnMeta>) => void
  setTheme: (theme: ThemeConfig) => void
  patchTheme: (patch: Partial<ThemeConfig>) => void
  setOptions: (patch: Partial<GenerationOptions>) => void
  refreshCustomThemes: () => void
  setStep: (step: Step) => void
  setGenerating: (v: boolean) => void
  setError: (msg: string | null) => void
  reset: () => void
}

const defaultOptions: GenerationOptions = {
  applyStyles: true,
  applyFormats: true,
  insertTotals: true,
  mode: 'once',
}

export const useAppStore = create<AppState>((set, get) => ({
  step: 'upload',
  rawWorkbook: null,
  workbook: null,
  cleaningOptions: DEFAULT_CLEANING_OPTIONS,
  cleaningSummaries: [],
  isProcessing: false,
  theme: PRESET_THEMES[0],
  customThemes: loadCustomThemes(),
  options: defaultOptions,
  isGenerating: false,
  error: null,

  ingestFile: async (raw) => {
    set({ isProcessing: true, error: null })
    try {
      const { workbook, summaries } = await buildWorkbookInWorker(raw, DEFAULT_CLEANING_OPTIONS)
      set({
        rawWorkbook: raw,
        workbook,
        cleaningOptions: DEFAULT_CLEANING_OPTIONS,
        cleaningSummaries: summaries,
        step: 'style',
        isProcessing: false,
      })
    } catch (e) {
      console.error(e)
      set({ isProcessing: false, error: 'No se pudo procesar el archivo. Verifica que no esté dañado.' })
    }
  },

  setCleaningOptions: async (patch) => {
    const state = get()
    if (!state.rawWorkbook) return
    const nextOptions = { ...state.cleaningOptions, ...patch }

    set({ isProcessing: true })
    try {
      const { workbook, summaries } = await buildWorkbookInWorker(state.rawWorkbook, nextOptions)

      // Conservar selección de hojas activa y hojas incluidas/excluidas si coinciden por nombre
      const prevByName = new Map(state.workbook?.sheets.map((s) => [s.name, s.selected]) ?? [])
      workbook.sheets = workbook.sheets.map((s) => ({
        ...s,
        selected: prevByName.has(s.name) ? prevByName.get(s.name)! : s.selected,
      }))
      workbook.activeSheetIndex = Math.min(state.workbook?.activeSheetIndex ?? 0, workbook.sheets.length - 1)

      set({ cleaningOptions: nextOptions, workbook, cleaningSummaries: summaries, isProcessing: false })
    } catch (e) {
      console.error(e)
      set({ isProcessing: false, error: 'No se pudo aplicar la limpieza de datos.' })
    }
  },

  setActiveSheet: (index) =>
    set((state) => (state.workbook ? { workbook: { ...state.workbook, activeSheetIndex: index } } : {})),

  toggleSheetSelected: (index) =>
    set((state) => {
      if (!state.workbook) return {}
      const sheets = state.workbook.sheets.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s))
      return { workbook: { ...state.workbook, sheets } }
    }),

  updateColumn: (sheetIndex, colKey, patch) =>
    set((state) => {
      if (!state.workbook) return {}
      const sheets = state.workbook.sheets.map((sheet, i) => {
        if (i !== sheetIndex) return sheet
        const columns = sheet.columns.map((c) => (c.key === colKey ? { ...c, ...patch } : c))
        return { ...sheet, columns }
      })
      return { workbook: { ...state.workbook, sheets } }
    }),

  setTheme: (theme) => set({ theme }),

  patchTheme: (patch) => set((state) => ({ theme: { ...state.theme, ...patch, isCustom: true, id: state.theme.id } })),

  setOptions: (patch) => set((state) => ({ options: { ...state.options, ...patch } })),

  refreshCustomThemes: () => set({ customThemes: loadCustomThemes() }),

  setStep: (step) => set({ step }),
  setGenerating: (v) => set({ isGenerating: v }),
  setError: (msg) => set({ error: msg }),

  reset: () =>
    set({
      step: 'upload',
      rawWorkbook: null,
      workbook: null,
      cleaningOptions: DEFAULT_CLEANING_OPTIONS,
      cleaningSummaries: [],
      error: null,
    }),
}))

export function allThemes(): ThemeConfig[] {
  return [...PRESET_THEMES, ...loadCustomThemes()]
}
