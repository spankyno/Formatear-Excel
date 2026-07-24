import type { ThemeConfig } from './types'

const STORAGE_KEY = 'formatear-excel:custom-themes:v1'

export function loadCustomThemes(): ThemeConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCustomThemes(themes: ThemeConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes))
  } catch {
    // Almacenamiento no disponible: se ignora silenciosamente
  }
}

export function upsertCustomTheme(theme: ThemeConfig): ThemeConfig[] {
  const current = loadCustomThemes()
  const idx = current.findIndex((t) => t.id === theme.id)
  if (idx >= 0) current[idx] = theme
  else current.push(theme)
  saveCustomThemes(current)
  return current
}

export function deleteCustomTheme(id: string): ThemeConfig[] {
  const current = loadCustomThemes().filter((t) => t.id !== id)
  saveCustomThemes(current)
  return current
}

export function renameCustomTheme(id: string, name: string): ThemeConfig[] {
  const current = loadCustomThemes()
  const idx = current.findIndex((t) => t.id === id)
  if (idx >= 0) current[idx] = { ...current[idx], name }
  saveCustomThemes(current)
  return current
}
