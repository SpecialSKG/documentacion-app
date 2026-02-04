'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
                        <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                            <SelectTrigger id="categoria">
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categorias.map((cat) => (
                                    <SelectItem key={cat.name} value={cat.name}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Subcategoría */}
                    <div className="space-y-2">
                        <Label htmlFor="subcategoria">Subcategoría</Label>
                        <Select
                            value={selectedSubcategoria}
                            onValueChange={setSelectedSubcategoria}
                            disabled={!selectedCategoria}
                        >
                            <SelectTrigger id="subcategoria">
                                <SelectValue placeholder={
                                    selectedCategoria ? "Selecciona una subcategoría" : "Primero selecciona una categoría"
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {subcategorias.map((subcat) => (
                                    <SelectItem key={subcat.name} value={subcat.name}>
                                        {subcat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Ítem */}
                    <div className="space-y-2">
                        <Label htmlFor="item">Artículo / Ítem</Label>
                        <Select
                            value={selectedItem}
                            onValueChange={setSelectedItem}
                            disabled={!selectedSubcategoria}
                        >
                            <SelectTrigger id="item">
                                <SelectValue placeholder={
                                    selectedSubcategoria ? "Selecciona un ítem" : "Primero selecciona una subcategoría"
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {items.map((item) => (
                                    <SelectItem key={item.name} value={item.name}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
