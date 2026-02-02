'use client';

import { useState } from 'react';
import { useDocumentStore } from '@/stores/docStore';
import { Categoria, Subcategoria, Item, createEmptyCategoria, createEmptySubcategoria, createEmptyItem } from '@/lib/document';
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
import { Plus, Trash2, Edit, FolderPlus, FilePlus } from 'lucide-react';
import ItemModal from './ItemModal';
import SubcategoriaModal from './SubcategoriaModal';
import { toast } from 'sonner';

interface CategoriaAccordionProps {
    categorias: Categoria[];
}

export default function CategoriaAccordion({ categorias }: CategoriaAccordionProps) {
    const {
        addCategoria,
        updateCategoria,
        deleteCategoria,
        addSubcategoria,
        updateSubcategoria,
        deleteSubcategoria,
        addItem,
        updateItem,
        deleteItem,
    } = useDocumentStore();

    const { categorias: catalogoCategorias } = useCatalogo();

    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedContext, setSelectedContext] = useState<{ categoriaId: string; subcategoriaId: string } | null>(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);

    const [selectedSubcat, setSelectedSubcat] = useState<{ id: string; nombre: string; aprobadores: string; categoriaId: string } | null>(null);
    const [isSubcatModalOpen, setIsSubcatModalOpen] = useState(false);

    // === Handlers para Categorías ===
    const handleAddCategoria = () => {
        const nuevaCategoria = createEmptyCategoria();
        addCategoria(nuevaCategoria);
        toast.success('Categoría creada. Edita su nombre.');
    };

    const handleDeleteCategoria = (catId: string) => {
        if (confirm('¿Estás seguro de eliminar esta categoría y todas sus subcategorías e ítems?')) {
            deleteCategoria(catId);
            toast.success('Categoría eliminada');
        }
    };

    // === Handlers para Subcategorías ===
    const handleAddSubcategoria = (categoriaId: string) => {
        const nuevaSubcat = createEmptySubcategoria();
        addSubcategoria(categoriaId, nuevaSubcat);
        toast.success('Subcategoría creada. Configura su nombre y aprobadores.');
    };

    const handleEditSubcatAprobadores = (catId: string, subcat: Subcategoria) => {
        setSelectedSubcat({
            id: subcat.id,
            nombre: subcat.nombre,
            aprobadores: subcat.aprobadores,
            categoriaId: catId,
        });
        setIsSubcatModalOpen(true);
    };

    const handleSaveSubcatAprobadores = (aprobadores: string) => {
        if (selectedSubcat) {
            updateSubcategoria(selectedSubcat.categoriaId, selectedSubcat.id, { aprobadores });
            toast.success('Aprobadores actualizados');
        }
    };

    const handleDeleteSubcategoria = (catId: string, subcatId: string) => {
        if (confirm('¿Estás seguro de eliminar esta subcategoría y todos sus ítems?')) {
            deleteSubcategoria(catId, subcatId);
            toast.success('Subcategoría eliminada');
        }
    };

    // === Handlers para Ítems ===
    const handleAddItem = (categoriaId: string, subcategoriaId: string) => {
        setSelectedItem(null);
        setSelectedContext({ categoriaId, subcategoriaId });
        setIsItemModalOpen(true);
    };

    const handleEditItem = (catId: string, subcatId: string, item: Item) => {
        setSelectedItem(item);
        setSelectedContext({ categoriaId: catId, subcategoriaId: subcatId });
        setIsItemModalOpen(true);
    };

    const handleSaveItem = (item: Item, categoriaId: string, subcategoriaId: string) => {
        if (selectedItem) {
            // Edición
            updateItem(categoriaId, subcategoriaId, item.id, item);
            toast.success('Ítem actualizado');
        } else {
            // Creación
            addItem(categoriaId, subcategoriaId, item);
            toast.success('Ítem creado');
        }
    };

    const handleDeleteItem = (catId: string, subcatId: string, itemId: string) => {
        if (confirm('¿Estás seguro de eliminar este ítem?')) {
            deleteItem(catId, subcatId, itemId);
            toast.success('Ítem eliminado');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Estructura Jerárquica</h3>
                <Button onClick={handleAddCategoria} variant="default">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Categoría
                </Button>
            </div>

            {categorias.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                    <p>No hay categorías. Haz clic en "Agregar Categoría" para comenzar.</p>
                </Card>
            ) : (
                <Accordion type="multiple" className="space-y-2">
                    {categorias.map((categoria) => (
                        <AccordionItem key={categoria.id} value={categoria.id} className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-blue-700">
                                            📁 {categoria.nombre || '(Sin nombre)'}
                                        </span>
                                        <Badge variant="secondary">
                                            {categoria.subcategorias.length} subcategorías
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCategoria(categoria.id);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-4">
                                <div className="space-y-2">
                                    <Button
                                        onClick={() => handleAddSubcategoria(categoria.id)}
                                        size="sm"
                                        variant="outline"
                                        className="mb-3"
                                    >
                                        <FolderPlus className="w-4 h-4 mr-2" />
                                        Agregar Subcategoría
                                    </Button>

                                    {categoria.subcategorias.length === 0 ? (
                                        <p className="text-sm text-gray-500 py-2">No hay subcategorías</p>
                                    ) : (
                                        <Accordion type="multiple" className="space-y-1">
                                            {categoria.subcategorias.map((subcat) => (
                                                <AccordionItem
                                                    key={subcat.id}
                                                    value={subcat.id}
                                                    className="border-l-4 border-l-green-500 rounded"
                                                >
                                                    <AccordionTrigger className="px-3 py-2 hover:no-underline">
                                                        <div className="flex items-center justify-between w-full pr-3">
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
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditSubcatAprobadores(categoria.id, subcat);
                                                                    }}
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteSubcategoria(categoria.id, subcat.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-3 pt-2">
                                                        <Button
                                                            onClick={() => handleAddItem(categoria.id, subcat.id)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="mb-2"
                                                        >
                                                            <FilePlus className="w-4 h-4 mr-2" />
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
                    item={selectedItem}
                    isOpen={isItemModalOpen}
                    onClose={() => setIsItemModalOpen(false)}
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
        </div>
    );
}
