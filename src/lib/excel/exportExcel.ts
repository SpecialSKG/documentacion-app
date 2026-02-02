/**
 * Exportación a Excel usando el template oficial
 * VERSIÓN 2.0: Soporte para estructura jerárquica con merges verticales complejos
 * 
 * Reglas de merge:
 * - Categoría (D), Subcategoría (E), SLA (G), Tipo Info (I), Buzón (J), Formulario Zoho (L): merge vertical por ítem
 * - Aprobadores (K): merge vertical por subcategoría
 * - Grupo (H), Grupos Asistencia (M), Grupos Usuario (N): estructura 2 niveles (título en fila 1, contenido merge en filas 2+)
 * - Mínimo 2 filas por ítem (aún sin campos adicionales)
 * - Separadores: 1 fila vacía entre subcategorías, 2 filas vacías entre categorías
 * - Flujograma: siempre debajo de detalle, se mueve con el crecimiento
 */

import ExcelJS from 'exceljs';
import { DocumentDraft, Categoria, Subcategoria, Item } from '@/lib/document';
import {
    SHEET_NAME,
    HEADER_CELLS,
    DETAIL_START_ROW,
    DETAIL_COLS,
    FLOWCHART_COL_START,
    FLOWCHART_COL_END,
    FLOWCHART_MARGIN_ROWS,
    FLOWCHART_HEIGHT_ROWS,
    DEFAULT_DOCUMENT_TITLE,
} from './excelAnchors';

/**
 * Exporta el documento a Excel con estructura jerárquica
 */
export async function exportToExcel(
    document: DocumentDraft,
    templateArrayBuffer: ArrayBuffer
): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateArrayBuffer);

    const worksheet = workbook.getWorksheet(SHEET_NAME);
    if (!worksheet) {
        throw new Error(`No se encontró la hoja "${SHEET_NAME}" en el template`);
    }

    // 1. Rellenar datos generales
    fillGeneralData(worksheet, document);

    // 2. Rellenar tabla de detalle con jerarquía y merges
    const lastDetailRow = fillDetailTableHierarchical(worksheet, document);

    // 3. Insertar flujograma si existe (siempre debajo de detalle)
    if (document.flowchart) {
        await insertFlowchart(workbook, worksheet, document.flowchart, lastDetailRow);
    }

    // Generar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
}

/**
 * Rellena datos generales (sin cambios)
 */
function fillGeneralData(worksheet: ExcelJS.Worksheet, document: DocumentDraft): void {
    const { general } = document;

    setCellValue(worksheet, HEADER_CELLS.title, DEFAULT_DOCUMENT_TITLE);
    setCellValue(worksheet, HEADER_CELLS.nombreServicio, general.nombreServicio);
    setCellValue(worksheet, HEADER_CELLS.objetivoServicio, general.objetivoServicio);
    setCellValue(worksheet, HEADER_CELLS.plantilla, general.plantilla);
    setCellValue(worksheet, HEADER_CELLS.ambito, general.ambito);
    setCellValue(worksheet, HEADER_CELLS.sitio, general.sitio);
    setCellValue(worksheet, HEADER_CELLS.contacto, general.contacto);
    setCellValue(worksheet, HEADER_CELLS.usuariosBeneficiados, general.usuariosBeneficiados);
    setCellValue(worksheet, HEADER_CELLS.alcance, general.alcance);
    setCellValue(worksheet, HEADER_CELLS.tiempoRetencion, general.tiempoRetencion);
    setCellValue(worksheet, HEADER_CELLS.requiereReportes, general.requiereReportes);
    setCellValue(worksheet, HEADER_CELLS.observaciones, general.observaciones);
    setCellValue(worksheet, HEADER_CELLS.autorizadoPor, general.autorizadoPor);
    setCellValue(worksheet, HEADER_CELLS.revisado, general.revisado);
}

/**
 * NUEVO: Rellena tabla de detalle con estructura jerárquica y merges verticales
 */
