'use client';

import { useState, useEffect } from 'react';
import { useDocumentStore } from '@/stores/docStore';
import { Item, GrupoEspecial, CampoAdicional, createEmptyItem, createEmptyCampoAdicional } from '@/lib/document';
import { useDataOptions } from '@/hooks/useDataOptions';
import { useCatalogo } from '@/hooks/useCatalogo';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Save } from 'lucide-react';

interface ItemModalProps {
    item: Item | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Item, categoriaId: string, subcategoriaId: string) => void;
    // Contexto jerárquico
    categoriaId?: string;
    subcategoriaId?: string;
}

export default function ItemModal({ item, isOpen, onClose, onSave, categoriaId, subcategoriaId }: ItemModalProps) {
    const { slaOptions, tipoCamposOptions, tipoInformacionOptions } = useDataOptions();
    const { categorias, getSubcategorias, getItems } = useCatalogo();

    const [localItem, setLocalItem] = useState<Item>(item || createEmptyItem());
    const [selectedCategoria, setSelectedCategoria] = useState('');
    const [selectedSubcategoria, setSelectedSubcategoria] = useState('');
    const [camposAdicionales, setCamposAdicionales] = useState<CampoAdicional[]>([]);

    // Inicializar estado cuando cambian props
    useEffect(() => {
        if (item) {
            setLocalItem(item);
            setCamposAdicionales(item.camposAdicionales || []);
        } else {
            const newItem = createEmptyItem();
            setLocalItem(newItem);
            setCamposAdicionales([]);
        }
    }, [item]);

    const subcategorias = getSubcategorias(selectedCategoria);
    const items = getItems(selectedCategoria, selectedSubcategoria);

    const handleChange = (field: keyof Item, value: any) => {
        setLocalItem((prev) => ({ ...prev, [field]: value }));
    };

    const handleGrupoChange = (field: keyof GrupoEspecial, value: string, grupoType: 'grupo' | 'gruposAsistencia' | 'gruposUsuario') => {
        setLocalItem((prev) => ({
            ...prev,
            [grupoType]: {
                ...prev[grupoType],
                [field]: value,
            },
        }));
    };

    // Campos adicionales
    const handleAddCampo = () => {
        setCamposAdicionales([...camposAdicionales, createEmptyCampoAdicional()]);
    };

    const handleUpdateCampo = (index: number, field: keyof CampoAdicional, value: any) => {
        const updated = [...camposAdicionales];
        updated[index] = { ...updated[index], [field]: value };
        setCamposAdicionales(updated);
    };

    const handleRemoveCampo = (index: number) => {
        setCamposAdicionales(camposAdicionales.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        const finalItem = {
            ...localItem,
            camposAdicionales,
        };
        onSave(finalItem, categoriaId || '', subcategoriaId || '');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{item ? 'Editar Ítem' : 'Agregar Nuevo Ítem'}</DialogTitle>
                    <DialogDescription>
                        Configura el ítem con categoría, subcategoría, artículo y campos adicionales
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* === SECCIÓN 1: CATÁLOGO === */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Catálogo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Categoría */}
                            <div>
                                <Label htmlFor="categoria">Categoría *</Label>
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
                            <div>
                                <Label htmlFor="subcategoria">Subcategoría *</Label>
                                <Select
                                    value={selectedSubcategoria}
                                    onValueChange={setSelectedSubcategoria}
                                    disabled={!selectedCategoria}
                                >
                                    <SelectTrigger id="subcategoria">
                                        <SelectValue placeholder="Selecciona una subcategoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subcategorias.map((sub) => (
                                            <SelectItem key={sub.name} value={sub.name}>
                                                {sub.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Ítem/Artículo */}
                            <div>
                                <Label htmlFor="itemNombre">Artículo / Ítem *</Label>
                                <Select
                                    value={localItem.itemNombre}
                                    onValueChange={(v) => handleChange('itemNombre', v)}
                                    disabled={!selectedSubcategoria}
                                >
                                    <SelectTrigger id="itemNombre">
                                        <SelectValue placeholder="Selecciona un artículo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {items.map((itm) => (
                                            <SelectItem key={itm.name} value={itm.name}>
                                                {itm.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* === SECCIÓN 2: PROPIEDADES DEL ÍTEM === */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Propiedades del Ítem</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* SLA (Col G) */}
                            <div>
                                <Label htmlFor="sla">SLA</Label>
                                <Select value={localItem.sla} onValueChange={(v) => handleChange('sla', v)}>
                                    <SelectTrigger id="sla">
                                        <SelectValue placeholder="Selecciona un SLA" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {slaOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Grupo (Col H) - Estructura 2 niveles */}
                            <div className="space-y-2">
                                <Label>Grupo (H) - Estructura 2 niveles</Label>
                                <Input
                                    placeholder="Título del grupo (fila 1)"
                                    value={localItem.grupo.titulo}
                                    onChange={(e) => handleGrupoChange('titulo', e.target.value, 'grupo')}
                                />
                                <Textarea
                                    placeholder="Contenido del grupo (filas 2+, multilinea)"
                                    value={localItem.grupo.contenido}
                                    onChange={(e) => handleGrupoChange('contenido', e.target.value, 'grupo')}
                                    rows={3}
                                />
                            </div>

                            {/* Tipo de Información (Col I) */}
                            <div>
                                <Label htmlFor="tipoInformacion">Tipo de Información</Label>
                                <Select
                                    value={localItem.tipoInformacion}
                                    onValueChange={(v) => handleChange('tipoInformacion', v)}
                                >
                                    <SelectTrigger id="tipoInformacion">
                                        <SelectValue placeholder="Selecciona tipo de información" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tipoInformacionOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Buzón (Col J) */}
                            <div>
                                <Label htmlFor="buzon">Buzón</Label>
                                <Input
                                    id="buzon"
                                    placeholder="Buzón de correo"
                                    value={localItem.buzon}
                                    onChange={(e) => handleChange('buzon', e.target.value)}
                                />
                            </div>

                            {/* Formulario Zoho (Col L) */}
                            <div>
                                <Label htmlFor="formularioZoho">Formulario Zoho</Label>
                                <Input
                                    id="formularioZoho"
                                    placeholder="Formulario Zoho"
                                    value={localItem.formularioZoho}
                                    onChange={(e) => handleChange('formularioZoho', e.target.value)}
                                />
                            </div>

                            {/* Grupos de Asistencia (Col M) - Estructura 2 niveles */}
                            <div className="space-y-2">
                                <Label>Grupos de Asistencia Seleccionados (M) - Estructura 2 niveles</Label>
                                <Input
                                    placeholder="Título del grupo (fila 1)"
                                    value={localItem.gruposAsistencia.titulo}
                                    onChange={(e) => handleGrupoChange('titulo', e.target.value, 'gruposAsistencia')}
                                />
                                <Textarea
                                    placeholder="Contenido (filas 2+, multilinea)"
                                    value={localItem.gruposAsistencia.contenido}
                                    onChange={(e) => handleGrupoChange('contenido', e.target.value, 'gruposAsistencia')}
                                    rows={3}
                                />
                            </div>

                            {/* Grupos de Usuario (Col N) - Estructura 2 niveles */}
                            <div className="space-y-2">
                                <Label>Grupos de Usuario Seleccionados (N) - Estructura 2 niveles</Label>
                                <Input
                                    placeholder="Título del grupo (fila 1)"
                                    value={localItem.gruposUsuario.titulo}
                                    onChange={(e) => handleGrupoChange('titulo', e.target.value, 'gruposUsuario')}
                                />
                                <Textarea
                                    placeholder="Contenido (filas 2+, multilinea)"
                                    value={localItem.gruposUsuario.contenido}
                                    onChange={(e) => handleGrupoChange('contenido', e.target.value, 'gruposUsuario')}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* === SECCIÓN 3: CAMPOS ADICIONALES === */}
                    <Card className="border-2 border-blue-200">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Campos Adicionales</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Define campos personalizados para este ítem
                                    </p>
                                </div>
                                <Button size="sm" onClick={handleAddCampo}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar campo
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {camposAdicionales.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No hay campos adicionales. Haz clic en "Agregar campo" para crear uno.
                                </p>
                            ) : (
                                camposAdicionales.map((campo, index) => (
                                    <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg border">
                                        <div className="flex-1 space-y-2">
                                            {/* Título del campo */}
                                            <Input
                                                placeholder="Título del campo"
                                                value={campo.titulo}
                                                onChange={(e) => handleUpdateCampo(index, 'titulo', e.target.value)}
                                            />

                                            {/* Tipo de campo */}
                                            <Select
                                                value={campo.tipo}
                                                onValueChange={(v) => handleUpdateCampo(index, 'tipo', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tipo de campo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tipoCamposOptions.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveCampo(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleSave} className="flex-1">
                            <Save className="w-4 h-4 mr-2" />
                            Guardar ítem
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
