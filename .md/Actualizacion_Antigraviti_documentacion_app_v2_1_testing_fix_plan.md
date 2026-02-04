# ACTUALIZACIÓN v2.1 (Testing + Fix Plan) — documentacion-app
> **Fecha:** 03-Feb-2026  
> Este documento **no es un proyecto desde cero**. Es una **actualización del repo existente** y está enfocado en **corregir UI + export XLSX** después del testeo que hiciste.

---

## 0) Qué cambió desde el v2 (por qué este update existe)
En el testeo aparecieron **dos problemas grandes**:

1) **Paso 1 (Selects):** con listas grandes, el dropdown “colapsa”/cubre toda la pantalla y no tiene búsqueda.  
2) **Paso 2 (Detalle/Jerarquía):** el árbol no está usando el catálogo real; “Agregar categoría/subcategoría” crea nodos **(Sin nombre)** sin forma de editarlos como se espera; el flujo de “Aprobadores” aparece en un lugar raro.  
3) **Paso 3 (Export XLSX):** el export **sí genera el archivo**, pero la data cae en posiciones incorrectas y el documento se descarga con el nombre del template (no con el nombre del servicio).

Este v2.1 agrega:
- **Ubicación exacta** de los archivos relevantes (ya identificados por tu búsqueda).
- **Causa raíz** del export (anchors y filas/columnas no corresponden al template real).
- **Plan de fixes** priorizado con checklist de aceptación.

---

## 1) Archivos clave (confirmados en el repo)
### Paso 2 (Detalle/Jerarquía)
- `src/components/wizard/steps/StepDetalle.tsx`  → Paso 2 (pantalla principal del detalle)
- `src/components/wizard/ui/CategoriaAccordion.tsx` → UI del árbol (categoría/subcategoría/ítem)
- `src/components/wizard/ui/ItemModal.tsx` → Modal “Agregar/Editar ítem”
- `src/components/wizard/ui/SubcategoriaModal.tsx` → Modal de “Aprobadores” (actual)

### Estado / modelo
- `src/stores/docStore.ts` → Estado global del documento (categorías, subcategorías, ítems, flujograma, etc.)
- `src/lib/document.ts` → Modelo/validación (si aplica)

### Paso 3 (Export)
- `src/components/wizard/steps/StepResumen.tsx` → UI de resumen + carga flujograma + botón export (según tu búsqueda)
- `src/lib/excel/exportExcel.ts` → Lógica principal de export
- `src/lib/excel/excelAnchors.ts` → Coordenadas/anchors del template (celdas/columnas/filas)

### Template XLSX
- Ruta: `public/templates/DOCUMENTACION MESA DE SERVICIOS.xlsx`

---

## 2) Hallazgos del testeo (lo que se observó)
### 2.1 Selects con mucha data (Paso 1 y/o modales)
**Síntoma:**  
- El dropdown se vuelve enorme, cubre pantalla.
- El scroll no “lo encoge” y toca cerrar con clic afuera.
- Falta búsqueda.

**Impacto:** cuando `src/data/datos.json` tiene decenas/centenas (o más) de opciones, la UX se vuelve inmanejable.

---

### 2.2 Paso 2 (Detalle) se siente “roto” / flujo incorrecto
**Síntomas:**
- “Agregar categoría” crea una tarjeta/carpeta **(Sin nombre)**.
- No hay un flujo claro para **nombrar/seleccionar** esa categoría.
- “Agregar subcategoría” hace lo mismo (y lo único editable termina siendo Aprobadores).
- “Aprobadores” aparece como si fuera parte del flujo de construir el árbol, pero en tu proceso mental de pasos no encaja ahí.

**Causa raíz (en código):**
En `CategoriaAccordion.tsx` se crea categoría/subcategoría con:
- nombre vacío (`''`), por eso ves **(Sin nombre)**,
- y **no existe UI para editar nombre de categoría** (solo borrar),
- además el árbol **no está consumiendo** el catálogo real para seleccionar categorías/subcategorías/ítems (aunque se importa `useCatalogo`, no se usa).

> Resultado: el usuario termina “creando nodos vacíos” en vez de **seleccionar del catálogo** y luego completar propiedades.

---

### 2.3 Export XLSX: “catástrofe” en posiciones
**Síntomas:**
- El archivo se genera rápido (sin error visible), pero la data cae “donde quiere”.
- Aparecen valores en filas que no corresponden (ej. nombre/objetivo).
- La tabla de detalle queda desordenada.
- El nombre del archivo descargado es el del template, no el del servicio.

