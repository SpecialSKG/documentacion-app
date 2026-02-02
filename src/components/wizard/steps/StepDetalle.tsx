'use client';

import { useDocumentStore } from '@/stores/docStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CategoriaAccordion from '../ui/CategoriaAccordion';

/**
 * Paso 2: Detalle
 * VERSIÓN 2.0: Vista de árbol jerárquico
 * Reemplaza el sistema de filas planas con acordeón de 3 niveles
 */
export default function StepDetalle() {
    const { document } = useDocumentStore();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Detalle del Servicio</CardTitle>
                    <CardDescription>
                        Organiza el detalle en una estructura jerárquica: Categorías → Subcategorías → Ítems
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CategoriaAccordion categorias={document.detalle} />
                </CardContent>
            </Card>

            {/* Información útil */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-sm text-blue-900">ℹ️ Cómo funciona</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Categorías:</strong> Nivel superior de organización</li>
                        <li><strong>Subcategorías:</strong> Agrupan ítems y tienen <em>Aprobadores</em></li>
                        <li><strong>Ítems:</strong> Elementos individuales con todos los campos (SLA, Grupo, Buzón, etc.)</li>
                        <li><strong>Campos Adicionales:</strong> Cada ítem puede tener campos personalizados</li>
                    </ul>
                    <p className="mt-3 text-xs">
                        💡 <strong>Tip:</strong> Los datos se exportan con merge vertical en Excel según la jerarquía.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
