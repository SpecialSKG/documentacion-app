/**
 * Persistencia con localForage para el documento actual
 */

import localforage from 'localforage';
import { DocumentDraft, DocumentDraftSchema, FIELD_TYPES, type FieldType } from './document';

const STORAGE_KEY = 'docms_current_v1';

const LEGACY_FIELD_TYPE_MAP: Record<string, FieldType> = {
    'Linea unica': 'Texto',
    'Linea única': 'Texto',
    'Línea unica': 'Texto',
    'Línea única': 'Texto',
    'Multilinea': 'Texto largo',
    'Multilínea': 'Texto largo',
    'Numerico': 'Número',
    'Numérico': 'Número',
    'Decimal': 'Número',
    'Lista de seleccion': 'Selector',
    'Lista de selección': 'Selector',
    'Seleccion multiple': 'Checkbox',
    'Selección múltiple': 'Checkbox',
    'Opcion': 'Radio',
    'Opción': 'Radio',
    'Casilla de verificacion': 'Checkbox',
    'Casilla de verificación': 'Checkbox',
    'Fecha/hora': 'Fecha y hora',
};

function normalizeText(value: string): string {
    return value
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function normalizeFieldType(value: unknown): FieldType {
    if (typeof value !== 'string') return 'Texto';

    if ((FIELD_TYPES as readonly string[]).includes(value)) {
        return value as FieldType;
    }

    const directMatch = LEGACY_FIELD_TYPE_MAP[value];
    if (directMatch) return directMatch;

    const normalized = normalizeText(value).toLowerCase();

    for (const [legacy, mapped] of Object.entries(LEGACY_FIELD_TYPE_MAP)) {
        if (normalizeText(legacy).toLowerCase() === normalized) {
            return mapped;
        }
    }

    return 'Texto';
}

function normalizeDraftFieldTypes(input: unknown): unknown {
    if (!input || typeof input !== 'object') return input;

    const doc = input as {
        detalle?: Array<{
            subcategorias?: Array<{
                items?: Array<{
                    camposAdicionales?: Array<{ tipo?: unknown } & Record<string, unknown>>;
                }>;
            }>;
        }>;
    };

    if (!Array.isArray(doc.detalle)) return input;

    for (const categoria of doc.detalle) {
        if (!Array.isArray(categoria?.subcategorias)) continue;

        for (const subcategoria of categoria.subcategorias) {
            if (!Array.isArray(subcategoria?.items)) continue;

            for (const item of subcategoria.items) {
                if (!Array.isArray(item?.camposAdicionales)) continue;

                for (const campo of item.camposAdicionales) {
                    campo.tipo = normalizeFieldType(campo?.tipo);
                }
            }
        }
    }

    return input;
}

// Configurar localforage
localforage.config({
    name: 'MesaServiciosDB',
    storeName: 'documents',
    description: 'Almacenamiento local de documentos de Mesa de Servicios',
});

/**
 * Guardar documento en localStorage
 */
export async function saveDocument(doc: DocumentDraft): Promise<void> {
    try {
        const updated = {
            ...doc,
            updatedAt: new Date().toISOString(),
        };
        await localforage.setItem(STORAGE_KEY, updated);
    } catch (error) {
        console.error('Error al guardar documento:', error);
        throw new Error('No se pudo guardar el documento');
    }
}

/**
 * Cargar documento desde localStorage
 */
export async function loadDocument(): Promise<DocumentDraft | null> {
    try {
        const data = await localforage.getItem<DocumentDraft>(STORAGE_KEY);
        if (!data) return null;

        const normalized = normalizeDraftFieldTypes(data);

        // Validar con Zod
        const validated = DocumentDraftSchema.parse(normalized);
        return validated;
    } catch (error) {
        console.error('Error al cargar documento:', error);
        return null;
    }
}

/**
 * Eliminar documento del almacenamiento
 */
export async function clearDocument(): Promise<void> {
    try {
        await localforage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error al limpiar documento:', error);
        throw new Error('No se pudo limpiar el documento');
    }
}

/**
 * Verificar si existe un documento guardado
 */
export async function hasDocument(): Promise<boolean> {
    try {
        const data = await localforage.getItem(STORAGE_KEY);
        return data !== null;
    } catch {
        return false;
    }
}
