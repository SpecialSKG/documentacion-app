import { Categoria, GeneralData, Item } from '@/lib/document';

function createDemoItem(overrides: Partial<Item>): Item {
    return {
        id: overrides.id || crypto.randomUUID(),
        itemNombre: '',
        camposAdicionales: [],
        detalle: '',
        sla: '',
        grupo: { titulo: '', contenido: '' },
        tipoInformacion: '',
        buzon: '',
        aprobadores: '',
        formularioZoho: '',
        gruposAsistencia: { titulo: '', contenido: '' },
        gruposUsuario: { titulo: '', contenido: '' },
        observaciones: '',
        requiereDocumento: '',
        ...overrides,
    };
}

export const DEMO_GENERAL_DATA: GeneralData = {
    nombreServicio: 'Proyecto Prueba Test',
    objetivoServicio: 'El objetivo principal de este servicio es facilitar la atención operativa del área.',
    plantilla: 'Sandbox / Prueba',
    ambito: 'Denuncias',
    sitio: 'DINAFI TECNOLOGIA',
    contacto: 'Juan Pérez Testing',
    usuariosBeneficiados: 'Usuarios del área de finanzas que necesitan acceso a reportes financieros.',
    alcance: 'Este servicio cubre la creación de cuentas de usuario en Active Directory, pero no incluye la configuración de permisos específicos.',
    tiempoRetencion: '5 años',
    requiereReportes: 'Sí',
    observaciones: 'Este servicio es crítico para el onboarding de nuevos empleados.',
    autorizadoPor: 'María Gómez Testing',
    revisado: 'Carlos López Testing',
};

export function createDemoDetalleData(): Categoria[] {
    return [
        {
            id: crypto.randomUUID(),
            nombre: 'Infraestructura',
            subcategorias: [
                {
                    id: crypto.randomUUID(),
                    nombre: 'Servidores',
                    aprobadores: 'Aprobador Infra 1\nAprobador Infra 2',
                    items: [
                        createDemoItem({
                            itemNombre: 'Alta de servidor',
                            sla: '5 días',
                            tipoInformacion: 'Confidencial',
                            buzon: 'buzon@prueba.com',
                            formularioZoho: 'www.zohotestingformulario.com',
                            grupo: {
                                titulo: 'Testing',
                                contenido: 'Testing\nTesting\nTesting',
                            },
                            gruposAsistencia: {
                                titulo: 'Testing',
                                contenido: 'Testing',
                            },
                            gruposUsuario: {
                                titulo: 'Testing',
                                contenido: 'Testing',
                            },
                            camposAdicionales: [
                                { titulo: 'Testing', tipo: 'Texto largo', requerido: false },
                            ],
                        }),
                        createDemoItem({
                            itemNombre: 'Mantenimiento de servidor',
                            sla: '2 días',
                            tipoInformacion: 'Publica',
                            buzon: 'buzon@prueba.com',
                            formularioZoho: 'www.zohotestingformulario.com',
                            grupo: {
                                titulo: 'Testing',
                                contenido: 'Testing\nTesting\nTesting',
                            },
                            camposAdicionales: [
                                { titulo: 'Testing', tipo: 'Texto', requerido: false },
                                { titulo: 'Testing', tipo: 'Número', requerido: false },
                            ],
                        }),
                    ],
                },
                {
                    id: crypto.randomUUID(),
                    nombre: 'Redes',
                    aprobadores: 'Aprobador Redes',
                    items: [
                        createDemoItem({
                            itemNombre: 'Apertura de puertos',
                            sla: '7 días',
                            tipoInformacion: 'Confidencial',
                            buzon: 'buzon@prueba.com',
                            aprobadores: 'Testing',
                            formularioZoho: 'www.zohotestingformulario.com',
                            grupo: {
                                titulo: 'Testing Testing',
                                contenido: 'Testing\nTesting\nTesting',
                            },
                            gruposAsistencia: {
                                titulo: 'Testing',
                                contenido: 'Testing\nTesting',
                            },
                            gruposUsuario: {
                                titulo: 'Testing',
                                contenido: 'Testing\nTesting',
                            },
                            camposAdicionales: [
                                { titulo: 'Testing Testing', tipo: 'Texto', requerido: false },
                            ],
                        }),
                        createDemoItem({
                            itemNombre: 'VPN',
                            sla: '6 días',
                            tipoInformacion: 'Confidencial',
                            buzon: 'buzon@prueba.com',
                            aprobadores: 'Testing\nTesting',
                            formularioZoho: 'www.zohotestingformulario.com',
                            grupo: {
                                titulo: 'Testing 1',
                                contenido: 'Testing 2',
                            },
                            camposAdicionales: [
                                { titulo: 'Testing 1', tipo: 'Selector', requerido: false },
                                { titulo: 'Testing 2', tipo: 'Texto largo', requerido: false },
                            ],
                        }),
                    ],
                },
            ],
        },
        {
            id: crypto.randomUUID(),
            nombre: 'Aplicaciones',
            subcategorias: [
                {
                    id: crypto.randomUUID(),
                    nombre: 'Software',
                    aprobadores: '',
                    items: [
                        createDemoItem({
                            itemNombre: 'Instalación de software',
                            sla: '7 días',
                            tipoInformacion: 'Confidencial',
                            buzon: 'buzon@prueba.com',
                            aprobadores: 'Testing',
                            formularioZoho: 'www.zohotestingformulario.com',
                            grupo: {
                                titulo: 'Testing 1',
                                contenido: 'Testing 2',
                            },
                            gruposAsistencia: {
                                titulo: 'Testing Testing Testing',
                                contenido: 'Testing',
                            },
                            gruposUsuario: {
                                titulo: 'Testing Testing',
                                contenido: 'Testing',
                            },
                            camposAdicionales: [
                                { titulo: 'Testing 1', tipo: 'Texto', requerido: false },
                                { titulo: 'Testing 2', tipo: 'Texto largo', requerido: false },
                            ],
                        }),
                        createDemoItem({
                            itemNombre: 'Licenciamiento',
                            sla: '9 días',
                            tipoInformacion: 'Confidencial',
                            buzon: 'buzon@prueba.com',
                            formularioZoho: 'www.zohotestingformulario.com',
                            grupo: {
                                titulo: 'Testing',
                                contenido: 'Testing Testing\nTesting Testing',
                            },
                            camposAdicionales: [
                                { titulo: 'Testing', tipo: 'Número', requerido: false },
                            ],
                        }),
                    ],
                },
                {
                    id: crypto.randomUUID(),
                    nombre: 'Bases de datos',
                    aprobadores: '',
                    items: [
                        createDemoItem({
                            itemNombre: 'Creación de base de datos',
                            sla: '3 días',
                            tipoInformacion: 'Confidencial',
                            buzon: 'buzon@prueba.com',
                            grupo: {
                                titulo: 'Testing',
                                contenido: 'TestingTestingTesting',
                            },
                            camposAdicionales: [],
                        }),
                    ],
                },
            ],
        },
    ];
}
