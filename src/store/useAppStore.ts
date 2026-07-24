import { create } from 'zustand'
import type { ColumnMeta, GenerationOptions, ThemeConfig, WorkbookData } from '../lib/types'
import { PRESET_THEMES } from '../lib/themes'
import { loadCustomThemes } from '../lib/styleLibrary'

export type Step = 'upload' | 'style' | 'done'

interface AppState {
  step: Step
  workbook: WorkbookData | null
  theme: ThemeConfig
  customThemes: ThemeConfig[]
  options: GenerationOptions
  isGenerating: boolean
  error: string | null

  setWorkbook: (wb: WorkbookData) => void
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
  workbook: null,
  theme: PRESET_THEMES[0],
  customThemes: loadCustomThemes(),
  options: defaultOptions,
  isGenerating: false,
  error: null,

  setWorkbook: (wb) => set({ workbook: wb, step: 'style', error: null }),

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

  reset: () => set({ step: 'upload', workbook: null, error: null }),
}))

export function allThemes(): ThemeConfig[] {
  return [...PRESET_THEMES, ...loadCustomThemes()]
}
