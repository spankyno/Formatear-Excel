import React, { useCallback, useRef, useState } from 'react'
import { FileSpreadsheet, UploadCloud, Loader2 } from 'lucide-react'
import { parseFile } from '../lib/fileParser'
import { useAppStore } from '../store/useAppStore'
import { Card } from './ui/Card'
import { cn } from '../lib/cn'

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const setWorkbook = useAppStore((s) => s.setWorkbook)
  const setError = useAppStore((s) => s.setError)
  const error = useAppStore((s) => s.error)

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return
      const validExt = /\.(csv|xlsx|xls)$/i.test(file.name)
      if (!validExt) {
        setError('Formato no soportado. Sube un archivo .csv o .xlsx')
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const wb = await parseFile(file)
        setWorkbook(wb)
      } catch (e) {
        console.error(e)
        setError('No se pudo leer el archivo. Verifica que no esté dañado o protegido.')
      } finally {
        setIsLoading(false)
      }
    },
    [setWorkbook, setError]
  )

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16 animate-fade-in">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-600">
          <FileSpreadsheet size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Formatear Excel</h1>
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
          Sube un CSV o Excel plano y transfórmalo en un reporte ejecutivo profesional, listo para
          presentar a dirección.
        </p>
      </div>

      <Card
        className={cn(
          'w-full cursor-pointer border-2 border-dashed p-10 text-center transition-colors',
          isDragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20' : 'border-slate-300 dark:border-slate-700'
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="animate-spin" size={28} />
            <span className="text-sm">Leyendo archivo…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <UploadCloud size={30} className="text-slate-400" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Arrastra tu archivo aquí o haz clic para seleccionarlo
            </p>
            <p className="text-xs text-slate-400">Soporta .csv y .xlsx — cualquier número de hojas</p>
          </div>
        )}
      </Card>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
