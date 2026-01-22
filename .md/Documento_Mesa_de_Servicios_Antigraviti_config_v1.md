# Documento Mesa de Servicios — Configuración y mapeo (v1)

> Este archivo está pensado para **pegarlo en Antigraviti** como “anexo de configuración”.
> Define **qué se configura** (archivos y constantes) para que el proyecto genere un Excel idéntico al template.

---

## 1) Qué es esto (y qué NO es)

- **Sí es**: una guía para crear **un archivo de configuración** (y constantes) que centralice:
  - Listas maestras (SLA, sitios, tipos, etc.)
  - Mapeo exacto **de celdas/columnas** del template Excel
  - Límites (borradores máximos, etc.)
  - Convenciones para “Campos adicionales” (micro-paso)

- **No es**: una “configuración manual del sistema”.  
  No hay que tocar nada fuera del repo (salvo copiar el template `.xlsx` a la carpeta indicada).

---

## 2) Convención: el template Excel vive dentro del repo

### 2.1 Ubicación recomendada

Guardar el archivo exactamente como:

- `templates/excel/DOCUMENTACION MESA DE SERVICIOS.xlsx`

**Regla**: el exportador SIEMPRE parte de este template, lo clona en memoria y luego escribe datos.

---

## 3) Mapeo del template (sheet + celdas del encabezado)

### 3.1 Sheet

- `SHEET_NAME = "Hoja1"`

### 3.2 Celdas clave del encabezado (arriba)

> Nota: varios campos están en rangos combinados (merged).  
> Para escribir, basta con escribir en la **celda superior izquierda** del rango.

| Campo (modelo) | Celda destino |
|---|---|
| `header.title` | `C1` |
| `header.nombreServicio` | `C5` |
| `header.objetivoServicio` | `C9` |
| `header.plantilla` | `C13` |
| `header.ambito` | `C16` |
| `header.sitio` | `C19` *(sin merge; escribir en C19)* |
| `header.contacto` | `C22` |
| `header.usuariosBeneficiados` | `C25` |
| `header.alcance` | `C28` |
| `header.tiempoRetencion` | `C31` |
| `header.requiereReportes` | `C34` |
| `header.observaciones` | `C37` |
| `header.autorizadoPor` | `C45` |
| `header.revisado` | `C47` |

**Recomendación**: habilitar “wrap text” para los campos largos (plantilla, observaciones, etc.) si el template ya lo trae, perfecto; si no, activarlo al escribir.

---

## 4) Tabla detalle (filas + columnas)

### 4.1 Fila de encabezados de la tabla

- `DETAIL_HEADER_ROW = 52`
- La data empieza en:
  - `DETAIL_START_ROW = 53`

### 4.2 Mapeo de columnas de la tabla

| Columna | Letra | Header del template | Campo (modelo) |
|---:|:---:|---|---|
| 1 | B | CATEGORÍA | `detail.categoria` |
| 2 | C | SUBCATEGORÍA | `detail.subcategoria` |
| 3 | D | ITEM | `detail.item` |
| 4 | E | CAMPO ADICIONAL | `detail.camposAdicionalesTitulos` |
| 5 | F | TIPO DE CAMPO | `detail.camposAdicionalesTipos` |
| 6 | G | DETALLE | `detail.detalle` |
| 7 | H | SLA | `detail.sla` |
| 8 | I | TIPO DE INFORMACION | `detail.tipoInformacion` |
| 9 | J | REQUIERE DOCUMENTO? | `detail.requiereDocumento` |
| 10 | K | OBSERVACIONES | `detail.observaciones` |

---

## 5) Micro-paso “Campos adicionales” (2 pájaros de un tiro)

### 5.1 UI / Captura (requisito funcional)

En el paso “Campos adicionales”:

- Botón `+ Agregar campo`
- Al presionarlo aparece una fila con:
  - **Input**: “Campo adicional” (texto)
  - **Select**: “Tipo de campo” (lista de tipos)

