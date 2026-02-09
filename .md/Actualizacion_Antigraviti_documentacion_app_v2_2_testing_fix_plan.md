# Actualización del proyecto — Documentación App (v2.2)  
**Fecha:** 03/02/2026  
**Enfoque de esta actualización:** corregir el “desfase” del export a Excel alineándolo 1:1 con el template real **DOCUMENTACION MESA DE SERVICIOS.xlsx**, y endurecer el export para que no reviente por merges pre-existentes (además de asegurar que el flujograma quede siempre debajo del detalle).

---

## 0) Contexto rápido (qué estaba pasando)
En los archivos actuales del proyecto, el export estaba usando **anchors/columnas** que pertenecían a un template anterior.  
Resultado: al exportar, valores como “Nombre del servicio”, “Plantilla”, “Sitio”, etc. terminaban escritos en celdas equivocadas y la tabla de detalle arrancaba en otra zona del Excel (por eso “se mira aleatorio”).

Ejemplo real (comparando el template vs tu export “(2)”):
- El **nombre del servicio** terminó en `C5` cuando el template lo espera en `C3`.  
- **Objetivo** terminó en `C9` cuando el template lo espera en `C4`.  
- La tabla de detalle se fue a un bloque que empieza alrededor de `D54…` en lugar de iniciar en `B20…`.  

Esto no es un problema de datos; es **mapeo/anchors**.

---

## 1) Template real: mapeo exacto (lo que el XLSX espera)
Basado en el archivo que subiste **DOCUMENTACION MESA DE SERVICIOS.xlsx**:

### 1.1 Datos generales
- **Título (merge):** `B1:G2` → se escribe **SIEMPRE en B1**
- **Valores de campos:** columna `C`, filas `3–15`

| Campo | Celda |
|---|---|
| NOMBRE DEL SERVICIO | C3 |
| OBJETIVO DEL SERVICIO | C4 |
| PLANTILLA | C5 |
| ÁMBITO | C6 |
| SITIO | C7 |
| CONTACTO | C8 |
| USUARIOS BENEFICIADOS | C9 |
| ALCANCE DEL SERVICIO | C10 |
| TIEMPO DE RETENCIÓN | C11 |
| REQUIERE REPORTES | C12 |
| OBSERVACIONES | C13 |
| AUTORIZADO POR | C14 |
| REVISADO | C15 |

---

### 1.2 Tabla de detalle
- Headers en `B18:N18`
- Primera fila real de datos: `B20`

**Columnas del detalle (según template):**

| Col | Header | Campo lógico |
|---:|---|---|
| B | CATEGORÍA | categoria |
| C | SUBCATEGORÍA | subcategoria |
| D | ARTÍCULOS | item |
| E | CAMPOS ADICIONALES | camposAdicionales |
| F | TIPO DE CAMPO | tipoCampos |
| G | SLA | sla |
| H | GRUPO | grupo |
| I | TIPO DE INFORMACIÓN | tipoInformacion |
| J | BUZÓN | buzon |
| K | APROBADORES | aprobadores |
| L | FORMULARIO EN ZOHO | formularioZoho |
| M | GRUPOS DE ASISTENCIAS SELECCIONADOS | gruposAsistencia |
| N | GRUPOS DE USUARIO SELECCIONADOS | gruposUsuario |

---

### 1.3 Flujograma (bloque preformateado)
En el template existe un bloque fijo:
- Título **FLUJOGRAMA**: `B49:G49`
- Caja para la imagen: `B50:G101`

Si el detalle crece, ese bloque debe “bajarse” (insertando filas) para no quedar en medio de la tabla.

---

## 2) Cambios requeridos en código (fix plan)

### 2.1 Archivo 1 — `src/lib/excel/excelAnchors.ts`
**Acción:** reemplazar con el mapeo correcto del template.

✅ Te dejo el archivo ya listo para copiar:
- `excelAnchors_FIXED.ts` (adjunto para descargar)

