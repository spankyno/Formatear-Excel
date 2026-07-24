import React from 'react'
import {
  FileSpreadsheet,
  ArrowLeft,
  UploadCloud,
  Palette,
  Wand2,
  Download,
  Layers,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'

const STEPS = [
  {
    icon: UploadCloud,
    title: '1. Sube tu archivo',
    text: 'Arrastra o selecciona un archivo .csv o .xlsx. Puede tener una o varias hojas: verás una vista previa inmediata de la primera.',
  },
  {
    icon: Wand2,
    title: '2. Revisa la detección automática',
    text: 'La app detecta el tipo de cada columna (moneda, porcentaje, fecha, número, texto). Si algo no coincide, corrígelo manualmente en el panel de columnas.',
  },
  {
    icon: Palette,
    title: '3. Elige o personaliza un estilo',
    text: 'Selecciona un tema corporativo predefinido o personaliza colores, fuentes, alineación, bordes y filas alternas. La vista previa se actualiza en tiempo real.',
  },
  {
    icon: Layers,
    title: '4. Elige qué hojas y qué aplicar',
    text: 'Marca las hojas que quieres incluir en el libro final y decide si aplicar estilos, formatos automáticos y/o una fila de totales con fórmulas reales.',
  },
  {
    icon: Download,
    title: '5. Genera y descarga',
    text: 'Pulsa "Regenerar libro (.xlsx)" y descarga tu reporte ejecutivo, listo para presentar.',
  },
]

const STACK = [
  { name: 'Vite + React + TypeScript', desc: 'Base de la aplicación, 100% del lado del cliente.' },
  { name: 'Tailwind CSS', desc: 'Sistema de estilos e interfaz moderna, con modo claro/oscuro automático.' },
  { name: 'Zustand', desc: 'Gestión del estado global de la aplicación.' },
  { name: 'SheetJS (xlsx)', desc: 'Lectura de archivos CSV y Excel.' },
  { name: 'ExcelJS', desc: 'Generación del libro final con estilos, formatos y fórmulas reales.' },
  { name: 'file-saver', desc: 'Descarga del archivo generado en el navegador.' },
  { name: 'lucide-react', desc: 'Iconografía de la interfaz.' },
  { name: 'canvas-confetti', desc: 'El pequeño detalle festivo al descargar tu reporte.' },
]

export function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6">
        <ArrowLeft size={14} /> Volver a la aplicación
      </Button>

      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-600">
          <FileSpreadsheet size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Formatear Excel</h1>
        <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
          Una herramienta que convierte un CSV o Excel plano en un reporte ejecutivo profesional, listo
          para presentar a dirección — aplicando una "piel" de diseño corporativo, formatos automáticos
          y fórmulas reales de Excel. Todo ocurre en tu navegador: ningún archivo se sube a un servidor.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 size={14} /> Cómo se usa
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {STEPS.map((step) => (
              <div key={step.title} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600">
                  <step.icon size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{step.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{step.text}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers size={14} /> Stack tecnológico
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid gap-3 sm:grid-cols-2">
              {STACK.map((item) => (
                <div key={item.name} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck size={14} /> Privacidad
            </CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Formatear Excel es una aplicación 100% del lado del cliente: la lectura, el formateo y la
              generación del archivo final ocurren íntegramente en tu navegador. Tus archivos y datos
              nunca se envían ni se almacenan en ningún servidor.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