**Causa raíz (confirmada):**
Los anchors actuales en `src/lib/excel/excelAnchors.ts` **no corresponden** al template real que estás usando.

Ejemplos (del template nuevo):
- El título del documento está en un merge **B1:G2** (la celda “real” es **B1**).
- “Nombre del servicio” está en **C3** (merge C3:G3), objetivo en C4, etc.
- Los encabezados de detalle están en **B..N** y el bloque inicia alrededor de las filas ~18–20 (dependiendo del template).

Pero tu `excelAnchors.ts` actual define:
- `TITLE_CELL = 'C1'`
- “nombreServicio” en `C5`, “objetivo” en `C9`, etc.
- detalle empieza en fila 54 y en columnas D..P (desfasado)

Eso explica por qué:
- el título aparece “extra” en otra columna,
- el objetivo/plantilla/observaciones terminan en filas incorrectas,
- y el detalle se dibuja completamente fuera del área del template.

---

## 3) Fix plan (prioridad alta → baja)

## 3.1 PRIORIDAD #1 — Alinear export a template (excelAnchors + export)
### 3.1.1 Actualiza `excelAnchors.ts` a la realidad del template (nuevo)
**Objetivo:** que el export escriba exactamente donde el template espera.

> ⚠️ Nota: estos valores están basados en el layout típico del template “nuevo” (el que ya muestra headers B..N en fila 18).  
> Si tu template cambia, la recomendación pro es hacer **detección dinámica** (ver 3.1.3).

**Sugerencia de anchors para el template nuevo:**
```ts
// === TITULO ===
export const TITLE_CELL = 'B1'; // merge B1:G2

// === DATOS GENERALES (col B label, col C..G value) ===
export const HEADER_CELLS = {
  nombreServicio: 'C3',
  objetivoServicio: 'C4',
  plantilla: 'C5',
  ambito: 'C6',
  sitio: 'C7',
  contacto: 'C8',
  usuariosBeneficiados: 'C9',
  alcanceServicio: 'C10',
  retencionTiempo: 'C11',
  requiereReportes: 'C12',
  observaciones: 'C13',
  autorizadoPor: 'C14',
  revisadoPor: 'C15',
};

// === DETALLE ===
// Recomendado: header en fila 18, data desde 20.
// (fila 19 suele ser un row “puente”/formato según el template)
export const DETAIL_HEADER_ROW = 18;
export const DETAIL_START_ROW = 20;

export const DETAIL_COLS = {
  categoria: 'B',
  subcategoria: 'C',
  articulos: 'D',
  camposAdicionales: 'E',
  tipoCampo: 'F',
  sla: 'G',
  grupo: 'H',
  tipoInformacion: 'I',
  buzon: 'J',
  aprobadores: 'K',
  formularioZoho: 'L',
  gruposAsistencias: 'M',
  gruposUsuario: 'N',
};

// === FLUJOGRAMA (se inserta debajo del detalle) ===
export const FLOWCHART_COL_START = 'B';
export const FLOWCHART_COL_END = 'N';
export const FLOWCHART_MARGIN_ROWS = 2;
export const FLOWCHART_AREA_HEIGHT_ROWS = 18;
```

### 3.1.2 En `exportExcel.ts`: cambia 2 cosas críticas
1) **Título del documento (celda y nombre de archivo):**
   - En `fillGeneralData()`, en vez de escribir `DEFAULT_DOCUMENT_TITLE`, escribe el nombre real:
     - `general.nombreServicio` en mayúsculas (según tu regla)
   - Asegúrate que se escribe en **B1** (no C1).

2) **Detalle:**
   - Debe iniciar en `DETAIL_START_ROW` correcto (20 aprox) y en columnas B..N.
   - Si el template trae merges “placeholder” dentro del área de tabla, desmerge antes de dibujar:
     - objetivo: evitar “merge conflict silencioso” y que los valores se pierdan.

**Idea práctica (robusta):**
- Antes de escribir el detalle, recorre el rango B..N desde `DETAIL_START_ROW` hasta un “máximo razonable” (ej. start+200) y:
  - si hay merges, `unMergeCells`.
  - limpia valores si el template trae placeholders.

> Esto hace que el export sea tolerante si el template vino “pre-mergeado”.

### 3.1.3 (Recomendación PRO) Detección dinámica del header row
Para evitar que vuelva a pasar lo mismo cuando se toque el template:

