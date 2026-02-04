/**
 * Exportación a Excel usando el template oficial
 * VERSIÓN 2.2: Alineado al template real + protección contra merges pre-existentes + flujograma “siempre debajo”
 *
 * Reglas de merge (según template real):
 * - Categoría (B), Subcategoría (C), SLA (G), Tipo Info (I), Buzón (J), Formulario Zoho (L): merge vertical por ítem
 * - Aprobadores (K): merge vertical por subcategoría
 * - Grupo (H), Grupos Asistencia (M), Grupos Usuario (N): estructura 2 niveles (título en fila 1, contenido merge en filas 2+)
 * - Mínimo 2 filas por ítem (aún sin campos adicionales)
 * - Separadores: 1 fila vacía entre subcategorías, 2 filas vacías entre categorías
 * - Flujograma: se “empuja” insertando filas si el detalle crece
 */

import ExcelJS from 'exceljs';
import { DocumentDraft } from '@/lib/document';
import {
    SHEET_NAME,
    HEADER_CELLS,
    DETAIL_START_ROW,
    DETAIL_COLS,
    FLOWCHART_COL_START,
    FLOWCHART_MARGIN_ROWS,
    FLOWCHART_TEMPLATE_LABEL_ROW,
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

    // 1) Datos generales
    fillGeneralData(worksheet, document);

    // 2) Antes de escribir el detalle, calculamos cuánto va a crecer,
    //    para empujar el bloque de flujograma del template (B49:G...) si es necesario.
    const estimatedLastDetailRow = estimateLastDetailRow(document.detalle);

    // Si no hay detalle, dejamos el template tal cual.
    if (estimatedLastDetailRow >= DETAIL_START_ROW) {
        shiftFlowchartBlockIfNeeded(worksheet, estimatedLastDetailRow);

        // Limpiar/unmergear el área del detalle hasta antes del flujograma (evita “merge conflicts”)
        const flowchartLabelRow = getFlowchartLabelRow(estimatedLastDetailRow);
        resetArea(worksheet, DETAIL_START_ROW, flowchartLabelRow - 1, 'B', DETAIL_COLS.gruposUsuario);
    }

    // 3) Tabla de detalle (con jerarquía y merges)
    const lastDetailRow = fillDetailTableHierarchical(worksheet, document);

    // 4) Flujograma (si existe)
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
 * Rellena datos generales (título + campos)
 */
function fillGeneralData(worksheet: ExcelJS.Worksheet, document: DocumentDraft): void {
    const { general } = document;

    // Title: SIEMPRE en B1 (merge B1:G2).
    const titulo = (general.nombreServicio || DEFAULT_DOCUMENT_TITLE).toUpperCase();
    setCellValue(worksheet, HEADER_CELLS.title, titulo);

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
 * Estima (sin escribir nada) la última fila que va a ocupar el detalle.
 * Esto permite “empujar” el flujograma del template ANTES de escribir la tabla.
 */
function estimateLastDetailRow(categorias: DocumentDraft['detalle']): number {
    if (!categorias || categorias.length === 0) {
        return DETAIL_START_ROW - 1;
    }

    let rows = 0;

    categorias.forEach((categoria, catIndex) => {
        categoria.subcategorias.forEach((subcategoria, subcatIndex) => {
            subcategoria.items.forEach((item) => {
                const numCamposAdicionales = item.camposAdicionales.length;
                const numFilasItem = Math.max(2, numCamposAdicionales + 1);
                rows += numFilasItem;
            });

            // 1 fila vacía entre subcategorías
            if (subcatIndex < categoria.subcategorias.length - 1) {
                rows += 1;
            }
        });

        // 2 filas vacías entre categorías
        if (catIndex < categorias.length - 1) {
            rows += 2;
        }
    });

    return DETAIL_START_ROW + rows - 1;
}

/**
 * Devuelve la fila donde debe estar el título "FLUJOGRAMA" (del template o empujado).
 */
function getFlowchartLabelRow(lastDetailRow: number): number {
    const desired = lastDetailRow + FLOWCHART_MARGIN_ROWS;
    return Math.max(FLOWCHART_TEMPLATE_LABEL_ROW, desired);
}

/**
 * Inserta filas en FLOWCHART_TEMPLATE_LABEL_ROW para empujar el bloque de flujograma,
 * de modo que siempre quede debajo del detalle.
 */
function shiftFlowchartBlockIfNeeded(worksheet: ExcelJS.Worksheet, estimatedLastDetailRow: number): void {
    const desiredLabelRow = getFlowchartLabelRow(estimatedLastDetailRow);

    if (desiredLabelRow > FLOWCHART_TEMPLATE_LABEL_ROW) {
        const delta = desiredLabelRow - FLOWCHART_TEMPLATE_LABEL_ROW;
        const emptyRows = Array.from({ length: delta }, () => []);
        worksheet.spliceRows(FLOWCHART_TEMPLATE_LABEL_ROW, 0, ...emptyRows);
    }
}

/**
 * Limpia valores y elimina merges dentro de un rango (para evitar conflictos con merges pre-existentes del template).
 */
function resetArea(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
    startColLetter: string,
    endColLetter: string
): void {
    if (endRow < startRow) {
        return;
    }

    const startCol = columnLetterToIndex(startColLetter);
    const endCol = columnLetterToIndex(endColLetter);

    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            const address = `${columnIndexToLetter(c)}${r}`;

            // 1) Unmerge si esa celda pertenece a algún merge
            try {
                worksheet.unMergeCells(address);
            } catch {
                // ignore
            }

            // 2) Vaciar valor
            const cell = worksheet.getCell(address);
            cell.value = null;
        }
    }
}

