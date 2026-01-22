'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DetalleRowSchema, type DetalleRow, type CampoAdicional, createEmptyCampoAdicional } from '@/lib/document';
import { useDocumentStore } from '@/stores/docStore';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
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
import { SLA_OPTIONS, TIPO_INFORMACION_OPTIONS, REQUIERE_DOCUMENTO_OPTIONS, GRUPO_OPTIONS } from '@/data/options';
import { FIELD_TYPES } from '@/lib/document';
import catalog from '@/data/catalog.json';

interface DetalleRowEditorProps {
    row: DetalleRow;
    isOpen: boolean;
    onClose: () => void;
    onSave: (row: DetalleRow) => void;
}

export default function DetalleRowEditor({ row, isOpen, onClose, onSave }: DetalleRowEditorProps) {
    const { updateDetalleRow } = useDocumentStore();
    const [localRow, setLocalRow] = useState<DetalleRow>(row);
    const [selectedCategoria, setSelectedCategoria] = useState(row.categoria);
    const [selectedSubcategoria, setSelectedSubcategoria] = useState(row.subcategoria);
    const [camposAdicionales, setCamposAdicionales] = useState<CampoAdicional[]>(row.camposAdicionales || []);

    useEffect(() => {
        setLocalRow(row);
        setSelectedCategoria(row.categoria);
        setSelectedSubcategoria(row.subcategoria);
        setCamposAdicionales(row.camposAdicionales || []);
    }, [row]);

    const categorias = catalog.data || [];
    const subcategorias = categorias.find((c) => c.name === selectedCategoria)?.subcategories || [];
    const items = subcategorias.find((s) => s.name === selectedSubcategoria)?.items || [];

    const handleChange = (field: keyof DetalleRow, value: string) => {
        setLocalRow((prev) => ({ ...prev, [field]: value }));
    };

    const handleCategoriaChange = (value: string) => {
        setSelectedCategoria(value);
        setSelectedSubcategoria('');
        setLocalRow((prev) => ({ ...prev, categoria: value, subcategoria: '', item: '' }));
    };

    const handleSubcategoriaChange = (value: string) => {
        setSelectedSubcategoria(value);
        setLocalRow((prev) => ({ ...prev, subcategoria: value, item: '' }));
    };

    // ===== MICRO-PASO: Campos Adicionales =====
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
        const finalRow = {
            ...localRow,
            camposAdicionales,
        };
        updateDetalleRow(finalRow.id, finalRow);
        onSave(finalRow);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Editar Entrada de Detalle</SheetTitle>
                    <SheetDescription>
                        Configura la entrada con categoría, subcategoría, ítem y campos adicionales
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Catálogo: Categoría, Subcategoría, Item */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Catálogo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Categoría */}
                            <div>
                                <Label htmlFor="categoria">Categoría *</Label>
                                <Select value={selectedCategoria} onValueChange={handleCategoriaChange}>
                                    <SelectTrigger id="categoria" aria-label="Seleccionar categoría">
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
                                    onValueChange={handleSubcategoriaChange}
                                    disabled={!selectedCategoria}
                                >
                                    <SelectTrigger id="subcategoria" aria-label="Seleccionar subcategoría">
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

                            {/* Item */}
                            <div>
                                <Label htmlFor="item">Item *</Label>
                                <Select
                                    value={localRow.item}
                                    onValueChange={(v) => handleChange('item', v)}
                                    disabled={!selectedSubcategoria}
                                >
                                    <SelectTrigger id="item" aria-label="Seleccionar item">
                                        <SelectValue placeholder="Selecciona un item" />
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
                        </CardContent>
                    </Card>

                    {/* Propiedades del servicio */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Propiedades del Servicio</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Detalle */}
                            <div>
                                <Label htmlFor="detalle">Detalle</Label>
                                <Textarea
                                    id="detalle"
                                    value={localRow.detalle}
                                    onChange={(e) => handleChange('detalle', e.target.value)}
                                    placeholder="Descripción detallada"
                                    rows={3}
                                />
                            </div>

                            {/* SLA */}
                            <div>
                                <Label htmlFor="sla">SLA</Label>
                                <Select value={localRow.sla} onValueChange={(v) => handleChange('sla', v)}>
                                    <SelectTrigger id="sla">
                                        <SelectValue placeholder="Selecciona un SLA" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SLA_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Grupo */}
                            <div>
                                <Label htmlFor="grupo">Grupo</Label>
                                <Select value={localRow.grupo} onValueChange={(v) => handleChange('grupo', v)}>
                                    <SelectTrigger id="grupo">
                                        <SelectValue placeholder="Selecciona un grupo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GRUPO_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tipo de Información */}
                            <div>
                                <Label htmlFor="tipoInformacion">Tipo de Información</Label>
                                <Select
                                    value={localRow.tipoInformacion}
                                    onValueChange={(v) => handleChange('tipoInformacion', v)}
                                >
                                    <SelectTrigger id="tipoInformacion">
                                        <SelectValue placeholder="Selecciona tipo de información" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIPO_INFORMACION_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Requiere Documento */}
                            <div>
                                <Label htmlFor="requiereDocumento">¿Requiere Documento?</Label>
                                <Select
                                    value={localRow.requiereDocumento}
                                    onValueChange={(v) => handleChange('requiereDocumento', v)}
                                >
                                    <SelectTrigger id="requiereDocumento">
                                        <SelectValue placeholder="Selecciona una opción" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {REQUIERE_DOCUMENTO_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <Label htmlFor="observaciones">Observaciones</Label>
                                <Textarea
                                    id="observaciones"
                                    value={localRow.observaciones}
                                    onChange={(e) => handleChange('observaciones', e.target.value)}
                                    placeholder="Observaciones adicionales"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ===== MICRO-PASO: Campos Adicionales ===== */}
                    <Card className="border-2 border-blue-200">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Campos Adicionales</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Define campos personalizados para este item
                                    </p>
                                </div>
                                <Button size="sm" onClick={handleAddCampo} aria-label="Agregar campo adicional">
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
                                                aria-label={`Título del campo ${index + 1}`}
                                            />

                                            {/* Tipo de campo */}
                                            <Select
                                                value={campo.tipo}
                                                onValueChange={(v) => handleUpdateCampo(index, 'tipo', v)}
                                            >
                                                <SelectTrigger aria-label={`Tipo de campo ${index + 1}`}>
                                                    <SelectValue placeholder="Tipo de campo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {FIELD_TYPES.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveCampo(index)}
                                            aria-label={`Eliminar campo ${index + 1}`}
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
                            Guardar entrada
                        </Button>
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancelar
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
