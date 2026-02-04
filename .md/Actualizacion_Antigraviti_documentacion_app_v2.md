# ACTUALIZACIÓN PARA ANTIGRAVITI (documentacion-app)
> Documento de reglas y tareas de **actualización** (no es un “proyecto desde cero”).  
> Objetivo: corregir **lectura de data real**, mejorar UI/UX y **exportar a Excel** respetando el formato oficial (merges/filas).

---

## 0) Contexto y alcance de esta actualización

- El proyecto ahora se llama: **documentacion-app**
- Este documento es una **actualización del proyecto existente**, por lo tanto:
  - **No reinicies** el repo ni cambies el stack base (Next.js + TS + Tailwind/shadcn si ya está).
  - **No borres** componentes existentes; modifica y refactoriza con cuidado.
  - Prioridad: **Sanar** (data → UI → export) con el mínimo de ruptura.

---

## 1) Fuente de verdad (data real del proyecto)

### 1.1 Archivos obligatorios
Los datos “reales” que deben alimentar selects/catálogos viven aquí:

- `src/data/catalogo.json`  
  Contiene **TODO el catálogo** jerárquico (categorías → subcategorías → ítems).

- `src/data/datos.json`  
  Contiene **listas de opciones** para selects (SLA, tipo de campo, tipo de info, ámbito, sitios, etc.).

✅ Regla: **la UI NO debe inventar opciones placeholder** (ej: Nacional/Regional, Oficina Central/Sucursal Norte, etc.).  
✅ Regla: **TODOS los selects** deben leer desde `datos.json` y/o `catalogo.json`.

---

## 2) Modelo de datos (lo que la app debe manejar)

### 2.1 Estructura general del documento
El documento que construye el wizard debe modelarse así:

- **Datos Generales** (Paso 1)
- **Detalle** (Paso 2)
  - **Categorías** (padre)
    - **Subcategorías** (hijo)
      - **Ítems / Artículos** (nieto)
        - **Campos adicionales** (lista; cada campo ocupa fila en Excel)

### 2.2 Regla clave de “entradas”
- **1 entrada = 1 CATEGORÍA**
- Dentro de una categoría pueden existir **múltiples subcategorías**
- Dentro de una subcategoría pueden existir **múltiples ítems**
- Dentro de un ítem pueden existir **0..N campos adicionales**

> Consecuencia: si “Infraestructura” tiene “Redes” y “Servidores”, NO son 2 entradas separadas.  
> Es 1 categoría (“Infraestructura”) con 2 subcategorías.

---

## 3) Reglas del Excel (export oficial)

> Base: usar el template oficial **DOCUMENTACION MESA DE SERVICIOS.xlsx** (o el que corresponda), y exportar respetando el layout de la hoja.

### 3.1 Encabezados/columnas de la tabla de detalle
En la hoja, la tabla de detalle se rige por encabezados tipo:

- **B:** CATEGORÍA  
- **C:** SUBCATEGORÍA  
- **D:** ARTÍCULOS / ÍTEM  
- **E:** CAMPOS ADICIONALES  
- **F:** TIPO DE CAMPO  
- **G:** SLA  
- **H:** GRUPO  
- **I:** TIPO DE INFORMACIÓN  
- **J:** BUZÓN  
- **K:** APROBADORES  
- **L:** FORMULARIO ZOHO  
- **M:** GRUPOS DE ASISTENCIAS SELECCIONADOS  
- **N:** GRUPOS DE USUARIO SELECCIONADOS  

> Nota: **M y N son parte del nuevo diseño** y deben exportarse (no se ocultan).

### 3.2 Cómo se “dibuja” el árbol en filas (merges verticales)
#### A) Categoría (columna B)
- La **Categoría** debe aparecer una sola vez y su celda se **mergea verticalmente** abarcando todo el bloque de filas que correspondan a su contenido.

#### B) Subcategoría (columna C)
- La **Subcategoría** también se **mergea verticalmente** sobre todas las filas que cubren sus ítems/campos.

