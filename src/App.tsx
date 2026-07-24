import React from 'react'
import { FileSpreadsheet, RefreshCw, Eye, Wand2 } from 'lucide-react'
import { useAppStore } from './store/useAppStore'
import { FileUpload } from './components/FileUpload'
import { PreviewTable } from './components/PreviewTable'
import { SheetSelector } from './components/SheetSelector'
import { ColumnTypeEditor } from './components/ColumnTypeEditor'
import { StyleCanvas } from './components/StyleCanvas'
import { GenerateButton } from './components/GenerateButton'
import { Stepper } from './components/Stepper'
import { Card, CardBody, CardHeader, CardTitle } from './components/ui/Card'
import { Button } from './components/ui/Button'

function Header() {
  const step = useAppStore((s) => s.step)
  const reset = useAppStore((s) => s.reset)
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur dark:border-slate-800 dark:bg-[#0b0e14]/80">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <FileSpreadsheet size={16} />
        </div>
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Formatear Excel</span>
      </div>
      <Stepper current={step} />
      {step !== 'upload' ? (
        <Button variant="ghost" size="sm" onClick={reset}>
          <RefreshCw size={13} /> Nuevo archivo
        </Button>
      ) : (
        <div className="w-[110px]" />
      )}
    </header>
  )
}

function WorkspaceView() {
  const workbook = useAppStore((s) => s.workbook)
  const theme = useAppStore((s) => s.theme)
  const options = useAppStore((s) => s.options)
  const error = useAppStore((s) => s.error)

  if (!workbook) return null
  const activeSheet = workbook.sheets[workbook.activeSheetIndex]

  return (
    <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 p-6 lg:grid-cols-[1.15fr_0.85fr]">
      {/* Panel izquierdo: preview */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Eye size={14} /> Vista previa en vivo
            </CardTitle>
            <span className="text-[11px] text-slate-400">{workbook.fileName}</span>
          </CardHeader>
          <CardBody className="space-y-3">
            <SheetSelector />
            <PreviewTable sheet={activeSheet} theme={theme} styled showTotals={options.insertTotals} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detección automática de tipos</CardTitle>
          </CardHeader>
          <CardBody>
            <ColumnTypeEditor />
          </CardBody>
        </Card>
      </div>

      {/* Panel derecho: style canvas */}
      <div className="space-y-4">
        <StyleCanvas />
        <Card className="sticky bottom-4">
          <CardBody className="space-y-3">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            )}
            <GenerateButton />
            <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
              <Wand2 size={12} /> El archivo conserva fórmulas reales de Excel y está listo para presentar.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default function App() {
  const step = useAppStore((s) => s.step)

  return (
    <div className="min-h-screen">
      <Header />
      {step === 'upload' ? <FileUpload /> : <WorkspaceView />}
    </div>
  )
}
