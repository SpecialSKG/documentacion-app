/**
 * Exportación a Excel usando el template oficial
 * VERSIÓN LIMPIA: merges + estilos controlados por código.
 *
 * Objetivos:
 * - Mantener el flujograma SIEMPRE debajo del detalle.
 * - Reconstruir la tabla de detalle de forma dinámica (categorías/subcategorías/ítems/campos).
 * - Controlar fuentes, bordes y separadores desde código (sin depender de bloques pre-dibujados).
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

// Estilos base
const DETAIL_FONT_NAME = 'Arial';
const DETAIL_FONT_SIZE = 11;
const HEADER_FONT_SIZE = 14;

const GRID_BORDER_COLOR = 'FFBFBFBF';     // bordes internos
const OUTER_BORDER_COLOR = 'FF000000';    // marco externo
const SEPARATOR_FILL = 'FFF2F2F2';        // relleno separadores

type BorderWeight = 'thin' | 'medium';

function makeBorder(style: BorderWeight, argb: string): ExcelJS.Border {
    return { style, color: { argb } };
}

/**
 * Exporta el documento a Excel
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

    // 2) Calcular cuánto va a ocupar el detalle y mover flujograma si hace falta
    const estimatedLastDetailRow = estimateLastDetailRow(document.detalle);
    let flowchartLabelRow = FLOWCHART_TEMPLATE_LABEL_ROW;

    if (estimatedLastDetailRow >= DETAIL_START_ROW) {
        flowchartLabelRow = shiftFlowchartBlockIfNeeded(worksheet, estimatedLastDetailRow);
        // Limpiar COMPLETAMENTE el área de detalle (valores + estilos + merges)
        resetArea(
            worksheet,
            DETAIL_START_ROW,
            flowchartLabelRow - 1,
            DETAIL_COLS.categoria,
            DETAIL_COLS.gruposUsuario
        );
    }

    // 3) Tabla de detalle
    const lastDetailRow = fillDetailTableHierarchical(worksheet, document);

    // 4) Aplicar estilo base solo a las filas realmente usadas
    if (lastDetailRow >= DETAIL_START_ROW) {
        applyBaseDetailStyling(
            worksheet,
            DETAIL_START_ROW,
            lastDetailRow,
            DETAIL_COLS.categoria,
            DETAIL_COLS.gruposUsuario
        );

        applyOuterBorder(
            worksheet,
            DETAIL_START_ROW,
            lastDetailRow,
            DETAIL_COLS.categoria,
            DETAIL_COLS.gruposUsuario
        );
    }

    // 5) Flujograma (si existe)
    if (document.flowchart) {
        await insertFlowchart(
            workbook,
            worksheet,
            document.flowchart,
            lastDetailRow,
            flowchartLabelRow
        );
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
}

/* ====================== DATOS GENERALES ====================== */

function fillGeneralData(worksheet: ExcelJS.Worksheet, document: DocumentDraft): void {
    const { general } = document;

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

/* ====================== CÁLCULOS DE ESPACIO ====================== */

/**
 * Estima la última fila que ocupará el detalle.
 * Reglas:
 * - Cada ítem ocupa N filas = max(2, camposAdicionales.length || 1)
 * - 1 fila separador entre subcategorías
 * - 2 filas separador entre categorías
 */
function estimateLastDetailRow(detalle: DocumentDraft['detalle']): number {
    if (!detalle || detalle.length === 0) {
        return DETAIL_START_ROW - 1;
    }

    let rows = 0;

    (detalle as any[]).forEach((categoria, catIndex) => {
        (categoria.subcategorias as any[]).forEach((subcat: any, subIndex: number) => {
            (subcat.items as any[]).forEach((item: any) => {
                const numCampos = (item.camposAdicionales?.length as number) || 0;
                const numFilasItem = Math.max(2, numCampos || 1);
                rows += numFilasItem;
            });

            if (subIndex < (categoria.subcategorias as any[]).length - 1) {
                rows += 1; // separador entre subcategorías
            }
        });

        if (catIndex < (detalle as any[]).length - 1) {
            rows += 2; // separador entre categorías
        }
    });

    return DETAIL_START_ROW + rows - 1;
}

/**
 * Fila donde debería quedar el texto "FLUJOGRAMA"
 */
function getFlowchartLabelRowFromDetail(lastDetailRow: number): number {
    const desired = lastDetailRow + FLOWCHART_MARGIN_ROWS;
    return Math.max(FLOWCHART_TEMPLATE_LABEL_ROW, desired);
}

/**
 * Inserta filas para empujar el bloque del flujograma.
 * Devuelve la nueva fila donde queda el label "FLUJOGRAMA".
 */
function shiftFlowchartBlockIfNeeded(
    worksheet: ExcelJS.Worksheet,
    estimatedLastDetailRow: number
): number {
    const desiredLabelRow = getFlowchartLabelRowFromDetail(estimatedLastDetailRow);

    if (desiredLabelRow <= FLOWCHART_TEMPLATE_LABEL_ROW) {
        return FLOWCHART_TEMPLATE_LABEL_ROW;
    }

    const delta = desiredLabelRow - FLOWCHART_TEMPLATE_LABEL_ROW;
    const emptyRows = Array.from({ length: delta }, () => []);
    worksheet.spliceRows(FLOWCHART_TEMPLATE_LABEL_ROW, 0, ...emptyRows);

    return desiredLabelRow;
}

/* ====================== LIMPIEZA Y ESTILOS BASE ====================== */

/**
 * Limpia valores, merges y estilos en un rango.
 */
function resetArea(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
    startColLetter: string,
    endColLetter: string
): void {
    if (endRow < startRow) return;

    const startCol = columnLetterToIndex(startColLetter);
    const endCol = columnLetterToIndex(endColLetter);

    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            const address = `${columnIndexToLetter(c)}${r}`;

            try {
                worksheet.unMergeCells(address);
            } catch {
                // ignorar: celda no mergeada
            }

            const cell = worksheet.getCell(r, c);
            cell.value = null;
            cell.style = {}; // quitar bordes/fill previos de la maqueta
        }
    }
}

