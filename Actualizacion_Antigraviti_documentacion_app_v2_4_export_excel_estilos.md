# Actualización v2.4 — Exportación Excel: estilos dinámicos y consistencia visual

## Objetivo
Que el export a `.xlsx` **siempre** mantenga una estética consistente (fuente, tamaños, centrado, bordes internos/externos, colores por tipo de fila, separadores, y ajuste de texto) **sin depender de editar el template por cada caso** y funcionando para cualquier cantidad de categorías/subcategorías/ítems.

## Qué está pasando hoy (causa raíz)
En ExcelJS, cuando:
- insertas filas nuevas, o
- escribes en rangos que no estaban “pre-estilizados” en el template,
las celdas terminan con estilo por defecto (Calibri/bordes vacíos/etc.).  
Por eso “se destruye” la tabla de detalle: **la data sí llega**, pero los estilos no se preservan.

Además, los `mergeCells` requieren cuidado: los bordes/estilos no “se aplican al merge” como bloque; se aplican por celda. Si se mergea y no se re-aplican bordes a todo el rango, aparecen líneas internas o se pierden bordes.

## Lo que SÍ se puede setear por código (confirmado)
- Fuente (familia, tamaño, bold, color)
- Alineación (horizontal/vertical), `wrapText`, `shrinkToFit`
- Alto de fila (`row.height`)
- Ancho de columnas (`column.width`)
- Bordes (internos finos, externos medianos/gruesos)
- Colores de fondo (`fill`)
- Merges (incluye merges de “línea separadora” B:N)
- Reglas de separadores por categoría/subcategoría/ítem

## Estrategia recomendada (sin dependencia “manual por usuario”)
Se define **una sola vez** un set de reglas/estilos por tipo de fila y se aplica dinámicamente en `exportExcel.ts` al construir el detalle.

### Tipos de fila a estilizar
1) `categoryRow` — fila “encabezado” de categoría  
2) `subcatRow` — fila “encabezado” de subcategoría  
3) `itemRow` — fila principal del ítem/artículo  
4) `extraFieldRow` — filas extra del ítem (campos adicionales / 2º nivel de grupos)  
5) `separatorRow` — fila separadora mergeada B:N (sin bordes internos)

### Reglas de separación visual (lo que pediste)
- Entre **categorías**: insertar `separatorRow` (merge B:N) + borde superior “medio” + relleno (color separador)
- Entre **subcategorías** dentro de la misma categoría: insertar `separatorRow` (mismo patrón)
- Entre **ítems** dentro de una subcategoría: insertar `separatorRow` (mismo patrón, puede ser más delgado si quieres distinguir niveles)

## Cómo implementarlo en código (plan claro)
### 1) Centralizar estilos en un “theme” (único lugar)
Crear un objeto `EXCEL_THEME` con presets de estilos por tipo de fila:
- `font`, `alignment`, `fill`, `border`, `height`
- y opcional: `level` (category/subcat/item) para variación de color/borde

> Así evitas “estilos regados” y se vuelve mantenible.

### 2) Funciones utilitarias (mínimas, pero claves)
- `applyRowStyle(ws, rowNumber, stylePreset, colStart='B', colEnd='N')`
- `mergeAndStyle(ws, rowNumber, colStart, colEnd, stylePreset)`  (para separadores)
- `setWrap(ws, cellAddress, wrap=true, vertical='middle')`
- `applyOuterBorder(ws, range)` (una vez al final para enmarcar todo el bloque detalle)

### 3) Construcción del detalle: siempre crear fila → aplicar estilo → setear valores
La secuencia ideal por cada fila:
1. Crear/insertar la fila (insertRows o addRow)
2. **Aplicar estilo del tipo de fila**
3. Escribir valores
4. Hacer merges necesarios (si aplica)
5. Re-aplicar bordes a todo el rango mergeado (si aplica)

### 4) Ajuste de texto (wrap) y alto de filas
- Columnas con contenido largo (grupos, formulario, campos adicionales) deben tener `wrapText: true`
- Altos recomendados:
  - `categoryRow`: 22–26
  - `subcatRow`: 20–24
  - `itemRow`: 30–45
  - `extraFieldRow`: 18–24
  - `separatorRow`: 8–12

> Excel no “auto ajusta” siempre el alto al wrap; es mejor fijar alturas por tipo.

### 5) Bordes: externos vs internos
- Bordes externos del bloque detalle: `medium` (o `thick` si querés más fuerte)
- Bordes internos: `thin`
- En `separatorRow` no deben existir bordes internos; solo borde superior (y/o inferior) según nivel.

## Nota importante: esto NO requiere editar el template por cantidad de categorías
El template base solo define el layout estático (títulos, campos generales, encabezados).  
El estilo del detalle se vuelve **100% programático**: funciona aunque haya 1 categoría o 50, 1 ítem o 200.

## Extra (deseable): export de walkthrough (Antigravity)
- Base: guardar el walkthrough como `.md` (texto)
- Export a Word/PDF:
  - Local (recomendado): `pandoc walkthrough.md -o walkthrough.docx` / `-o walkthrough.pdf`
  - Dentro de la app:
    - PDF: renderizar a HTML y exportar con `jspdf` o `pdfmake`
    - Word: generar `.docx` con la lib `docx` (JS)

---
**Siguiente paso recomendado:** aplicar este enfoque al bloque de “Detalle” del export y luego calibrar los estilos exactos (colores/fuentes/bordes) para que claven con el template oficial.
