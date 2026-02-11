/**
 * Exportación a Excel usando el template oficial
 * VERSIÓN 2.4: merges + estilos dinámicos (sin depender de “bloques pre-dibujados”)
 */

import ExcelJS from 'exceljs';
import { DocumentDraft } from '@/lib/document';
import {
    SHEET_NAME,
    HEADER_CELLS,
    DETAIL_START_ROW as DETAIL_START_ROW_ANCHOR,
    DETAIL_COLS as DETAIL_COLS_ANCHOR,
    FLOWCHART_COL_START as FLOWCHART_COL_START_ANCHOR,
    FLOWCHART_MARGIN_ROWS,
    FLOWCHART_TEMPLATE_LABEL_ROW as FLOWCHART_TEMPLATE_LABEL_ROW_ANCHOR,
    DEFAULT_DOCUMENT_TITLE,
} from './excelAnchors';

const DETAIL_FONT = { name: 'Arial', size: 11 };
const HEADER_FONT = { name: 'Arial', size: 14, bold: true };

/** Columnas esperadas del template. */
type DetailCols = {
    categoria: string;
    subcategoria: string;
    item: string;
    camposAdicionales: string;
    tipoCampos: string;
    sla: string;
    grupo: string;
    tipoInformacion: string;
    buzon: string;
    aprobadores: string;
    formularioZoho: string;
    gruposAsistencia: string;
    gruposUsuario: string;
};

const FALLBACK_DETAIL_COLS: DetailCols = {
    categoria: 'B',
    subcategoria: 'C',
    item: 'D',
    camposAdicionales: 'E',
    tipoCampos: 'F',
    sla: 'G',
    grupo: 'H',
    tipoInformacion: 'I',
    buzon: 'J',
    aprobadores: 'K',
    formularioZoho: 'L',
    gruposAsistencia: 'M',
    gruposUsuario: 'N',
};

type TemplateStyles = {
    baseCell: Partial<ExcelJS.Style>;
    categoriaCell: Partial<ExcelJS.Style>;
    subcategoriaCell: Partial<ExcelJS.Style>;
    separatorRowCell: Partial<ExcelJS.Style>;
    outerBorderColorARGB: string; // normalmente negro FF000000
};

function deepClone<T>(obj: T): T {
    return obj ? (JSON.parse(JSON.stringify(obj)) as T) : obj;
}

function getCellText(v: ExcelJS.CellValue): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v === 'object' && 'richText' in v) {
        // @ts-ignore
        return (v.richText || []).map((x: any) => x.text).join('');
    }
    return String(v);
}

/**
 * Resuelve anclas (rows/cols) intentando validar contra el template real.
 * Si excelAnchors.ts no coincide, hace fallback a búsqueda.
 */