function fillDetailTableHierarchical(worksheet: ExcelJS.Worksheet, document: DocumentDraft): number {
    const categorias = document.detalle;
    let currentRow = DETAIL_START_ROW;

    if (categorias.length === 0) {
        return currentRow;
    }

    categorias.forEach((categoria, catIndex) => {
        const categoriaStartRow = currentRow;

        categoria.subcategorias.forEach((subcategoria, subcatIndex) => {
            const subcategoriaStartRow = currentRow;

            subcategoria.items.forEach((item, itemIndex) => {
                const itemStartRow = currentRow;

                // Calcular filas por ítem (mínimo 2)
                const numCamposAdicionales = item.camposAdicionales.length;
                const numFilasItem = Math.max(2, numCamposAdicionales + 1); // +1 para fila principal

                // === FILA PRINCIPAL DEL ÍTEM ===
                // Columna F: Artículo/Ítem
                setCellValue(worksheet, `${DETAIL_COLS.item}${currentRow}`, item.itemNombre);

                // Columnas que se mergean verticalmente por ÍTEM:
                // D (Categoría), E (Subcategoría), G (SLA), I (Tipo Info), J (Buzón), L (Formulario Zoho)
                // Solo se escriben en la primera fila del ítem, luego se mergean

                // === GRUPO (H): Estructura 2 niveles ===
                // Fila 1: título
                setCellValue(worksheet, `${DETAIL_COLS.grupo}${currentRow}`, item.grupo.titulo);
                // Filas 2+: contenido (se escribirá y mergeará abajo)

                // === GRUPOS ASISTENCIA (M): Estructura 2 niveles ===
                setCellValue(worksheet, `${DETAIL_COLS.gruposAsistencia}${currentRow}`, item.gruposAsistencia.titulo);

                // === GRUPOS USUARIO (N): Estructura 2 niveles ===
                setCellValue(worksheet, `${DETAIL_COLS.gruposUsuario}${currentRow}`, item.gruposUsuario.titulo);

                // === CAMPOS ADICIONALES ===
                // Fila 1 del ítem puede tener el primer campo adicional si existe
                if (item.camposAdicionales.length > 0) {
                    const campo = item.camposAdicionales[0];
                    setCellValue(worksheet, `${DETAIL_COLS.camposAdicionales}${currentRow}`, campo.titulo);
                    setCellValue(worksheet, `${DETAIL_COLS.tipoCampos}${currentRow}`, campo.tipo);
                }

                currentRow++;

                // === FILAS ADICIONALES DEL ÍTEM (campos adicionales + contenido de grupos) ===
                for (let i = 1; i < numFilasItem; i++) {
                    // Contenido de Grupo (H) - filas 2+
                    if (i === 1 && item.grupo.contenido) {
                        setCellValue(worksheet, `${DETAIL_COLS.grupo}${currentRow}`, item.grupo.contenido);
                    }

                    // Contenido de Grupos Asistencia (M) - filas 2+
                    if (i === 1 && item.gruposAsistencia.contenido) {
                        setCellValue(worksheet, `${DETAIL_COLS.gruposAsistencia}${currentRow}`, item.gruposAsistencia.contenido);
                    }

                    // Contenido de Grupos Usuario (N) - filas 2+
                    if (i === 1 && item.gruposUsuario.contenido) {
                        setCellValue(worksheet, `${DETAIL_COLS.gruposUsuario}${currentRow}`, item.gruposUsuario.contenido);
                    }

                    // Campos adicionales (si hay más)
                    if (i < item.camposAdicionales.length) {
                        const campo = item.camposAdicionales[i];
                        setCellValue(worksheet, `${DETAIL_COLS.camposAdicionales}${currentRow}`, campo.titulo);
                        setCellValue(worksheet, `${DETAIL_COLS.tipoCampos}${currentRow}`, campo.tipo);
                    }

                    currentRow++;
                }

                const itemEndRow = currentRow - 1;

                // ========== MERGES VERTICALES POR ÍTEM ==========
                // Categoría (D)
                mergeCells(worksheet, `${DETAIL_COLS.categoria}${itemStartRow}:${DETAIL_COLS.categoria}${itemEndRow}`);
                setCellValue(worksheet, `${DETAIL_COLS.categoria}${itemStartRow}`, categoria.nombre);

                // Subcategoría (E)
                mergeCells(worksheet, `${DETAIL_COLS.subcategoria}${itemStartRow}:${DETAIL_COLS.subcategoria}${itemEndRow}`);
                setCellValue(worksheet, `${DETAIL_COLS.subcategoria}${itemStartRow}`, subcategoria.nombre);

                // SLA (G)
                mergeCells(worksheet, `${DETAIL_COLS.sla}${itemStartRow}:${DETAIL_COLS.sla}${itemEndRow}`);
                setCellValue(worksheet, `${DETAIL_COLS.sla}${itemStartRow}`, item.sla);

                // Tipo de Información (I)
                mergeCells(worksheet, `${DETAIL_COLS.tipoInformacion}${itemStartRow}:${DETAIL_COLS.tipoInformacion}${itemEndRow}`);
                setCellValue(worksheet, `${DETAIL_COLS.tipoInformacion}${itemStartRow}`, item.tipoInformacion);

                // Buzón (J)
                mergeCells(worksheet, `${DETAIL_COLS.buzon}${itemStartRow}:${DETAIL_COLS.buzon}${itemEndRow}`);
                setCellValue(worksheet, `${DETAIL_COLS.buzon}${itemStartRow}`, item.buzon);

                // Formulario Zoho (L)
                mergeCells(worksheet, `${DETAIL_COLS.formularioZoho}${itemStartRow}:${DETAIL_COLS.formularioZoho}${itemEndRow}`);
                setCellValue(worksheet, `${DETAIL_COLS.formularioZoho}${itemStartRow}`, item.formularioZoho);

                // Grupo (H) - merge filas 2+ si hay contenido
                if (numFilasItem > 1 && item.grupo.contenido) {
                    mergeCells(worksheet, `${DETAIL_COLS.grupo}${itemStartRow + 1}:${DETAIL_COLS.grupo}${itemEndRow}`);
                }

                // Grupos Asistencia (M) - merge filas 2+
                if (numFilasItem > 1 && item.gruposAsistencia.contenido) {
                    mergeCells(worksheet, `${DETAIL_COLS.gruposAsistencia}${itemStartRow + 1}:${DETAIL_COLS.gruposAsistencia}${itemEndRow}`);
                }

                // Grupos Usuario (N) - merge filas 2+
                if (numFilasItem > 1 && item.gruposUsuario.contenido) {
                    mergeCells(worksheet, `${DETAIL_COLS.gruposUsuario}${itemStartRow + 1}:${DETAIL_COLS.gruposUsuario}${itemEndRow}`);
                }
            });

            const subcategoriaEndRow = currentRow - 1;

            // ========== MERGE APROBADORES (K) POR SUBCATEGORÍA ==========
            if (subcategoriaEndRow >= subcategoriaStartRow) {
                mergeCells(worksheet, `${DETAIL_COLS.aprobadores}${subcategoriaStartRow}:${DETAIL_COLS.aprobadores}${subcategoriaEndRow}`);
                setCellValue(worksheet, `${DETAIL_COLS.aprobadores}${subcategoriaStartRow}`, subcategoria.aprobadores);
            }

            // === SEPARADOR: 1 fila vacía entre subcategorías (excepto última) ===
            if (subcatIndex < categoria.subcategorias.length - 1) {
                currentRow++;
            }
        });

        // === SEPARADOR: 2 filas vacías entre categorías (excepto última) ===
        if (catIndex < categorias.length - 1) {
            currentRow += 2;
        }
    });

    return currentRow - 1; // Última fila escrita
}

