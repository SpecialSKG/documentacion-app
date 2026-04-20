'use client';

import { useState } from 'react';
import { useDocumentStore } from '@/stores/docStore';
import { Categoria, Subcategoria, Item } from '@/lib/document';
import { useCatalogo } from '@/hooks/useCatalogo';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Library, ShieldCheck } from 'lucide-react';
import ItemModal from './ItemModal';
import SubcategoriaModal from './SubcategoriaModal';
import SubcategoriaEditModal from './SubcategoriaEditModal';
import AddCategoryModal from './AddCategoryModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { nanoid } from 'nanoid';
import { alertError, alertInfo, alertSuccess } from '@/lib/alerts';

interface CategoriaAccordionProps {
    categorias: Categoria[];
}

export default function CategoriaAccordion({ categorias }: CategoriaAccordionProps) {
    const {
        addCategoria,
        deleteCategoria,
        addSubcategoria,
        updateSubcategoria,
        deleteSubcategoria,
        addItem,
        updateItem,
        deleteItem,
    } = useDocumentStore();

    useCatalogo();

    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedContext, setSelectedContext] = useState<{ categoriaId: string; subcategoriaId?: string } | null>(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);

    const [selectedSubcat, setSelectedSubcat] = useState<{ id: string; nombre: string; aprobadores: string; categoriaId: string } | null>(null);
    const [isSubcatModalOpen, setIsSubcatModalOpen] = useState(false);
    const [selectedSubcatEdit, setSelectedSubcatEdit] = useState<{ id: string; nombre: string; categoriaId: string } | null>(null);
    const [isSubcatEditModalOpen, setIsSubcatEditModalOpen] = useState(false);

    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    // Estados para confirmaciones
    const [deleteConfirm, setDeleteConfirm] = useState<{
        open: boolean;
        type: 'categoria' | 'subcategoria' | 'item';
        categoriaId?: string;
        subcategoriaId?: string;
        itemId?: string;
    }>({ open: false, type: 'categoria' });
    const [openCategorias, setOpenCategorias] = useState<string[]>(
        () => categorias.map((categoria) => categoria.id)
    );
    const [openSubcategoriasByCategoria, setOpenSubcategoriasByCategoria] = useState<Record<string, string[]>>(
        () =>
            categorias.reduce<Record<string, string[]>>((acc, categoria) => {
                acc[categoria.id] = categoria.subcategorias.map((subcat) => subcat.id);
                return acc;
            }, {})
    );

    const ensureExpandedPath = (categoriaId: string, subcategoriaId?: string) => {
        setOpenCategorias((prev) =>
            prev.includes(categoriaId) ? prev : [...prev, categoriaId]
        );

        if (!subcategoriaId) return;

        setOpenSubcategoriasByCategoria((prev) => {
            const current = prev[categoriaId] || [];
            if (current.includes(subcategoriaId)) return prev;

            return {
                ...prev,
                [categoriaId]: [...current, subcategoriaId],
            };
        });
    };

    const normalizeValue = (value: string) => value.trim().toLowerCase();

    const handleAddCategoria = (categoriaNombre: string, subcategoriaNombre: string) => {
        let categoria = categorias.find(
            (current) => normalizeValue(current.nombre) === normalizeValue(categoriaNombre)
        );

        if (!categoria) {
            categoria = {
                id: nanoid(),
                nombre: categoriaNombre.trim(),
                subcategorias: [],
            };
            addCategoria(categoria);
        }

        const existingSubcat = categoria.subcategorias.find(
            (subcat) => normalizeValue(subcat.nombre) === normalizeValue(subcategoriaNombre)
        );

        if (existingSubcat) {
            ensureExpandedPath(categoria.id, existingSubcat.id);
            void alertInfo('La subcategoría ya existe en esta categoría');
            return;
        }

        const nuevaSubcategoria = {
            id: nanoid(),
            nombre: subcategoriaNombre.trim(),
            aprobadores: '',
            items: [],
        };

        addSubcategoria(categoria.id, nuevaSubcategoria);
        ensureExpandedPath(categoria.id, nuevaSubcategoria.id);
        void alertSuccess(`Subcategoría "${nuevaSubcategoria.nombre}" agregada`);
    };

    // === Handlers para Categorías ===
    const handleDeleteCategoria = (catId: string) => {
        setDeleteConfirm({
            open: true,
            type: 'categoria',
            categoriaId: catId,
        });
    };

    // === Handlers para Subcategorías ===

    const handleEditSubcatAprobadores = (catId: string, subcat: Subcategoria) => {
        setSelectedSubcat({
            id: subcat.id,
            nombre: subcat.nombre,
            aprobadores: subcat.aprobadores,
            categoriaId: catId,
        });
        setIsSubcatModalOpen(true);
    };

    const handleEditSubcategoria = (catId: string, subcat: Subcategoria) => {
        setSelectedSubcatEdit({
            id: subcat.id,
            nombre: subcat.nombre,
            categoriaId: catId,
        });
        setIsSubcatEditModalOpen(true);
    };

    const handleSaveSubcatAprobadores = (aprobadores: string) => {
        if (selectedSubcat) {
            updateSubcategoria(selectedSubcat.categoriaId, selectedSubcat.id, { aprobadores });
            void alertSuccess('Aprobadores actualizados');
        }
    };

    const handleSaveSubcategoria = (nombre: string) => {
        if (!selectedSubcatEdit) return;
        updateSubcategoria(selectedSubcatEdit.categoriaId, selectedSubcatEdit.id, { nombre });
        void alertSuccess('Subcategoría actualizada');
    };

    const handleDeleteSubcategoria = (catId: string, subcatId: string) => {
        setDeleteConfirm({
            open: true,
            type: 'subcategoria',
            categoriaId: catId,
            subcategoriaId: subcatId,
        });
    };

    // === Handlers para Ítems ===
    const handleAddItem = (categoriaId: string, subcategoriaId: string) => {
        setSelectedItem(null);
        setSelectedContext({ categoriaId, subcategoriaId });
        ensureExpandedPath(categoriaId, subcategoriaId);
        setIsItemModalOpen(true);
    };

    const handleAddFromCategory = (categoriaId: string) => {
        setSelectedItem(null);
        setSelectedContext({ categoriaId });
        ensureExpandedPath(categoriaId);
        setIsItemModalOpen(true);
    };

    const handleEditItem = (catId: string, subcatId: string, item: Item) => {
        setSelectedItem(item);
        setSelectedContext({ categoriaId: catId, subcategoriaId: subcatId });
        ensureExpandedPath(catId, subcatId);
        setIsItemModalOpen(true);
    };

    const handleSaveItem = (
        item: Item,
        categoriaId: string,
        subcategoriaId: string,
        _categoriaNombre: string,
        subcategoriaNombre: string
    ) => {
        if (selectedItem) {
            // Edición
            updateItem(categoriaId, subcategoriaId, item.id, item);
            void alertSuccess('Ítem actualizado');
        } else {
            if (!subcategoriaId) {
                const categoria = categorias.find((current) => current.id === categoriaId);
                if (!categoria) {
                    void alertError('No se encontró la categoría de destino');
                    return;
                }

                const normalizedSubcatName = normalizeValue(subcategoriaNombre);
                const existingSubcat = categoria.subcategorias.find(
                    (subcat) => normalizeValue(subcat.nombre) === normalizedSubcatName
                );

                let finalSubcatId = existingSubcat?.id;

                if (!finalSubcatId) {
                    const nuevaSubcategoria = {
                        id: nanoid(),
                        nombre: subcategoriaNombre.trim(),
                        aprobadores: '',
                        items: [],
                    };
                    addSubcategoria(categoriaId, nuevaSubcategoria);
                    finalSubcatId = nuevaSubcategoria.id;
                }

                addItem(categoriaId, finalSubcatId, item);
                ensureExpandedPath(categoriaId, finalSubcatId);
            } else {
                // Creación normal (flujo Agregar Ítem intacto)
                addItem(categoriaId, subcategoriaId, item);
                ensureExpandedPath(categoriaId, subcategoriaId);
            }
            void alertSuccess('Ítem creado');
        }
    };

    const handleCloseItemModal = () => {
        setIsItemModalOpen(false);
        setSelectedItem(null);
        setSelectedContext(null);
    };

    const handleDeleteItem = (catId: string, subcatId: string, itemId: string) => {
        setDeleteConfirm({
            open: true,
            type: 'item',
            categoriaId: catId,
            subcategoriaId: subcatId,
            itemId: itemId,
        });
    };

    // Confirmar eliminación
    const confirmDelete = () => {
        const { type, categoriaId, subcategoriaId, itemId } = deleteConfirm;

        if (type === 'categoria' && categoriaId) {
            deleteCategoria(categoriaId);
            void alertSuccess('Categoría eliminada');
        } else if (type === 'subcategoria' && categoriaId && subcategoriaId) {
            deleteSubcategoria(categoriaId, subcategoriaId);
            void alertSuccess('Subcategoría eliminada');
        } else if (type === 'item' && categoriaId && subcategoriaId && itemId) {
            deleteItem(categoriaId, subcategoriaId, itemId);
            void alertSuccess('Ítem eliminado');
        }

        setDeleteConfirm({ open: false, type: 'categoria' });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Estructura Jerárquica</h3>
                <Button onClick={() => setIsAddCategoryModalOpen(true)} variant="default">
                    <Library className="w-4 h-4 mr-2" />
                    Agregar Categoría
                </Button>
            </div>

            {categorias.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                    <p>No hay categorías. Haz clic en &quot;Agregar Categoría&quot; para comenzar.</p>
                </Card>
            ) : (
                <Accordion
                    type="multiple"
                    className="space-y-2"
                    value={openCategorias}
                    onValueChange={setOpenCategorias}
                >
                    {categorias.map((categoria) => (
                        <AccordionItem key={categoria.id} value={categoria.id} className="border rounded-lg">
                            <div className="flex items-center px-4 gap-2">
                                <AccordionTrigger className="flex-1 hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-blue-700">
                                            📁 {categoria.nombre || '(Sin nombre)'}
                                        </span>
                                        <Badge variant="secondary">
                                            {categoria.subcategorias.length} subcategorías
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddFromCategory(categoria.id)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar Subcategoría
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteCategoria(categoria.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <AccordionContent className="px-4 pt-4">
                                <div className="space-y-2">

                                    {categoria.subcategorias.length === 0 ? (
                                        <p className="text-sm text-gray-500 py-2">No hay subcategorías</p>
                                    ) : (
                                        <Accordion
                                            type="multiple"
                                            className="space-y-1"
                                            value={openSubcategoriasByCategoria[categoria.id] || []}
                                            onValueChange={(values) =>
                                                setOpenSubcategoriasByCategoria((prev) => ({
                                                    ...prev,
                                                    [categoria.id]: values,
                                                }))
                                            }
                                        >
                                            {categoria.subcategorias.map((subcat) => (
                                                <AccordionItem
                                                    key={subcat.id}
                                                    value={subcat.id}
                                                    className="border-l-2 border-green-200 pl-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <AccordionTrigger className="flex-1 py-2 hover:no-underline">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-green-700">
                                                                    📂 {subcat.nombre || '(Sin nombre)'}
                                                                </span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {subcat.items.length} ítems
                                                                </Badge>
                                                                {subcat.aprobadores && (
                                                                    <Badge variant="default" className="text-xs">
                                                                        ✓ Aprobadores
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </AccordionTrigger>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditSubcategoria(categoria.id, subcat)}
                                                                title="Editar subcategoría"
                                                            >
                                                                <Edit className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditSubcatAprobadores(categoria.id, subcat)}
                                                                title="Aprobadores de subcategoría"
                                                            >
                                                                <ShieldCheck className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDeleteSubcategoria(categoria.id, subcat.id)}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <AccordionContent className="px-3 pt-2">
                                                        <Button
                                                            onClick={() => handleAddItem(categoria.id, subcat.id)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="mb-2"
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Agregar Ítem
                                                        </Button>

                                                        {subcat.items.length === 0 ? (
                                                            <p className="text-xs text-gray-500 py-1">No hay ítems</p>
                                                        ) : (
                                                            <div className="space-y-1">
                                                                {subcat.items.map((item) => (
                                                                    <div
                                                                        key={item.id}
                                                                        className="flex items-center justify-between p-2 bg-gray-50 rounded border text-sm"
                                                                    >
                                                                        <div className="flex-1">
                                                                            <span className="font-medium">
                                                                                📄 {item.itemNombre || '(Sin nombre)'}
                                                                            </span>
                                                                            {item.camposAdicionales.length > 0 && (
                                                                                <Badge variant="secondary" className="ml-2 text-xs">
                                                                                    {item.camposAdicionales.length} campos
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex gap-1">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    handleEditItem(categoria.id, subcat.id, item)
                                                                                }
                                                                            >
                                                                                <Edit className="w-3 h-3" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="destructive"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    handleDeleteItem(
                                                                                        categoria.id,
                                                                                        subcat.id,
                                                                                        item.id
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}

            {/* Modal de Ítem */}
            {selectedContext && (
                <ItemModal
                    key={`${selectedContext.categoriaId}-${selectedContext.subcategoriaId || 'no-subcat'}-${selectedItem?.id || 'new'}`}
                    item={selectedItem}
                    isOpen={isItemModalOpen}
                    onClose={handleCloseItemModal}
                    onSave={handleSaveItem}
                    categoriaId={selectedContext.categoriaId}
                    subcategoriaId={selectedContext.subcategoriaId}
                />
            )}

            {/* Modal de Subcategoría (Aprobadores) */}
            {selectedSubcat && (
                <SubcategoriaModal
                    subcategoriaNombre={selectedSubcat.nombre}
                    aprobadores={selectedSubcat.aprobadores}
                    isOpen={isSubcatModalOpen}
                    onClose={() => setIsSubcatModalOpen(false)}
                    onSave={handleSaveSubcatAprobadores}
                />
            )}

            {/* Modal de Edición de Subcategoría */}
            {selectedSubcatEdit && (
                <SubcategoriaEditModal
                    isOpen={isSubcatEditModalOpen}
                    nombreActual={selectedSubcatEdit.nombre}
                    onClose={() => setIsSubcatEditModalOpen(false)}
                    onSave={handleSaveSubcategoria}
                />
            )}

            <AddCategoryModal
                isOpen={isAddCategoryModalOpen}
                onClose={() => setIsAddCategoryModalOpen(false)}
                onSave={handleAddCategoria}
            />

            {/* Dialog de confirmación para eliminaciones */}
            <ConfirmDialog
                open={deleteConfirm.open}
                onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
                onConfirm={confirmDelete}
                title={
                    deleteConfirm.type === 'categoria'
                        ? 'Eliminar Categoría'
                        : deleteConfirm.type === 'subcategoria'
                            ? 'Eliminar Subcategoría'
                            : 'Eliminar Ítem'
                }
                description={
                    deleteConfirm.type === 'categoria'
                        ? '¿Estás seguro de eliminar esta categoría y todas sus subcategorías e ítems? Esta acción no se puede deshacer.'
                        : deleteConfirm.type === 'subcategoria'
                            ? '¿Estás seguro de eliminar esta subcategoría y todos sus ítems? Esta acción no se puede deshacer.'
                            : '¿Estás seguro de eliminar este ítem? Esta acción no se puede deshacer.'
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="destructive"
            />
        </div>
    );
}
