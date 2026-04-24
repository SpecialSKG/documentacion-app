'use client';

import { useState } from 'react';
import { useDocumentStore } from '@/stores/docStore';
import {
    Item,
    GrupoEspecial,
    CampoAdicional,
    Categoria,
    createEmptyItem,
    createEmptyCampoAdicional,
} from '@/lib/document';
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
import { SelectCreatable } from '@/components/ui/SelectCreatable';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Save } from 'lucide-react';
import { alertError } from '@/lib/alerts';

interface ItemModalProps {
    item: Item | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        item: Item,
        categoriaId: string,
        subcategoriaId: string,
        categoriaNombre: string,
        subcategoriaNombre: string
    ) => void;
    // Contexto jerárquico
    categoriaId?: string;
    subcategoriaId?: string;
}

interface ItemModalInitialState {
    localItem: Item;
    selectedCategoria: string;
    selectedSubcategoria: string;
    camposAdicionales: CampoAdicional[];
    useSubcatAprobadores: boolean;
}

function getInitialState(
    item: Item | null,
    categoriaId: string | undefined,
    subcategoriaId: string | undefined,
    detalle: Categoria[]
): ItemModalInitialState {
    if (item) {
        let selectedCategoria = '';
        let selectedSubcategoria = '';

        for (const cat of detalle) {
            for (const subcat of cat.subcategorias) {
                if (subcat.items.some((i) => i.id === item.id)) {
                    selectedCategoria = cat.nombre;
                    selectedSubcategoria = subcat.nombre;
                    break;
                }
            }
            if (selectedCategoria && selectedSubcategoria) break;
        }

        return {
            localItem: item,
            selectedCategoria,
            selectedSubcategoria,
            camposAdicionales: item.camposAdicionales || [],
            useSubcatAprobadores: !item.aprobadores || item.aprobadores === '',
        };
    }

    const newItem = createEmptyItem();
    let selectedCategoria = '';
    let selectedSubcategoria = '';

    if (categoriaId) {
        const categoria = detalle.find((cat) => cat.id === categoriaId);
        selectedCategoria = categoria?.nombre || '';
        if (subcategoriaId) {
            const subcategoria = categoria?.subcategorias.find((sub) => sub.id === subcategoriaId);
            selectedSubcategoria = subcategoria?.nombre || '';
        }
    }

    return {
        localItem: newItem,
        selectedCategoria,
        selectedSubcategoria,
        camposAdicionales: [],
        useSubcatAprobadores: true,
    };
}

