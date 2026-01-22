/**
 * Tipos y esquemas para el modelo de documentos de Mesa de Servicios
 */

import { z } from 'zod';

// ========== TIPOS DE CAMPO ==========
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

export const CampoAdicionalSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  tipo: z.enum(FIELD_TYPES),
  requerido: z.boolean().optional().default(false),
});

export const DetalleRowSchema = z.object({
  id: z.string(),
  categoria: z.string().default(''),
  subcategoria: z.string().default(''),
  item: z.string().default(''),
  camposAdicionales: z.array(CampoAdicionalSchema).default([]),
  detalle: z.string().default(''),
  sla: z.string().default(''),
  grupo: z.string().default(''),
  tipoInformacion: z.string().default(''),
  requiereDocumento: z.string().default(''),
  observaciones: z.string().default(''),
});

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

export const FlowchartSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
  base64: z.string(),
}).optional();

export const DocumentDraftSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(['editing', 'completed']).default('editing'),
  general: GeneralDataSchema,
  detalle: z.array(DetalleRowSchema).default([]),
  flowchart: FlowchartSchema,
});

// ========== TIPOS TYPESCRIPT ==========
export type CampoAdicional = z.infer<typeof CampoAdicionalSchema>;
export type DetalleRow = z.infer<typeof DetalleRowSchema>;
export type GeneralData = z.infer<typeof GeneralDataSchema>;
export type Flowchart = z.infer<typeof FlowchartSchema>;
export type DocumentDraft = z.infer<typeof DocumentDraftSchema>;

// ========== FUNCIONES HELPER ==========

/**
 * Crea un nuevo documento vacío
 */
export function createEmptyDocument(): DocumentDraft {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'editing',
    general: GeneralDataSchema.parse({}),
    detalle: [],
    flowchart: undefined,
  };
}

/**
 * Crea una nueva fila de detalle vacía
 */
export function createEmptyDetalleRow(): DetalleRow {
  return {
    id: crypto.randomUUID(),
    categoria: '',
    subcategoria: '',
    item: '',
    camposAdicionales: [],
    detalle: '',
    sla: '',
    grupo: '',
    tipoInformacion: '',
    requiereDocumento: '',
    observaciones: '',
  };
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
