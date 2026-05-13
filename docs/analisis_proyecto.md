# Análisis del Proyecto: `documentacion-app`

## Visión General

Aplicación web **frontend-only** para crear documentación técnica tipo "Mesa de Servicios" mediante un wizard de 3 pasos, con exportación a Excel usando una plantilla oficial. Sin backend — todo funciona en el navegador.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| Componentes UI | shadcn/ui (Radix primitives) |
| Estado global | Zustand |
| Formularios | React Hook Form + Zod |
| Excel | ExcelJS |
| Persistencia | localForage (IndexedDB) |
| Notificaciones | Sonner + SweetAlert2 |

---

## Arquitectura

### Capas

1. **Páginas** (`src/app/`) — Dashboard (`/`) y Wizard (`/nuevo`)
2. **Componentes** (`src/components/wizard/`) — WizardShell orquesta 3 steps
3. **Datos/negocio** (`src/lib/`, `src/stores/`, `src/data/`) — Lógica, persistencia, tipos

### Flujo de Datos

```
Usuario → React Hook Form → Zustand Store → localForage (IndexedDB)
                                              ↓
                                         ExcelJS → Blob → Download
```

El store de Zustand es la fuente de verdad única. Cada cambio se auto-persiste a IndexedDB.

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx                   # Dashboard (ruta /)
│   └── nuevo/
│       └── page.tsx               # Wizard (ruta /nuevo)
├── components/
│   ├── wizard/
│   │   ├── WizardShell.tsx        # Orquestador multi-paso
│   │   ├── steps/
│   │   │   ├── StepGeneral.tsx    # Paso 1: Datos generales
│   │   │   ├── StepDetalle.tsx    # Paso 2: Detalle jerárquico
│   │   │   └── StepResumen.tsx    # Paso 3: Resumen + exportación
│   │   └── ui/
│   │       ├── DetalleRowEditor.tsx    # Editor de ítem (slide-out)
│   │       ├── CategoriaAccordion.tsx  # Acordeón de categorías
│   │       └── ...                     # Otros subcomponentes
│   └── ui/                        # shadcn/ui components genéricos
├── lib/
│   ├── document.ts                # Tipos TypeScript + esquemas Zod
│   ├── storage.ts                 # Persistencia con localForage
│   ├── utils.ts                   # cn() — merge de clases Tailwind
│   └── excel/
│       ├── exportExcel.ts         # Motor de exportación (~760 líneas)
│       └── excelAnchors.ts        # Constantes de mapeo de celdas
├── stores/
│   └── docStore.ts                # Store Zustand (estado global + auto-save)
├── data/
│   ├── catalogo.json              # Catálogo jerárquico (Categoría → Sub → Item)
│   └── datos.json                 # Opciones maestras (SLA, tipos, ámbitos, sitios)
└── hooks/
    ├── useCatalogo.ts             # Hook para leer catalogo.json
    └── useDataOptions.ts          # Hook para leer datos.json
```

---

## Wizard — 3 Pasos

### Paso 1: Datos Generales (`StepGeneral.tsx`)
- Formulario con React Hook Form + Zod
- Campos: nombre, objetivo, plantilla, ámbito, sitio, contacto, usuarios, alcance, retención, reportes, observaciones, autorizado por, revisado
- Sincronización inmediata con el store vía `watch()`
- Soporte para campos combinables con opción "Otro"

### Paso 2: Detalle (`StepDetalle.tsx`)
- Estructura jerárquica de 3 niveles: **Categorías → Subcategorías → Ítems**
- Cada ítem tiene: SLA, grupo, tipo información, buzón, detalle, observaciones, aprobadores, formulario Zoho, grupos asistencia/usuario
- Campos adicionales dinámicos por ítem (título + tipo)
- Selects en cascada basados en `catalogo.json`

### Paso 3: Resumen y Exportación (`StepResumen.tsx`)
- Vista previa de todos los datos capturados
- Upload de flujograma (PNG/JPG → base64)
- Exportación a Excel:
  - Carga plantilla oficial desde `/public/templates/`
  - Rellena datos generales en celdas específicas
  - Construye tabla detalle con merges verticales
  - Inserta flujograma debajo de la tabla
  - Descarga como `DOCUMENTACION - {nombreServicio}.xlsx`

---

## Modelo de Datos (Jerárquico v2.0)

```
DocumentDraft
├── id, createdAt, updatedAt, status
├── general: GeneralData
│   └── nombreServicio, objetivo, plantilla, ambito, sitio, etc.
├── detalle: Categoria[]
│   └── Categoria
│       ├── id, nombre
│       └── subcategorias: Subcategoria[]
│           └── Subcategoria
│               ├── id, nombre, aprobadores
│               └── items: Item[]
│                   └── Item
│                       ├── itemNombre, detalle, sla
│                       ├── grupo (2 niveles: título + contenido)
│                       ├── tipoInformacion, buzon
│                       ├── aprobadores (override de subcategoría)
│                       ├── formularioZoho
│                       ├── gruposAsistencia (2 niveles)
│                       ├── gruposUsuario (2 niveles)
│                       ├── observaciones
│                       └── camposAdicionales: { titulo, tipo, requerido }[]
└── flowchart: { fileName, mimeType, base64 } (opcional)
```

---

## Persistencia

- **localForage** (IndexedDB con fallback a localStorage)
- Auto-guardado en cada mutación del store
- Migración automática de tipos legacy (ej. "Linea unica" → "Texto", "Multilinea" → "Texto largo")
- Validación con Zod al cargar

---

## Exportación Excel

- **Biblioteca:** ExcelJS
- **Plantilla:** `public/templates/DOCUMENTACION MESA DE SERVICIOS.xlsx`
- **Datos generales:** Escritura en celdas fijas (C3:C15)
- **Tabla detalle:** Construcción dinámica con merges verticales para categorías, subcategorías e ítems
- **Estilos:** Bordes finos/gruesos, fuente Roboto, alineación centrada, wrap text
- **Flujograma:** Inserción de imagen desde base64
- **Aprobadores:** Herencia — si el ítem no tiene aprobadores, usa los de la subcategoría

---

## Puntos clave

- **100% client-side** — sin backend, sin API routes
- **Catálogo configurable** vía `catalogo.json`
- **Opciones maestras** vía `datos.json`
- **Accesibilidad** — navegación por teclado, aria-labels, focus visible
- **Guardado automático** — no se pierde progreso
- **Sin pruebas automatizadas** — no se encontraron test files