/**
 * Aplica estilo base (Arial 11, bordes thin, wrap) al bloque de detalle.
 */
function applyBaseDetailStyling(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
    startColLetter: string,
    endColLetter: string
): void {
    if (endRow < startRow) return;

    const startCol = columnLetterToIndex(startColLetter);
    const endCol = columnLetterToIndex(endColLetter);

    for (let r = startRow; r <= endRow; r++) {
        const row = worksheet.getRow(r);
        if (!row.height) row.height = 22.5;

        for (let c = startCol; c <= endCol; c++) {
            const cell = worksheet.getCell(r, c);

            cell.font = {
                name: DETAIL_FONT_NAME,
                size: DETAIL_FONT_SIZE,
            };

            cell.alignment = {
                vertical: 'middle',
                horizontal: 'left',
                wrapText: true,
            };

            cell.border = {
                top: makeBorder('thin', GRID_BORDER_COLOR),
                left: makeBorder('thin', GRID_BORDER_COLOR),
                bottom: makeBorder('thin', GRID_BORDER_COLOR),
                right: makeBorder('thin', GRID_BORDER_COLOR),
            };
        }
    }
}

/**
 * Marco externo (bordes medium alrededor del bloque usado).
 */
function applyOuterBorder(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
    startColLetter: string,
    endColLetter: string
): void {
    const startCol = columnLetterToIndex(startColLetter);
    const endCol = columnLetterToIndex(endColLetter);

    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            const cell = worksheet.getCell(r, c);
            const border = cell.border || {};

            if (r === startRow) {
                border.top = makeBorder('medium', OUTER_BORDER_COLOR);
            }
            if (r === endRow) {
                border.bottom = makeBorder('medium', OUTER_BORDER_COLOR);
            }
            if (c === startCol) {
                border.left = makeBorder('medium', OUTER_BORDER_COLOR);
            }
            if (c === endCol) {
                border.right = makeBorder('medium', OUTER_BORDER_COLOR);
            }

            cell.border = border;
        }
    }
}

/**
 * Fila separadora (merge B:N, relleno suave).
 */
function renderSeparatorRow(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    startColLetter: string,
    endColLetter: string
): void {
    const startCol = columnLetterToIndex(startColLetter);
    const endCol = columnLetterToIndex(endColLetter);

    for (let c = startCol; c <= endCol; c++) {
        const cell = worksheet.getCell(rowNumber, c);
        cell.value = null;
        cell.style = {};
    }

    mergeCells(worksheet, `${startColLetter}${rowNumber}:${endColLetter}${rowNumber}`);

    const cell = worksheet.getCell(`${startColLetter}${rowNumber}`);
    cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: SEPARATOR_FILL },
    };
}

/* ====================== DETALLE JERÁRQUICO ====================== */

/**
 * Rellena tabla de detalle con estructura de:
 * Categoría -> Subcategoría -> Ítem (campos adicionales).
 */
