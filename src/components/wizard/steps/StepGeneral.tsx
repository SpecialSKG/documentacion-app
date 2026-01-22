'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useDocumentStore } from '@/stores/docStore';
import { GeneralDataSchema, GeneralData } from '@/lib/document';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AMBITO_OPTIONS, SITIO_OPTIONS, REQUIERE_REPORTES_OPTIONS } from '@/data/options';

export default function StepGeneral() {
    const { document, updateGeneral } = useDocumentStore();

    const form = useForm({
        resolver: zodResolver(GeneralDataSchema),
        defaultValues: document.general,
    });

    // Sincronizar con el store cuando cambian los valores
    useEffect(() => {
        const subscription = form.watch((values) => {
            updateGeneral(values as GeneralData);
        });
        return () => subscription.unsubscribe();
    }, [form, updateGeneral]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Datos Generales del Servicio</CardTitle>
                    <CardDescription>
                        Ingresa la información básica del servicio que documentarás
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form className="space-y-6">
                            {/* Nombre del Servicio */}
                            <FormField
                                control={form.control}
                                name="nombreServicio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del Servicio *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: Alta de usuario en Active Directory"
                                                {...field}
                                                aria-label="Nombre del servicio"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Objetivo del Servicio */}
                            <FormField
                                control={form.control}
                                name="objetivoServicio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Objetivo del Servicio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe el objetivo principal de este servicio"
                                                rows={3}
                                                {...field}
                                                aria-label="Objetivo del servicio"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Grid de 2 columnas para campos más pequeños */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Plantilla */}
                                <FormField
                                    control={form.control}
                                    name="plantilla"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Plantilla</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nombre de la plantilla" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Ámbito */}
                                <FormField
                                    control={form.control}
                                    name="ambito"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ámbito</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger aria-label="Seleccionar ámbito">
                                                        <SelectValue placeholder="Selecciona un ámbito" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {AMBITO_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Sitio */}
                                <FormField
                                    control={form.control}
                                    name="sitio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sitio</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger aria-label="Seleccionar sitio">
                                                        <SelectValue placeholder="Selecciona un sitio" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {SITIO_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Requiere Reportes */}
                                <FormField
                                    control={form.control}
                                    name="requiereReportes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>¿Requiere Reportes?</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger aria-label="Requiere reportes">
                                                        <SelectValue placeholder="Selecciona una opción" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {REQUIERE_REPORTES_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Contacto */}
                            <FormField
                                control={form.control}
                                name="contacto"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contacto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre del contacto responsable" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Usuarios Beneficiados */}
                            <FormField
                                control={form.control}
                                name="usuariosBeneficiados"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Usuarios Beneficiados</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe qué usuarios se benefician de este servicio"
                                                rows={2}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Alcance del Servicio */}
                            <FormField
                                control={form.control}
                                name="alcance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alcance del Servicio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Define el alcance y límites del servicio"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tiempo de Retención */}
                            <FormField
                                control={form.control}
                                name="tiempoRetencion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tiempo de Retención</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: 5 años" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Observaciones */}
                            <FormField
                                control={form.control}
                                name="observaciones"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observaciones</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Observaciones adicionales"
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Grid para Autorizado y Revisado */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="autorizadoPor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Autorizado Por</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nombre de quien autoriza" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="revisado"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Revisado Por</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nombre de quien revisa" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Los datos se guardan automáticamente. Puedes continuar al
                    siguiente paso cuando estés listo.
                </p>
            </div>
        </div>
    );
}
