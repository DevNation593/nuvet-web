'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import type {
    ApiBillingAttemptStatus,
    BillingAttempt,
    BillingFailureCodeCount,
    BillingFailureReportSummary,
} from '@nuvet/types';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';

import { useBillingFailureReport } from '../../hooks/use-memberships';
import { formatMembershipPriceCents } from '../../lib/membership-labels';

/**
 * Dashboard admin para Fase 2 · Slice 2 — intentos de cobro fallidos.
 *   - Cards resumen (24h / 7d / 30d / past_due / recovered)
 *   - Top failure codes
 *   - Tabla paginada de intentos fallidos con join de subscription/owner/plan/pet
 */
export default function BillingFailuresDashboard() {
    const [page, setPage] = useState(1);
    const [since, setSince] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().slice(0, 10);
    });

    const { data, isLoading, isError } = useBillingFailureReport({
        page,
        pageSize: 20,
        since: new Date(since).toISOString(),
    });

    if (isLoading) {
        return <div className="text-muted-foreground p-6 text-sm">Cargando reporte…</div>;
    }

    if (isError || !data) {
        return (
            <div className="border-destructive/40 bg-destructive/10 text-destructive m-6 rounded-md border p-4 text-sm">
                No pudimos cargar el reporte. Recarga la página.
            </div>
        );
    }

    const { summary, attempts, total } = data;

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="text-amber-600 h-6 w-6" />
                    <div>
                        <h1 className="text-2xl font-bold">Intentos de cobro fallidos</h1>
                        <p className="text-muted-foreground text-sm">
                            Audita los cobros rechazados por el gateway de pagos y su
                            recuperación.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium" htmlFor="since">
                        Desde
                    </label>
                    <Input
                        id="since"
                        type="date"
                        value={since}
                        onChange={(e) => {
                            setSince(e.target.value);
                            setPage(1);
                        }}
                        max={new Date().toISOString().slice(0, 10)}
                        className="w-44"
                    />
                </div>
            </div>

            <SummaryCards summary={summary} />

            {summary.topFailureCodes.length > 0 && (
                <TopFailureCodesCard codes={summary.topFailureCodes} />
            )}

            <AttemptsTable attempts={attempts} />

            <Pagination
                page={page}
                pageSize={data.pageSize}
                total={total}
                onPageChange={setPage}
            />
        </div>
    );
}

function SummaryCards({ summary }: { summary: BillingFailureReportSummary }) {
    const tiles = [
        {
            label: 'Fallos en 24h',
            value: summary.failuresLast24Hours,
            icon: Clock,
            tone: summary.failuresLast24Hours === 0 ? 'ok' : 'warn',
        },
        {
            label: 'Fallos en 7d',
            value: summary.failuresLast7Days,
            icon: AlertTriangle,
            tone: 'warn',
        },
        {
            label: 'Fallos en 30d',
            value: summary.failuresLast30Days,
            icon: AlertTriangle,
            tone: 'muted',
        },
        {
            label: 'Suscripciones PAST_DUE',
            value: summary.pastDueSubscriptions,
            icon: XCircle,
            tone: summary.pastDueSubscriptions > 0 ? 'danger' : 'ok',
        },
        {
            label: 'Recuperadas',
            value: summary.totalRecoveredAfterFailure,
            icon: CheckCircle2,
            tone: summary.totalRecoveredAfterFailure > 0 ? 'ok' : 'muted',
        },
    ] as const;

    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {tiles.map((tile) => {
                const Icon = tile.icon;
                const toneClass =
                    tile.tone === 'danger'
                        ? 'text-red-600'
                        : tile.tone === 'warn'
                          ? 'text-amber-600'
                          : tile.tone === 'ok'
                            ? 'text-emerald-600'
                            : 'text-muted-foreground';
                return (
                    <Card key={tile.label} className="p-0">
                        <CardContent className="space-y-1 p-4">
                            <div className="text-muted-foreground flex items-center gap-2 text-xs uppercase">
                                <Icon className={`h-4 w-4 ${toneClass}`} />
                                {tile.label}
                            </div>
                            <div className="text-2xl font-bold tabular-nums">{tile.value}</div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

function TopFailureCodesCard({ codes }: { codes: BillingFailureCodeCount[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Top failure codes</CardTitle>
                <CardDescription>
                    Causas más frecuentes en el período seleccionado.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {codes.map((row) => (
                    <div
                        key={row.failureCode}
                        className="flex items-center justify-between gap-3 border-b pb-2 text-sm last:border-b-0 last:pb-0"
                    >
                        <div className="min-w-0 flex-1">
                            <Badge variant="destructive" className="font-mono text-xs">
                                {row.failureCode}
                            </Badge>
                            {row.failureMessage && (
                                <p className="text-muted-foreground mt-1 truncate text-xs">
                                    {row.failureMessage}
                                </p>
                            )}
                        </div>
                        <div className="text-foreground text-lg font-bold tabular-nums">
                            {row.count}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function AttemptsTable({ attempts }: { attempts: BillingAttempt[] }) {
    if (attempts.length === 0) {
        return (
            <Card>
                <CardContent className="text-muted-foreground p-8 text-center text-sm">
                    Sin intentos fallidos en el período seleccionado. 🎉
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Fecha</th>
                                <th className="px-4 py-3 text-left font-medium">Suscripción</th>
                                <th className="px-4 py-3 text-left font-medium">Plan</th>
                                <th className="px-4 py-3 text-left font-medium">Mascota</th>
                                <th className="px-4 py-3 text-right font-medium">Monto</th>
                                <th className="px-4 py-3 text-left font-medium">Fallo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.map((att) => (
                                <tr
                                    key={att.id}
                                    className="border-b last:border-b-0 hover:bg-muted/30"
                                    data-testid={`failure-row-${att.id}`}
                                >
                                    <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                                        {formatDate(att.createdAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <OwnerCell attempt={att} />
                                    </td>
                                    <td className="px-4 py-3">
                                        {att.subscription?.plan?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {att.subscription?.pet?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">
                                        {formatMembershipPriceCents(
                                            att.amountCents,
                                            att.currency,
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="destructive" className="font-mono text-xs">
                                            {att.failureCode ?? 'unknown'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

function OwnerCell({ attempt }: { attempt: BillingAttempt }) {
    const owner = attempt.subscription?.owner;
    if (!owner) {
        return <span className="text-muted-foreground text-xs">{attempt.subscriptionId.slice(0, 8)}…</span>;
    }
    return (
        <div>
            <div className="font-medium">
                {owner.firstName} {owner.lastName}
            </div>
            <div className="text-muted-foreground text-xs">{owner.email}</div>
        </div>
    );
}

function Pagination({
    page,
    pageSize,
    total,
    onPageChange,
}: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
}) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
                Página {page} de {totalPages} · {total} fallos
            </p>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function formatDate(iso: string): string {
    try {
        return format(new Date(iso), 'dd MMM yyyy HH:mm', { locale: es });
    } catch {
        return iso;
    }
}