- Buscar la fila donde la celda **B** tenga el texto “CATEGORÍA” (o similar).
- Esa fila es `DETAIL_HEADER_ROW`.
- `DETAIL_START_ROW = DETAIL_HEADER_ROW + 2` (o +1, según el template; se valida una vez con un export).

Con esto, aunque el template cambie de fila, el export se adapta.

---

## 3.2 PRIORIDAD #2 — Paso 2: que deje de crear “(Sin nombre)” y use el catálogo real
### 3.2.1 Solución recomendada (la que más encaja con tu intención)
En Paso 2, el usuario **no debería “inventar” categorías** a mano para algo que ya existe en `src/data/catalogo.json`.

✅ Flujo recomendado:
1) Botón “Agregar ítem” (o “Agregar detalle”)
2) Modal con **3 selects con búsqueda**:
   - Categoría (del catálogo)
   - Subcategoría (filtrada por categoría)
   - Ítem/Artículo (filtrado por subcategoría)
3) Al guardar:
   - Si la categoría/subcategoría no existe en tu árbol actual, se crea automáticamente con el **nombre real**.
   - Se inserta el ítem en la subcategoría correspondiente.

**Resultado:** el Accordion refleja el catálogo, sin “nodos vacíos”.

### 3.2.2 Si quieres mantener “Agregar categoría/subcategoría”
Entonces hay que corregir UX:
- Al crear categoría → abrir un modal inmediato para poner el nombre o elegirlo del catálogo.
- Agregar botón “Editar” en categoría (no solo borrar).
- Subcategoría: el modal actual solo edita aprobadores, pero también debe permitir editar nombre (o seleccionar).

---

## 3.3 PRIORIDAD #3 — Selects grandes: combobox con búsqueda + altura máxima
### 3.3.1 Qué cambiar
En lugar de un `<Select>` simple:
- Usa un **Combobox (Popover + Command)** con:
  - `Input` de búsqueda
  - lista con `max-h-[300px] overflow-auto`
  - (opcional) virtualización si son miles.

Esto aplica a:
- Paso 1: Sitios, Ámbito, SLA, etc.
- Paso 2: selects del catálogo en el modal
- Cualquier select que venga de `src/data/datos.json`

---

## 3.4 PRIORIDAD #4 — Nombre del archivo exportado
Ahora se descarga como “DOCUMENTACION MESA DE SERVICIOS”.

✅ Reglas nuevas:
- El nombre del archivo debe ser el **Nombre del Servicio** (Paso 1) en mayúsculas.
- Ejemplo:
  - `NOMBRE_SERVICIO.xlsx`

**Dónde tocar:**
- En el handler de download del Paso 3 (probablemente `StepResumen.tsx`)
- O donde creas el `<a download="...">`

---

## 4) Checklist de aceptación (post-fix)
### Export
- [ ] Título se escribe en B1 (merge B1:G2) y coincide con Nombre del Servicio.
- [ ] Datos generales caen en C3..C15 (según labels).
- [ ] Tabla detalle inicia en fila correcta (no en 54) y usa columnas B..N.
- [ ] K (Aprobadores) se mergea por subcategoría.
- [ ] H/M/N respetan: 1 fila título + merge del contenido.
- [ ] Flujograma siempre queda debajo del detalle.

### Paso 2
- [ ] Ya no aparecen nodos “(Sin nombre)” al agregar.
- [ ] Se puede construir el detalle seleccionando desde `catalogo.json`.
- [ ] El árbol refleja categorías/subcategorías reales.

### Selects
- [ ] Los selects con mucha data tienen búsqueda.
- [ ] El dropdown no “tapa” la pantalla; tiene altura máxima.

---

## 5) Comandos útiles (para buscar en Windows sin “.next”)
Ya te funcionó `Select-String`, pero te llenó de resultados de `.next`.

Usa esto para excluir `.next`:
```powershell
Get-ChildItem -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx |
  Where-Object { $_.FullName -notmatch '\\\.next\\' } |
  Select-String -Pattern "Detalle del Servicio|Estructura Jerárquica|Agregar Categoría|Agregar Subcategoría|Agregar Ítem|Aprobadores" |
  Select-Object Path, LineNumber, Line
```

Si quieres instalar `rg` (ripgrep):
- **winget**:
```powershell
winget install BurntSushi.ripgrep.MSVC
```

---

## 6) Nota final (cómo seguir)
Con lo que ya identificaste + los archivos que compartiste, **ya se puede hacer el update** (no hace falta esperar más).  
Si después quieres refinar con más screenshots/ejemplos, sacamos un v2.2, pero el bloqueo real hoy es **anchors/export + UX del árbol**.