export default function ItemModal({ item, isOpen, onClose, onSave, categoriaId, subcategoriaId }: ItemModalProps) {
    const { document } = useDocumentStore();
    const { slaOptions, tipoCamposOptions, tipoInformacionOptions } = useDataOptions();
    const { categorias, getSubcategorias, getItems } = useCatalogo();
    const initialState = getInitialState(item, categoriaId, subcategoriaId, document.detalle);

    const [localItem, setLocalItem] = useState<Item>(initialState.localItem);
    const [selectedCategoria, setSelectedCategoria] = useState(initialState.selectedCategoria);
    const [selectedSubcategoria, setSelectedSubcategoria] = useState(initialState.selectedSubcategoria);
    const [camposAdicionales, setCamposAdicionales] = useState<CampoAdicional[]>(initialState.camposAdicionales);
    const [useSubcatAprobadores, setUseSubcatAprobadores] = useState(initialState.useSubcatAprobadores);
    const [currentStep, setCurrentStep] = useState(1);
    const isCreateWithSubcategoryContext = !item && !!categoriaId && !!subcategoriaId;
    const isCreateWithCategoryContext = !item && !!categoriaId && !subcategoriaId;

    // Obtener aprobadores de subcategoría para el contexto actual
    const subcatAprobadores = document.detalle
        .find(cat => cat.id === categoriaId)
        ?.subcategorias.find(sub => sub.id === subcategoriaId)
        ?.aprobadores || '';

    const subcategorias = getSubcategorias(selectedCategoria);
    const items = getItems(selectedCategoria, selectedSubcategoria);

    const handleChange = <K extends keyof Item>(field: K, value: Item[K]) => {
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

    //Campos adicionales
    const handleAddCampo = () => {
        setCamposAdicionales([...camposAdicionales, createEmptyCampoAdicional()]);
    };

    const handleUpdateCampo = <K extends keyof CampoAdicional>(
        index: number,
        field: K,
        value: CampoAdicional[K]
    ) => {
        const updated = [...camposAdicionales];
        updated[index] = { ...updated[index], [field]: value };
        setCamposAdicionales(updated);
    };

    const handleRemoveCampo = (index: number) => {
        setCamposAdicionales(camposAdicionales.filter((_, i) => i !== index));
    };

    // Manejar checkbox de aprobadores
    const handleAprobadoresCheckbox = (checked: boolean | 'indeterminate') => {
        const isChecked = checked === true;
        setUseSubcatAprobadores(isChecked);
        if (isChecked) {
            // Si heredamos, limpiamos el campo de aprobadores del ítem
            handleChange('aprobadores', '');
        }
    };

    const handleSave = async () => {
        if (!selectedCategoria.trim() || !selectedSubcategoria.trim() || !localItem.itemNombre.trim()) {
            await alertError('Campos obligatorios incompletos', 'Completa categoría, subcategoría y artículo.');
            return;
        }

        const finalItem = {
            ...localItem,
            camposAdicionales,
            // Si usa aprobadores de subcategoría, aseguramos que el campo quede vacío
            aprobadores: useSubcatAprobadores ? '' : localItem.aprobadores,
        };
        onSave(
            finalItem,
            categoriaId || '',
            subcategoriaId || '',
            selectedCategoria,
            selectedSubcategoria
        );
        onClose();
    };

    const handleNextStep = async () => {
        if (currentStep === 1) {
            if (!selectedCategoria.trim() || !selectedSubcategoria.trim() || !localItem.itemNombre.trim()) {
                await alertError('Campos obligatorios incompletos', 'Completa categoría, subcategoría y artículo para continuar.');
                return;
            }
        }
        setCurrentStep((prev) => Math.min(6, prev + 1));
    };

    const handlePreviousStep = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    // Convertir opciones para SelectCreatable
    const categoriasOptions = categorias.map(cat => ({ value: cat.name, label: cat.name }));
    const subcategoriasOptions = subcategorias.map(sub => ({ value: sub.name, label: sub.name }));
    const itemsOptions = items.map(itm => ({ value: itm.name, label: itm.name }));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[90dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{item ? 'Editar Ítem' : 'Agregar Nuevo Ítem'}</DialogTitle>
                    <DialogDescription>
                        Configura el ítem con categoría, subcategoría, artículo y campos adicionales
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <span className={currentStep === 1 ? 'text-blue-700' : ''}>1. Catálogo</span>
                        <span>•</span>
                        <span className={currentStep === 2 ? 'text-blue-700' : ''}>2. Campos</span>
                        <span>•</span>
                        <span className={currentStep === 3 ? 'text-blue-700' : ''}>3. SLA</span>
                        <span>•</span>
                        <span className={currentStep === 4 ? 'text-blue-700' : ''}>4. Propiedades</span>
                        <span>•</span>
                        <span className={currentStep === 5 ? 'text-blue-700' : ''}>5. Aprobadores</span>
                        <span>•</span>
                        <span className={currentStep === 6 ? 'text-blue-700' : ''}>6. Grupos</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${(currentStep / 6) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-6 mt-4">
                    {/* === SECCIÓN 1: CATÁLOGO === */}
                    {currentStep === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Catálogo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Categoría */}
                                <div>
                                    <Label htmlFor="categoria">Categoría *</Label>
                                    <SelectCreatable
                                        value={selectedCategoria}
                                        onValueChange={setSelectedCategoria}
                                        options={categoriasOptions}
                                        placeholder="Selecciona o escribe una categoría"
                                        disabled={!!item || isCreateWithSubcategoryContext || isCreateWithCategoryContext}
                                    />
                                    {(item || isCreateWithSubcategoryContext || isCreateWithCategoryContext) && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {item
                                                ? 'No puedes cambiar la categoría al editar un ítem'
                                                : 'Categoría prefijada por el contexto'}
                                        </p>
                                    )}
                                </div>

                                {/* Subcategoría */}
                                <div>
                                    <Label htmlFor="subcategoria">Subcategoría *</Label>
                                    <SelectCreatable
                                        value={selectedSubcategoria}
                                        onValueChange={setSelectedSubcategoria}
                                        options={subcategoriasOptions}
                                        placeholder="Selecciona o escribe una subcategoría"
                                        disabled={!selectedCategoria || !!item || isCreateWithSubcategoryContext}
                                    />
                                    {(item || isCreateWithSubcategoryContext) && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {item
                                                ? 'No puedes cambiar la subcategoría al editar un ítem'
                                                : 'Subcategoría prefijada por el contexto de subcategoría'}
                                        </p>
                                    )}
                                </div>

                                {/* Ítem/Artículo */}
                                <div>
                                    <Label htmlFor="itemNombre">Artículo / Ítem *</Label>
                                    <SelectCreatable
                                        value={localItem.itemNombre}
                                        onValueChange={(value) => handleChange('itemNombre', value)}
                                        options={itemsOptions}
                                        placeholder="Selecciona o escribe un artículo"
                                        disabled={!selectedSubcategoria || !!item}
                                    />
                                    {item && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            No puedes cambiar el nombre del ítem al editar
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* === SECCIÓN 2: CAMPOS ADICIONALES === */}
                    {currentStep === 2 && (
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
                                        No hay campos adicionales. Haz clic en &quot;Agregar campo&quot; para crear uno.
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

                                                {/* Tipo de campo - MEJORADO con SelectCreatable y placeholder */}
                                                <div>
                                                    <Label className="text-xs text-gray-600">Tipo de campo adicional</Label>
                                                    <SelectCreatable
                                                        value={campo.tipo}
                                                        onValueChange={(value) => handleUpdateCampo(index, 'tipo', value as CampoAdicional['tipo'])}
                                                        options={tipoCamposOptions}
                                                        placeholder="Selecciona tipo (línea única, multilínea, lista, etc.)"
                                                    />
                                                </div>
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
                    )}

                    {/* === SECCIÓN 3: SLA === */}
                    {currentStep === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Propiedades del Ítem</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* SLA (Col G) */}
                                <div>
                                    <Label htmlFor="sla">SLA</Label>
                                    <SelectCreatable
                                        value={localItem.sla}
                                        onValueChange={(value) => handleChange('sla', value)}
                                        options={slaOptions}
                                        placeholder="Selecciona o escribe un SLA"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* === SECCIÓN 4: PROPIEDADES DEL ÍTEM === */}
                    {currentStep === 4 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Propiedades del Ítem</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Grupo (Col H) - Estructura 2 niveles */}
                                <div className="space-y-2">
                                    <Label>Grupo (H) - Estructura 2 niveles</Label>
                                    <Input
                                        placeholder="Título del grupo (fila 1)"
                                        value={localItem.grupo.titulo}
                                        onChange={(e) => handleGrupoChange('titulo', e.target.value, 'grupo')}
                                    />
                                    <Textarea
                                        placeholder="Contenido del grupo (filas 2+, multilínea)"
                                        value={localItem.grupo.contenido}
                                        onChange={(e) => handleGrupoChange('contenido', e.target.value, 'grupo')}
                                        rows={3}
                                    />
                                </div>

                                {/* Tipo de Información (Col I) */}
                                <div>
                                    <Label htmlFor="tipoInformacion">Tipo de Información</Label>
                                    <SelectCreatable
                                        value={localItem.tipoInformacion}
                                        onValueChange={(value) => handleChange('tipoInformacion', value)}
                                        options={tipoInformacionOptions}
                                        placeholder="Selecciona o escribe el tipo de información"
                                    />
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
                            </CardContent>
                        </Card>
                    )}

                    {/* === SECCIÓN 5: Aprobadores === */}
                    {currentStep === 5 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Aprobadores de la solicitud</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">

                                {/* NUEVO v3.3: Aprobadores (Col K) - Con herencia de subcategoría */}
                                <div className="space-y-3 p-4 border-2 border-purple-200 rounded-lg bg-purple-50/30">
                                    <Label>Aprobadores (Col K)</Label>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="inheritAprobadores"
                                            checked={useSubcatAprobadores}
                                            onCheckedChange={handleAprobadoresCheckbox}
                                        />
                                        <label
                                            htmlFor="inheritAprobadores"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Heredar aprobadores de la subcategoría
                                        </label>
                                    </div>

                                    {useSubcatAprobadores ? (
                                        <div className="bg-gray-100 p-3 rounded border">
                                            <p className="text-xs text-gray-600 mb-1">Aprobadores de la subcategoría:</p>
                                            <p className="text-sm whitespace-pre-wrap">
                                                {subcatAprobadores || <span className="text-gray-400 italic">(Sin aprobadores definidos en la subcategoría)</span>}
                                            </p>
                                        </div>
                                    ) : (
                                        <Textarea
                                            placeholder="Aprobadores específicos para este ítem (uno por línea)"
                                            value={localItem.aprobadores || ''}
                                            onChange={(e) => handleChange('aprobadores', e.target.value)}
                                            rows={4}
                                            className="font-mono text-sm"
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* === SECCIÓN 6: Grupos === */}
                    {currentStep === 6 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Grupos Seleccionados</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Grupos de Asistencia (Col M) - Estructura 2 niveles */}
                                <div className="space-y-2">
                                    <Label>Grupos de Asistencia Seleccionados (M) - Estructura 2 niveles</Label>
                                    <Input
                                        placeholder="Título del grupo (fila 1)"
                                        value={localItem.gruposAsistencia.titulo}
                                        onChange={(e) => handleGrupoChange('titulo', e.target.value, 'gruposAsistencia')}
                                    />
                                    <Textarea
                                        placeholder="Contenido (filas 2+, multilínea)"
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
                                        placeholder="Contenido (filas 2+, multilínea)"
                                        value={localItem.gruposUsuario.contenido}
                                        onChange={(e) => handleGrupoChange('contenido', e.target.value, 'gruposUsuario')}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-4">
                        {currentStep > 1 && (
                            <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                                Anterior
                            </Button>
                        )}
                        {currentStep < 6 && (
                            <Button onClick={handleNextStep} className="flex-1">
                                Siguiente
                            </Button>
                        )}
                        {currentStep === 6 && (
                            <Button onClick={handleSave} className="flex-1">
                                <Save className="w-4 h-4 mr-2" />
                                Guardar
                            </Button>
                        )}
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancelar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
