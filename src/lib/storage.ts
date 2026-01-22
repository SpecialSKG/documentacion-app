/**
 * Persistencia con localForage para el documento actual
 */

import localforage from 'localforage';
import { DocumentDraft, DocumentDraftSchema } from './document';

const STORAGE_KEY = 'docms_current_v1';

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

        // Validar con Zod
        const validated = DocumentDraftSchema.parse(data);
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