/**
 * Rellena tabla de detalle con estructura jerárquica y merges verticales
 */
function fillDetailTableHierarchical(worksheet: ExcelJS.Worksheet, document: DocumentDraft): number {
    const categorias = document.detalle;
    let currentRow = DETAIL_START_ROW;

    if (!categorias || categorias.length === 0) {
        return currentRow;
    }

    categorias.forEach((categoria, catIndex) => {
        categoria.subcategorias.forEach((subcategoria, subcatIndex) => {
            const subcategoriaStartRow = currentRow;

            subcategoria.items.forEach((item) => {
                const itemStartRow = currentRow;

                // Calcular filas por ítem (mínimo 2)
                const numCamposAdicionales = item.camposAdicionales.length;
                const numFilasItem = Math.max(2, numCamposAdicionales + 1); // +1 fila principal

                // === FILA PRINCIPAL DEL ÍTEM ===
                // D: Artículo/Ítem
                setCellValue(worksheet, `${DETAIL_COLS.item}${currentRow}`, item.itemNombre);

                // === GRUPO (H): Estructura 2 niveles ===
                setCellValue(worksheet, `${DETAIL_COLS.grupo}${currentRow}`, item.grupo.titulo);

                // === GRUPOS ASISTENCIA (M): Estructura 2 niveles ===
                setCellValue(worksheet, `${DETAIL_COLS.gruposAsistencia}${currentRow}`, item.gruposAsistencia.titulo);

                // === GRUPOS USUARIO (N): Estructura 2 niveles ===
                setCellValue(worksheet, `${DETAIL_COLS.gruposUsuario}${currentRow}`, item.gruposUsuario.titulo);

                // === CAMPOS ADICIONALES (E) y TIPO DE CAMPO (F) ===
                // Fila 1: campo principal
                setCellValue(
                    worksheet,
                    `${DETAIL_COLS.camposAdicionales}${currentRow}`,
                    item.campoPrincipal.nombre
                );
                setCellValue(
                    worksheet,
                    `${DETAIL_COLS.tipoCampos}${currentRow}`,
                    item.campoPrincipal.tipoCampo
                );

                // Filas 2+: campos adicionales
                if (numCamposAdicionales > 0) {
                    item.camposAdicionales.forEach((campo, idx) => {
                        const row = currentRow + 1 + idx;
                        setCellValue(worksheet, `${DETAIL_COLS.camposAdicionales}${row}`, campo.nombre);
                        setCellValue(worksheet, `${DETAIL_COLS.tipoCampos}${row}`, campo.tipoCampo);
                    });
                }

                const itemEndRow = currentRow + numFilasItem - 1;

                // === MERGES POR ÍTEM ===
                mergeCells(worksheet, `${DETAIL_COLS.categoria}${itemStartRow}:${DETAIL_COLS.categoria}${itemEndRow}`);
                mergeCells(worksheet, `${DETAIL_COLS.subcategoria}${itemStartRow}:${DETAIL_COLS.subcategoria}${itemEndRow}`);
                mergeCells(worksheet, `${DETAIL_COLS.sla}${itemStartRow}:${DETAIL_COLS.sla}${itemEndRow}`);
                mergeCells(worksheet, `${DETAIL_COLS.tipoInformacion}${itemStartRow}:${DETAIL_COLS.tipoInformacion}${itemEndRow}`);
                mergeCells(worksheet, `${DETAIL_COLS.buzon}${itemStartRow}:${DETAIL_COLS.buzon}${itemEndRow}`);
                mergeCells(worksheet, `${DETAIL_COLS.formularioZoho}${itemStartRow}:${DETAIL_COLS.formularioZoho}${itemEndRow}`);

                // Escribir valores “solo una vez” (arriba del merge)
                setCellValue(worksheet, `${DETAIL_COLS.categoria}${itemStartRow}`, categoria.categoriaNombre);
                setCellValue(worksheet, `${DETAIL_COLS.subcategoria}${itemStartRow}`, subcategoria.subcategoriaNombre);
                setCellValue(worksheet, `${DETAIL_COLS.sla}${itemStartRow}`, item.sla);
                setCellValue(worksheet, `${DETAIL_COLS.tipoInformacion}${itemStartRow}`, item.tipoInformacion);
                setCellValue(worksheet, `${DETAIL_COLS.buzon}${itemStartRow}`, item.buzon);
                setCellValue(worksheet, `${DETAIL_COLS.formularioZoho}${itemStartRow}`, item.formularioZoho);

                // === GRUPO / ASISTENCIA / USUARIO: contenido merge en filas 2+ ===
                if (numFilasItem >= 2) {
                    // Grupo (H)
                    setCellValue(worksheet, `${DETAIL_COLS.grupo}${itemStartRow + 1}`, item.grupo.contenido);
                    mergeCells(worksheet, `${DETAIL_COLS.grupo}${itemStartRow + 1}:${DETAIL_COLS.grupo}${itemEndRow}`);

                    // Asistencias (M)
                    setCellValue(worksheet, `${DETAIL_COLS.gruposAsistencia}${itemStartRow + 1}`, item.gruposAsistencia.contenido);
                    mergeCells(worksheet, `${DETAIL_COLS.gruposAsistencia}${itemStartRow + 1}:${DETAIL_COLS.gruposAsistencia}${itemEndRow}`);

                    // Usuario (N)
                    setCellValue(worksheet, `${DETAIL_COLS.gruposUsuario}${itemStartRow + 1}`, item.gruposUsuario.contenido);
                    mergeCells(worksheet, `${DETAIL_COLS.gruposUsuario}${itemStartRow + 1}:${DETAIL_COLS.gruposUsuario}${itemEndRow}`);
                }

                // Avanzar cursor
                currentRow += numFilasItem;
            });

            // === APROBADORES (K): merge por SUBCATEGORÍA ===
            const subcategoriaEndRow = currentRow - 1;
            mergeCells(worksheet, `${DETAIL_COLS.aprobadores}${subcategoriaStartRow}:${DETAIL_COLS.aprobadores}${subcategoriaEndRow}`);
            setCellValue(worksheet, `${DETAIL_COLS.aprobadores}${subcategoriaStartRow}`, subcategoria.aprobadores);

            // 1 fila vacía entre subcategorías
            if (subcatIndex < categoria.subcategorias.length - 1) {
                currentRow += 1;
            }
        });

        // 2 filas vacías entre categorías
        if (catIndex < categorias.length - 1) {
            currentRow += 2;
        }
    });

    return currentRow - 1;
}

