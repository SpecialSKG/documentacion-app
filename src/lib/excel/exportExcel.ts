/**
 * Exportación a Excel usando el template oficial
 * Utiliza exceljs para preservar estilos y formato
 */

import ExcelJS from 'exceljs';
import { DocumentDraft } from '@/lib/document';
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
 * Exporta el documento a Excel usando el template oficial
 * @param document - Documento a exportar
 * @param templateArrayBuffer - ArrayBuffer del template Excel
 * @returns Promise<Blob> - Blob del archivo Excel generado
 */
export async function exportToExcel(
    document: DocumentDraft,
    templateArrayBuffer: ArrayBuffer
): Promise<Blob> {
    // Cargar el template
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateArrayBuffer);

    const worksheet = workbook.getWorksheet(SHEET_NAME);

    if (!worksheet) {
        throw new Error(`No se encontró la hoja "${SHEET_NAME}" en el template`);
    }

    // 1. Rellenar datos generales (META)
    fillGeneralData(worksheet, document);

    // 2. Rellenar tabla de detalle
    const lastDetailRow = fillDetailTable(worksheet, document);

    // 3. Insertar flujograma si existe
    if (document.flowchart) {
        await insertFlowchart(workbook, worksheet, document.flowchart, lastDetailRow);
    }

    // Generar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
}

/**
 * Rellena los datos generales en el template
 */
