'use client';

import { Suspense } from 'react';
import WizardShell from '@/components/wizard/WizardShell';

export default function NuevoDocumentoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
            <WizardShell />
        </Suspense>
    );
}
