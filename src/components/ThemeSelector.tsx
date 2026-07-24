import React, { useState } from 'react'
import { PRESET_THEMES } from '../lib/themes'
import { useAppStore } from '../store/useAppStore'
import { deleteCustomTheme, renameCustomTheme, upsertCustomTheme } from '../lib/styleLibrary'
import { Save, Trash2, Pencil, Check } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button } from './ui/Button'

function Swatch({ color }: { color: string }) {
  return <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />
}

export function ThemeSelector() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const customThemes = useAppStore((s) => s.customThemes)
  const refreshCustomThemes = useAppStore((s) => s.refreshCustomThemes)

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleSaveCurrent = () => {
    const name = newName.trim() || `Mi estilo ${customThemes.length + 1}`
    const id = `custom-${Date.now()}`
    upsertCustomTheme({ ...theme, id, name, isCustom: true })
    refreshCustomThemes()
    setNewName('')
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Temas predefinidos</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                theme.id === t.id
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
              )}
            >
              <Swatch color={t.headerBg} />
              <span className="truncate font-medium text-slate-700 dark:text-slate-200">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {customThemes.length > 0 && (
        <div>
          <p className="pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Mis estilos guardados</p>
          <div className="space-y-1.5">
            {customThemes.map((t) => (
              <div
                key={t.id}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs',
                  theme.id === t.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                    : 'border-slate-200 dark:border-slate-800'
                )}
              >
                <Swatch color={t.headerBg} />
                {editingId === t.id ? (
                  <input
                    autoFocus
                    className="flex-1 rounded border border-slate-300 bg-transparent px-1.5 py-0.5 text-xs"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        renameCustomTheme(t.id, editingName.trim() || t.name)
                        refreshCustomThemes()
                        setEditingId(null)
                      }
                    }}
                  />
                ) : (
                  <button className="flex-1 truncate text-left font-medium text-slate-700 dark:text-slate-200" onClick={() => setTheme(t)}>
                    {t.name}
                  </button>
                )}
                {editingId === t.id ? (
                  <button
                    onClick={() => {
                      renameCustomTheme(t.id, editingName.trim() || t.name)
                      refreshCustomThemes()
                      setEditingId(null)
                    }}
                    className="text-emerald-600"
                  >
                    <Check size={13} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(t.id)
                      setEditingName(t.name)
                    }}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <Pencil size={13} />
                  </button>
                )}
                <button
                  onClick={() => {
                    deleteCustomTheme(t.id)
                    refreshCustomThemes()
                  }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre del nuevo estilo…"
          className="flex-1 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-xs focus:border-brand-500 focus:outline-none dark:border-slate-700"
        />
        <Button size="sm" variant="outline" onClick={handleSaveCurrent}>
          <Save size={13} /> Guardar
        </Button>
      </div>
    </div>
  )
}
