/**
 * Generic data export utilities for CSV and printable table generation.
 */

export interface ExportColumn<T> {
    header: string;
    accessor: (row: T) => string | number | boolean | null | undefined;
}

function escapeCSVField(value: unknown): string {
    const str = value == null ? '' : String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export function exportToCSV<T>(
    data: T[],
    columns: ExportColumn<T>[],
    filename: string,
): void {
    const header = columns.map((c) => escapeCSVField(c.header)).join(',');
    const rows = data.map((row) =>
        columns.map((col) => escapeCSVField(col.accessor(row))).join(','),
    );
    const csvContent = [header, ...rows].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function printTable<T>(
    data: T[],
    columns: ExportColumn<T>[],
    title: string,
): void {
    const rows = data
        .map(
            (row) =>
                `<tr>${columns.map((col) => `<td style="padding:6px 10px;border:1px solid #ddd;">${col.accessor(row) ?? ''}</td>`).join('')}</tr>`,
        )
        .join('');

    const headerCells = columns
        .map(
            (c) =>
                `<th style="padding:8px 10px;border:1px solid #ddd;background:#f5f5f5;text-align:left;">${c.header}</th>`,
        )
        .join('');

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>${title}</title>
            <style>
                body { font-family: system-ui, sans-serif; padding: 20px; }
                h1 { font-size: 18px; margin-bottom: 12px; }
                table { border-collapse: collapse; width: 100%; font-size: 13px; }
                .meta { font-size: 12px; color: #666; margin-bottom: 16px; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <p class="meta">Generado: ${new Date().toLocaleString('es-EC')}</p>
            <table>
                <thead><tr>${headerCells}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
    `.trim();

    const popup = window.open('', '_blank', 'width=900,height=700');
    if (popup) {
        popup.document.write(html);
        popup.document.close();
    }
}