**Qué corrige:**
- Mueve el título a `B1` (no `C1`)
- Datos generales a `C3–C15`
- Detalle: `DETAIL_START_ROW = 20` y columnas `B–N`
- Añade constantes para flujograma (fila 49) y margen

---

### 2.2 Archivo 2 — `src/lib/excel/exportExcel.ts`
**Acción:** actualizar el export para:
1) **Escribir el título en B1** usando el `nombreServicio` (uppercase)  
2) Calcular cuánto va a crecer el detalle antes de escribirlo  
3) **Insertar filas** en la fila 49 para empujar el flujograma si el detalle lo requiere  
4) Antes de escribir detalle, **unmerge + limpiar** el área del detalle (para evitar conflictos con merges pre-existentes del template)  
5) Escribir el detalle con el nuevo mapeo de columnas (B–N)  

✅ Te dejo un export ya parcheado:
- `exportExcel_PATCH.ts` (adjunto para descargar)

**Notas importantes del parche:**
- Se introducen helpers:
  - `estimateLastDetailRow(...)`
  - `shiftFlowchartBlockIfNeeded(...)`
  - `resetArea(...)` (unmerge + limpiar)
  - `getFlowchartLabelRow(...)`
- El flujograma se inserta **debajo del detalle**, y si el detalle es corto igual cae dentro del bloque del template (desde B50).

---

## 3) Ajuste pendiente: nombre del archivo descargado
Lo del **nombre del archivo** (que se descargue con el nombre del servicio) normalmente no está en `exportExcel.ts`, sino en la parte UI que dispara el download (usualmente en `StepResumen.tsx` o donde haces `saveAs(...)` / `link.download = ...`).

**Regla recomendada:**
- Nombre: `{nombreServicio}.xlsx`
- Sanitizado: sin caracteres inválidos (`\ / : * ? " < > |`)
- Fallback: `DOCUMENTACIÓN MESA DE SERVICIOS.xlsx`

> Si querés, pásame ese archivo del handler del download y te lo dejo exacto con sanitización.

---

## 4) Recordatorio: dónde está la data que alimenta los campos (muy importante)
Tal como mencionaste, los archivos de data para los campos que hay que actualizar están en:

✅ `src/data/`

Esto incluye (según lo que hemos venido trabajando):
- Catálogo / jerarquía (categorías → subcategorías → ítems)
- Listas para selects (Ámbito, Sitio, Tipo de información, etc.)
- Mapeos de aprobadores (columna K) a nivel de subcategoría

---

## 5) Cómo validar el fix (checklist rápido)
1. Reemplazar:
   - `src/lib/excel/excelAnchors.ts` → contenido del `excelAnchors_FIXED.ts`
   - `src/lib/excel/exportExcel.ts` → contenido del `exportExcel_PATCH.ts`

2. Ejecutar export con un servicio que tenga:
   - 1 categoría, 2 subcategorías, varios ítems
   - Campos adicionales (para que cree filas extra)
   - Aprobadores por subcategoría (columna K)

3. Abrir el Excel exportado y confirmar:
   - **B1** = nombre del servicio en mayúsculas  
   - **C3** = nombre del servicio  
   - **C4** = objetivo  
   - Detalle inicia en **B20**  
   - Aprobadores se ve en **K** y mergeado por subcategoría  
   - Flujograma queda debajo del detalle, nunca en medio  

---

## 6) Extra útil (para búsquedas sin ruido)
Tu búsqueda ya confirmó los archivos correctos (`src/...`) y que lo demás es `.next`.  
Para evitar ruido en el futuro:

- En PowerShell (sin ripgrep):
  - Limitar a `src`:
    - `Get-ChildItem .\src -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx | Select-String ...`

- Si querés `rg` (ripgrep) en Windows:
  - `winget install BurntSushi.ripgrep.MSVC`

---

## 7) Archivos listos para descargar
- `excelAnchors_FIXED.ts`
- `exportExcel_PATCH.ts`

(En el repo, reemplazalos en sus rutas reales dentro de `src/lib/excel/`.)

---