function resolveAnchors(worksheet: ExcelJS.Worksheet): {
    detailStartRow: number;
    flowchartTemplateLabelRow: number;
    flowchartColStart: number;
    cols: DetailCols;
} {
    const colsFromAnchor = (DETAIL_COLS_ANCHOR || {}) as Partial<DetailCols>;

    // objeto MUTABLE; no hay readonly aquí
    const cols: DetailCols = {
        ...FALLBACK_DETAIL_COLS,
        ...colsFromAnchor,
    };

    // 1) intentamos usar DETAIL_START_ROW del anchor
    let detailStartRow = DETAIL_START_ROW_ANCHOR || 20;
    let flowchartTemplateLabelRow = FLOWCHART_TEMPLATE_LABEL_ROW_ANCHOR || 49;
    let flowchartColStart = FLOWCHART_COL_START_ANCHOR || 2; // B

    // Validación rápida: en (detailStartRow - 2) debería estar el header "CATEGORÍA"
    const headerRowGuess = detailStartRow - 2;
    const headerGuessValue = getCellText(
        worksheet.getCell(`${cols.categoria}${headerRowGuess}`).value
    ).toUpperCase();

    const looksOk = headerGuessValue.includes('CATEG');

    if (looksOk) {
        return { detailStartRow, flowchartTemplateLabelRow, flowchartColStart, cols };
    }

    // 2) fallback: buscamos la celda que tenga "CATEGORÍA"
    for (let r = 1; r <= 200; r++) {
        for (let c = 1; c <= 30; c++) {
            const cell = worksheet.getCell(r, c);
            const text = getCellText(cell.value).toUpperCase().trim();

            if (text === 'CATEGORÍA' || text === 'CATEGORIA') {
                const colLetter = columnIndexToLetter(c);

                cols.categoria = colLetter;
                cols.subcategoria = columnIndexToLetter(c + 1);
                cols.item = columnIndexToLetter(c + 2);
                cols.camposAdicionales = columnIndexToLetter(c + 3);
                cols.tipoCampos = columnIndexToLetter(c + 4);
                cols.sla = columnIndexToLetter(c + 5);
                cols.grupo = columnIndexToLetter(c + 6);
                cols.tipoInformacion = columnIndexToLetter(c + 7);
                cols.buzon = columnIndexToLetter(c + 8);
                cols.aprobadores = columnIndexToLetter(c + 9);
                cols.formularioZoho = columnIndexToLetter(c + 10);
                cols.gruposAsistencia = columnIndexToLetter(c + 11);
                cols.gruposUsuario = columnIndexToLetter(c + 12);

                detailStartRow = r + 2; // hay una fila “de separación” (ej: r=18 -> start=20)
            }

            const text2 = getCellText(cell.value).toUpperCase().trim();
            if (text2 === 'FLUJOGRAMA') {
                flowchartTemplateLabelRow = r;
                flowchartColStart = c;
            }
        }
    }

    return { detailStartRow, flowchartTemplateLabelRow, flowchartColStart, cols };
}

/**
 * Captura estilos “de referencia” del template antes de limpiar/unmergear.
 */
function captureTemplateStyles(
    worksheet: ExcelJS.Worksheet,
    detailStartRow: number,
    cols: DetailCols,
): TemplateStyles {
    const rowRef = detailStartRow;
    const separatorRowRef = detailStartRow - 1;

    const baseCell = worksheet.getCell(`${cols.item}${rowRef}`).style || {};
    const categoriaCell = worksheet.getCell(`${cols.categoria}${rowRef}`).style || {};
    const subcategoriaCell = worksheet.getCell(`${cols.subcategoria}${rowRef}`).style || {};
    const separatorRowCell = worksheet.getCell(`${cols.categoria}${separatorRowRef}`).style || {};

    const outerBorderColorARGB =
        // @ts-ignore
        (worksheet.getCell(`${cols.categoria}${rowRef}`).style?.border?.left?.color?.argb as string) ||
        'FF000000';

    return {
        baseCell: deepClone(baseCell),
        categoriaCell: deepClone(categoriaCell),
        subcategoriaCell: deepClone(subcategoriaCell),
        separatorRowCell: deepClone(separatorRowCell),
        outerBorderColorARGB,
    };
}

/**
 * Exporta el documento a Excel con estructura jerárquica.
 */
