'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Home, Download, Save } from 'lucide-react';
import { useDocumentStore } from '@/stores/docStore';
import { toast } from 'sonner';
import StepGeneral from './steps/StepGeneral';
import StepDetalle from './steps/StepDetalle';
import StepResumen from './steps/StepResumen';

const STEPS = [
    { number: 1, name: 'Datos Generales', component: StepGeneral },
    { number: 2, name: 'Detalle', component: StepDetalle },
    { number: 3, name: 'Resumen y Exportación', component: StepResumen },
];

export default function WizardShell() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const stepParam = searchParams.get('step');
    const currentStep = parseInt(stepParam || '1', 10);

    const { setCurrentStep, save, load } = useDocumentStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Cargar documento al iniciar el wizard
        const loadDoc = async () => {
            await load();
            setIsLoading(false);
        };
        loadDoc();
    }, [load]);

    useEffect(() => {
        setCurrentStep(currentStep);
    }, [currentStep, setCurrentStep]);

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            router.push(`/nuevo?step=${currentStep + 1}`);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            router.push(`/nuevo?step=${currentStep - 1}`);
        } else {
            router.push('/');
        }
    };

    const handleSave = async () => {
        await save();
        toast.success('Borrador guardado correctamente');
    };

    const handleExport = async () => {
        // La exportación se maneja en el StepResumen
        toast.info('Ve al paso 3 para exportar el documento');
    };

    const CurrentStepComponent = STEPS[currentStep - 1]?.component || StepGeneral;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Cargando documento...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header con progreso */}
            <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Nuevo Documento de Servicio</h1>
                            <p className="text-sm text-gray-600">
                                Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1]?.name}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSave}>
                                <Save className="w-4 h-4 mr-2" />
                                Guardar borrador
                            </Button>
                            {currentStep === 3 ? (
                                <Button size="sm" onClick={handleExport}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar
                                </Button>
                            ) : (
                                <Button size="sm" disabled variant="secondary">
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar (disponible en paso 3)
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Stepper visual */}
                    <div className="flex items-center gap-2">
                        {STEPS.map((step, idx) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex items-center gap-2 flex-1">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === step.number
                                                ? 'bg-blue-600 text-white'
                                                : currentStep > step.number
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}
                                        aria-label={`Paso ${step.number}: ${step.name}`}
                                    >
                                        {step.number}
                                    </div>
                                    <span
                                        className={`text-sm font-medium hidden md:inline ${currentStep === step.number ? 'text-blue-600' : 'text-gray-600'
                                            }`}
                                    >
                                        {step.name}
                                    </span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div
                                        className={`h-1 flex-1 mx-2 ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Contenido del paso actual */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <CurrentStepComponent />
            </main>

            {/* Footer fijo con navegación */}
            <footer className="bg-white border-t sticky bottom-0 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={handleBack}>
                            {currentStep === 1 ? (
                                <>
                                    <Home className="w-4 h-4 mr-2" />
                                    Volver al dashboard
                                </>
                            ) : (
                                <>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Atrás
                                </>
                            )}
                        </Button>

                        <div className="text-sm text-gray-600">
                            Guardado automáticamente
                        </div>

                        {currentStep < STEPS.length && (
                            <Button onClick={handleNext}>
                                Siguiente
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                        {currentStep === STEPS.length && (
                            <Button onClick={() => router.push('/')}>
                                Finalizar
                                <Home className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}
