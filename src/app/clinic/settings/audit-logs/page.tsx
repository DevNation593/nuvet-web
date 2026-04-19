'use client';

import { Suspense, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuditLogs } from '@/features/audit/hooks/use-audit-logs';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, Shield } from 'lucide-react';

function AuditLogsContent() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [entityFilter, setEntityFilter] = useState('');

    const { data, isLoading } = useAuditLogs({
        page,
        limit: 20,
        entity: entityFilter || undefined,
        action: search || undefined,
    });

    const logs = data?.data ?? [];
    const meta = data?.meta;

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Registro de Auditoría</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Filtros</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por acción..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={entityFilter}
                        onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        aria-label="Filtrar por entidad"
                    >
                        <option value="">Todas las entidades</option>
                        <option value="Appointment">Citas</option>
                        <option value="PosTicket">Ventas POS</option>
                        <option value="Invoice">Facturas</option>
                        <option value="User">Usuarios</option>
                        <option value="Pet">Mascotas</option>
                        <option value="Product">Productos</option>
                    </select>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-3 p-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-14 animate-pulse rounded bg-muted" />
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No se encontraron registros de auditoría
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium">Fecha</th>
                                        <th className="px-4 py-3 text-left font-medium">Acción</th>
                                        <th className="px-4 py-3 text-left font-medium">Entidad</th>
                                        <th className="px-4 py-3 text-left font-medium">Usuario</th>
                                        <th className="px-4 py-3 text-left font-medium">IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="border-b last:border-b-0 hover:bg-muted/30">
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">{log.entity}</span>
                                                {log.entityId && (
                                                    <span className="ml-1 text-xs text-muted-foreground">
                                                        #{log.entityId.slice(0, 8)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {log.user
                                                    ? `${log.user.firstName} ${log.user.lastName}`
                                                    : 'Sistema'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                                                {log.ipAddress ?? '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Página {meta.page} de {meta.totalPages} ({meta.total} registros)
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!meta.hasPrevPage}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!meta.hasNextPage}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AuditLogsPage() {
    return (
        <Suspense fallback={<div className="p-6">Cargando auditoría...</div>}>
            <AuditLogsContent />
        </Suspense>
    );
}