export async function exportToExcel(
    document: DocumentDraft,
    templateArrayBuffer: ArrayBuffer,
): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateArrayBuffer);

    const worksheet = workbook.getWorksheet(SHEET_NAME);
    if (!worksheet) {
        throw new Error(`No se encontró la hoja "${SHEET_NAME}" en el template`);
    }

    const { detailStartRow, flowchartTemplateLabelRow, flowchartColStart, cols } =
        resolveAnchors(worksheet);
    const templateStyles = captureTemplateStyles(worksheet, detailStartRow, cols);

    // 1) Datos generales
    fillGeneralData(worksheet, document);

    // 2) Calculamos cuánto crecerá el detalle para empujar el flujograma
    const estimatedLastDetailRow = estimateLastDetailRow(document.detalle, detailStartRow);

    if (estimatedLastDetailRow >= detailStartRow) {
        shiftFlowchartBlockIfNeeded(
            worksheet,
            estimatedLastDetailRow,
            flowchartTemplateLabelRow,
            cols,
            templateStyles,
        );

        const flowchartLabelRow = getFlowchartLabelRow(
            estimatedLastDetailRow,
            flowchartTemplateLabelRow,
        );

        // Limpiar valores / merges en TODO el área hasta antes del flujograma
        resetArea(worksheet, detailStartRow, flowchartLabelRow - 1, cols.categoria, cols.gruposUsuario);

        // Aplicar estilo base al área (incluye filas insertadas)
        applyBaseDetailStyling(
            worksheet,
            detailStartRow,
            flowchartLabelRow - 1,
            cols.categoria,
            cols.gruposUsuario,
            templateStyles,
        );
    }

    // 3) Tabla de detalle (con jerarquía + merges + separadores)
    const lastDetailRow = fillDetailTableHierarchical(
        worksheet,
        document,
        detailStartRow,
        cols,
        templateStyles,
    );

    // Marco externo (medium) solo al rango usado
    if (lastDetailRow >= detailStartRow) {
        applyOuterBorder(
            worksheet,
            detailStartRow,
            lastDetailRow,
            cols.categoria,
            cols.gruposUsuario,
            templateStyles,
        );
    }

    // 4) Flujograma (si existe)
    if (document.flowchart) {
        await insertFlowchart(
            workbook,
            worksheet,
            document.flowchart,
            lastDetailRow,
            flowchartTemplateLabelRow,
            flowchartColStart,
        );
    }

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
 * Estima última fila del detalle según estructura.
 */
function estimateLastDetailRow(
    categorias: DocumentDraft['detalle'],
    detailStartRow: number,
): number {
    if (!categorias || categorias.length === 0) return detailStartRow - 1;

    let rows = 0;

    categorias.forEach((categoria, catIndex) => {
        categoria.subcategorias.forEach((subcategoria, subcatIndex) => {
            subcategoria.items.forEach((item) => {
                const numCampos = item.camposAdicionales?.length || 0;
                const numFilasItem = Math.max(2, numCampos);
                rows += numFilasItem;
            });

            if (subcatIndex < categoria.subcategorias.length - 1) rows += 1;
        });

        if (catIndex < categorias.length - 1) rows += 2;
    });

    return detailStartRow + rows - 1;
}

function getFlowchartLabelRow(
    lastDetailRow: number,
    flowchartTemplateLabelRow: number,
): number {
    const desired = lastDetailRow + FLOWCHART_MARGIN_ROWS;
    return Math.max(flowchartTemplateLabelRow, desired);
}

/**
 * Empuja el bloque del flujograma insertando filas.
 */
function shiftFlowchartBlockIfNeeded(
    worksheet: ExcelJS.Worksheet,
    estimatedLastDetailRow: number,
    flowchartTemplateLabelRow: number,
    cols: DetailCols,
    templateStyles: TemplateStyles
): void {
    const desiredLabelRow = getFlowchartLabelRow(estimatedLastDetailRow, flowchartTemplateLabelRow);

    if (desiredLabelRow > flowchartTemplateLabelRow) {
        const delta = desiredLabelRow - flowchartTemplateLabelRow;
        const emptyRows = Array.from({ length: delta }, () => []);
        worksheet.spliceRows(flowchartTemplateLabelRow, 0, ...emptyRows);

        // IMPORTANTE: aquí ya NO llamamos a renderSeparatorRow.
        // Las filas insertadas las va a “limpiar” resetArea y quedarán con estilo base.
    }
}

/**
 * Limpia valores y elimina merges dentro de un rango.
 */
function resetArea(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
    startColLetter: string,
    endColLetter: string,
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
                // ignore
            }

            const cell = worksheet.getCell(address);
            cell.value = null;
        }
    }
}

/**
 * Aplica estilo base a todo el bloque de detalle (wrap, bordes, etc).
 */
