# Documentación Mesa de Servicios — Especificación para Antigraviti (v1)

> Proyecto: **Documentación Mesa de Servicios**  
> Entorno: **local / cerrado** (sin login por ahora)  
> Objetivo: llenar un formulario web y exportar un **Excel idéntico al template**.

---

## 1) Qué debe resolver esta app

1. Capturar datos “meta” (cabecera del documento).
2. Capturar datos “detalle” (la tabla grande de categorías/subcategorías/artículos y propiedades).
3. Evitar pérdida de datos si el usuario:
   - recarga el navegador,
   - cierra la pestaña,
   - retrocede/avanza,
   - cambia de dispositivo momentáneamente.
4. Exportar:
   - **(A) Excel oficial**: rellenando el template `DOCUMENTACION MESA DE SERVICIOS.xlsx`.
   - **(B) Excel plano**: exportar la tabla filtrada (sin template).
5. Soportar (futuro, no activo):
   - múltiples borradores,
   - “Servicio en producción” como segundo modo,
   - exportar PDF,
   - envío a correo/Drive.

---

## 2) Stack (fase actual)

### Core
- Node.js
- Next.js (App Router)
- TypeScript

### UI / UX
- Tailwind CSS
- shadcn/ui
- lucide-react
- react-hot-toast

### Formularios / Validación / Estado
- React Hook Form
- zod
- zustand
- localforage (persistencia)

### Tabla
- @tanstack/react-table

### Exportación / Importación
- exceljs (export oficial + export plano)
- SheetJS (xlsx) (importación futura)

### QA (mínimo)
- vitest
- playwright (e2e) *(y en futuro PDF si aplica)*

---

## 3) UX general (sin ambigüedad)

### 3.1 Dashboard (`/`)
- Card/Botón principal: **Registrar servicio nuevo**
- Card/Botón secundario: **Servicio en producción** (disabled, “Próximamente”)

Acciones rápidas visibles:
- **Iniciar de cero** (reset completo del documento actual con confirmación)
- (Futuro, apagado por flag) **Borradores** (crear/cargar)

### 3.2 Wizard (misma ruta, pasos por URL)
Ruta: `/nuevo?step=1|2|3`

- Breadcrumb arriba (solo visual):  
  `Dashboard → Documentación → Registrar servicio nuevo → Paso X`
- Stepper arriba (solo visual, NO clickeable).
- Footer fijo con botones únicos:
  - **Atrás**
  - **Siguiente**
- **Exportar**:
  - NO va en el footer.
  - Va en header sticky arriba derecha.
  - Debe estar **habilitado solo en Paso 3** (o siempre visible pero disabled hasta Paso 3).
  - Cuando está disabled, debe mostrar tooltip “Disponible al finalizar”.

---

## 4) Decisión clave: “Campos adicionales” (2 pájaros de un tiro)

En el detalle del servicio, existe la columna:

- `CAMPOS ADICIONALES`
- `TIPO DE CAMPO`

La UI debe capturarlos como un **par** en el mismo momento:

- Input: **Nombre del campo**
- Select: **Tipo de campo**
- Botón `+` para agregar otro

UI exacta (dentro del editor de una “Entrada”):
- Encabezado: “Campos adicionales”
- Lista de filas dinámicas:
  - `[Nombre del campo]  [Tipo de campo]  [Eliminar]`
- Botón: `+ Agregar campo`

Reglas:
- Se permite 0..N campos adicionales.
- Los campos adicionales deben conservar el orden de inserción.
- Si el usuario deja “Nombre” vacío, no se exporta ese campo.
- Si el usuario escribe nombre pero deja tipo vacío, se exporta el nombre y tipo queda “Sin especificar”.

---

## 5) Modelo lógico (JSON) — Documento completo

### 5.1 Estructura

- Todos los campos son opcionales en fase actual.
- Se valida estructura/tipos con zod, pero NO se bloquea por required.

```json
{
  "schemaVersion": 1,
  "status": "editing",
  "updatedAt": "ISO",
  "meta": {
    "nombreServicio": "",
    "objetivo": "",
    "plantilla": "",
    "ambito": "",
    "sitio": "",
    "contacto": "",
    "usuariosBeneficiados": "",
    "alcanceServicio": "",
    "tiempoRetencion": "",
    "requiereReportes": "",
    "observaciones": "",
    "autorizadoPor": "",
    "revisadoPor": ""
  },
  "entries": [
    {
      "id": "uuid/nanoid",
      "categoria": "",
      "subcategoria": "",
      "articulo": "",
      "sla": "",
      "grupo": "",
      "tipoInformacion": "",
      "buzon": "",
      "aprobadores": ["nombre.apellido"],
      "camposAdicionales": [
        { "nombre": "Campo X", "tipoCampo": "Linea única" }
      ]
    }
  ],
  "flowchart": {
    "fileName": "flujograma.png",
    "mimeType": "image/png",
    "base64": "..."
  }
}
```

