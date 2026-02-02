/**
 * Constantes y mapeo de celdas del template Excel
 * VERSIÓN 2.0: Actualizado para estructura jerárquica con nuevas columnas
 */

// Nombre de la hoja de trabajo
export const SHEET_NAME = 'Hoja1';

// Ruta del template (relativa desde public)
export const TEMPLATE_XLSX_PATH = '/templates/DOCUMENTACION MESA DE SERVICIOS.xlsx';

// ========== MAPEO DE CELDAS - DATOS GENERALES ==========
export const HEADER_CELLS = {
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
export const DETAIL_START_ROW = 54;

/**
 * Mapeo de columnas para la estructura jerárquica
 * IMPORTANTE: Columnas actualizadas según nuevo diseño con estructura 2 niveles
 * 
 * Estructura:
 * D: Categoría (merge vertical por ítem)
 * E: Subcategoría (merge vertical por ítem)
 * F: Artículo/Ítem
 * G: SLA (merge vertical por ítem)
 * H: Grupo - Estructura 2 niveles (titulo fila 1, contenido merge filas 2+)
 * I: Tipo de Información (merge vertical por ítem)
 * J: Buzón (merge vertical por ítem) [NUEVO]
 * K: Aprobadores (merge vertical por subcategoría)
 * L: Formulario Zoho (merge vertical por ítem) [NUEVO]
 * M: Grupos de Asistencia - Estructura 2 niveles [NUEVO]
 * N: Grupos de Usuario - Estructura 2 niveles [NUEVO]
 * O: Campos Adicionales (titulo)
 * P: Tipo de Campo
 */
export const DETAIL_COLS = {
    categoria: 'D',
    subcategoria: 'E',
    item: 'F',
    sla: 'G',
    grupo: 'H',
    tipoInformacion: 'I',
    buzon: 'J',
    aprobadores: 'K',
    formularioZoho: 'L',
    gruposAsistencia: 'M',
    gruposUsuario: 'N',
    camposAdicionales: 'O',
    tipoCampos: 'P',
} as const;

/**
 * Headers esperados en la fila DETAIL_HEADER_ROW (solo referencia, no se validan)
 */
export const EXPECTED_HEADERS = [
    'CATEGORÍA',           // D
    'SUBCATEGORÍA',        // E
    'ARTÍCULO / ÍTEM',     // F
    'SLA',                 // G
    'GRUPO',               // H
    'TIPO DE INFORMACIÓN', // I
    'BUZÓN',               // J
    'APROBADORES',         // K
    'FORMULARIO ZOHO',     // L
    'GRUPOS DE ASISTENCIA',// M
    'GRUPOS DE USUARIO',   // N
    'CAMPOS ADICIONALES',  // O
    'TIPO DE CAMPO',       // P
] as const;

// ========== FLUJOGRAMA ==========

/**
 * El flujograma se inserta dinámicamente debajo de la tabla
 * Se posiciona en el ancho de columnas D:N aproximadamente
 */
export const FLOWCHART_COL_START = 3; // D (0-indexed: A=0, B=1, C=2, D=3)
export const FLOWCHART_COL_END = 13;  // N (0-indexed: N=13)

// Espacio entre última fila de detalle y el flujograma
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
