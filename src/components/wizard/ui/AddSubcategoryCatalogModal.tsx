'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SelectCreatable } from '@/components/ui/SelectCreatable';
import { useCatalogo } from '@/hooks/useCatalogo';

interface AddSubcategoryCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoriaNombre: string;
    onSave: (subcategoria: string) => void;
}

export default function AddSubcategoryCatalogModal({
    isOpen,
    onClose,
    categoriaNombre,
    onSave,
}: AddSubcategoryCatalogModalProps) {
    const { getSubcategorias } = useCatalogo();
    const [selectedSubcategoria, setSelectedSubcategoria] = useState('');

    const subcategoriasOptions = getSubcategorias(categoriaNombre).map((sub) => ({
        value: sub.name,
        label: sub.name,
    }));
    const canSave = selectedSubcategoria.trim().length > 0;

    const handleClose = () => {
        setSelectedSubcategoria('');
        onClose();
    };

    const handleSave = () => {
        const subcategoria = selectedSubcategoria.trim();
        if (!subcategoria) return;
        onSave(subcategoria);
        handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agregar Subcategoría</DialogTitle>
                </DialogHeader>

                <div className="py-2 space-y-4">
                    <div className="text-sm text-muted-foreground">
                        Categoría: <strong>{categoriaNombre || '(Sin nombre)'}</strong>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subcategoria">Subcategoría</Label>
                        <SelectCreatable
                            value={selectedSubcategoria}
                            onValueChange={setSelectedSubcategoria}
                            options={subcategoriasOptions}
                            placeholder="Selecciona o escribe una subcategoría"
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
