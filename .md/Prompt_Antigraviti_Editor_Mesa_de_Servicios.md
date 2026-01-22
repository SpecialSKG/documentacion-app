# Prompt maestro para Antigraviti (Editor) — Proyecto “Documentación Mesa de Servicio”

> **Instrucción base:** Actúa como **arquitecto + desarrollador senior**. Genera el código completo, listo para correr, siguiendo **al pie de la letra** este prompt.  
> Antes de programar, lee y absorbe estos archivos (el usuario los referenciará con `@`):
> - `@Documento_Mesa_de_Servicios_Antigraviti_v1.md`
> - `@Documento_Mesa_de_Servicios_Antigraviti_config_v1.md`
> - `@templates/DOCUMENTACION MESA DE SERVICIOS.xlsx`
>
> Si hay conflicto entre documentos, **este prompt manda**.

---

## 0) Objetivo del proyecto

Construir una **web app interna** para crear y mantener documentos de “Documentación Mesa de Servicio” mediante un **wizard (paso a paso)**, guardando todo localmente (sin backend por ahora) y permitiendo **exportar a Excel** usando el template oficial:

- **Nombre del archivo Excel exportado:** `DOCUMENTACION MESA DE SERVICIOS.xlsx` (descarga al usuario).
- Permite subir un **flujograma** (imagen) y que se inserte en el Excel.
- En el paso de **Campos adicionales**, implementar el “**micro‑paso**”: un botón `+` para agregar un campo y, de inmediato, capturar:
  - **Título del campo** (input)
  - **Tipo de campo** (select)
  - (Opcional) `Requerido` (toggle) — si no lo piden, dejarlo deshabilitado pero preparado.

---

## 1) Stack y reglas técnicas

- **Next.js** (App Router) + **TypeScript**.
- **Tailwind CSS** + **shadcn/ui** (componentes).
- Estado global con **Zustand**.
- Formularios con **react-hook-form** + **zod** (validación).
- Export a Excel: **exceljs** (para leer el template, escribir valores, conservar estilos) + descarga en cliente (ej. `file-saver` o `URL.createObjectURL`).
- Sin backend, sin DB. Persistencia local con **localStorage** (drafts).

**Calidad mínima:**
- `npm run dev` funciona.
- `npm run build` no falla.
- Tipado estricto sin `any` (salvo casos muy justificados).
- UI accesible (el usuario es ciego): **tab/teclado**, `aria-label`, enfoque (focus) correcto en modales, mensajes claros.

---

## 2) Estructura de carpetas (la app debe generarse dentro de `src/`)

> Nota: el usuario ya creó carpetas. Aun así, genera el código y crea lo que falte.

```
src/
  app/
    layout.tsx
    page.tsx
    (dashboard)/
      dashboard/page.tsx
    (docs)/
      docs/new/page.tsx
      docs/[id]/page.tsx
  components/
    wizard/
      WizardShell.tsx
      steps/
        StepGeneral.tsx
        StepDetalle.tsx
        StepFlujograma.tsx
        StepResumen.tsx
      ui/
        StepHeader.tsx
        StepNavBar.tsx
        ConfirmDialog.tsx
        InlineFieldEditor.tsx
    table/
      DetalleTable.tsx
  data/
    options.ts
    catalog.json               ← el usuario pegará aquí el JSON grande de categorías/subcategorías/items
  lib/
    document.ts
    excel/
      exportExcel.ts
      excelAnchors.ts
    storage.ts
    utils.ts
  stores/
    docStore.ts
templates/
  DOCUMENTACION MESA DE SERVICIOS.xlsx
```

**Importante:** el archivo `src/data/catalog.json` debe existir aunque sea con contenido mínimo de ejemplo. Documenta en comentarios “reemplazar por el JSON real”.

---

## 3) Modelo de datos (DocumentDraft)

Define tipos en `src/lib/document.ts`:

- `DocumentDraft`
  - `id: string`
  - `createdAt: string` (ISO)
  - `updatedAt: string` (ISO)
  - `general`:
    - `nombreServicio: string`
    - `descripcion: string`
    - `categoria: string`
    - `subcategoria: string`
    - `item: string`
    - `objetivo: string`
    - `canalSolicitud: string`
    - `sitio: string`
    - `ambito: string`
    - `descripcionExtra: string` (la del bloque “DESCRIPCIÓN:” del template)
    - `tipoInformacion: string`
    - `asistencia: string`
    - `aprobadores: string[]` (lista)
  - `detalle: DetalleRow[]`