/**
 * Inserta flujograma debajo de la tabla de detalle
 */
async function insertFlowchart(
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    flowchart: NonNullable<DocumentDraft['flowchart']>,
    lastDetailRow: number
): Promise<void> {
    // Posición del flujograma: debajo del detalle con margen
    const flowchartStartRow = lastDetailRow + FLOWCHART_MARGIN_ROWS;

    // Decodificar la imagen
    const base64Data = flowchart.base64.includes(',')
        ? flowchart.base64.split(',')[1]
        : flowchart.base64;

    // Determinar la extensión según el MIME type
    const extension = flowchart.mimeType.includes('png') ? 'png' : 'jpeg';

    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imageId = workbook.addImage({
        buffer: imageBuffer as any,
        extension,
    });

    // Insertar imagen
    worksheet.addImage(imageId, {
        tl: { col: FLOWCHART_COL_START - 0.1, row: flowchartStartRow - 0.5 },
        ext: { width: 500, height: 300 }, // Tamaño fijo, ajustable
    });
}

/**
 * Helper: Set cell value
 */
function setCellValue(worksheet: ExcelJS.Worksheet, cellAddress: string, value: any): void {
    const cell = worksheet.getCell(cellAddress);
    cell.value = value ?? '';
}

/**
 * Helper: Merge cells
 */
function mergeCells(worksheet: ExcelJS.Worksheet, range: string): void {
    try {
        worksheet.mergeCells(range);
    } catch (err) {
        // Ignorar errores de merge (puede ya estar mergeado)
        console.warn(`Error merging cells ${range}:`, err);
    }
}