### 5.2 “Otro” en selects
Para cualquier select (categoría, subcategoría, artículo, SLA, etc.) debe existir la opción:

- `value: "__OTHER__"`, label “Otro”
- Cuando se selecciona, aparece input “Especificar…”
- El valor final exportado debe ser:
  - si `__OTHER__`: usar el texto del input
  - si no: usar el valor seleccionado

---

## 6) Fuentes de verdad para selects

Crear un archivo de opciones para:
- SLA
- Tipo de campo
- Tipo de información
- Ámbito
- Sitios

Regla:
- Todos deben incluir “Otro”.

---

## 7) Catálogo (Categoría → Subcategoría → Artículos)

Entrada: `catalog.json` con forma:

```json
{
  "data": [
    {
      "name": "Categoria",
      "subcategories": [
        {
          "name": "Subcategoria",
          "items": [{ "name": "Articulo" }]
        }
      ]
    }
  ],
  "counts": { "categories": 0, "subcategories": 0, "items": 0 },
  "ok": true
}
```

UI:
- Select Categoría (con búsqueda)
- Select Subcategoría (depende de categoría)
- Select Artículo (depende de subcategoría)

Regla:
- No asumir nombres únicos.
- Construir un id interno por path:
  - `Categoria|Subcategoria|Articulo`

---

## 8) Persistencia (no perder data)

### 8.1 Autosave (ACTIVO)
- Guardar `DocumentModel` completo en `localforage`.
- Key sugerida: `docms_current_v1`
- Cargar al iniciar el wizard (hydration).
- Guardar con debounce (~500ms) o onBlur.
- Toast discreto: “Borrador guardado”.

### 8.2 Borradores múltiples (FUTURO — apagado por flag)
- Feature flag: `NEXT_PUBLIC_ENABLE_DRAFTS=false`
- Cuando se active:
  - máximo 5 borradores
  - limpiar borradores viejos automáticamente

---

## 9) Wizard — Paso por paso

### Paso 1: Datos generales (Meta)
Campos (opcionales):
- Nombre del servicio
- Objetivo
- Plantilla
- Ámbito
- Sitio
- Contacto
- Usuarios beneficiados
- Alcance del servicio
- Tiempo de retención
- Requiere reportes
- Observaciones
- Autorizado por
- Revisado por

### Paso 2: Detalle (Entradas)
- Tabla con @tanstack/react-table
- Botón: `Agregar entrada`
- Filtros:
  - Buscador global
  - SLA
  - Tipo de información
- Botón debajo de filtros:
  - `Exportar tabla filtrada (XLSX)` (export plano)

Edición de una entrada:
- Abrir un **Sheet/Drawer** (shadcn) a la derecha con:
  1) Catálogo (categoría/subcategoría/artículo)
  2) SLA, Grupo, Tipo info, Buzón
  3) Aprobadores (chips + añadir/remover)
  4) **Campos adicionales** (micro-paso “2 pájaros”)
     - `+ Agregar campo` genera fila: input + select + delete

### Paso 3: Revisión + Exportación
- Mostrar resumen (meta + entradas)
- Botón Exportar (header top-right):
  - `Exportar plantilla oficial (XLSX)`

---

## 10) Excel oficial (exceljs) — Reglas exactas

### 10.1 Template
- Archivo: `templates/DOCUMENTACION MESA DE SERVICIOS.xlsx`
- Hoja: `Hoja1`

### 10.2 Mapeo de META a celdas (escribir en la celda superior izquierda del merge)
- `meta.nombreServicio` → `C5` (merge C5:G7)
- `meta.objetivo` → `C9` (merge C9:G11)
- `meta.plantilla` → `C13` (merge C13:G14)
- `meta.ambito` → `C16` (merge C16:G17)
- `meta.sitio` → `C19` (NO merge; escribir en C19)
- `meta.contacto` → `C22` (merge C22:G23)
- `meta.usuariosBeneficiados` → `C25` (merge C25:G26)
- `meta.alcanceServicio` → `C28` (merge C28:G29)
- `meta.tiempoRetencion` → `C31` (merge C31:G32)
- `meta.requiereReportes` → `C34` (merge C34:G35)
- `meta.observaciones` → `C37` (merge C37:G41)
- `meta.autorizadoPor` → `C45` (merge C45:G46)
- `meta.revisadoPor` → `C47` (merge C47:G48)

