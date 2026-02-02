/**
 * Hook para leer opciones de datos desde datos.json
 * Reemplaza las opciones hardcodeadas en options.ts
 */

import { useMemo } from 'react';
import datosJson from '@/data/datos.json';

export interface SelectOption {
    value: string;
    label: string;
}

export function useDataOptions() {
    const slaOptions: SelectOption[] = useMemo(
        () => datosJson.listado_sla.map((sla) => ({ value: sla, label: sla })),
        []
    );

    const tipoCamposOptions: SelectOption[] = useMemo(
        () => datosJson.tipo_campos.map((tipo) => ({ value: tipo, label: tipo })),
        []
    );

    const tipoInformacionOptions: SelectOption[] = useMemo(
        () => datosJson.tipo_informacion.map((tipo) => ({ value: tipo, label: tipo })),
        []
    );

    const ambitoOptions: SelectOption[] = useMemo(
        () => datosJson.ambito.map((ambito) => ({ value: ambito, label: ambito })),
        []
    );

    const sitiosOptions: SelectOption[] = useMemo(
        () => datosJson.sitios.map((sitio) => ({ value: sitio, label: sitio })),
        []
    );

    // Requiere Reportes no está en datos.json, así que lo mantenemos hardcoded
    const requiereReportesOptions: SelectOption[] = useMemo(
        () => [
            { value: 'Si', label: 'Sí' },
            { value: 'No', label: 'No' },
        ],
        []
    );

    return {
        slaOptions,
        tipoCamposOptions,
        tipoInformacionOptions,
        ambitoOptions,
        sitiosOptions,
        requiereReportesOptions,
    };
}
