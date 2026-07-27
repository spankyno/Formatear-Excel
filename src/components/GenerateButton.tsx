import React from 'react'
import confetti from 'canvas-confetti'
import { saveAs } from 'file-saver'
import { Sparkles, Loader2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { generateWorkbookInWorker } from '../lib/workerClient'
import { Button } from './ui/Button'

function fireConfetti() {
  const duration = 900
  const end = Date.now() + duration
  const colors = ['#3762f7', '#8aacff', '#ffffff']
  ;(function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      scalar: 0.8,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      scalar: 0.8,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

export function GenerateButton() {
  const workbook = useAppStore((s) => s.workbook)
  const theme = useAppStore((s) => s.theme)
  const options = useAppStore((s) => s.options)
  const isGenerating = useAppStore((s) => s.isGenerating)
  const setGenerating = useAppStore((s) => s.setGenerating)
  const setError = useAppStore((s) => s.setError)

  const handleGenerate = async () => {
    if (!workbook) return
    const selectedSheets = workbook.sheets.filter((s) => s.selected)
    if (selectedSheets.length === 0) {
      setError('Selecciona al menos una hoja para generar el reporte.')
      return
    }
    setGenerating(true)
    setError(null)
    try {
      const { buffer, outputName } = await generateWorkbookInWorker(workbook.sheets, theme, options, workbook.fileName)
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      saveAs(blob, outputName)
      fireConfetti()
    } catch (e) {
      console.error(e)
      setError('Ocurrió un error generando el archivo. Intenta nuevamente.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button size="lg" className="w-full" onClick={handleGenerate} disabled={isGenerating || !workbook}>
      {isGenerating ? (
        <>
          <Loader2 size={18} className="animate-spin" /> Generando libro…
        </>
      ) : (
        <>
          <Sparkles size={18} /> Regenerar libro (.xlsx)
        </>
      )}
    </Button>
  )
}
