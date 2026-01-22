/**
 * Opciones maestras para selects y configuración
 */

export const SLA_OPTIONS = [
    { value: '1_hora', label: '1 hora' },
    { value: '4_horas', label: '4 horas' },
    { value: '8_horas', label: '8 horas' },
    { value: '24_horas', label: '24 horas' },
    { value: '48_horas', label: '48 horas' },
    { value: '72_horas', label: '72 horas' },
    { value: '__OTHER__', label: 'Otro' },
] as const;

export const TIPO_INFORMACION_OPTIONS = [
    { value: 'publica', label: 'Pública' },
    { value: 'privada', label: 'Privada' },
    { value: 'confidencial', label: 'Confidencial' },
    { value: 'restringida', label: 'Restringida' },
    { value: '__OTHER__', label: 'Otro' },
] as const;

export const AMBITO_OPTIONS = [
    { value: 'nacional', label: 'Nacional' },
    { value: 'regional', label: 'Regional' },
    { value: 'local', label: 'Local' },
    { value: 'internacional', label: 'Internacional' },
    { value: '__OTHER__', label: 'Otro' },
] as const;

export const SITIO_OPTIONS = [
    { value: 'oficina_central', label: 'Oficina Central' },
    { value: 'sucursal_norte', label: 'Sucursal Norte' },
    { value: 'sucursal_sur', label: 'Sucursal Sur' },
    { value: 'sucursal_este', label: 'Sucursal Este' },
    { value: 'sucursal_oeste', label: 'Sucursal Oeste' },
    { value: '__OTHER__', label: 'Otro' },
] as const;

export const REQUIERE_REPORTES_OPTIONS = [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
] as const;

export const REQUIERE_DOCUMENTO_OPTIONS = [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
    { value: 'opcional', label: 'Opcional' },
] as const;

export const GRUPO_OPTIONS = [
    { value: 'soporte_tecnico', label: 'Soporte Técnico' },
    { value: 'infraestructura', label: 'Infraestructura' },
    { value: 'aplicaciones', label: 'Aplicaciones' },
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'redes', label: 'Redes' },
    { value: '__OTHER__', label: 'Otro' },
] as const;

/**
 * Helper para determinar si un valor seleccionado es "Otro"
 */
export function isOtherValue(value: string): boolean {
    return value === '__OTHER__';
}

/**
 * Helper para obtener el valor final de un select (real o del input "Otro")
 */
export function getFinalValue(selectedValue: string, otherValue?: string): string {
    if (isOtherValue(selectedValue)) {
        return otherValue || '';
    }
    return selectedValue;
}
