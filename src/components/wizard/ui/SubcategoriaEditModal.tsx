'use client';

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface SubcategoriaEditModalProps {
    isOpen: boolean;
    nombreActual: string;
    onClose: () => void;
    onSave: (nombre: string) => void;
}

export default function SubcategoriaEditModal({
    isOpen,
    nombreActual,
    onClose,
    onSave,
}: SubcategoriaEditModalProps) {
    const [nombre, setNombre] = useState(nombreActual);

    useEffect(() => {
        setNombre(nombreActual);
    }, [nombreActual]);

    const handleSave = () => {
        onSave(nombre.trim());
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Subcategoría</DialogTitle>
                    <DialogDescription>
                        Actualiza el nombre visible de la subcategoría.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="subcat-nombre">Nombre</Label>
                        <Input
                            id="subcat-nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Nombre de la subcategoría"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button onClick={handleSave} className="flex-1" disabled={!nombre.trim()}>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar
                        </Button>
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancelar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