function applyBaseDetailStyling(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
    startColLetter: string,
    endColLetter: string,
    templateStyles: TemplateStyles,
): void {
    if (endRow < startRow) return;

    const startCol = columnLetterToIndex(startColLetter);
    const endCol = columnLetterToIndex(endColLetter);

    for (let r = startRow; r <= endRow; r++) {
        const row = worksheet.getRow(r);
        if (!row.height) row.height = 22.5;

        for (let c = startCol; c <= endCol; c++) {
            const cell = worksheet.getCell(r, c);
            cell.style = deepClone(templateStyles.baseCell);
            cell.font = {
                ...(cell.font || {}),
                ...DETAIL_FONT,
            };
            cell.alignment = {
                ...(cell.alignment || {}),
                wrapText: true,
                vertical: 'middle',
            };
        }
    }
}

/**
 * Marco externo (medium) alrededor del bloque usado.
 */
function applyOuterBorder(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
    startColLetter: string,
    endColLetter: string,
    templateStyles: TemplateStyles,
): void {
    const startCol = columnLetterToIndex(startColLetter);
    const endCol = columnLetterToIndex(endColLetter);

    const color = templateStyles.outerBorderColorARGB || 'FF000000';

    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            const cell = worksheet.getCell(r, c);
            const border = deepClone(cell.border || {});
            if (r === startRow) border.top = borderSide('medium', color);
            if (r === endRow) border.bottom = borderSide('medium', color);
            if (c === startCol) border.left = borderSide('medium', color);
            if (c === endCol) border.right = borderSide('medium', color);
            cell.border = border;
        }
    }
}

/**
 * Separador estilizado (merge B:N o el rango que toque).
 */
function renderSeparatorRow(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    startColLetter: string,
    endColLetter: string,
    templateStyles: TemplateStyles,
): void {
    const startCol = columnLetterToIndex(startColLetter);
    const endCol = columnLetterToIndex(endColLetter);

    for (let c = startCol; c <= endCol; c++) {
        worksheet.getCell(rowNumber, c).value = null;
    }

    mergeCells(worksheet, `${startColLetter}${rowNumber}:${endColLetter}${rowNumber}`);

    for (let c = startCol; c <= endCol; c++) {
        const cell = worksheet.getCell(rowNumber, c);
        cell.style = deepClone(templateStyles.separatorRowCell || templateStyles.baseCell);
    }
}

type BorderWeight = 'thin' | 'medium';
function borderSide(style: BorderWeight, argb: string): any {
    return { style, color: { argb } };
}

/**
 * Rellena tabla de detalle con estructura jerárquica y merges.
 */
