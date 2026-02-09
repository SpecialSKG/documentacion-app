/**
 * Tipos y esquemas para el modelo de documentos de Mesa de Servicios
 * VERSIÓN 2.0: Modelo Jerárquico (Categoría → Subcategoría → Ítem)
 */

import { z } from 'zod';

// ========== TIPOS DE CAMPO (sin cambios) ==========
export const FIELD_TYPES = [
  'Texto',
  'Texto largo',
  'Número',
  'Correo',
  'Teléfono',
  'Fecha',
  'Hora',
  'Fecha y hora',
  'Selector',
  'Checkbox',
  'Radio',
  'Archivo',
  'URL',
] as const;

export type FieldType = typeof FIELD_TYPES[number];

// ========== ESQUEMAS ZOD ==========

/**
 * Campo adicional de un ítem (sin cambios)
 */
export const CampoAdicionalSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  tipo: z.enum(FIELD_TYPES),
  requerido: z.boolean().optional().default(false),
});

/**
 * NUEVO: Estructura especial de 2 niveles para Grupo, Grupos Asistencia, Grupos Usuario
 * Fila 1: título
 * Filas 2+: contenido (merge vertical)
 */
export const GrupoEspecialSchema = z.object({
  titulo: z.string().default(''),
  contenido: z.string().default(''), // Multilinea con saltos de línea
});

/**
 * ACTUALIZADO: DetalleRow ahora representa un ÍTEM completo
 * (antes era una fila plana)
 */
export const ItemSchema = z.object({
  id: z.string(),
  // Referencia al catálogo
  itemNombre: z.string().default(''), // Nombre del ítem seleccionado del catálogo
  // Campos adicionales
  camposAdicionales: z.array(CampoAdicionalSchema).default([]),
  // Propiedades del ítem
  detalle: z.string().default(''),
  sla: z.string().default(''), // Col G
  grupo: GrupoEspecialSchema.default({ titulo: '', contenido: '' }), // Col H (2 niveles)
  tipoInformacion: z.string().default(''), // Col I
  buzon: z.string().default(''), // Col J (NUEVO)
  // NUEVO v2.3: Aprobadores a nivel ítem (opcional, hereda de subcategoría si está vacío)
  aprobadores: z.string().default('').optional(), // Col K - override de subcategoría
  formularioZoho: z.string().default(''), // Col L (NUEVO)
  gruposAsistencia: GrupoEspecialSchema.default({ titulo: '', contenido: '' }), // Col M (NUEVO)
  gruposUsuario: GrupoEspecialSchema.default({ titulo: '', contenido: '' }), // Col N (NUEVO)
  observaciones: z.string().default(''),
  // Campos legacy (mantener compatibilidad temporal)
  requiereDocumento: z.string().default(''),
});

/**
 * NUEVO: Subcategoría (contiene ítems)
 */
export const SubcategoriaSchema = z.object({
  id: z.string(),
  nombre: z.string().default(''), // Nombre de la subcategoría del catálogo
  aprobadores: z.string().default(''), // Col K - multilinea, a nivel de subcategoría
  items: z.array(ItemSchema).default([]),
});

/**
 * NUEVO: Categoría (contiene subcategorías)
 */
export const CategoriaSchema = z.object({
  id: z.string(),
  nombre: z.string().default(''), // Nombre de la categoría del catálogo
  subcategorias: z.array(SubcategoriaSchema).default([]),
});

/**
 * Datos Generales (sin cambios)
 */
export const GeneralDataSchema = z.object({
  nombreServicio: z.string().default(''),
  objetivoServicio: z.string().default(''),
  plantilla: z.string().default(''),
  ambito: z.string().default(''),
  sitio: z.string().default(''),
  contacto: z.string().default(''),
  usuariosBeneficiados: z.string().default(''),
  alcance: z.string().default(''),
  tiempoRetencion: z.string().default(''),
  requiereReportes: z.string().default(''),
  observaciones: z.string().default(''),
  autorizadoPor: z.string().default(''),
  revisado: z.string().default(''),
});

/**
 * Flujograma (sin cambios)
 */
export const FlowchartSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
  base64: z.string(),
}).optional();

/**
 * ACTUALIZADO: DocumentDraft ahora usa estructura jerárquica
 */
export const DocumentDraftSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(['editing', 'completed']).default('editing'),
  general: GeneralDataSchema,
  detalle: z.array(CategoriaSchema).default([]), // CAMBIADO: ahora es array de Categorías
  flowchart: FlowchartSchema,
});

// ========== TIPOS TYPESCRIPT ==========
export type CampoAdicional = z.infer<typeof CampoAdicionalSchema>;
export type GrupoEspecial = z.infer<typeof GrupoEspecialSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Subcategoria = z.infer<typeof SubcategoriaSchema>;
export type Categoria = z.infer<typeof CategoriaSchema>;
export type GeneralData = z.infer<typeof GeneralDataSchema>;
export type Flowchart = z.infer<typeof FlowchartSchema>;
export type DocumentDraft = z.infer<typeof DocumentDraftSchema>;

// Legacy type alias para compatibilidad temporal
export type DetalleRow = Item;

// ========== UTILIDADES ==========

/**
 * Genera un UUID v4 compatible con todos los navegadores
 * Alternativa a crypto.randomUUID() que no está disponible en todos los entornos
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ========== FUNCIONES HELPER ==========

/**
 * Crea un nuevo documento vacío
 */
export function createEmptyDocument(): DocumentDraft {
  return {
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'editing',
    general: GeneralDataSchema.parse({}),
    detalle: [], // Ahora es array de Categorías
    flowchart: undefined,
  };
}

/**
 * Crea una categoría vacía
 */
export function createEmptyCategoria(): Categoria {
  return {
    id: generateUUID(),
    nombre: '',
    subcategorias: [],
  };
}

/**
 * Crea una subcategoría vacía
 */
export function createEmptySubcategoria(): Subcategoria {
  return {
    id: generateUUID(),
    nombre: '',
    aprobadores: '',
    items: [],
  };
}

/**
 * Crea un ítem vacío
 */
export function createEmptyItem(): Item {
  return {
    id: generateUUID(),
    itemNombre: '',
    camposAdicionales: [],
    detalle: '',
    sla: '',
    grupo: { titulo: '', contenido: '' },
    tipoInformacion: '',
    buzon: '',
    aprobadores: '', // NUEVO v2.3: aprobadores a nivel ítem
    formularioZoho: '',
    gruposAsistencia: { titulo: '', contenido: '' },
    gruposUsuario: { titulo: '', contenido: '' },
    observaciones: '',
    requiereDocumento: '',
  };
}

/**
 * Legacy: Crea un ítem vacío (alias)
 * @deprecated Usar createEmptyItem() en su lugar
 */
export function createEmptyDetalleRow(): Item {
  return createEmptyItem();
}

/**
 * Crea un campo adicional vacío
 */
export function createEmptyCampoAdicional(): CampoAdicional {
  return {
    titulo: '',
    tipo: 'Texto',
    requerido: false,
  };
}

/**
 * Crea un grupo especial vacío
 */
export function createEmptyGrupoEspecial(): GrupoEspecial {
  return {
    titulo: '',
    contenido: '',
  };
}
