'use client';

import { useState, useRef } from 'react';
import { useDocumentStore } from '@/stores/docStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { exportToExcel } from '@/lib/excel/exportExcel';

export default function StepResumen() {
    const { document, setFlowchart, removeFlowchart } = useDocumentStore();
    const [isExporting, setIsExporting] = useState(false);
    const [flowchartPreview, setFlowchartPreview] = useState<string | null>(
        document.flowchart?.base64 || null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFlowchartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor selecciona una imagen válida (PNG, JPG)');
            return;
        }

        // Convertir a base64
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setFlowchartPreview(base64);
            setFlowchart({
                fileName: file.name,
                mimeType: file.type,
                base64,
            });
            toast.success('Flujograma cargado correctamente');
        };
        reader.onerror = () => {
            toast.error('Error al cargar la imagen');
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveFlowchart = () => {
        removeFlowchart();
        setFlowchartPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.success('Flujograma eliminado');
    };

    const handleExportTemplate = async () => {
        setIsExporting(true);
        try {
            // Cargar template desde public
            const response = await fetch('/templates/DOCUMENTACION MESA DE SERVICIOS.xlsx');
            if (!response.ok) {
                throw new Error('No se pudo cargar el template');
            }

            const arrayBuffer = await response.arrayBuffer();
            const blob = await exportToExcel(document, arrayBuffer);

            // Descargar con el nombre del servicio
            const url = URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            // Formato: "DOCUMENTACION - NOMBRE DEL SERVICIO.xlsx"
            const serviceName = document.general.nombreServicio
                ? document.general.nombreServicio.toUpperCase().replace(/[/\\?%*:|"<>]/g, '-')
                : 'MESA DE SERVICIOS';
            const fileName = `DOCUMENTACION - ${serviceName}.xlsx`;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);

            toast.success('Documento exportado correctamente');
        } catch (error) {
            console.error('Error al exportar:', error);
            toast.error('Error al exportar el documento a Excel');
        } finally {
            setIsExporting(false);
        }
    };

    const { general, detalle } = document;

    // Calculate total count of items across all categories and subcategories
    const totalItems = detalle.reduce((acc, cat) => {
        return acc + cat.subcategorias.reduce((subAcc, subcat) => {
            return subAcc + subcat.items.length;
        }, 0);
    }, 0);

    const hasData = general.nombreServicio || detalle.length > 0;

    return (
        <div className="space-y-6">
            {/* Resumen de datos generales */}
            <Card>
                <CardHeader>
                    <CardTitle>Datos Generales</CardTitle>
                    <CardDescription>Resumen de la información capturada</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {general.nombreServicio ? (
                        <>
                            <div>
                                <span className="text-sm font-medium text-gray-700">Nombre del Servicio:</span>
                                <p className="text-gray-900">{general.nombreServicio}</p>
                            </div>
                            {general.objetivoServicio && (
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Objetivo:</span>
                                    <p className="text-gray-900 text-sm">{general.objetivoServicio}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                {general.ambito && (
                                    <div>
                                        <span className="text-xs text-gray-500">Ámbito:</span>
                                        <p className="text-sm font-medium">{general.ambito}</p>
                                    </div>
                                )}
                                {general.sitio && (
                                    <div>
                                        <span className="text-xs text-gray-500">Sitio:</span>
                                        <p className="text-sm font-medium">{general.sitio}</p>
                                    </div>
                                )}
                                {general.contacto && (
                                    <div>
                                        <span className="text-xs text-gray-500">Contacto:</span>
                                        <p className="text-sm font-medium">{general.contacto}</p>
                                    </div>
                                )}
                                {general.requiereReportes && (
                                    <div>
                                        <span className="text-xs text-gray-500">Req. Reportes:</span>
                                        <p className="text-sm font-medium">{general.requiereReportes}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">No se han capturado datos generales</p>
                    )}
                </CardContent>
            </Card>

            {/* Resumen de detalle - ACTUALIZADO PARA JERARQUÍA */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalle del Servicio</CardTitle>
                    <CardDescription>
                        {detalle.length > 0
                            ? `${detalle.length} categoría${detalle.length > 1 ? 's' : ''}, ${totalItems} ítem${totalItems !== 1 ? 's' : ''} total${totalItems !== 1 ? 'es' : ''}`
                            : 'No hay categorías registradas'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {detalle.length > 0 ? (
                        <div className="space-y-3">
                            {detalle.map((categoria) => (
                                <div key={categoria.id} className="border-l-4 border-l-blue-500 pl-3">
                                    <p className="font-semibold text-blue-900">📁 {categoria.nombre || '(Sin nombre)'}</p>
                                    <div className="ml-4 mt-1 space-y-2">
                                        {categoria.subcategorias.map((subcat) => (
                                            <div key={subcat.id} className="border-l-2 border-l-green-400 pl-2">
                                                <p className="text-sm font-medium text-green-700">
                                                    📂  {subcat.nombre || '(Sin nombre)'}
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        ({subcat.items.length} ítem{subcat.items.length !== 1 ? 's' : ''})
                                                    </span>
                                                </p>
                                                {subcat.items.length > 0 && (
                                                    <div className="ml-3 mt-1 text-xs text-gray-600">
                                                        {subcat.items.map((item, idx) => (
                                                            <div key={item.id} className="flex items-center gap-1">
                                                                <span>📄</span>
                                                                <span>{item.itemNombre || '(Sin nombre)'}</span>
                                                                {item.camposAdicionales.length > 0 && (
                                                                    <span className="text-blue-600">
                                                                        (+{item.camposAdicionales.length} campos)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No hay categorías de detalle</p>
                    )}
                </CardContent>
            </Card>

            {/* Flujograma */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Flujograma del Servicio</CardTitle>
                            <CardDescription>Opcional - Adjunta una imagen del flujograma</CardDescription>
                        </div>
                        {!flowchartPreview && (
                            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-4 h-4 mr-2" />
                                Cargar imagen
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleFlowchartUpload}
                        className="hidden"
                        aria-label="Cargar flujograma"
                    />

                    {flowchartPreview ? (
                        <div className="space-y-3">
                            <div className="relative border rounded-lg overflow-hidden">
                                <img
                                    src={flowchartPreview}
                                    alt="Preview del flujograma"
                                    className="w-full h-auto max-h-96 object-contain bg-gray-50"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Cambiar imagen
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleRemoveFlowchart}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Quitar flujograma
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600 mb-2">No se ha cargado ningún flujograma</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Cargar imagen
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Exportación */}
            <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                    <CardTitle className="text-green-900">Exportación</CardTitle>
                    <CardDescription className="text-green-700">
                        Genera el documento Excel con el formato oficial
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button
                        onClick={handleExportTemplate}
                        disabled={!hasData || isExporting}
                        className="w-full"
                        size="lg"
                    >
                        <FileText className="w-5 h-5 mr-2" />
                        {isExporting ? 'Exportando...' : 'Exportar Documento Completo (XLSX)'}
                    </Button>

                    {!hasData && (
                        <p className="text-xs text-orange-600 text-center">
                            Completa al menos el nombre del servicio o agrega entradas de detalle para exportar
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