function fillDetailTableHierarchical(
    worksheet: ExcelJS.Worksheet,
    document: DocumentDraft,
    detailStartRow: number,
    cols: DetailCols,
    templateStyles: TemplateStyles,
): number {
    const categorias = document.detalle;
    let currentRow = detailStartRow;

    if (!categorias || categorias.length === 0) {
        return currentRow - 1;
    }

    categorias.forEach((categoria, catIndex) => {
        const categoriaStartRow = currentRow;

        categoria.subcategorias.forEach((subcategoria, subcatIndex) => {
            const subcategoriaStartRow = currentRow;

            subcategoria.items.forEach((item, itemIndex) => {
                const itemStartRow = currentRow;

                const numCampos = item.camposAdicionales?.length || 0;
                const numFilasItem = Math.max(2, numCampos);
                const itemEndRow = itemStartRow + numFilasItem - 1;

                applyBaseDetailStyling(
                    worksheet,
                    itemStartRow,
                    itemEndRow,
                    cols.categoria,
                    cols.gruposUsuario,
                    templateStyles,
                );

                // Ítem + SLA + Tipo info + Buzón + Formulario
                mergeCells(worksheet, `${cols.item}${itemStartRow}:${cols.item}${itemEndRow}`);
                setCellValue(worksheet, `${cols.item}${itemStartRow}`, item.itemNombre);

                mergeCells(worksheet, `${cols.sla}${itemStartRow}:${cols.sla}${itemEndRow}`);
                mergeCells(
                    worksheet,
                    `${cols.tipoInformacion}${itemStartRow}:${cols.tipoInformacion}${itemEndRow}`,
                );
                mergeCells(worksheet, `${cols.buzon}${itemStartRow}:${cols.buzon}${itemEndRow}`);
                mergeCells(
                    worksheet,
                    `${cols.formularioZoho}${itemStartRow}:${cols.formularioZoho}${itemEndRow}`,
                );

                setCellValue(worksheet, `${cols.sla}${itemStartRow}`, item.sla);
                setCellValue(worksheet, `${cols.tipoInformacion}${itemStartRow}`, item.tipoInformacion);
                setCellValue(worksheet, `${cols.buzon}${itemStartRow}`, item.buzon);
                setCellValue(worksheet, `${cols.formularioZoho}${itemStartRow}`, item.formularioZoho);

                // Aprobadores: ítem o herencia de subcat
                const aprobadoresEfectivos = item.aprobadores || subcategoria.aprobadores || '';
                mergeCells(
                    worksheet,
                    `${cols.aprobadores}${itemStartRow}:${cols.aprobadores}${itemEndRow}`,
                );
                setCellValue(worksheet, `${cols.aprobadores}${itemStartRow}`, aprobadoresEfectivos);

                // Grupo / asistencia / usuario
                setCellValue(worksheet, `${cols.grupo}${itemStartRow}`, item.grupo?.titulo);
                setCellValue(
                    worksheet,
                    `${cols.gruposAsistencia}${itemStartRow}`,
                    item.gruposAsistencia?.titulo,
                );
                setCellValue(
                    worksheet,
                    `${cols.gruposUsuario}${itemStartRow}`,
                    item.gruposUsuario?.titulo,
                );

                if (numFilasItem >= 2) {
                    const contentRow = itemStartRow + 1;

                    setCellValue(worksheet, `${cols.grupo}${contentRow}`, item.grupo?.contenido);
                    setCellValue(
                        worksheet,
                        `${cols.gruposAsistencia}${contentRow}`,
                        item.gruposAsistencia?.contenido,
                    );
                    setCellValue(
                        worksheet,
                        `${cols.gruposUsuario}${contentRow}`,
                        item.gruposUsuario?.contenido,
                    );

                    mergeIfMultipleRows(
                        worksheet,
                        `${cols.grupo}${contentRow}:${cols.grupo}${itemEndRow}`,
                    );
                    mergeIfMultipleRows(
                        worksheet,
                        `${cols.gruposAsistencia}${contentRow}:${cols.gruposAsistencia}${itemEndRow}`,
                    );
                    mergeIfMultipleRows(
                        worksheet,
                        `${cols.gruposUsuario}${contentRow}:${cols.gruposUsuario}${itemEndRow}`,
                    );
                }

                // Campos adicionales
                for (let i = 0; i < numFilasItem; i++) {
                    const row = itemStartRow + i;
                    const campo = item.camposAdicionales?.[i];

                    setCellValue(worksheet, `${cols.camposAdicionales}${row}`, campo?.titulo || '');
                    setCellValue(
                        worksheet,
                        `${cols.tipoCampos}${row}`,
                        campo?.tipo || (i === 0 ? 'Texto' : ''),
                    );
                }

                // Línea divisoria entre ítems
                if (itemIndex > 0) {
                    renderItemDividerLine(
                        worksheet,
                        itemStartRow,
                        cols.item,
                        cols.gruposUsuario,
                        templateStyles,
                    );
                }

                currentRow += numFilasItem;
            });

            const subcategoriaEndRow = currentRow - 1;

            mergeCells(
                worksheet,
                `${cols.subcategoria}${subcategoriaStartRow}:${cols.subcategoria}${subcategoriaEndRow}`,
            );
            setCellValue(worksheet, `${cols.subcategoria}${subcategoriaStartRow}`, subcategoria.nombre);

            styleHeaderCells(worksheet, subcategoriaStartRow, cols, templateStyles);

            if (subcatIndex < categoria.subcategorias.length - 1) {
                renderSeparatorRow(worksheet, currentRow, cols.categoria, cols.gruposUsuario, templateStyles);
                currentRow += 1;
            }
        });

        const categoriaEndRow = currentRow - 1;

        mergeCells(
            worksheet,
            `${cols.categoria}${categoriaStartRow}:${cols.categoria}${categoriaEndRow}`,
        );
        setCellValue(worksheet, `${cols.categoria}${categoriaStartRow}`, categoria.nombre);

        styleHeaderCells(worksheet, categoriaStartRow, cols, templateStyles);

        if (catIndex < categorias.length - 1) {
            renderSeparatorRow(worksheet, currentRow, cols.categoria, cols.gruposUsuario, templateStyles);
            currentRow += 1;

            renderSeparatorRow(worksheet, currentRow, cols.categoria, cols.gruposUsuario, templateStyles);
            currentRow += 1;
        }
    });

    return currentRow - 1;
}

