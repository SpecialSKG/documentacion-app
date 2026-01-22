/**
 * Constantes y mapeo de celdas del template Excel
 */

// Nombre de la hoja de trabajo
export const SHEET_NAME = 'Hoja1';

// Ruta del template (relativa desde public)
export const TEMPLATE_XLSX_PATH = '/templates/DOCUMENTACION MESA DE SERVICIOS.xlsx';

// ========== MAPEO DE CELDAS - DATOS GENERALES ==========
export const HEADER_CELLS = {
    // Según especificación del documento de configuración
    title: 'C1',
    nombreServicio: 'C5',
    objetivoServicio: 'C9',
    plantilla: 'C13',
    ambito: 'C16',
    sitio: 'C19',
    contacto: 'C22',
    usuariosBeneficiados: 'C25',
    alcance: 'C28',
    tiempoRetencion: 'C31',
    requiereReportes: 'C34',
    observaciones: 'C37',
    autorizadoPor: 'C45',
    revisado: 'C47',
} as const;

// ========== TABLA DETALLE ==========

// Fila donde están los headers de la tabla
export const DETAIL_HEADER_ROW = 52;

// Primera fila de datos de la tabla
export const DETAIL_START_ROW = 54; // según template actualizado B54:K

// Mapeo de columnas (letra de columna para cada campo)
export const DETAIL_COLS = {
    categoria: 'B',        // Columna B
    subcategoria: 'C',     // Columna C
    item: 'D',             // Columna D
    campoAdicional: 'E',   // Columna E
    tipoCampo: 'F',        // Columna F
    detalle: 'G',          // Columna G (antes era SLA)
    sla: 'H',              // Columna H
    tipoInformacion: 'I',  // Columna I
    requiereDocumento: 'J',// Columna J
    observaciones: 'K',    // Columna K
} as const;

// Headers esperados en la fila DETAIL_HEADER_ROW
export const EXPECTED_HEADERS = [
    'CATEGORÍA',
    'SUBCATEGORÍA',
    'ITEM',
    'CAMPO ADICIONAL',
    'TIPO DE CAMPO',
    'DETALLE',
    'SLA',
    'TIPO DE INFORMACION',
    'REQUIERE DOCUMENTO?',
    'OBSERVACIONES',
] as const;

// ========== FLUJOGRAMA ==========

// El flujograma se inserta dinámicamente debajo de la tabla
// usando el ancho de columnas B:G
export const FLOWCHART_COL_START = 1; // B (0-indexed: A=0, B=1)
export const FLOWCHART_COL_END = 6;   // G (0-indexed: G=6)

// Espacio entre última fila de detalle y el título del flujograma
export const FLOWCHART_MARGIN_ROWS = 3;

// Alto sugerido del área de flujograma (en filas)
export const FLOWCHART_HEIGHT_ROWS = 28;

// ========== CONFIGURACIÓN ==========

// Límites
export const MAX_CAMPOS_ADICIONALES_POR_ITEM = 30;
export const DRAFTS_MAX = 5;
export const DRAFT_TTL_HOURS = 720; // 30 días

// Título del documento
export const DEFAULT_DOCUMENT_TITLE = 'DOCUMENTACIÓN MESA DE SERVICIOS';
