import React from 'react'
import { useAppStore } from '../store/useAppStore'
import type { Alignment, BorderStyle } from '../lib/types'
import { Card, CardBody, CardHeader, CardTitle } from './ui/Card'
import { ThemeSelector } from './ThemeSelector'
import { Switch } from './ui/Switch'
import { InfoTooltip } from './ui/Tooltip'
import { cn } from '../lib/cn'

const FONTS = ['Calibri', 'Segoe UI', 'Georgia', 'Poppins', 'Verdana', 'Arial', 'Times New Roman']
const BORDER_STYLES: { value: BorderStyle; label: string }[] = [
  { value: 'none', label: 'Ninguno' },
  { value: 'thin', label: 'Delgado' },
  { value: 'medium', label: 'Medio' },
  { value: 'dashed', label: 'Discontinuo' },
  { value: 'dotted', label: 'Punteado' },
]
const ALIGN_OPTIONS: { value: Alignment | 'auto'; label: string }[] = [
  { value: 'auto', label: 'Auto (por tipo)' },
  { value: 'left', label: 'Izquierda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Derecha' },
]

function Field({ label, children, tooltip }: { label: string; children: React.ReactNode; tooltip?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-xs focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-[#12151d]'

export function StyleCanvas() {
  const theme = useAppStore((s) => s.theme)
  const patchTheme = useAppStore((s) => s.patchTheme)
  const options = useAppStore((s) => s.options)
  const setOptions = useAppStore((s) => s.setOptions)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>1. Elige un tema corporativo</CardTitle>
        </CardHeader>
        <CardBody>
          <ThemeSelector />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Personalización avanzada</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Color de fondo (cabecera)">
              <input
                type="color"
                value={theme.headerBg}
                onChange={(e) => patchTheme({ headerBg: e.target.value })}
                className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </Field>
            <Field label="Color de texto (cabecera)">
              <input
                type="color"
                value={theme.headerText}
                onChange={(e) => patchTheme({ headerText: e.target.value })}
                className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fuente de cabecera">
              <select
                className={inputClass}
                value={theme.headerFont}
                onChange={(e) => patchTheme({ headerFont: e.target.value })}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tamaño cabecera (pt)">
              <input
                type="number"
                min={8}
                max={20}
                className={inputClass}
                value={theme.headerFontSize}
                onChange={(e) => patchTheme({ headerFontSize: Number(e.target.value) })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fuente de cuerpo">
              <select
                className={inputClass}
                value={theme.bodyFont}
                onChange={(e) => patchTheme({ bodyFont: e.target.value })}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tamaño cuerpo (pt)">
              <input
                type="number"
                min={7}
                max={16}
                step={0.5}
                className={inputClass}
                value={theme.bodyFontSize}
                onChange={(e) => patchTheme({ bodyFontSize: Number(e.target.value) })}
              />
            </Field>
          </div>

          <Field label="Alineación global" tooltip="'Auto' respeta la alineación óptima según el tipo de cada columna (números a la derecha, texto a la izquierda).">
            <select
              className={inputClass}
              value={theme.globalAlignment}
              onChange={(e) => patchTheme({ globalAlignment: e.target.value as Alignment | 'auto' })}
            >
              {ALIGN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Estilo de borde">
              <select
                className={inputClass}
                value={theme.borderStyle}
                onChange={(e) => patchTheme({ borderStyle: e.target.value as BorderStyle })}
              >
                {BORDER_STYLES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Color de borde">
              <input
                type="color"
                value={theme.borderColor}
                onChange={(e) => patchTheme({ borderColor: e.target.value })}
                className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-800">
            <Switch checked={theme.zebra} onChange={(v) => patchTheme({ zebra: v })} label="Filas alternas (zebra)" />
            {theme.zebra && (
              <input
                type="color"
                value={theme.zebraColor}
                onChange={(e) => patchTheme({ zebraColor: e.target.value })}
                className="h-7 w-10 cursor-pointer rounded border border-slate-200 dark:border-slate-700"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fondo de totales">
              <input
                type="color"
                value={theme.totalsBg}
                onChange={(e) => patchTheme({ totalsBg: e.target.value })}
                className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </Field>
            <Field label="Texto de totales">
              <input
                type="color"
                value={theme.totalsText}
                onChange={(e) => patchTheme({ totalsText: e.target.value })}
                className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Qué aplicar al generar</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <Switch checked={options.applyStyles} onChange={(v) => setOptions({ applyStyles: v })} label="Aplicar estilos visuales" />
          <Switch checked={options.applyFormats} onChange={(v) => setOptions({ applyFormats: v })} label="Aplicar formatos automáticos (moneda, %, fecha…)" />
          <Switch checked={options.insertTotals} onChange={(v) => setOptions({ insertTotals: v })} label="Insertar fila de totales con fórmulas" />

          <div className="pt-2">
            <p className="pb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Modo de uso del estilo</p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: 'once', label: 'Aplicar una sola vez' },
                  { value: 'template', label: 'Guardar como plantilla' },
                ] as const
              ).map((m) => (
                <button
                  key={m.value}
                  onClick={() => setOptions({ mode: m.value })}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                    options.mode === m.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300'
                      : 'border-slate-200 text-slate-500 dark:border-slate-800'
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
