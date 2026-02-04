/**
 * Constantes y mapeo de celdas del template Excel
 * VERSIÓN 2.2: Alineado al template real (DOCUMENTACION MESA DE SERVICIOS.xlsx)
 *
 * Este archivo DEBE reflejar exactamente el layout del XLSX en:
 * /public/templates/DOCUMENTACION MESA DE SERVICIOS.xlsx
 */

export const SHEET_NAME = 'Hoja1';

// Ruta del template (relativa desde public)
export const TEMPLATE_XLSX_PATH = '/templates/DOCUMENTACION MESA DE SERVICIOS.xlsx';

// ========== MAPEO DE CELDAS - DATOS GENERALES ==========
//
// IMPORTANTE:
// - El título está en el merge B1:G2, por lo tanto SIEMPRE se escribe en B1.
// - Los campos de texto están en la columna C, filas 3–15.
// - Muchos de estos campos están mergeados (C:G), se escribe en la celda superior izquierda (columna C).
//
export const HEADER_CELLS = {
    title: 'B1',                 // merge B1:G2
    nombreServicio: 'C3',
    objetivoServicio: 'C4',       // merge C4:G4
    plantilla: 'C5',
    ambito: 'C6',
    sitio: 'C7',
    contacto: 'C8',
    usuariosBeneficiados: 'C9',
    alcance: 'C10',              // "ALCANCE DEL SERVICIO:"
    tiempoRetencion: 'C11',       // "TIEMPO DE RETENCIÓN:"
    requiereReportes: 'C12',      // "REQUIERE REPORTES:"
    observaciones: 'C13',         // "OBSERVACIONES:"
    autorizadoPor: 'C14',
    revisado: 'C15',
} as const;

// ========== TABLA DETALLE ==========

// Fila donde están los headers de la tabla (B18:N18)
export const DETAIL_HEADER_ROW = 18;

// Primera fila real de datos (B20:N...)
export const DETAIL_START_ROW = 20;

/**
 * Mapeo de columnas según el template real.
 *
 * Orden (B→N):
 * B: CATEGORÍA (merge vertical por ítem)
 * C: SUBCATEGORÍA (merge vertical por ítem)
 * D: ARTÍCULOS (ítem)
 * E: CAMPOS ADICIONALES (por fila)
 * F: TIPO DE CAMPO (por fila)
 * G: SLA (merge vertical por ítem)
 * H: GRUPO (estructura 2 niveles opcional)
 * I: TIPO DE INFORMACIÓN (merge vertical por ítem)
 * J: BUZÓN (merge vertical por ítem)
 * K: APROBADORES (merge vertical por subcategoría)
 * L: FORMULARIO EN ZOHO (merge vertical por ítem)
 * M: GRUPOS DE ASISTENCIAS SELECCIONADOS (estructura 2 niveles opcional)
 * N: GRUPOS DE USUARIO SELECCIONADOS (estructura 2 niveles opcional)
 */
export const DETAIL_COLS = {
    categoria: 'B',
    subcategoria: 'C',
    item: 'D',
    camposAdicionales: 'E',
    tipoCampos: 'F',
    sla: 'G',
    grupo: 'H',
    tipoInformacion: 'I',
    buzon: 'J',
    aprobadores: 'K',
    formularioZoho: 'L',
    gruposAsistencia: 'M',
    gruposUsuario: 'N',
} as const;

/**
 * Headers esperados en DETAIL_HEADER_ROW (solo referencia)
 */
export const EXPECTED_HEADERS = [
    'CATEGORÍA',                          // B
    'SUBCATEGORÍA',                       // C
    'ARTÍCULOS',                          // D
    'CAMPOS ADICIONALES',                 // E
    'TIPO DE CAMPO',                      // F
    'SLA',                                // G
    'GRUPO',                              // H
    'TIPO DE INFORMACIÓN',                // I
    'BUZÓN',                              // J
    'APROBADORES',                        // K
    'FORMULARIO EN ZOHO',                 // L
    'GRUPOS DE ASISTENCIAS SELECCIONADOS', // M
    'GRUPOS DE USUARIO SELECCIONADOS',     // N
] as const;

// ========== FLUJOGRAMA ==========
//
// En el template existe un bloque preformateado:
// - Título: B49:G49
// - Caja:   B50:G101
//
// Si el detalle crece, se insertan filas para "empujar" este bloque hacia abajo.
//
export const FLOWCHART_TEMPLATE_LABEL_ROW = 49; // donde está "FLUJOGRAMA" en el template

// Columna (0-index) donde se inserta la imagen (B)
export const FLOWCHART_COL_START = 1; // A=0, B=1
export const FLOWCHART_COL_END = 6;   // G=6 (referencial)

// Espacio mínimo (en filas) entre el final del detalle y el título de flujograma
export const FLOWCHART_MARGIN_ROWS = 3;

// ========== CONFIGURACIÓN ==========
export const MAX_CAMPOS_ADICIONALES_POR_ITEM = 30;

// Título por defecto si no se asigna nombre del servicio
export const DEFAULT_DOCUMENT_TITLE = 'DOCUMENTACIÓN MESA DE SERVICIOS';
