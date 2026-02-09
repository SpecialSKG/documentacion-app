'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Settings, AlertCircle } from 'lucide-react';
import { useDocumentStore } from '@/stores/docStore';
import { toast } from 'sonner';

export default function DashboardPage() {
    const router = useRouter();
    const { load, clear, document } = useDocumentStore();
    const [hasDraft, setHasDraft] = useState(false);

    useEffect(() => {
        // Cargar documento guardado al iniciar
        load();
    }, [load]);

    useEffect(() => {
        // Actualizar hasDraft después del montaje para evitar hydration mismatch
        setHasDraft(document.updatedAt !== document.createdAt || document.detalle.length > 0);
    }, [document]);

    const handleNewDocument = () => {
        router.push('/nuevo?step=1');
    };

    const handleClearDocument = async () => {
        if (confirm('¿Estás seguro de que deseas limpiar el documento actual? Esta acción no se puede deshacer.')) {
            await clear();
            toast.success('Documento limpiado correctamente');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Mesa de Servicios</h1>
                            <p className="text-sm text-gray-600">Sistema de documentación</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleClearDocument}>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Limpiar documento
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Card principal - Registrar servicio nuevo */}
                    <Card className="relative overflow-hidden border-2 border-blue-500 shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle>Registrar servicio nuevo</CardTitle>
                                    <CardDescription>Crear nueva documentación</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                Inicia el wizard para crear un nuevo documento de servicio paso a paso.
                            </p>
                            <Button onClick={handleNewDocument} className="w-full" size="lg">
                                Comenzar
                            </Button>
                            {hasDraft && (
                                <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Tienes un borrador en progreso
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Card secundaria - Servicio en producción (disabled) */}
                    <Card className="opacity-60">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <Settings className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <CardTitle>Servicio en producción</CardTitle>
                                    <CardDescription>Gestionar servicios activos</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                Administra y actualiza servicios que ya están en operación.
                            </p>
                            <Button disabled className="w-full" size="lg">
                                Próximamente
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Info card */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-blue-900">Información</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm">
                                <p className="font-semibold text-blue-900 mb-1">¿Qué puedes hacer?</p>
                                <ul className="space-y-1 text-blue-800">
                                    <li>• Crear documentos paso a paso</li>
                                    <li>• Guardar borradores automáticamente</li>
                                    <li>• Exportar a Excel con template</li>
                                    <li>• Adjuntar flujogramas</li>
                                </ul>
                            </div>
                            <div className="pt-2 border-t border-blue-200">
                                <p className="text-xs text-blue-700">
                                    Tu progreso se guarda automáticamente. Puedes cerrar y volver cuando quieras.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