function fillDetailTableHierarchical(
    worksheet: ExcelJS.Worksheet,
    document: DocumentDraft
): number {
    const categorias = (document.detalle || []) as any[];
    let currentRow = DETAIL_START_ROW;

    if (!categorias || categorias.length === 0) {
        return DETAIL_START_ROW - 1;
    }

    categorias.forEach((categoria, catIndex) => {
        const categoriaStartRow = currentRow;

        (categoria.subcategorias as any[]).forEach((subcat, subIndex) => {
            const subcatStartRow = currentRow;

            (subcat.items as any[]).forEach((item: any) => {
                const itemStartRow = currentRow;

                const campos: any[] = item.camposAdicionales || [];
                const numCampos = campos.length;
                const numFilasItem = Math.max(2, numCampos || 1);
                const itemEndRow = itemStartRow + numFilasItem - 1;

                // === ARTÍCULO (D) + SLA / TIPO INFO / BUZÓN / FORMULARIO ===
                mergeCells(worksheet, `${DETAIL_COLS.item}${itemStartRow}:${DETAIL_COLS.item}${itemEndRow}`);
                setCellValue(worksheet, `${DETAIL_COLS.item}${itemStartRow}`, item.itemNombre);

                mergeCells(worksheet, `${DETAIL_COLS.sla}${itemStartRow}:${DETAIL_COLS.sla}${itemEndRow}`);
                mergeCells(
                    worksheet,
                    `${DETAIL_COLS.tipoInformacion}${itemStartRow}:${DETAIL_COLS.tipoInformacion}${itemEndRow}`
                );
                mergeCells(worksheet, `${DETAIL_COLS.buzon}${itemStartRow}:${DETAIL_COLS.buzon}${itemEndRow}`);
                mergeCells(
                    worksheet,
                    `${DETAIL_COLS.formularioZoho}${itemStartRow}:${DETAIL_COLS.formularioZoho}${itemEndRow}`
                );

                setCellValue(worksheet, `${DETAIL_COLS.sla}${itemStartRow}`, item.sla);
                setCellValue(worksheet, `${DETAIL_COLS.tipoInformacion}${itemStartRow}`, item.tipoInformacion);
                setCellValue(worksheet, `${DETAIL_COLS.buzon}${itemStartRow}`, item.buzon);
                setCellValue(worksheet, `${DETAIL_COLS.formularioZoho}${itemStartRow}`, item.formularioZoho);

                // === APROBADORES (hereda de subcategoría si el ítem no tiene) ===
                const aprobadoresEfectivos =
                    (item.aprobadores && String(item.aprobadores).trim()) ||
                    (subcat.aprobadores as string) ||
                    '';
                mergeCells(
                    worksheet,
                    `${DETAIL_COLS.aprobadores}${itemStartRow}:${DETAIL_COLS.aprobadores}${itemEndRow}`
                );
                setCellValue(worksheet, `${DETAIL_COLS.aprobadores}${itemStartRow}`, aprobadoresEfectivos);

                // === GRUPO / GRUPOS ASISTENCIA / GRUPOS USUARIO (2 niveles) ===
                setCellValue(worksheet, `${DETAIL_COLS.grupo}${itemStartRow}`, item.grupo?.titulo || '');
                setCellValue(
                    worksheet,
                    `${DETAIL_COLS.gruposAsistencia}${itemStartRow}`,
                    item.gruposAsistencia?.titulo || ''
                );
                setCellValue(
                    worksheet,
                    `${DETAIL_COLS.gruposUsuario}${itemStartRow}`,
                    item.gruposUsuario?.titulo || ''
                );

                if (numFilasItem >= 2) {
                    const contentStartRow = itemStartRow + 1;

                    setCellValue(
                        worksheet,
                        `${DETAIL_COLS.grupo}${contentStartRow}`,
                        item.grupo?.contenido || ''
                    );
                    setCellValue(
                        worksheet,
                        `${DETAIL_COLS.gruposAsistencia}${contentStartRow}`,
                        item.gruposAsistencia?.contenido || ''
                    );
                    setCellValue(
                        worksheet,
                        `${DETAIL_COLS.gruposUsuario}${contentStartRow}`,
                        item.gruposUsuario?.contenido || ''
                    );

                    if (contentStartRow < itemEndRow) {
                        mergeCells(
                            worksheet,
                            `${DETAIL_COLS.grupo}${contentStartRow}:${DETAIL_COLS.grupo}${itemEndRow}`
                        );
                        mergeCells(
                            worksheet,
                            `${DETAIL_COLS.gruposAsistencia}${contentStartRow}:${DETAIL_COLS.gruposAsistencia}${itemEndRow}`
                        );
                        mergeCells(
                            worksheet,
                            `${DETAIL_COLS.gruposUsuario}${contentStartRow}:${DETAIL_COLS.gruposUsuario}${itemEndRow}`
                        );
                    }
                }

                // === CAMPOS ADICIONALES (E) + TIPO (F) ===
                for (let i = 0; i < numFilasItem; i++) {
                    const row = itemStartRow + i;
                    const campo = campos[i];

                    setCellValue(
                        worksheet,
                        `${DETAIL_COLS.camposAdicionales}${row}`,
                        campo ? campo.titulo : ''
                    );
                    setCellValue(
                        worksheet,
                        `${DETAIL_COLS.tipoCampos}${row}`,
                        campo ? campo.tipo : i === 0 ? 'Texto' : ''
                    );
                }

                currentRow += numFilasItem;
            });

            const subcatEndRow = currentRow - 1;

            // SUBCATEGORÍA (C): merge por bloque
            mergeCells(
                worksheet,
                `${DETAIL_COLS.subcategoria}${subcatStartRow}:${DETAIL_COLS.subcategoria}${subcatEndRow}`
            );
            styleSubcategoriaCell(worksheet, subcatStartRow);
            setCellValue(worksheet, `${DETAIL_COLS.subcategoria}${subcatStartRow}`, subcat.nombre);

            // Separador entre subcategorías
            if (subIndex < (categoria.subcategorias as any[]).length - 1) {
                renderSeparatorRow(
                    worksheet,
                    currentRow,
                    DETAIL_COLS.categoria,
                    DETAIL_COLS.gruposUsuario
                );
                currentRow += 1;
            }
        });

        const categoriaEndRow = currentRow - 1;

        // CATEGORÍA (B): merge por bloque completo
        mergeCells(
            worksheet,
            `${DETAIL_COLS.categoria}${categoriaStartRow}:${DETAIL_COLS.categoria}${categoriaEndRow}`
        );
        styleCategoriaCell(worksheet, categoriaStartRow);
        setCellValue(worksheet, `${DETAIL_COLS.categoria}${categoriaStartRow}`, categoria.nombre);

        // Separador entre categorías
        if (catIndex < categorias.length - 1) {
            renderSeparatorRow(worksheet, currentRow, DETAIL_COLS.categoria, DETAIL_COLS.gruposUsuario);
            currentRow += 1;
            renderSeparatorRow(worksheet, currentRow, DETAIL_COLS.categoria, DETAIL_COLS.gruposUsuario);
            currentRow += 1;
        }
    });

    return currentRow - 1;
}

