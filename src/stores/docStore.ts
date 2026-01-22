/**
 * Store de Zustand para el estado global del documento
 */

import { create } from 'zustand';
import { DocumentDraft, createEmptyDocument, DetalleRow } from '@/lib/document';
import { saveDocument, loadDocument, clearDocument } from '@/lib/storage';

interface DocumentStore {
    // Estado
    document: DocumentDraft;
    isLoading: boolean;
    isSaving: boolean;
    currentStep: number;

    // Acciones generales
    setDocument: (doc: DocumentDraft) => void;
    updateGeneral: (data: Partial<DocumentDraft['general']>) => void;
    setCurrentStep: (step: number) => void;

    // Acciones de detalle
    addDetalleRow: (row: DetalleRow) => void;
    updateDetalleRow: (id: string, data: Partial<DetalleRow>) => void;
    deleteDetalleRow: (id: string) => void;

    // Acciones de flujograma
    setFlowchart: (flowchart: DocumentDraft['flowchart']) => void;
    removeFlowchart: () => void;

    // Persistencia
    save: () => Promise<void>;
    load: () => Promise<void>;
    clear: () => Promise<void>;
    reset: () => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
    // Estado inicial
    document: createEmptyDocument(),
    isLoading: false,
    isSaving: false,
    currentStep: 1,

    // Acciones generales
    setDocument: (doc) => set({ document: doc }),

    updateGeneral: (data) => {
        const current = get().document;
        set({
            document: {
                ...current,
                general: { ...current.general, ...data },
                updatedAt: new Date().toISOString(),
            },
        });
        // Auto-save después de actualización
        get().save();
    },

    setCurrentStep: (step) => set({ currentStep: step }),

    // Acciones de detalle
    addDetalleRow: (row) => {
        const current = get().document;
        set({
            document: {
                ...current,
                detalle: [...current.detalle, row],
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    updateDetalleRow: (id, data) => {
        const current = get().document;
        set({
            document: {
                ...current,
                detalle: current.detalle.map((row) =>
                    row.id === id ? { ...row, ...data } : row
                ),
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    deleteDetalleRow: (id) => {
        const current = get().document;
        set({
            document: {
                ...current,
                detalle: current.detalle.filter((row) => row.id !== id),
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    // Acciones de flujograma
    setFlowchart: (flowchart) => {
        const current = get().document;
        set({
            document: {
                ...current,
                flowchart,
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    removeFlowchart: () => {
        const current = get().document;
        set({
            document: {
                ...current,
                flowchart: undefined,
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    // Persistencia
    save: async () => {
        set({ isSaving: true });
        try {
            await saveDocument(get().document);
        } catch (error) {
            console.error('Error guardando documento:', error);
        } finally {
            set({ isSaving: false });
        }
    },

    load: async () => {
        set({ isLoading: true });
        try {
            const doc = await loadDocument();
            if (doc) {
                set({ document: doc });
            }
        } catch (error) {
            console.error('Error cargando documento:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    clear: async () => {
        try {
            await clearDocument();
            set({ document: createEmptyDocument(), currentStep: 1 });
        } catch (error) {
            console.error('Error limpiando documento:', error);
        }
    },

    reset: () => {
        set({ document: createEmptyDocument(), currentStep: 1 });
    },
}));