function fillGeneralData(worksheet: ExcelJS.Worksheet, document: DocumentDraft): void {
    const { general } = document;

    // Título del documento
    setCellValue(worksheet, HEADER_CELLS.title, DEFAULT_DOCUMENT_TITLE);

    // Datos generales
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
 * Rellena la tabla de detalle
 * @returns Número de la última fila escrita
 */
function fillDetailTable(worksheet: ExcelJS.Worksheet, document: DocumentDraft): number {
    const { detalle } = document;

    if (detalle.length === 0) {
        return DETAIL_START_ROW;
    }

    // Recopilar datos por columna (formato multilinea)
    const categorias: string[] = [];
    const subcategorias: string[] = [];
    const items: string[] = [];
    const camposAdicionales: string[] = [];
    const tiposCampos: string[] = [];
    const detalles: string[] = [];
    const slas: string[] = [];
    const tiposInfo: string[] = [];
    const requiereDocs: string[] = [];
    const observaciones: string[] = [];

    detalle.forEach((row) => {
        categorias.push(row.categoria);
        subcategorias.push(row.subcategoria);
        items.push(row.item);

        // Campos adicionales: serializar como lista separada por punto y coma
        if (row.camposAdicionales.length > 0) {
            const titulos = row.camposAdicionales.map((c) => c.titulo).join('; ');
            const tipos = row.camposAdicionales.map((c) => c.tipo).join('; ');
            camposAdicionales.push(titulos);
            tiposCampos.push(tipos);
        } else {
            camposAdicionales.push('');
            tiposCampos.push('');
        }

        detalles.push(row.detalle);
        slas.push(row.sla);
        tiposInfo.push(row.tipoInformacion);
        requiereDocs.push(row.requiereDocumento);
        observaciones.push(row.observaciones);
    });

    // Escribir en celdas (formato multilinea con saltos de línea)
    const startRow = DETAIL_START_ROW;

    setCellValue(worksheet, `${DETAIL_COLS.categoria}${startRow}`, categorias.join('\n'));
    setCellValue(worksheet, `${DETAIL_COLS.subcategoria}${startRow}`, subcategorias.join('\n'));
    setCellValue(worksheet, `${DETAIL_COLS.item}${startRow}`, items.join('\n'));
    setCellValue(worksheet, `${DETAIL_COLS.campoAdicional}${startRow}`, camposAdicionales.join('\n'));
    setCellValue(worksheet, `${DETAIL_COLS.tipoCampo}${startRow}`, tiposCampos.join('\n'));
    setCellValue(worksheet, `${DETAIL_COLS.detalle}${startRow}`, detalles.join('\n'));
    setCellValue(worksheet, `${DETAIL_COLS.sla}${startRow}`, slas.join('\n'));
    setCellValue(worksheet, `${DETAIL_COLS.tipoInformacion}${startRow}`, tiposInfo.join('\n'));
    setCellValue(worksheet, `${DETAIL_COLS.requiereDocumento}${startRow}`, requiereDocs.join('\n'));
    setCellValue(worksheet, `${DETAIL_COLS.observaciones}${startRow}`, observaciones.join('\n'));

    // Habilitar text wrap en las celdas de detalle
    const detailCell = worksheet.getCell(`${DETAIL_COLS.categoria}${startRow}`);
    detailCell.alignment = { wrapText: true, vertical: 'top' };

    // Retornar la última fila lógica (para el flujograma)
    // Como todo está en una celda con saltos de línea, la última fila física es startRow
    return startRow;
}

/**
 * Inserta el flujograma como imagen debajo de la tabla
 */
async function insertFlowchart(
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    flowchart: NonNullable<DocumentDraft['flowchart']>,
    lastDetailRow: number
): Promise<void> {
    // Calcular posición del flujograma
    const titleRow = lastDetailRow + FLOWCHART_MARGIN_ROWS;
    const imageStartRow = titleRow + 1;

    // Insertar título del flujograma
    const titleCell = worksheet.getCell(`B${titleRow}`);
    titleCell.value = 'FLUJOGRAMA DEL SERVICIO';
    titleCell.font = { bold: true, size: 12 };
    titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

    // Convertir base64 a buffer
    const base64Data = flowchart.base64.split(',')[1] || flowchart.base64;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Determinar extensión de imagen
    const extension = flowchart.mimeType === 'image/png' ? 'png' : 'jpeg';

    // Agregar imagen al workbook
    const imageId = workbook.addImage({
        buffer: imageBuffer as any,
        extension,
    });

    // Insertar imagen en la hoja
    // tl = top-left, br = bottom-right
    worksheet.addImage(imageId, {
        tl: {
            col: FLOWCHART_COL_START,
            row: imageStartRow - 1,
            nativeCol: FLOWCHART_COL_START,
            nativeRow: imageStartRow - 1,
            colOff: 0,
            rowOff: 0
        },
        br: {
            col: FLOWCHART_COL_END,
            row: imageStartRow - 1 + FLOWCHART_HEIGHT_ROWS,
            nativeCol: FLOWCHART_COL_END,
            nativeRow: imageStartRow - 1 + FLOWCHART_HEIGHT_ROWS,
            colOff: 0,
            rowOff: 0
        },
        editAs: 'oneCell',
    } as any);
}

/**
 * Helper para establecer valor de celda con manejo de celdas merged
 */
function setCellValue(
    worksheet: ExcelJS.Worksheet,
    address: string,
    value: string | number | undefined
): void {
    const cell = worksheet.getCell(address);
    cell.value = value || '';

    // Habilitar text wrap para celdas largas
    if (typeof value === 'string' && value.length > 50) {
        cell.alignment = { wrapText: true, vertical: 'top' };
    }
}

/**
 * Exporta solo la tabla filtrada (sin template) como Excel plano
 */
export async function exportPlainTable(document: DocumentDraft): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Detalle');

    // Headers
    worksheet.columns = [
        { header: 'Categoría', key: 'categoria', width: 20 },
        { header: 'Subcategoría', key: 'subcategoria', width: 20 },
        { header: 'Item', key: 'item', width: 25 },
        { header: 'Campos Adicionales', key: 'camposAdicionales', width: 30 },
        { header: 'SLA', key: 'sla', width: 15 },
        { header: 'Tipo Info', key: 'tipoInformacion', width: 15 },
        { header: 'Req. Documento', key: 'requiereDocumento', width: 15 },
        { header: 'Observaciones', key: 'observaciones', width: 30 },
    ];

    // Estilo de headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
    };

    // Datos
    document.detalle.forEach((row) => {
        const camposStr = row.camposAdicionales
            .map((c) => `${c.titulo} (${c.tipo})`)
            .join(', ');

        worksheet.addRow({
            categoria: row.categoria,
            subcategoria: row.subcategoria,
            item: row.item,
            camposAdicionales: camposStr,
            sla: row.sla,
            tipoInformacion: row.tipoInformacion,
            requiereDocumento: row.requiereDocumento,
            observaciones: row.observaciones,
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
}
