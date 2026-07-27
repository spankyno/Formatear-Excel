import React, { useEffect, useState } from 'react'
import { FileSpreadsheet, RefreshCw, Eye, Wand2, Info } from 'lucide-react'
import { useAppStore } from './store/useAppStore'
import { FileUpload } from './components/FileUpload'
import { PreviewTable } from './components/PreviewTable'
import { SheetSelector } from './components/SheetSelector'
import { ColumnTypeEditor } from './components/ColumnTypeEditor'
import { StyleCanvas } from './components/StyleCanvas'
import { GenerateButton } from './components/GenerateButton'
import { Stepper } from './components/Stepper'
import { AboutPage } from './components/AboutPage'
import { Footer } from './components/Footer'
import { DataCleaningPanel } from './components/DataCleaningPanel'
import { Card, CardBody, CardHeader, CardTitle } from './components/ui/Card'
import { Button } from './components/ui/Button'

const ABOUT_PATH = '/acerca-de'
const TITLES = {
  app: 'Formatear Excel — Convierte CSV/Excel en reportes ejecutivos profesionales',
  about: 'Acerca de Formatear Excel — Cómo funciona y stack tecnológico',
}

function usePathRoute() {
  const [isAbout, setIsAbout] = useState(() => window.location.pathname === ABOUT_PATH)

  useEffect(() => {
    document.title = isAbout ? TITLES.about : TITLES.app
  }, [isAbout])

  useEffect(() => {
    const onPopState = () => setIsAbout(window.location.pathname === ABOUT_PATH)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const goToAbout = () => {
    window.history.pushState({}, '', ABOUT_PATH)
    setIsAbout(true)
  }
  const goBack = () => {
    window.history.pushState({}, '', '/')
    setIsAbout(false)
  }

  return { isAbout, goToAbout, goBack }
}

function Header({ onNavigateAbout }: { onNavigateAbout: () => void }) {
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
      <div className="flex items-center gap-1">
        <a
          href="/acerca-de"
          onClick={(e) => {
            e.preventDefault()
            onNavigateAbout()
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Info size={13} /> Acerca de
        </a>
        {step !== 'upload' && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RefreshCw size={13} /> Nuevo archivo
          </Button>
        )}
      </div>
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
    <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      {/* Panel izquierdo: preview */}
      <div className="min-w-0 space-y-4">
        <DataCleaningPanel />
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Eye size={14} /> Vista previa en vivo
            </CardTitle>
            <span className="text-[11px] text-slate-400">{workbook.fileName}</span>
          </CardHeader>
          <CardBody className="min-w-0 space-y-3">
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
      <div className="min-w-0 space-y-4">
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
  const { isAbout, goToAbout, goBack } = usePathRoute()

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header onNavigateAbout={goToAbout} />
      <main className="flex-1">
        {isAbout ? <AboutPage onBack={goBack} /> : step === 'upload' ? <FileUpload /> : <WorkspaceView />}
      </main>
      <Footer onNavigateAbout={goToAbout} />
    </div>
  )
}