Recomendación:
- activar wrapText en esas celdas si el template ya no lo trae.

### 10.3 Mapeo de DETALLE (tabla)
Headers están en fila `52` (B..K).

El bloque de escritura del detalle está en celdas merged:
- Categoría → `B54` (merge B54:B90)
- Subcategoría → `C54` (merge C54:C65)
- Artículos → `D54` (merge D54:D65)
- Campos adicionales → `E54` (merge E54:E65)
- Tipo de campo → `F54` (merge F54:F65)
- SLA → `G54` (merge G54:G65)
- Grupo → `H54` (NO merge en template, pero la tabla usa la columna; escribir en H54 o el rango que aplique)
- Tipo de información → `I54` (merge I54:I65)
- Buzón → `J54` (merge J54:J65)
- Aprobadores → `K54` (merge K54:K65)

**Regla de serialización (sin crear filas nuevas):**
Como el template usa celdas altas/merged, la exportación debe escribir listas como texto multilinea:

Para cada columna:
- construir un array de strings por cada entry.
- unir con `\n` (saltos de línea).
- escribir el resultado en la celda correspondiente.

Ejemplo:
- `B54` = categorías, una por línea.
- `C54` = subcategorías, una por línea.
- `D54` = artículos, uno por línea.
- `G54` = SLA, uno por línea.

#### Campos adicionales (E y F)
Cada entry puede tener 0..N campos adicionales (pares nombre/tipo).

Regla recomendada:
- Para cada entry, serializar sus campos adicionales en un bloque:
  - nombres: `Campo1; Campo2; Campo3`
  - tipos: `Linea única; Lista de selección; Fecha/hora`
- Luego unir entries por salto de línea.

Esto mantiene alineación conceptual por entry y evita “explosionar” filas en un template que no está diseñado por filas.

Aprobadores:
- `K54` = por entry, unir aprobadores con `, ` (coma)
- entries separados por `\n`

---

## 11) Flujograma (imagen) — NUEVO REQUERIMIENTO

### 11.1 Captura en UI
En Paso 3 (o en Paso 1 si prefieres), agregar:
- Input de archivo (accept: png/jpg)
- Mostrar preview + botón “Quitar”

Guardar la imagen en el modelo como:
- `{ fileName, mimeType, base64 }`

### 11.2 Inserción en Excel (debajo de la tabla, ancho B:G)
El flujograma debe quedar **debajo del bloque del detalle** en formato vertical.

Requisito de layout:
- **Título**: “Flujograma del servicio”
- Ancho: columnas **B:G**
- No usar I:N.
- Debe verse como una sección adicional del documento.

Implementación recomendada (robusta):
1) En el template, crear una zona dedicada:
   - `B92:G92` (merge) con el título “Flujograma del servicio”
   - `B93:G120` como caja vacía/borde para colocar imagen (ajustable)
2) En export:
   - si no hay imagen → no insertar nada (dejar la sección vacía)
   - si hay imagen:
     - `worksheet.addImage()` con `tl: { col: 1, row: 92 }` y `br: { col: 6, row: 120 }`
       - (col 1 = B si 0-index en exceljs; ajustar según API)
     - Mantener estilos del template (no romper bordes)
     - Si la imagen no calza, escalarla para fit dentro del rango sin deformar.

Fallback (si el template cambia):
- buscar la celda que contiene el texto exacto “Flujograma del servicio”
- insertar la imagen dos filas debajo de esa celda, siempre en B:G.

---

## 12) Export “Tabla filtrada” (XLSX plano)
- Crear workbook nuevo con exceljs
- Headers legibles
- Autosize básico
- Columnas sugeridas:
  - Categoría, Subcategoría, Artículo, SLA, Grupo, Tipo info, Buzón, Aprobadores, Campos adicionales (resumen)

---

## 13) Accesibilidad (importante)
- Labels y `aria-label` en icon buttons
- Navegación completa por teclado
- Focus visible
- No depender solo de color

---

## 14) Criterios de aceptación (fase 1)
1) Wizard funciona en desktop/móvil.
2) Recargar no borra el avance.
3) Se pueden crear/editar/eliminar entradas.
4) Se pueden agregar N campos adicionales por entrada y cada uno tiene tipo.
5) Export oficial genera un Excel que abre correctamente y respeta el template.
6) Export plano genera un Excel con la tabla filtrada.
7) Flujograma se inserta debajo del detalle (B:G) con título.

---

## 15) Backlog (futuro)
- Borradores múltiples (on/off por flag)
- Modo “Servicio en producción”
- PDF
- Envío por correo/Drive
- Login/roles (Auth.js)