/**
 * Estilo visual para la celda master de categoría (B)
 */
function styleCategoriaCell(worksheet: ExcelJS.Worksheet, rowNumber: number): void {
    const cell = worksheet.getCell(`${DETAIL_COLS.categoria}${rowNumber}`);
    cell.font = {
        name: DETAIL_FONT_NAME,
        size: HEADER_FONT_SIZE,
        bold: true,
    };
    cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
    };
}

/**
 * Estilo visual para la celda master de subcategoría (C)
 */
function styleSubcategoriaCell(worksheet: ExcelJS.Worksheet, rowNumber: number): void {
    const cell = worksheet.getCell(`${DETAIL_COLS.subcategoria}${rowNumber}`);
    cell.font = {
        name: DETAIL_FONT_NAME,
        size: HEADER_FONT_SIZE,
        bold: true,
    };
    cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
    };
}

/* ====================== FLUJOGRAMA ====================== */

async function insertFlowchart(
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    flowchart: NonNullable<DocumentDraft['flowchart']>,
    lastDetailRow: number,
    flowchartLabelRow: number
): Promise<void> {
    const base64Data = flowchart.base64.split(',')[1];
    if (!base64Data) return;

    const imageId = workbook.addImage({
        base64: base64Data,
        extension: 'png',
    });

    // Si por alguna razón no se movió el label, calculamos dónde debería ir
    const labelRow = flowchartLabelRow || getFlowchartLabelRowFromDetail(lastDetailRow);
    const startRow = labelRow + 1;

    worksheet.addImage(imageId, {
        tl: { col: FLOWCHART_COL_START - 0.1, row: startRow - 0.5 },
        ext: { width: 800, height: 450 },
        editAs: 'oneCell',
    });
}

/* ====================== HELPERS GENERALES ====================== */

function setCellValue(worksheet: ExcelJS.Worksheet, cellAddress: string, value: any): void {
    const cell = worksheet.getCell(cellAddress);
    cell.value = value === undefined || value === null ? '' : value;
}

function mergeCells(worksheet: ExcelJS.Worksheet, range: string): void {
    try {
        worksheet.mergeCells(range);
    } catch {
        // ignorar si ya estaba mergeado
    }
}

function columnLetterToIndex(letter: string): number {
    let col = 0;
    const up = letter.toUpperCase();
    for (let i = 0; i < up.length; i++) {
        col = col * 26 + (up.charCodeAt(i) - 64);
    }
    return col;
}

function columnIndexToLetter(index: number): string {
    let col = index;
    let letter = '';
    while (col > 0) {
        const mod = (col - 1) % 26;
        letter = String.fromCharCode(65 + mod) + letter;
        col = Math.floor((col - 1) / 26);
    }
    return letter;
}