- `DetalleRow`
  - `categoria: string`
  - `subcategoria: string`
  - `item: string`
  - `camposAdicionales: CampoAdicional[]`
  - `sla: string`
  - `grupo: string`
  - `tipoInformacion: string`
  - `buzon: string`
  - `aprobadores: string[]`
  - `formZoho: string`
  - `grupoAsistencia: string`
  - `grupoUsuario: string`
- `CampoAdicional`
  - `titulo: string`
  - `tipo: FieldType` (enum/string union)
  - `requerido?: boolean`

---

## 4) UI general (look & feel)

- Estilo “admin dashboard” (como referencia: carpeta `templates/templates-demo/*`), pero **sin depender** de esos templates.
- Sidebar izquierda (simple) con:
  - “Dashboard”
  - “Nuevo documento”
  - “Documentos” (lista básica)
- Topbar con título, breadcrumb y acciones.
- El wizard debe tener:
  - **header** con nombre del documento (o “Nuevo documento”), progreso y botones.
  - **barra inferior fija** (sticky) con: `Atrás`, `Siguiente`, `Guardar borrador`, `Limpiar`.
  - Botón **Exportar a Excel** visible (arriba a la derecha) pero **solo habilitado** si validación pasa.

---

## 5) Wizard (pasos obligatorios)

### Paso 1 — Datos generales
Formulario con los campos de `general`.  
Validación: nombreServicio obligatorio, categoría/subcategoría/item obligatorios.

**Categoría/Subcategoría/Item:**
- Se alimentan de `src/data/catalog.json`.
- Implementa selects “encadenados”:
  - Si cambia categoría ⇒ resetea subcategoría e item.
  - Si cambia subcategoría ⇒ resetea item.
- Para accesibilidad y rapidez, los selects deben permitir **búsqueda** (combo/command).

### Paso 2 — Detalle (tabla)
Renderiza una tabla editable (componente `DetalleTable`) donde cada fila es un `DetalleRow`.

Acciones:
- `+ Agregar fila` (crea fila vacía).
- `Eliminar fila`
- (Opcional) `Duplicar fila`

Columnas mínimas visibles:
- Categoría, Subcategoría, Item
- Campos adicionales (resumen)
- SLA, Grupo, Tipo de información, Buzón, Aprobadores, Form Zoho, Grupo Asistencia, Grupo Usuario

#### “Micro‑paso” — Campos adicionales (requisito clave)
Dentro de cada fila:
- Un botón `+` (con `aria-label="Agregar campo adicional"`) que al presionarlo **inserta inmediatamente** un editor inline o mini‑modal con:
  - Input: `Título del campo`
  - Select: `Tipo de campo`
  - (Opcional) toggle requerido
- Al guardar ese micro‑paso:
  - se agrega a `camposAdicionales[]`
  - se muestra en la celda como chips/lista (ej. `Título — Tipo`)
- Debe permitir:
  - editar un campo
  - eliminar un campo

**Tipos de campo (FieldType)**
Define en `src/data/options.ts`, por ejemplo:
- `Texto`
- `Texto largo`
- `Número`
- `Correo`
- `Teléfono`
- `Fecha`
- `Hora`
- `Fecha y hora`
- `Selector`
- `Checkbox`
- `Radio`
- `Archivo`
- `URL`

*(Si el usuario luego quiere más, quedará centralizado.)*

### Paso 3 — Flujograma
- Upload de imagen (PNG/JPG).
- Vista previa + botón “Quitar”.
- Guardar en el draft como:
  - `flowchart?: { name: string; mime: string; dataUrl: string }`
- El export a Excel debe insertar esta imagen en el área del template.

### Paso 4 — Resumen y exportación
- Vista “resumen” en cards:
  - Datos generales
  - Conteo de filas de detalle
  - Lista rápida de aprobadores
  - Si hay flujograma adjunto
- Botón final `Exportar a Excel`.

---

## 6) Persistencia (borradores)

En `src/lib/storage.ts`:
- Guardar y cargar drafts en `localStorage`.
- Clave recomendada: `ms_docs_v1`.
- Permitir:
  - Guardar borrador manual.
  - Autoguardado cada X segundos **solo si hay cambios** (ej. 10s).
  - Recuperar borrador al volver a entrar a `/docs/new`.

---

## 7) Exportación a Excel (requisito clave)

