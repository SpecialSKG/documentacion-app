// src/data/options.ts

export type SelectOption = {
  label: string;
  value: string;
};

export const OTHER_VALUE = "__OTHER__";

export function toSelectOptions(list: string[]): SelectOption[] {
  return list.map((x) => ({ label: x, value: x }));
}

export function withOther(
  options: SelectOption[],
  otherLabel = "Otro",
  otherValue = OTHER_VALUE
): SelectOption[] {
  return [...options, { label: otherLabel, value: otherValue }];
}

/** =========================
 *  Listas base (strings)
 *  ========================= */

export const SLA_LIST = [
  "1 día",
  "2 días",
  "3 días",
  "4 días",
  "5 días",
  "6 días",
  "7 días",
  "8 días",
  "9 días",
  "10 días",
  "12 días",
  "13 días",
  "15 días",
  "20 días",
  "25 días",
  "30 días",
  "35 días",
  "45 días",
  "60 días",
  "90 días",
  "150 días",
  "270 días",
  "365 días",
];

export const FIELD_TYPE_LIST = [
  "Linea única",
  "Multilínea",
  "Numérico",
  "Decimal",
  "Lista de selección",
  "Selección múltiple",
  "Opción",
  "Casilla de verificación",
  "Fecha/hora",
];

export const INFO_TYPE_LIST = ["Publica", "Confidencial"];

export const SCOPE_LIST = [
  "Sin especificar",
  "Denuncias",
  "Mantenimiento",
  "Negocio",
  "Reintegro",
  "Seguridad",
  "Tecnología",
];

export const SITE_LIST = [
  "DGA DENUNCIAS",
  "DGA EQUIPOS CLIENTES",
  "DGA GESTIÓN DE CAMBIOS",
  "DGA GESTION DE RIESGOS",
  "DGA NEGOCIO",
  "DGA SERVIDORES",
  "DGA TECNOLOGIA",
  "DGCG EQUIPOS CLIENTES",
  "DGCG GESTIÓN DE CAMBIOS",
  "DGCG SERVIDORES",
  "DGCG TECNOLOGIA",
  "DGICP EQUIPOS CLIENTES",
  "DGICP GESTIÓN DE CAMBIOS",
  "DGICP SERVIDORES",
  "DGICP TECNOLOGIA",
  "DGII EQUIPOS CLIENTES",
  "DGII GESTIÓN DE CAMBIOS",
  "DGII NEGOCIO",
  "DGII RESOLUCIONES - REINTEGROS",
  "DGII SERVIDORES",
  "DGII TECNOLOGIA",
  "DGP EQUIPOS CLIENTES",
  "DGP GESTIÓN DE CAMBIOS",
  "DGP SERVIDORES",
  "DGP TECNOLOGIA",
  "DGS GESTIÓN DE CAMBIOS",
  "DGS NEGOCIO",
  "DGS TECNOLOGIA",
  "DGT COBROS REINTEGROS",
  "DGT EQUIPOS CLIENTES",
  "DGT FAC DVC",
  "DGT FONDOS AJENOS EN CUSTODIA",
  "DGT GESTIÓN DE CAMBIOS",
  "DGT MANTENIMIENTO",
  "DGT NEGOCIO",
  "DGT PAGOS DIRECTOS",
  "DGT REINTEGROS",
  "DGT SERVIDORES",
  "DGT TECNOLOGIA",
  "DGT UGFM",
  "DINAFI EQUIPOS CLIENTES",
  "DINAFI GESTIÓN DE CAMBIOS",
  "DINAFI PROYECTOS INTERNOS",
  "DINAFI SERVICIOS",
  "DINAFI SERVIDORES",
  "DINAFI SERVIDORES COMUNES",
  "DINAFI TECNOLOGIA",
  "DINAFI UDCT CAMBIOS",
  "DINAFI UIP CAMBIOS",
  "DINAFI UIT CAMBIOS",
  "DINAFI URT CAMBIOS",
  "DINAFI USC CAMBIOS",
  "DINAFI USEI CAMBIOS",
  "DINAFI USI CAMBIOS",
  "EQUIPOS CLIENTE DADOS DE BAJA",
  "EQUIPOS CLIENTES SIN ASIGNAR",
  "GESTIÓN DE CAMBIOS",
  "SEDE EQUIPOS CLIENTES",
  "SEDE GESTIÓN DE CAMBIOS",
  "SEDE NEGOCIO",
  "SEDE SEGURIDAD",
  "SEDE SERVIDORES",
  "SEDE TECNOLOGIA",
  "SEGURIDAD DE LA INFORMACION",
  "SERVIDORES DADOS DE BAJA",
  "SERVIDORES SIN ASIGNAR",
  "Sitio cmdb",
  "TAIIA EQUIPOS CLIENTES",
  "TAIIA GESTIÓN DE CAMBIOS",
  "TAIIA SERVIDORES",
  "TAIIA TECNOLOGIA",
  "UNAC EQUIPOS CLIENTES",
  "UNAC GESTIÓN DE CAMBIOS",
  "UNAC NEGOCIO",
  "UNAC SERVIDORES",
  "UNAC TECNOLOGIA",
];

/** =========================
 *  Opciones listas para UI
 *  (incluyen "Otro")
 *  ========================= */

export const SLA_OPTIONS = withOther(toSelectOptions(SLA_LIST));
export const FIELD_TYPE_OPTIONS = withOther(toSelectOptions(FIELD_TYPE_LIST));
export const INFO_TYPE_OPTIONS = withOther(toSelectOptions(INFO_TYPE_LIST));
export const SCOPE_OPTIONS = withOther(toSelectOptions(SCOPE_LIST));
export const SITE_OPTIONS = withOther(toSelectOptions(SITE_LIST));
