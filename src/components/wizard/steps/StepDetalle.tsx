'use client';

import { useState } from 'react';
import { useDocumentStore } from '@/stores/docStore';
import { createEmptyDetalleRow } from '@/lib/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import DetalleRowEditor from '@/components/wizard/ui/DetalleRowEditor';
import type { DetalleRow } from '@/lib/document';

export default function StepDetalle() {
    const { document, addDetalleRow, deleteDetalleRow } = useDocumentStore();
    const [editingRow, setEditingRow] = useState<DetalleRow | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const handleAddRow = () => {
        const newRow = createEmptyDetalleRow();
        setEditingRow(newRow);
        setIsEditorOpen(true);
    };

    const handleEditRow = (row: DetalleRow) => {
        setEditingRow(row);
        setIsEditorOpen(true);
    };

    const handleDeleteRow = (id: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta entrada?')) {
            deleteDetalleRow(id);
        }
    };

    const handleSaveRow = (row: DetalleRow) => {
        const exists = document.detalle.find((r) => r.id === row.id);
        if (!exists) {
            addDetalleRow(row);
        }
        // Si ya existe, el editor actualiza directamente vía store
        setIsEditorOpen(false);
        setEditingRow(null);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setEditingRow(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Detalle del Servicio</CardTitle>
                            <CardDescription>
                                Agrega las entradas de categoría, subcategoría, ítems y sus campos adicionales
                            </CardDescription>
                        </div>
                        <Button onClick={handleAddRow}>
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar entrada
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {document.detalle.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <p className="text-gray-600 mb-4">No hay entradas todavía</p>
                            <Button onClick={handleAddRow} variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar primera entrada
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {document.detalle.map((row, idx) => (
                                <div
                                    key={row.id}
                                    className="flex items-start gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-blue-600">#{idx + 1}</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {row.categoria || 'Sin categoría'}
                                            </span>
                                            {row.subcategoria && (
                                                <>
                                                    <span className="text-gray-400">›</span>
                                                    <span className="text-sm text-gray-700">{row.subcategoria}</span>
                                                </>
                                            )}
                                            {row.item && (
                                                <>
                                                    <span className="text-gray-400">›</span>
                                                    <span className="text-sm text-gray-700">{row.item}</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                            <div>
                                                <span className="text-gray-500">SLA:</span>{' '}
                                                <span className="font-medium">{row.sla || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Tipo Info:</span>{' '}
                                                <span className="font-medium">{row.tipoInformacion || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Req. Doc:</span>{' '}
                                                <span className="font-medium">{row.requiereDocumento || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Campos:</span>{' '}
                                                <span className="font-medium">{row.camposAdicionales.length}</span>
                                            </div>
                                        </div>

                                        {row.camposAdicionales.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {row.camposAdicionales.map((campo, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
                                                    >
                                                        {campo.titulo} ({campo.tipo})
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditRow(row)}
                                            aria-label="Editar entrada"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteRow(row.id)}
                                            aria-label="Eliminar entrada"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Editor de fila (Sheet lateral) */}
            {editingRow && (
                <DetalleRowEditor
                    row={editingRow}
                    isOpen={isEditorOpen}
                    onClose={handleCloseEditor}
                    onSave={handleSaveRow}
                />
            )}

            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Haz clic en "Agregar entrada" para crear nuevos ítems de
                    servicio. En cada entrada puedes definir campos adicionales personalizados.
                </p>
            </div>
        </div>
    );
}