Implementa `src/lib/excel/exportExcel.ts`:

### 7.1 Leer template y rellenar “Datos generales”
- Cargar el archivo `templates/DOCUMENTACION MESA DE SERVICIOS.xlsx` como ArrayBuffer.
- Abrir con exceljs.
- Trabajar sobre la hoja `Hoja1`.

**Relleno por anclas (robusto, NO hardcode frágil):**
- Busca en la columna **B** las etiquetas exactas del template y escribe el valor en la celda “de la derecha” (normalmente columna C, en rangos mergeados).
- Etiquetas (deben existir en el template):
  - `NOMBRE DEL SERVICIO:`
  - `DESCRIPCION:`
  - `CATEGORIA:`
  - `SUB CATEGORIA:`
  - `ITEM:`
  - `OBJETIVO:`
  - `CANAL DE SOLICITUD:`
  - `SITIO:`
  - `AMBITO:`
  - `DESCRIPCIÓN:`
  - `TIPO DE INFORMACION:`
  - `ASISTENCIA:`
  - `APROBADORES:`

**Aprobadores (general):**
- Escribirlos en una sola celda separados por salto de línea (multiline).

### 7.2 Rellenar la tabla “DETALLE”
- La fila de headers está en la **fila 19** (según el template actual).
- La primera fila de datos es la **fila 21**.
- Columnas del detalle (según headers del template):
  - B: CATEGORIA
  - C: SUBCATEGORIA
  - D: ITEM
  - E: CAMPOS ADICIONALES
  - F: TIPO DE CAMPO
  - G: SLA
  - H: GRUPO
  - I: TIPO INFORMACION
  - J: BUZON
  - K: APROBADORES
  - L: FORMULARIO ZOHO
  - M: GRUPO ASISTENCIA
  - N: GRUPO USUARIO

**Regla para campos adicionales:**
- Si una fila tiene **N** campos adicionales:
  - Genera **N filas de Excel**.
  - En la primera, rellena B-D, G-N normalmente.
  - En cada fila, rellena:
    - E = `titulo`
    - F = `tipo`
  - En filas adicionales (2..N), deja B-D y G-N en blanco (solo E-F) para que se lea como “sub‑filas”.

**Si no hay campos adicionales:** deja E y F vacíos y exporta 1 fila.

**Aprobadores (detalle):**
- Columna K: join con saltos de línea.

**Estilos:**
- Copia el estilo/bordes de la fila 21 como “fila plantilla” si necesitas insertar más filas.
- Si el número de filas excede las filas preformateadas, inserta filas y copia estilo.

### 7.3 Insertar imagen de flujograma
- Debe detectar el área del flujograma de forma flexible:
  - Buscar la celda que contenga el texto `FLUJOGRAMA:` (en el template actual es `I3`).
  - Tomar el rango debajo (por defecto `I4:N16`) como área destino.
  - Insertar la imagen escalada para caber en ese rectángulo.
- **Nota:** el usuario puede mover el flujograma a otra zona (ej. B:G abajo). Por eso, el algoritmo debe depender del texto `FLUJOGRAMA:` y no de coordenadas fijas.

---

## 8) Validaciones y UX

- Bloquear export si:
  - falta `nombreServicio`
  - falta categoría/subcategoría/item en general
  - no hay ninguna fila de detalle (o hay filas vacías)
- En tabla detalle:
  - Mostrar errores por celda (tooltip o texto pequeño).
  - Asegurar navegación por teclado.
- Confirmaciones:
  - “Limpiar” debe pedir confirmación (pierde cambios).
- Mensajes:
  - Usa toasts para: guardado, error, exportación exitosa.

---

## 9) Entregables (lo que debes generar)

1) Código completo en la estructura indicada.
2) `README.md` con:
   - instalación
   - correr dev
   - build
   - cómo pegar el `catalog.json` real
3) Un “dataset mínimo” en `catalog.json` para que la app funcione aunque sea demo.
4) Un dashboard simple con lista de borradores y botón para crear nuevo.

---

## 10) Checklist antes de finalizar

- [ ] Wizard navega sin romper estado.
- [ ] Micro‑paso de campos adicionales funciona (agregar/editar/eliminar).
- [ ] Export a Excel descarga un archivo válido y preserva estilos.
- [ ] Insertar flujograma funciona si existe.
- [ ] Accesibilidad básica: labels, foco, teclado, `aria-*`.
- [ ] Sin errores TypeScript.
