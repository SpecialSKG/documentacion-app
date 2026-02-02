'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface SubcategoriaModalProps {
    subcategoriaNombre: string;
    aprobadores: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: (aprobadores: string) => void;
}

export default function SubcategoriaModal({
    subcategoriaNombre,
    aprobadores,
    isOpen,
    onClose,
    onSave,
}: SubcategoriaModalProps) {
    const [localAprobadores, setLocalAprobadores] = useState(aprobadores);

    useEffect(() => {
        setLocalAprobadores(aprobadores);
    }, [aprobadores]);

    const handleSave = () => {
        onSave(localAprobadores);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Aprobadores</DialogTitle>
                    <DialogDescription>
                        Subcategoría: <strong>{subcategoriaNombre}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <Label htmlFor="aprobadores">
                            Aprobadores (Columna K - multilinea)
                        </Label>
                        <Textarea
                            id="aprobadores"
                            placeholder="Ingresa cada aprobador en una línea&#10;Ejemplo:&#10;Juan Pérez&#10;María García"
                            value={localAprobadores}
                            onChange={(e) => setLocalAprobadores(e.target.value)}
                            rows={6}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-2">
                            Los aprobadores se mostrarán en la columna K con merge vertical
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button onClick={handleSave} className="flex-1">
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
