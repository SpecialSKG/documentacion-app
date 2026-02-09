# Actualización del proyecto — Pruebas del flujo “Nuevo Documento de Servicio” (v2.3)

> Este documento consolida hallazgos de pruebas (UI/UX + lógica) y decisiones de comportamiento para corregir bugs y dejar el flujo consistente.
> Incluye checklist y plan técnico para implementar cambios sin romper la exportación Excel.

---

## 0) Contexto rápido del flujo probado

Flujo: **Nuevo Documento de Servicio**
- Paso 1: **Datos Generales**
- Paso 2: **Detalle** (jerarquía: Categorías → Subcategorías → Ítems)
- Paso 3: **Resumen y Exportación** (incluye carga de flujograma e **Exportar XLSX**)

En pruebas se agregaron categorías/subcategorías/ítems desde:
- “Agregar desde Catálogo” (modal de 3 selects: Categoría / Subcategoría / Artículo-Ítem)
- “Agregar Ítem” dentro de subcategoría (modal completo de ítem con campos + campos adicionales)

---

## 1) Decisiones y reglas funcionales acordadas (lo que se implementará)

### 1.1 Campos obligatorios (Paso 1 y Paso 2)
- **Pendiente definir listado exacto**: se implementará la capacidad de marcar campos como obligatorios por configuración.
- Importante: no solo Paso 1; también habrá obligatorios en Paso 2 (según el campo y el tipo de ítem).

Recomendación técnica:
- Hacer validación **configurable** (por archivo) para no “quemar” reglas en componentes.
- Mostrar validación visual y bloquear “Siguiente” cuando aplique.

### 1.2 “Creatable Select” (en TODOS los selects)
Regla: **todo select debe permitir escribir un valor nuevo** si el usuario no encuentra la opción.

Esto aplica a:
- Paso 1 (todos los selects)
- Paso 2 (Catálogo: Categoría/Subcategoría/Artículo-Ítem)
- Paso 2 (Propiedades de ítem, campos adicionales, etc.)

Notas UI/UX:
- Debe verse claro cuando el usuario está creando una opción nueva (“Agregar: …”).
- Idealmente normalizar (trim) y evitar duplicados por mayúsculas/minúsculas.

### 1.3 Aprobadores en 2 niveles (Subcategoría y Ítem) + regla de herencia
Regla solicitada:
- Si hay **Aprobadores a nivel Subcategoría**, entonces **todos los ítems** dentro heredan esos aprobadores.
- Si **NO** hay aprobadores a nivel Subcategoría:
  - Un ítem puede tener sus propios aprobadores (solo aplica a ese ítem).
  - Los “hermanos” (otros ítems de la misma subcategoría) NO heredan, salvo que el usuario los agregue explícitamente.

Recomendación adicional:
- Si hay aprobadores en subcategoría, permitir “override” por ítem de forma explícita (checkbox “usar aprobadores de subcategoría” vs “personalizar aprobadores”).
  - Esto evita ambigüedades y hace visible la herencia.

---

## 2) Hallazgos y bugs (por Paso)

## 2.1 Paso 1 — Datos Generales

### A) Alertas visualmente “básicas” (se ven como JS tradicional)
- Hallazgo: las alertas se perciben como `alert()`/`confirm()` (poco estético y rompe la coherencia visual del proyecto).

Acción recomendada:
- Integrar una librería de alertas/toasts moderna:
  - Opción 1: **SweetAlert2** (modal) con wrapper React (ej. sweetalert2-react-content).
  - Opción 2: Toaster (ej. `sonner` / `react-hot-toast`) + Dialogs del UI kit.
- Definir un estándar: 
  - “Errores” como toast o modal (según criticidad)
  - Confirmaciones destructivas como modal (Eliminar, salir sin guardar, etc.)

### B) Faltan validaciones (obligatorios)
- Se requiere una capa que determine qué campos son obligatorios y que bloquee avanzar si faltan.

### C) Selects deben permitir escribir (creatable)
- Confirmado: aplica “a todos”.

---

## 2.2 Paso 2 — Detalle (Jerarquía)

### A) UI/UX Aprobadores: falta botón al nivel correcto
Situación actual:
- No hay un botón visible “Aprobadores” en el nivel natural del flujo.
- Para editarlos hay que entrar al botón de “editar” en la subcategoría, y ese botón realmente edita aprobadores.