#### C) Ítem (columna D)
- Cada ítem se escribe una vez y su celda (col D) se **mergea verticalmente** sobre todas las filas necesarias para sus campos adicionales (y reglas mínimas).

#### D) Campos adicionales (columnas E y F)
- Cada campo adicional ocupa **una fila** (en E el nombre del campo y en F el tipo).
- Si el ítem tiene **N** campos adicionales, entonces se generan **N filas**.
- **Si el ítem tiene 0 campos adicionales**, igual debe existir un bloque mínimo (ver 3.3) y:
  - **E y F se mergean verticalmente** en ese bloque, con valor vacío (o un texto neutro si se decide).
  - No se crean “columnas extra”; siempre son filas.

### 3.3 Regla mínima de filas por ítem (muy importante)
Un ítem debe ocupar **mínimo 2 filas**, aunque tenga 0 campos adicionales.

Motivo: por la estructura especial de **GRUPO (H)** y también por **M/N**, que requieren:
- Fila 1: **título/nombre del grupo**
- Fila 2..N: **contenido** (merge vertical)

Por lo tanto:
- `filas_item = max(cantidad_campos_adicionales, 1)`  
- `filas_item = max(filas_item, 2)`  ✅ (mínimo 2)

### 3.4 Estructura especial de GRUPO (columna H)
Para cada ÍTEM:

- En la **primera fila del bloque del ítem** (H):
  - escribir el **nombre/título** del grupo (texto)

- En las **filas 2..fin del bloque** (H):
  - escribir el **contenido** (miembros / detalle) en una sola celda con saltos de línea
  - esa celda debe estar **mergeada verticalmente** desde la fila 2 hasta el final del bloque

> Ejemplo conceptual:
> - H(fila 1): “DGT FAC FAC” (nombre del grupo)
> - H(filas 2..N merge): “persona1\npersona2\npersona3…”

### 3.5 Estructura especial de M y N (igual que “Grupo”)
Para cada ÍTEM:

- **Columna M** (Grupos de asistencias seleccionados):
  - Fila 1 del bloque: **título/nombre**
  - Filas 2..fin: **contenido** (merge vertical), con saltos de línea

- **Columna N** (Grupos de usuario seleccionados):
  - Fila 1 del bloque: **título/nombre**
  - Filas 2..fin: **contenido** (merge vertical), con saltos de línea

### 3.6 APROBADORES (columna K) es a nivel de SUBCATEGORÍA
- **K (Aprobadores)** se llena **por subcategoría**, no por ítem.
- Debe exportarse como texto libre (puede ser 1 o varias personas).
- Se recomienda:
  - guardar en la app como lista (array) y exportar con saltos de línea,
  - y en Excel **mergear verticalmente** la columna K a través de todo el bloque de esa subcategoría.

### 3.7 Separación visual entre bloques (filas en blanco)
Se debe insertar filas en blanco para separar bloques:

- **Separación interna (subcategorías):**  
  Al terminar una subcategoría, insertar **1 fila en blanco**.

- **Separación externa (categorías):**  
  Al terminar una categoría (después de su última subcategoría), insertar **2 filas en blanco** (o 1 adicional sobre la interna) para que se note más la separación de “macro bloque”.

> Importante: las filas en blanco **no deben quedar dentro de merges** de categoría/subcategoría/ítem.

### 3.8 Flujograma debajo del detalle (sin límite de detalle)
- La tabla de detalle **NO tiene límite de filas**.
- El flujograma siempre debe quedar **debajo** del detalle, aunque el detalle crezca.
- Regla: al exportar, si el detalle crece, el export debe:
  - **insertar filas** y empujar el bloque de flujograma hacia abajo.
- Separación: entre el fin del detalle y el inicio del flujograma, dejar **2 filas en blanco**.

