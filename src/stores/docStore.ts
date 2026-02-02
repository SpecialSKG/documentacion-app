/**
 * Store de Zustand para el estado global del documento
 * VERSIÓN 2.0: Soporte para estructura jerárquica
 */

import { create } from 'zustand';
import {
    DocumentDraft,
    createEmptyDocument,
    Categoria,
    Subcategoria,
    Item,
    createEmptyCategoria,
    createEmptySubcategoria,
    createEmptyItem,
} from '@/lib/document';
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

    // ========== Acciones de Categoría ==========
    addCategoria: (categoria: Categoria) => void;
    updateCategoria: (id: string, data: Partial<Categoria>) => void;
    deleteCategoria: (id: string) => void;

    // ========== Acciones de Subcategoría ==========
    addSubcategoria: (categoriaId: string, subcategoria: Subcategoria) => void;
    updateSubcategoria: (categoriaId: string, subcatId: string, data: Partial<Subcategoria>) => void;
    deleteSubcategoria: (categoriaId: string, subcatId: string) => void;

    // ========== Acciones de Ítem ==========
    addItem: (categoriaId: string, subcatId: string, item: Item) => void;
    updateItem: (categoriaId: string, subcatId: string, itemId: string, data: Partial<Item>) => void;
    deleteItem: (categoriaId: string, subcatId: string, itemId: string) => void;

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

    // ========== Acciones de Categoría ==========
    addCategoria: (categoria) => {
        const current = get().document;
        set({
            document: {
                ...current,
                detalle: [...current.detalle, categoria],
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    updateCategoria: (id, data) => {
        const current = get().document;
        set({
            document: {
                ...current,
                detalle: current.detalle.map((cat) =>
                    cat.id === id ? { ...cat, ...data } : cat
                ),
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    deleteCategoria: (id) => {
        const current = get().document;
        set({
            document: {
                ...current,
                detalle: current.detalle.filter((cat) => cat.id !== id),
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    // ========== Acciones de Subcategoría ==========
    addSubcategoria: (categoriaId, subcategoria) => {
        const current = get().document;
        set({
            document: {
                ...current,
                detalle: current.detalle.map((cat) =>
                    cat.id === categoriaId
                        ? { ...cat, subcategorias: [...cat.subcategorias, subcategoria] }
                        : cat
                ),
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    updateSubcategoria: (categoriaId, subcatId, data) => {
        const current = get().document;
        set({
            document: {
                ...current,
                detalle: current.detalle.map((cat) =>
                    cat.id === categoriaId
                        ? {
                            ...cat,
                            subcategorias: cat.subcategorias.map((subcat) =>
                                subcat.id === subcatId ? { ...subcat, ...data } : subcat
                            ),
                        }
                        : cat
                ),
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    deleteSubcategoria: (categoriaId, subcatId) => {
        const current = get().document;
        set({
            document: {
                ...current,
                detalle: current.detalle.map((cat) =>
                    cat.id === categoriaId
                        ? {
                            ...cat,
                            subcategorias: cat.subcategorias.filter((subcat) => subcat.id !== subcatId),
                        }
                        : cat
                ),
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    // ========== Acciones de Ítem ==========
    addItem: (categoriaId, subcatId, item) => {
        const current = get().document;
        set({
            document: {
                ...current,
                detalle: current.detalle.map((cat) =>
                    cat.id === categoriaId
                        ? {
                            ...cat,
                            subcategorias: cat.subcategorias.map((subcat) =>
                                subcat.id === subcatId
                                    ? { ...subcat, items: [...subcat.items, item] }
                                    : subcat
                            ),
                        }
                        : cat
                ),
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    updateItem: (categoriaId, subcatId, itemId, data) => {
        const current = get().document;
        set({
            document: {
                ...current,
                detalle: current.detalle.map((cat) =>
                    cat.id === categoriaId
                        ? {
                            ...cat,
                            subcategorias: cat.subcategorias.map((subcat) =>
                                subcat.id === subcatId
                                    ? {
                                        ...subcat,
                                        items: subcat.items.map((item) =>
                                            item.id === itemId ? { ...item, ...data } : item
                                        ),
                                    }
                                    : subcat
                            ),
                        }
                        : cat
                ),
                updatedAt: new Date().toISOString(),
            },
        });
        get().save();
    },

    deleteItem: (categoriaId, subcatId, itemId) => {
        const current = get().document;
        set({
            document: {
                ...current,
                detalle: current.detalle.map((cat) =>
                    cat.id === categoriaId
                        ? {
                            ...cat,
                            subcategorias: cat.subcategorias.map((subcat) =>
                                subcat.id === subcatId
                                    ? {
                                        ...subcat,
                                        items: subcat.items.filter((item) => item.id !== itemId),
                                    }
                                    : subcat
                            ),
                        }
                        : cat
                ),
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
