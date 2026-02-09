'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SelectCreatable } from '@/components/ui/SelectCreatable';
import { useCatalogo } from '@/hooks/useCatalogo';

interface AddFromCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (categoria: string, subcategoria: string, item: string) => void;
}

/**
 * Modal para seleccionar Categoría > Subcategoría > Ítem desde el catálogo
 * Esto reemplaza el flujo anterior de crear nodos vacíos
 */
export default function AddFromCatalogModal({ isOpen, onClose, onSave }: AddFromCatalogModalProps) {
    const { categorias, getSubcategorias, getItems } = useCatalogo();

    const [selectedCategoria, setSelectedCategoria] = useState<string>('');
    const [selectedSubcategoria, setSelectedSubcategoria] = useState<string>('');
    const [selectedItem, setSelectedItem] = useState<string>('');

    const subcategorias = selectedCategoria ? getSubcategorias(selectedCategoria) : [];
    const items = selectedCategoria && selectedSubcategoria ? getItems(selectedCategoria, selectedSubcategoria) : [];

    // Reset subcategoría e ítem cuando cambie la categoría
    useEffect(() => {
        setSelectedSubcategoria('');
        setSelectedItem('');
    }, [selectedCategoria]);

    // Reset ítem cuando cambie la subcategoría
    useEffect(() => {
        setSelectedItem('');
    }, [selectedSubcategoria]);

    const handleSave = () => {
        if (selectedCategoria && selectedSubcategoria && selectedItem) {
            onSave(selectedCategoria, selectedSubcategoria, selectedItem);
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedCategoria('');
        setSelectedSubcategoria('');
        setSelectedItem('');
        onClose();
    };

    const canSave = selectedCategoria && selectedSubcategoria && selectedItem;

    // Convertir opciones para SelectCreatable
    const categoriasOptions = categorias.map(cat => ({ value: cat.name, label: cat.name }));
    const subcategoriasOptions = subcategorias.map(sub => ({ value: sub.name, label: sub.name }));
    const itemsOptions = items.map(itm => ({ value: itm.name, label: itm.name }));

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agregar Ítem desde Catálogo</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Categoría */}
                    <div className="space-y-2">
                        <Label htmlFor="categoria">Categoría</Label>
                        <SelectCreatable
                            value={selectedCategoria}
                            onValueChange={setSelectedCategoria}
                            options={categoriasOptions}
                            placeholder="Selecciona o escribe una categoría"
                        />
                    </div>

                    {/* Subcategoría */}
                    <div className="space-y-2">
                        <Label htmlFor="subcategoria">Subcategoría</Label>
                        <SelectCreatable
                            value={selectedSubcategoria}
                            onValueChange={setSelectedSubcategoria}
                            options={subcategoriasOptions}
                            placeholder="Selecciona o escribe una subcategoría"
                            disabled={!selectedCategoria}
                        />
                    </div>

                    {/* Ítem */}
                    <div className="space-y-2">
                        <Label htmlFor="item">Artículo / Ítem</Label>
                        <SelectCreatable
                            value={selectedItem}
                            onValueChange={setSelectedItem}
                            options={itemsOptions}
                            placeholder="Selecciona o escribe un artículo"
                            disabled={!selectedSubcategoria}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={!canSave}>
                        Agregar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