Si no hay flujograma:
- Exportar una sola fila con un texto tipo: **“No se requiere”** (o equivalente), respetando el estilo visual.

---

## 4) UI/UX (mejoras necesarias)

### 4.1 Paso 1: Datos Generales (layout)
Problema actual: selects “mínimos” y inputs desbalanceados visualmente.

**Reglas UX:**
- Todos los inputs/selects deben usar `w-full`.
- Usar grid consistente:
  - fila Plantilla (izq) + Ámbito (der) → ambos con ancho equilibrado.
  - fila Sitio (izq) + ¿Requiere Reportes? (der) → ambos con ancho equilibrado.
- Evitar selects “pegados” y espacios vacíos raros.

**Data:**
- Ámbito, Sitio, Requiere Reportes: deben alimentarse desde `src/data/datos.json`.

### 4.2 Paso 2: Detalle (cambiar el patrón de edición)
Problema actual: para agregar/editar se abre un **sidebar derecho**.
✅ Esto NO es deseado.

**Nuevo comportamiento recomendado:**
- Mantener el listado de entradas (cards/rows) como está (te gusta cómo se ve).
- Cambiar el “Agregar/Editar” a un **MODAL** centrado y responsivo, no sidebar.
- Al guardar el modal:
  - se integra (inline) dentro de la categoría/subcategoría correspondiente.

### 4.3 Estructura de UI en Paso 2 (tree editor)
El editor de detalle debe ser “árbol”:

- Lista de **Categorías** (expandibles/accordion)
  - Dentro, lista de **Subcategorías**
    - Dentro, lista de **Ítems**
      - Cada ítem se ve como una fila/card compacta con:
        - Path (Categoría > Subcategoría > Ítem)
        - Chips de campos adicionales (si existen)
        - Resumen rápido: SLA, Tipo info, Req. doc, etc. (lo que quepa)
        - Botones: Editar / Eliminar

**Acciones necesarias:**
- Botón global: **“Agregar nueva categoría”**
- Dentro de una categoría: **“Agregar subcategoría”**
- Dentro de una subcategoría: **“Agregar ítem”**
- Editar ítem abre modal
- Editar subcategoría debe permitir:
  - cambiar nombre/selección (si aplica)
  - editar **APROBADORES** (porque K es por subcategoría)

> Extra: cuando un ítem cambia de subcategoría, debe “moverse” en el árbol (no duplicarse).

---

## 5) Contenido del MODAL (agregar/editar ítem)

### 5.1 Sección Catálogo (depende de catalogo.json)
Dentro del modal, el ítem se define con:

- Categoría (select)
- Subcategoría (select filtrado por categoría)
- Ítem/Artículo (select filtrado por subcategoría)

✅ Estos 3 selects se alimentan desde `src/data/catalogo.json`.

### 5.2 Sección Propiedades del ítem (columnas G, H, I, J, L, M, N)
- SLA (col G) → select desde `datos.json` (listado real)
- Grupo (col H) → estructura 2 niveles:
  - título/nombre (texto libre o select si existiera lista)
  - contenido (multilinea / lista de personas)
- Tipo de Información (col I) → select desde `datos.json`
- Buzón (col J) → texto libre
- Formulario Zoho (col L) → texto libre
- Grupos de asistencias seleccionados (col M) → igual que Grupo (H):
  - título/nombre
  - contenido (multilinea)
- Grupos de usuario seleccionados (col N) → igual que Grupo (H):
  - título/nombre
  - contenido (multilinea)

> Nota: aunque no hay base de datos, estos textos se guardan en el estado del documento/borrador y se exportan.

### 5.3 Campos adicionales (columnas E y F)
Los campos adicionales deben manejarse como lista.

Cada fila debe tener:
- Nombre del campo (E)
- Tipo de campo (F) → select desde `datos.json`

Acciones:
- “Agregar campo” añade una nueva fila
- Permitir eliminar un campo
- (Opcional) reordenar

