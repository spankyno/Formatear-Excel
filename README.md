# 📊 Formatear Excel

Herramienta 100% *client-side* que convierte un CSV o Excel plano en un **reporte ejecutivo profesional (.xlsx)**, con estilos corporativos, formatos automáticos y fórmulas reales de Excel. Nada se sube a ningún servidor: todo el procesamiento ocurre en el navegador.

---

## ✨ Funcionalidades

- **Subida de archivos**: `.csv` y `.xlsx` (cualquier número de hojas), con drag & drop y vista previa inmediata.
- **Lienzo de estilos en vivo**: 6 temas corporativos predefinidos (Minimal Corporate, Tech Blue, Executive Dark, Finance Green, Modern Purple, Sunset Coral) + personalización avanzada de color, fuente, alineación, bordes y zebra stripes.
- **Auto-formato inteligente**: detecta moneda, porcentaje, fecha, enteros, decimales y texto por columna — editable manualmente.
- **Ancho de columna automático** (evita el clásico `###`).
- **Fila de totales con fórmulas reales** (`SUMA`, `PROMEDIO`, `CONTAR`) sobre columnas numéricas detectadas.
- **Biblioteca de estilos** guardada en `localStorage`: crear, renombrar y eliminar tus propios temas.
- **Selección de hojas** a formatear (todas o algunas).
- **Exportación** a `.xlsx` con estilos, formatos y fórmulas reales, generado con ExcelJS.
- Modo claro/oscuro automático (según el sistema) y confeti sutil al descargar 🎉.

---

## 🧱 Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Vite + React 18 + TypeScript |
| Estilos | Tailwind CSS (+ componentes propios estilo shadcn/ui) |
| Estado | Zustand |
| Lectura de archivos | [SheetJS (`xlsx`)](https://sheetjs.com/) |
| Escritura con estilos y fórmulas | [ExcelJS](https://github.com/exceljs/exceljs) |
| Descarga | `file-saver` |
| Iconos | `lucide-react` |
| Confeti | `canvas-confetti` |

Todo corre en el navegador: no hay backend, no hay API keys, no se envían datos a ningún servidor.

---

## 🚀 Cómo ejecutarlo

Requisitos: Node.js 18+ y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el entorno de desarrollo
npm run dev
# → abre http://localhost:5173

# 3. (Opcional) Compilar para producción
npm run build
npm run preview
```

El resultado de `npm run build` es una carpeta `dist/` 100% estática: puedes desplegarla en Vercel, Netlify, GitHub Pages, S3, o simplemente abrir `dist/index.html` sirviéndolo con cualquier servidor estático.

---

## 🗂️ Estructura del proyecto

```
formatear-excel/
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ vite.config.ts
├─ src/
│  ├─ main.tsx                  # entrypoint de React
│  ├─ App.tsx                   # layout de dos paneles + flujo por pasos
│  ├─ index.css                 # estilos base + Tailwind
│  ├─ store/
│  │  └─ useAppStore.ts         # estado global (Zustand)
│  ├─ lib/
│  │  ├─ types.ts               # tipos compartidos (ColumnMeta, ThemeConfig...)
│  │  ├─ themes.ts              # temas corporativos predefinidos
│  │  ├─ typeDetector.ts        # detección automática de tipo de dato por columna
│  │  ├─ fileParser.ts          # lectura de CSV/XLSX con SheetJS
│  │  ├─ excelGenerator.ts      # ⭐ generación del .xlsx final con ExcelJS (estilos + fórmulas)
│  │  ├─ styleLibrary.ts        # persistencia de estilos en localStorage
│  │  └─ cn.ts                  # helper de clases CSS
│  └─ components/
│     ├─ FileUpload.tsx         # zona de drag & drop
│     ├─ PreviewTable.tsx       # tabla de vista previa (original y con estilos)
│     ├─ SheetSelector.tsx      # pestañas de hojas + selección múltiple
│     ├─ ColumnTypeEditor.tsx   # corrección manual de tipo/alineación/agregación
│     ├─ ThemeSelector.tsx      # selección y biblioteca de temas
│     ├─ StyleCanvas.tsx        # panel de personalización avanzada
│     ├─ GenerateButton.tsx     # botón de generación + confeti
│     ├─ Stepper.tsx            # indicador de progreso por pasos
│     └─ ui/                    # Button, Card, Switch, Tooltip
└─ README.md
```

---

## 🧠 Lógica central: `excelGenerator.ts`

Este es el corazón de la herramienta. Recibe las hojas ya parseadas (`SheetData[]`), un `ThemeConfig` y las `GenerationOptions`, y construye un `ExcelJS.Workbook` real:

1. **Crea una hoja por cada hoja seleccionada**, con congelación de la fila de cabecera y auto-filtro.
2. **Aplica estilos** a la cabecera (color de fondo/texto, fuente, negrita, bordes) según el tema activo.
3. **Convierte cada valor** al tipo correcto (número, fecha, porcentaje) antes de escribirlo, para que Excel lo reconozca como un dato real y no como texto.
4. **Aplica formatos numéricos nativos de Excel** (`numFmt`) por columna: `$#,##0.00`, `0.00%`, `dd/mm/yyyy`, `#,##0`, etc.
5. **Aplica zebra stripes** alternando el color de fondo en filas pares.
6. **Inserta una fila de totales con fórmulas reales** (`=SUMA(B2:B50)`, `=PROMEDIO(...)`, `=CONTAR(...)`) — no valores estáticos — para las columnas numéricas marcadas con una agregación.
7. **Genera el archivo** con `workbook.xlsx.writeBuffer()` y lo descarga con `file-saver`.

Fragmento representativo (fórmulas reales, no texto):

```ts
const letter = colLetter(idx) // A, B, C...
const range = `${letter}2:${letter}${lastDataRowNumber}`
cell.value = { formula: `SUM(${range})` } // fórmula real de Excel, recalculable
cell.numFmt = numberFormatFor(col)        // ej. "$#,##0.00"
```

---

## 🎨 Cómo se detecta el tipo de cada columna

`typeDetector.ts` analiza una muestra de valores de cada columna y calcula qué porcentaje matchea patrones de:

- **Moneda**: `$1,250.00`, `€980,50`…
- **Porcentaje**: `45%`, `12.5 %`…
- **Fecha**: `dd/mm/yyyy`, `yyyy-mm-dd`, fechas nativas de Excel (números de serie) o `Date`.
- **Números**: enteros vs decimales.

Si ≥60% de los valores no vacíos matchean un patrón, se asigna ese tipo. El usuario puede corregirlo manualmente en cualquier momento desde el panel "Detección automática de tipos".

---

## 📌 Notas de producto

- El modo **"Aplicar una sola vez"** no persiste el tema; **"Guardar como plantilla"** te sugiere guardarlo en tu biblioteca de estilos para reutilizarlo en futuros archivos.
- Puedes tener **varias hojas** en el archivo original y decidir a cuáles aplicar el formato (el resto se omite del libro final).
- Todo el estado vive en memoria + `localStorage` (solo para tus estilos guardados). Ningún dato del archivo subido sale de tu navegador.

---

## 🛣️ Posibles extensiones futuras

- Exportar/importar estilos como archivo `.json` para compartir entre equipos.
- Plantillas por hoja (aplicar temas distintos a hojas distintas del mismo libro).
- Soporte para gráficos nativos de Excel generados automáticamente a partir de los totales.
- Historial de archivos procesados (IndexedDB).