/**
 * Inserta flujograma debajo del detalle y dentro del bloque del template (B50:G...)
 */
async function insertFlowchart(
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    flowchart: string,
    lastDetailRow: number
): Promise<void> {
    // flowchart viene como dataURL base64 (data:image/png;base64,....)
    const base64Data = flowchart.split(',')[1];
    if (!base64Data) {
        return;
    }

    const imageId = workbook.addImage({
        base64: base64Data,
        extension: 'png',
    });

    const flowchartLabelRow = getFlowchartLabelRow(lastDetailRow);
    const flowchartStartRow = flowchartLabelRow + 1;

    worksheet.addImage(imageId, {
        tl: {
            col: FLOWCHART_COL_START - 0.1,
            row: flowchartStartRow - 0.5,
        },
        ext: {
            width: 800,
            height: 450,
        },
        editAs: 'oneCell',
    });
}

/**
 * Helpers
 */
function setCellValue(worksheet: ExcelJS.Worksheet, cellAddress: string, value: any): void {
    const cell = worksheet.getCell(cellAddress);

    if (value === undefined || value === null) {
        cell.value = '';
        return;
    }

    cell.value = value;
}

function mergeCells(worksheet: ExcelJS.Worksheet, range: string): void {
    try {
        worksheet.mergeCells(range);
    } catch (error) {
        // Si ya existe un merge o el rango es inválido, no rompemos el export
        console.warn(`No se pudo hacer merge en rango ${range}:`, error);
    }
}

function columnLetterToIndex(letter: string): number {
    // B -> 2
    let col = 0;
    const up = letter.toUpperCase();

    for (let i = 0; i < up.length; i++) {
        col = col * 26 + (up.charCodeAt(i) - 64);
    }

    return col;
}

function columnIndexToLetter(index: number): string {
    // 2 -> B
    let col = index;
    let letter = '';

    while (col > 0) {
        const mod = (col - 1) % 26;
        letter = String.fromCharCode(65 + mod) + letter;
        col = Math.floor((col - 1) / 26);
    }

    return letter;
}