Problemas:
- Confunde: el ícono “editar” sugiere editar subcategoría (nombre/propiedades), pero abre aprobadores.
- Aprobadores sí son de subcategoría (en el resultado), pero **no están expuestos con un control claro**.

Acciones UI recomendadas:
- Agregar un botón visible “Aprobadores” **al mismo nivel** que “Agregar Ítem” dentro de subcategoría.
- Mantener un botón/acción real “Editar subcategoría” (nombre, etc.) separado del de aprobadores.
- Agregar aprobadores a nivel Ítem también (según regla 1.3).

### B) “Agregar desde Catálogo”: solo aparecen 3 categorías
Hallazgo:
- En el modal de “Agregar desde Catálogo” solo aparecen:
  - Infraestructura
  - Aplicaciones
  - Seguridad
- No aparecen todas las categorías disponibles en la data.

Probable causa:
- La fuente del catálogo está filtrada, incompleta o no está leyendo el archivo correcto.

Acción:
- Verificar fuente de datos en `src/data` (allí están los archivos con la data base de categorías/subcategorías/ítems).
- Asegurar que el modal use el mismo “catálogo maestro” y no una lista derivada parcial.

### C) Modal de Ítem (editar): NO precarga categoría/subcategoría/ítem
Hallazgo:
- Al editar un ítem, los 3 selects del bloque “Catálogo” aparecen vacíos.
- Deberían pre-cargarse con el valor actual del ítem.

Acción:
- En modo edición, setear valores iniciales del formulario (incluyendo los selects).
- Si se decide que esos selects no deben cambiarse durante edición (ver punto D), entonces:
  - mostrarlos en modo “readonly” (o deshabilitados) pero visibles.

### D) Bug crítico: editar ítem termina creando uno nuevo
Hallazgo:
- Si durante edición se cambia (aunque sea solo) el select de “Artículo/Ítem” y luego se guarda:
  - Se crea un ítem nuevo
  - Se mantiene el ítem original
- Esto rompe el concepto de “editar”.

Causa probable:
- El modal de edición está llamando `addItem` en lugar de `updateItem`, o no está pasando el `id` del ítem.
- También puede ser que el formulario no conserve el `id` y caiga en flujo “crear”.

Acción:
- Modal debe operar con **modo** explícito:
  - `mode = "create"` → `addItem(...)`
  - `mode = "edit"` → `updateItem(...)` (con `id` obligatorio)
- Agregar tests/validación: si `mode === "edit"` y no hay `id`, bloquear guardar y loggear error.

### E) Política de edición: ¿se permite cambiar categoría/subcategoría desde el modal de ítem?
Observación:
- Cambiar categoría/subcategoría desde el modal de ítem es, en la práctica, “mover” el ítem en la jerarquía.
- Eso necesita reglas claras para evitar desorden.

Recomendación:
- Opción A (simple y segura): En edición, **no permitir** cambiar categoría/subcategoría/ítem; solo editar propiedades del ítem.
- Opción B (permitir mover): Si se cambia categoría/subcategoría, tratarlo como **Move**:
  - Remover del lugar original
  - Insertar en el nuevo lugar
  - Con confirmación y preservando el mismo `id` (o creando uno nuevo explícitamente)

### F) Modal: ancho insuficiente en desktop
Hallazgo:
- En desktop el modal se siente angosto para la cantidad de cards/campos.
- Para móvil, el layout vertical es válido.

Acción:
- Definir breakpoints:
  - Desktop: modal más ancho (y/o 2 columnas internas para “Catálogo” y “Propiedades”).
  - Mobile: mantener layout vertical.

### G) Campos adicionales: select de tipo es pequeño y poco descriptivo
Hallazgo:
- El select del tipo de campo adicional se percibe “mini” y no explica bien su propósito.

Acciones:
- Mejorar labels:
  - “Tipo de campo adicional”
  - Placeholder: “Selecciona el tipo de campo (línea única, multilínea, lista, etc.)”
- Ajustar tamaño/estilo consistente con el resto de inputs.

---

## 2.3 Paso 3 — Resumen y Exportación

