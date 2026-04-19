'use client';

import { Download, Printer } from 'lucide-react';
import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';
import { exportToCSV, printTable, type ExportColumn } from '@/shared/lib/export-utils';

interface ExportButtonProps<T> {
    data: T[];
    columns: ExportColumn<T>[];
    filename: string;
    title: string;
}

export function ExportButton<T>({ data, columns, filename, title }: ExportButtonProps<T>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportToCSV(data, columns, filename)}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => printTable(data, columns, title)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir tabla
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
