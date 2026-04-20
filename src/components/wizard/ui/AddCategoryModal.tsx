'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SelectCreatable } from '@/components/ui/SelectCreatable';
import { useCatalogo } from '@/hooks/useCatalogo';

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (categoria: string, subcategoria: string) => void;
}

export default function AddCategoryModal({ isOpen, onClose, onSave }: AddCategoryModalProps) {
    const { categorias, getSubcategorias } = useCatalogo();
    const [selectedCategoria, setSelectedCategoria] = useState('');
    const [selectedSubcategoria, setSelectedSubcategoria] = useState('');

    const categoriasOptions = categorias.map((cat) => ({ value: cat.name, label: cat.name }));
    const subcategoriasOptions = selectedCategoria
        ? getSubcategorias(selectedCategoria).map((sub) => ({ value: sub.name, label: sub.name }))
        : [];
    const canSave = selectedCategoria.trim().length > 0 && selectedSubcategoria.trim().length > 0;

    const handleClose = () => {
        setSelectedCategoria('');
        setSelectedSubcategoria('');
        onClose();
    };

    const handleSave = () => {
        const categoria = selectedCategoria.trim();
        const subcategoria = selectedSubcategoria.trim();
        if (!categoria || !subcategoria) return;
        onSave(categoria, subcategoria);
        handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agregar Categoría</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <SelectCreatable
                        value={selectedCategoria}
                        onValueChange={setSelectedCategoria}
                        options={categoriasOptions}
                        placeholder="Selecciona o escribe una categoría"
                    />
                    <Label htmlFor="subcategoria">Subcategoría</Label>
                    <SelectCreatable
                        value={selectedSubcategoria}
                        onValueChange={setSelectedSubcategoria}
                        options={subcategoriasOptions}
                        placeholder="Selecciona o escribe una subcategoría"
                        disabled={!selectedCategoria}
                    />
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