### A) Exportación XLSX y “contrato” del template
Regla clave:
- **El template Excel es un contrato**. Si el template cambia (filas/columnas/merges), se deben ajustar los anchors o la lógica de detección.

Archivos clave:
- `src/lib/excel/exportExcel.ts` (lógica de export)
- `src/lib/excel/excelAnchors.ts` (anclas: celdas y coordenadas del template)
- Template XLSX en: `public/templates/` (o ruta equivalente usada por el frontend)

Riesgo:
- Si el template se edita (p.ej. mover tabla, eliminar filas, cambiar merges), el export puede quedar “descuadrado” o escribir en zonas mergeadas.

Recomendación técnica (para robustez):
- En lugar de depender solo de filas fijas, detectar “anclas” buscando textos (ej. celda con “CATEGORÍA”, “APROBADORES”, “FLUJOGRAMA”) y calcular posiciones.
- Alternativa: usar **Named Ranges** en Excel y resolverlas en runtime.

### B) Flujograma
Ya se implementó (en código) inserción del flujograma “debajo del detalle” de forma dinámica.
Pendiente:
- Asegurar que el template NO tenga un flujograma fijo en otra posición que cause confusión.
- Si el template conserva un placeholder, que sea coherente con el área donde se insertará dinámicamente.

---

## 3) Checklist de corrección (orden recomendado)

1) Alertas UI
- [ ] Reemplazar alertas “JS” por librería estándar (SweetAlert2 o alternativa).
- [ ] Definir patrón: toast vs modal.

2) Validaciones (Paso 1 / Paso 2)
- [ ] Implementar sistema de “reglas” configurable para obligatorios.
- [ ] Bloquear “Siguiente” y mostrar mensajes claros.

3) Creatable selects (global)
- [ ] Implementar componente reusable (SelectCreatable) con estilo consistente.
- [ ] Aplicarlo a TODOS los selects.

4) Aprobadores (subcategoría + ítem)
- [ ] Botón visible “Aprobadores” al nivel de subcategoría.
- [ ] Acción real “Editar subcategoría” separada.
- [ ] Implementar aprobadores en ítem + herencia y override.

5) Modal de ítem — Edición correcta
- [ ] Precargar los 3 selects (Catálogo).
- [ ] Corregir bug: editar no debe crear un ítem nuevo.
- [ ] Definir política de “mover ítem” vs “editar campos”.

6) Modal — Layout desktop
- [ ] Aumentar ancho en desktop.
- [ ] Considerar grid 2 columnas en desktop.

7) Campos adicionales — UX
- [ ] Labels claros + select con tamaño adecuado.
- [ ] Placeholder/descripciones.

8) Catálogo incompleto en “Agregar desde Catálogo”
- [ ] Verificar lectura desde `src/data`.
- [ ] Asegurar listado completo.

9) Export Excel (sanidad y robustez)
- [ ] Verificar coherencia template ↔ anchors.
- [ ] Evitar escribir dentro de rangos mergeados no previstos.
- [ ] Considerar detección por texto o named ranges.

---

## 4) Notas sobre archivos de data

Recordatorio: la data base para selects/catálogo se encuentra en:
- `src/data/*` (carpeta indicada para ubicar los archivos con la data de campos a actualizar)

Objetivo:
- Mantener una sola fuente de verdad para:
  - Categorías
  - Subcategorías
  - Ítems/Artículos
  - (y cualquier listado quemado en selects del Paso 1 y Paso 2)

---

## 5) Apéndice técnico (referencias rápidas)

### Componentes y store relevantes (según revisión)
- `src/store/docStore.ts`  
  - Acciones como `addItem`, `updateItem`, etc.
- `src/components/.../CategoriaAccordion.tsx`  
  - Actualmente el botón “editar” en subcategoría se usa para aprobadores (confuso).

### Depuración de búsqueda en Windows
Si no está instalado `ripgrep (rg)` en el entorno local:
- Usar búsqueda global de VSCode
- O PowerShell `Select-String` como alternativa

---

## 6) Próximos pasos inmediatos (para cerrar estos puntos)
- Implementar primero el **bug crítico** de edición de ítem (no crear duplicados).
- Luego resolver aprobadores (UI + data model).
- Finalmente pulir creatable selects y validaciones (que son cambios transversales).

