import React from 'react'
import { Info, Mail, BookOpen, LayoutGrid } from 'lucide-react'

export function Footer({ onNavigateAbout }: { onNavigateAbout: () => void }) {
  return (
    <footer className="border-t border-slate-200 bg-white/60 px-6 py-6 dark:border-slate-800 dark:bg-[#0b0e14]/60">
      <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 sm:flex-row">
        <p>Aitor Sánchez Gutiérrez © 2026 - Reservados todos los derechos</p>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <a
            href="/acerca-de"
            onClick={(e) => {
              e.preventDefault()
              onNavigateAbout()
            }}
            className="flex items-center gap-1.5 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
          >
            <Info size={13} /> Acerca de
          </a>
          <a
            href="https://aitor-blog-contacto.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
          >
            <Mail size={13} /> Contacto
          </a>
          <a
            href="https://aitorsanchez.pages.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
          >
            <BookOpen size={13} /> Blog
          </a>
          <a
            href="https://aitorhub.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
          >
            <LayoutGrid size={13} /> Más apps
          </a>
        </nav>
      </div>
    </footer>
  )
}
