'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { Calendar, MapPin, User, Stethoscope, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { ApiHomeVetBookingStatus } from '@nuvet/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useHomeVetBookings } from '@/features/home-vet/hooks/use-home-vet-bookings';

const STATUS_LABELS: Record<ApiHomeVetBookingStatus, string> = {
    REQUESTED: 'Solicitada',
    CONFIRMED: 'Confirmada',
    EN_ROUTE: 'En camino',
    IN_PROGRESS: 'En curso',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No-show',
};

const STATUS_VARIANTS: Record<ApiHomeVetBookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    REQUESTED: 'outline',
    CONFIRMED: 'default',
    EN_ROUTE: 'secondary',
    IN_PROGRESS: 'default',
    COMPLETED: 'secondary',
    CANCELLED: 'destructive',
    NO_SHOW: 'destructive',
};

const STATUS_OPTIONS: Array<{ value: ApiHomeVetBookingStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'Todos' },
    { value: 'REQUESTED', label: 'Solicitada' },
    { value: 'CONFIRMED', label: 'Confirmada' },
    { value: 'EN_ROUTE', label: 'En camino' },
    { value: 'IN_PROGRESS', label: 'En curso' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'CANCELLED', label: 'Cancelada' },
    { value: 'NO_SHOW', label: 'No-show' },
];

const formatDate = (iso: string) =>
    format(new Date(iso), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });

const formatPrice = (cents: number, currency: string) => {
    if (cents === 0) return 'Gratis';
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency }).format(
        cents / 100,
    );
};

export default function HomeVetBookingsListPage() {
    const [statusFilter, setStatusFilter] = useState<ApiHomeVetBookingStatus | 'ALL'>(
        'ALL',
    );
    const { data, isLoading, error, refetch } = useHomeVetBookings(
        statusFilter === 'ALL' ? {} : { status: statusFilter },
    );
    const bookings = data?.data ?? [];

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Veterinario a domicilio
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Solicitudes de visita a domicilio. Asigna un vet, sigue el
                        progreso y registra el resultado.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as ApiHomeVetBookingStatus | 'ALL')}
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button asChild>
                        <Link href="/clinic/home-vet/bookings/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva visita
                        </Link>
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Cargando…</p>
            ) : error ? (
                <Card>
                    <CardContent className="pt-6 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <div className="flex-1">
                            <p className="text-sm">No pudimos cargar las visitas.</p>
                            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
                                Reintentar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : bookings.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">
                            No hay visitas{statusFilter !== 'ALL' ? ' con ese estado' : ''}.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookings.map((b) => (
                        <Card key={b.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-base">
                                        {b.pet?.name ?? 'Mascota'}
                                    </CardTitle>
                                    <Badge variant={STATUS_VARIANTS[b.status]}>
                                        {STATUS_LABELS[b.status]}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {b.reason}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(b.scheduledAt)}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span className="truncate">{b.address}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    {b.owner
                                        ? `${b.owner.firstName} ${b.owner.lastName}`
                                        : '—'}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Stethoscope className="h-4 w-4" />
                                    {b.vet
                                        ? `${b.vet.firstName} ${b.vet.lastName}`
                                        : 'Sin asignar'}
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="font-semibold">
                                        {formatPrice(b.totalCents, b.currency)}
                                    </span>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/clinic/home-vet/bookings/${b.id}`}>
                                            Ver detalle
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