**Regla de export (relación 1:1):**
- Campo[i].nombre → columna E fila i
- Campo[i].tipo → columna F fila i

---

## 6) Aprobadores a nivel subcategoría (columna K)

En la UI, a nivel de subcategoría debe existir un apartado:

- **Aprobadores (K)**
  - texto libre (uno o varios)
  - preferible multilinea
  - se exporta con saltos de línea

Esto **no depende** del ítem.

---

## 7) Exportación (Paso 3)

### 7.1 Botones de export
Mantener 2 opciones si ya existen:

- Exportar Plantilla Oficial (XLSX) → usa template y llena TODO
- Exportar solo tabla de detalle (XLSX) → genera workbook con la tabla

### 7.2 Reglas críticas del export
- Tomar la tabla de detalle desde fila inicial del template (la del encabezado).
- Generar filas dinámicas en base al árbol (categoría→subcategoría→ítems→campos).
- Aplicar merges verticales:
  - Categoría (B)
  - Subcategoría (C)
  - Ítem (D)
  - SLA (G) por ítem
  - Tipo info (I) por ítem
  - Buzón (J) por ítem
  - Formulario Zoho (L) por ítem
  - Aprobadores (K) por subcategoría
  - Campos E/F si el ítem tiene 0 campos (merge vertical)
  - Grupo (H) con patrón 2 niveles (1 fila + merge)
  - M y N con patrón 2 niveles (1 fila + merge)

- Insertar filas separadoras:
  - 1 entre subcategorías
  - 2 entre categorías

- Al final del detalle:
  - dejar 2 filas en blanco
  - colocar flujograma abajo (moviendo/insertando filas si es necesario)

---

## 8) Persistencia (borrador) y limpieza

- “Guardar borrador” debe persistir el documento completo (Datos Generales + Detalle).
- “Limpiar documento” debe resetear TODO el estado y limpiar storage.

✅ Recomendación: guardar en localStorage (ya existe `storage.ts`), pero asegurar:
- solo en client-side
- compatible con Next.js (no romper SSR)

---

## 9) Checklist de aceptación (lo mínimo para considerar “sanado”)

### Paso 1
- [ ] Ámbito/Sitio/Reportes leen desde `datos.json`
- [ ] Grid visual balanceado (selects con `w-full`, sin “mínimos”)
- [ ] No hay opciones placeholder

### Paso 2
- [ ] No existe sidebar derecho para crear/editar → se usa modal
- [ ] Árbol real: Categoría → Subcategoría → Ítems
- [ ] Aprobadores (K) se editan en subcategoría
- [ ] Ítems soportan 0..N campos adicionales
- [ ] M y N existen en UI y se guardan

### Export
- [ ] Export respeta jerarquía y merges
- [ ] 2 filas mínimas por ítem
- [ ] Columnas H/M/N: 1 fila título + merge para contenido
- [ ] Columna K: merge por subcategoría
- [ ] Separaciones: 1 fila subcategoría, 2 filas categoría
- [ ] Flujograma siempre queda abajo del detalle

---

## 10) Instrucción final para Antigraviti (modo ejecución)
1) Abrir el repo existente **documentacion-app**  
2) Leer `src/data/catalogo.json` y `src/data/datos.json`  
3) Identificar dónde están hardcodeadas las opciones actuales y reemplazarlas por lectura desde JSON  
4) Refactorizar Paso 2 (Detalle) para:
   - modelo jerárquico
   - modal en lugar de sidebar
   - aprobadores por subcategoría
   - M/N en UI y export
5) Ajustar export XLSX:
   - merges correctos
   - filas mínimas
   - separadores
   - flujograma desplazable

---

### Notas de estilo (para que el resultado se vea “pro”)
- Mantener consistencia visual (spacing, tipografías, tarjetas).
- Los chips de campos adicionales deben ser compactos (máx 1 línea; overflow con “+N”).
- En modal: separar por secciones con títulos (Catálogo / Propiedades / Campos Adicionales).

