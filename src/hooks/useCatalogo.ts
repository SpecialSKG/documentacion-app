/**
 * Hook para leer el catálogo jerárquico desde catalogo.json
 */

import { useMemo } from 'react';
import catalogoJson from '@/data/catalogo.json';

export interface CatalogoItem {
    name: string;
}

export interface CatalogoSubcategoria {
    name: string;
    items: CatalogoItem[];
}

export interface CatalogoCategoria {
    name: string;
    subcategories: CatalogoSubcategoria[];
}

export function useCatalogo() {
    const categorias: CatalogoCategoria[] = useMemo(() => catalogoJson.data || [], []);

    const getSubcategorias = useMemo(
        () => (categoriaNombre: string): CatalogoSubcategoria[] => {
            const categoria = categorias.find((c) => c.name === categoriaNombre);
            return categoria?.subcategories || [];
        },
        [categorias]
    );

    const getItems = useMemo(
        () => (categoriaNombre: string, subcategoriaNombre: string): CatalogoItem[] => {
            const categoria = categorias.find((c) => c.name === categoriaNombre);
            const subcategoria = categoria?.subcategories.find((s) => s.name === subcategoriaNombre);
            return subcategoria?.items || [];
        },
        [categorias]
    );

    return {
        categorias,
        getSubcategorias,
        getItems,
    };
}