/**
 * Estilo visual para celdas master de categoría/subcategoría.
 */
function styleHeaderCells(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    cols: DetailCols,
    templateStyles: TemplateStyles,
): void {
    const cat = worksheet.getCell(`${cols.categoria}${rowNumber}`);
    cat.style = deepClone(templateStyles.categoriaCell || templateStyles.baseCell);
    cat.alignment = { ...(cat.alignment || {}), horizontal: 'center', vertical: 'middle', wrapText: true };
    cat.font = { ...(cat.font || {}), ...HEADER_FONT };

    const sub = worksheet.getCell(`${cols.subcategoria}${rowNumber}`);
    sub.style = deepClone(templateStyles.subcategoriaCell || templateStyles.baseCell);
    sub.alignment = { ...(sub.alignment || {}), horizontal: 'center', vertical: 'middle', wrapText: true };
    sub.font = { ...(sub.font || {}), ...HEADER_FONT };
}

/**
 * Línea divisoria visible (medium top) entre ítems.
 */
function renderItemDividerLine(
    worksheet: ExcelJS.Worksheet,
    rowNumber: number,
    startColLetter: string,
    endColLetter: string,
    templateStyles: TemplateStyles,
): void {
    const startCol = columnLetterToIndex(startColLetter);
    const endCol = columnLetterToIndex(endColLetter);
    const color = templateStyles.outerBorderColorARGB || 'FF000000';

    for (let c = startCol; c <= endCol; c++) {
        const cell = worksheet.getCell(rowNumber, c);
        const border = deepClone(cell.border || {});
        border.top = borderSide('medium', color);
        cell.border = border;
    }
}

/**
 * Inserta flujograma debajo del detalle.
 */
async function insertFlowchart(
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    flowchart: NonNullable<DocumentDraft['flowchart']>,
    lastDetailRow: number,
    flowchartTemplateLabelRow: number,
    flowchartColStart: number,
): Promise<void> {
    const base64Data = flowchart.base64.split(',')[1];
    if (!base64Data) return;

    const imageId = workbook.addImage({
        base64: base64Data,
        extension: 'png',
    });

    const flowchartLabelRow = getFlowchartLabelRow(lastDetailRow, flowchartTemplateLabelRow);
    const flowchartStartRow = flowchartLabelRow + 1;

    worksheet.addImage(imageId, {
        tl: { col: flowchartColStart - 0.1, row: flowchartStartRow - 0.5 },
        ext: { width: 800, height: 450 },
        editAs: 'oneCell',
    });
}

/** Helpers genéricos */
function setCellValue(worksheet: ExcelJS.Worksheet, cellAddress: string, value: any): void {
    const cell = worksheet.getCell(cellAddress);
    cell.value = value === undefined || value === null ? '' : value;
}

function mergeCells(worksheet: ExcelJS.Worksheet, range: string): void {
    try {
        worksheet.mergeCells(range);
    } catch {
        // ignore
    }
}

function mergeIfMultipleRows(worksheet: ExcelJS.Worksheet, range: string): void {
    const [start, end] = range.split(':');
    if (!start || !end) return;

    const startRow = parseInt(start.replace(/^[A-Z]+/i, ''), 10);
    const endRow = parseInt(end.replace(/^[A-Z]+/i, ''), 10);

    if (Number.isFinite(startRow) && Number.isFinite(endRow) && endRow > startRow) {
        mergeCells(worksheet, range);
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