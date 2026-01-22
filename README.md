# Mesa de Servicios - Sistema de Documentación

Sistema web para crear y mantener documentos de "Documentación Mesa de Servicio" mediante un wizard paso a paso, con exportación a Excel usando el template oficial.

## 🚀 Características

- **Wizard multi-paso** para captura de datos
- **Guardado automático** con localStorage (no se pierde el progreso)
- **Exportación a Excel** usando el template oficial
- **Campos adicionales personalizados** (micro-paso: captura título + tipo simultáneamente)
- **Upload de flujograma** con vista previa
- **Accesibilidad** completa por teclado
- **Sin backend** - funciona completamente en el navegador

## 📋 Requisitos

- Node.js 18+ 
- npm o yarn

## 🛠️ Instalación

```bash
# Clonar o descargar el proyecto
cd mesa-servicios-app

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
mesa-servicios-app/
├── src/
│   ├── app/                  # Páginas Next.js (App Router)
│   │   ├── page.tsx         # Dashboard
│   │   └── nuevo/page.tsx   # Wizard
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── WizardShell.tsx        # Orquestador del wizard
│   │   │   ├── steps/
│   │   │   │   ├── StepGeneral.tsx    # Paso 1: Datos generales
│   │   │   │   ├── StepDetalle.tsx    # Paso 2: Tabla de detalle
│   │   │   │   └── StepResumen.tsx    # Paso 3: Resumen + exportación
│   │   │   └── ui/
│   │   │       └── DetalleRowEditor.tsx  # Editor de fila (micro-paso)
│   │   └── ui/              # Componentes shadcn/ui
│   ├── data/
│   │   ├── catalog.json     # ⚠️ Catálogo de categorías/subcategorías/items
│   │   └── options.ts       # Opciones maestras (SLA, tipos, etc.)
│   ├── lib/
│   │   ├── document.ts      # Tipos y esquemas del documento
│   │   ├── storage.ts       # Persistencia con localForage
│   │   ├── excel/
│   │   │   ├── exportExcel.ts    # Lógica de exportación
│   │   │   └── excelAnchors.ts   # Mapeo de celdas del template
│   │   └── utils.ts
│   └── stores/
│       └── docStore.ts      # Store de Zustand (estado global)
├── public/
│   └── templates/
│       └── DOCUMENTACION MESA DE SERVICIOS.xlsx  # Template oficial
└── package.json
```

## ⚙️ Configuración del Catálogo

El archivo `src/data/catalog.json` contiene el catálogo de **Categorías → Subcategorías → Items**.

### Formato del catálogo

```json
{
  "ok": true,
  "counts": {
    "categories": 3,
    "subcategories": 6,
    "items": 15
  },
  "data": [
    {
      "name": "Infraestructura",
      "subcategories": [
        {
          "name": "Servidores",
          "items": [
            { "name": "Alta de servidor" },
            { "name": "Mantenimiento de servidor" }
          ]
        }
      ]
    }
  ]
}
```

### Para reemplazar con datos reales:

1. Abre `src/data/catalog.json`
2. Reemplaza el contenido con tu catálogo real
3. Mantén la misma estructura JSON
4. Reinicia el servidor de desarrollo (`npm run dev`)

## 🎨 Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilo**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Estado**: Zustand
- **Formularios**: React Hook Form + Zod
- **Excel**: exceljs
- **Persistencia**: localForage
- **Notificaciones**: Sonner (toast)

## 📝 Uso

### 1. Dashboard
- Inicia desde el dashboard
- Opción de limpiar documento actual
- Ver si hay borrador en progreso

### 2. Paso 1: Datos Generales
- Completa información básica del servicio
- Campos como nombre, objetivo, ámbito, sitio, etc.
- Guardado automático

### 3. Paso 2: Detalle
- Agrega entradas de servicio
- Selecciona Categoría → Subcategoría → Item (selects encadenados)
- **Campos adicionales**: Usa el botón `+` para agregar campos personalizados
  - Ingresa título y tipo simultáneamente
  - Puedes agregar múltiples campos por entrada
- Configura SLA, tipo de información, etc.

### 4. Paso 3: Resumen y Exportación
- Revisa resumen de datos capturados
- Sube flujograma (PNG/JPG) - opcional
- Exporta a Excel:
  - **Plantilla oficial**: Genera el Excel completo con template
  - **Solo tabla**: Exporta únicamente la tabla de detalle

## 🔧 Construcción para Producción

```bash
# Compilar
npm run build

# Ejecutar producción
npm start
```

## ♿ Accesibilidad

El sistema está diseñado para ser completamente accesible:
- ✅ Navegación completa por teclado
- ✅ Labels y aria-labels en todos los controles
- ✅ Focus visible
- ✅ Mensajes claros con toasts
- ✅ Confirmaciones importantes

## 📦 Template Excel

El template `DOCUMENTACION MESA DE SERVICIOS.xlsx` debe estar en `public/templates/`.

La exportación:
- Preserva estilos del template
- Rellena datos generales en celdas correspondientes
- Escribe tabla de detalle en formato multilinea
- Inserta flujograma debajo de la tabla (columnas B:G)

## 🐛 Solución de Problemas

### El template no se encuentra
Verifica que el archivo esté en `public/templates/DOCUMENTACION MESA DE SERVICIOS.xlsx`

### Los datos no se guardan
Verifica que localStorage esté habilitado en tu navegador

### Error de compilación TypeScript
Ejecuta `npm install` nuevamente para asegurar todas las dependencias

## 📄 Licencia

Este proyecto es de uso interno.

## 👥 Soporte

Para preguntas y soporte, contacta al equipo de desarrollo.