Cada fila representa un objeto:

```ts
type CampoAdicional = {
  titulo: string;      // lo que escribe el usuario
  tipoCampo: string;   // opción elegida del select
};
```

### 5.2 Persistencia (temporal)

- Guardar `camposAdicionales: CampoAdicional[]` en el store y persistirlo.
- Límite sugerido: `maxCamposAdicionalesPorItem = 30` (por seguridad UX).

### 5.3 Export a Excel (cómo se escribe en E y F)

Como una fila de la tabla detalle solo tiene **una** celda `E` y una `F`, se propone este formato:

- Columna **E**: títulos separados por salto de línea
- Columna **F**: tipos separados por salto de línea
- Orden 1:1 (la línea 1 de E corresponde a la línea 1 de F)

Ejemplo:

E:
```
Usuario solicitante
IP de origen
Justificación
```

F:
```
Linea única
Linea única
Multilínea
```

Esto mantiene el Excel limpio y “legible” sin multiplicar filas.

---

## 6) Flujograma (imagen) — ubicación vertical bajo la tabla

### 6.1 Objetivo

- El flujograma se insertará como **imagen** (PNG/JPG) y quedará debajo de la tabla detalle.
- Ancho aproximado: **B:G** (6 columnas, sin exagerar).

### 6.2 Estrategia recomendada (dinámica)

1) Calcular la última fila usada de la tabla detalle:
- `lastRow = max(DETAIL_START_ROW, última fila donde exista data en B..K)`

2) Definir el “anchor row” del flujograma:
- `FLOWCHART_START_ROW = lastRow + 3`

3) Insertar la imagen en el rango visual:
- Columna inicial: `B` (col index 1 si es 0-based para exceljs)
- Columna final: `G` (col index 6 si es 0-based para exceljs)
- Alto sugerido: 25–35 filas (depende del tamaño real del diagrama)

> Importante: en **exceljs**, `tl/br` de imagen usan índices 0-based:
> - A = 0, B = 1, C = 2, etc.
> - Row 1 = 0, Row 2 = 1, etc.

### 6.3 Texto “título” encima del flujograma

Insertar una celda con título en:
- `B{FLOWCHART_START_ROW - 1}` con el texto:
  - `FLUJOGRAMA`

---

## 7) Archivo de configuración sugerido (constantes)

Este es el tipo de constantes que deben existir (nombres sugeridos):

- `SHEET_NAME`
- `TEMPLATE_XLSX_PATH`
- `DETAIL_HEADER_ROW`
- `DETAIL_START_ROW`
- `DETAIL_COLS` (objeto con letras/índices)
- `HEADER_CELLS` (objeto con las celdas del encabezado)
- `DRAFTS_MAX = 5`
- `DRAFT_TTL_HOURS` (si se usa expiración)
- `MAX_CAMPOS_ADICIONALES_POR_ITEM`

---

## 8) Validación mínima (para no romper el template sin darte cuenta)

Crear una prueba (vitest) que abra el template y valide:

- Existe `Hoja1`
- En fila 52 están exactamente estos headers en B..K:
  - `CATEGORÍA`, `SUBCATEGORÍA`, `ITEM`, `CAMPO ADICIONAL`, `TIPO DE CAMPO`, `DETALLE`, `SLA`, `TIPO DE INFORMACION`, `REQUIERE DOCUMENTO?`, `OBSERVACIONES`

Si algún header cambia, el test falla y te avisa inmediatamente.

---

## 9) Notas prácticas (Next.js + App Router)

- El export a Excel debe correr en **server-side**:
  - Route Handler: `app/api/export/xlsx/route.ts`
  - o Server Action que devuelva un `Blob`/stream.
- Leer el template con `fs.readFileSync(TEMPLATE_XLSX_PATH)`.
- Generar el output con exceljs y retornar como descarga.

---

Fin del documento.
