'use client';

import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import {
    type PromotionType,
    useCreatePromotion,
    useDeletePromotion,
    usePromotions,
    useTogglePromotion,
    useUpdatePromotion,
    type CreatePromotionInput,
    type Promotion,
} from '@/features/promotions/hooks/use-promotions';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { Loader2, Pencil, Percent, Plus, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollableTable, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/components/ui/table';
import { MobileCard, MobileCardHeader, MobileCardTitle, MobileCardContent, MobileCardRow, MobileCardLabel, MobileCardValue, MobileCardActions } from '@/shared/components/ui/mobile-card';
import { useIsMobile } from '@/shared/hooks/use-media-query';

// ─── Schema ──────────────────────────────────────────────────────────────────

const promotionSchema = z.object({
    name: z.string().min(2, 'El nombre es obligatorio'),
    description: z.string().optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y'] as const),
    value: z.coerce.number().min(0, 'El valor debe ser mayor o igual a 0'),
    buyQuantity: z.coerce.number().optional(),
    getQuantity: z.coerce.number().optional(),
    minPurchaseAmount: z.coerce.number().optional(),
    maxUsages: z.coerce.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

type PromotionForm = z.infer<typeof promotionSchema>;

const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
    PERCENTAGE: 'Porcentaje',
    FIXED_AMOUNT: 'Monto fijo',
    BUY_X_GET_Y: 'Lleva X paga Y',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function PromotionsManagement() {
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Promotion | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const isMobile = useIsMobile();

    const queryParams = useMemo(() => {
        if (activeFilter === 'active') return { isActive: true, limit: 100 };
        if (activeFilter === 'inactive') return { isActive: false, limit: 100 };
        return { limit: 100 };
    }, [activeFilter]);

    const promotionsQuery = usePromotions(queryParams);
    const createPromotion = useCreatePromotion();
    const updatePromotion = useUpdatePromotion(selectedId);
    const togglePromotion = useTogglePromotion(selectedId);
    const deletePromotion = useDeletePromotion();

    const promotions = useMemo(() => promotionsQuery.data?.data ?? [], [promotionsQuery.data]);

    function openCreate() {
        setEditTarget(null);
        setModalOpen(true);
    }

    function openEdit(promo: Promotion) {
        setEditTarget(promo);
        setSelectedId(promo.id);
        setModalOpen(true);
    }

    async function handleToggle(promo: Promotion) {
        setSelectedId(promo.id);
        try {
            await togglePromotion.mutateAsync(!promo.isActive);
            toast.success(promo.isActive ? 'Promoción desactivada' : 'Promoción activada');
        } catch {
            toast.error('No se pudo cambiar el estado');
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await deletePromotion.mutateAsync(deleteTarget.id);
            toast.success('Promoción eliminada');
            setDeleteTarget(null);
        } catch {
            toast.error('No se pudo eliminar la promoción');
        }
    }

    async function handleSubmit(values: PromotionForm) {
        const payload: CreatePromotionInput = {
            ...values,
            startDate: values.startDate || undefined,
            endDate: values.endDate || undefined,
            buyQuantity: values.buyQuantity || undefined,
            getQuantity: values.getQuantity || undefined,
            minPurchaseAmount: values.minPurchaseAmount || undefined,
            maxUsages: values.maxUsages || undefined,
        };

        try {
            if (editTarget) {
                await updatePromotion.mutateAsync(payload);
                toast.success('Promoción actualizada');
            } else {
                await createPromotion.mutateAsync(payload);
                toast.success('Promoción creada');
            }
            setModalOpen(false);
            setEditTarget(null);
        } catch (error: unknown) {
            const message =
                error && typeof error === 'object' && 'response' in error
                    ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                    : undefined;
            toast.error(message ?? 'No se pudo guardar la promoción');
        }
    }

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Promociones</h2>
                    <p className="text-sm text-muted-foreground">Gestiona descuentos y ofertas aplicables en punto de venta</p>
                </div>
                <Button onClick={openCreate} title="Crear nueva promoción">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva promoción
                </Button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard
                    label="Total"
                    value={promotions.length}
                    icon={<Tag className="h-5 w-5 text-muted-foreground" />}
                />
                <StatCard
                    label="Activas"
                    value={promotions.filter((p) => p.isActive).length}
                    icon={<Percent className="h-5 w-5 text-green-500" />}
                    highlight
                />
                <StatCard
                    label="Inactivas"
                    value={promotions.filter((p) => !p.isActive).length}
                    icon={<Percent className="h-5 w-5 text-muted-foreground" />}
                />
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex gap-2">
                        {(['all', 'active', 'inactive'] as const).map((f) => (
                            <button
                                key={f}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                    activeFilter === f
                                        ? 'bg-primary text-primary-foreground'
                                        : 'border text-muted-foreground hover:bg-muted'
                                }`}
                                onClick={() => setActiveFilter(f)}
                            >
                                {f === 'all' ? 'Todas' : f === 'active' ? 'Activas' : 'Inactivas'}
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {promotionsQuery.isLoading ? (
                        <ClinicRowsSkeleton rows={5} />
                    ) : promotions.length === 0 ? (
                        <ClinicStateCard message="No hay promociones registradas." />
                    ) : isMobile ? (
                        <div className="space-y-3 p-4 max-h-[560px] overflow-y-auto">
                            {promotions.map((promo) => (
                                <MobileCard key={promo.id}>
                                    <MobileCardHeader>
                                        <MobileCardTitle>{promo.name}</MobileCardTitle>
                                        <Badge variant={promo.isActive ? 'confirmed' : 'cancelled'}>
                                            {promo.isActive ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </MobileCardHeader>
                                    <MobileCardContent>
                                        {promo.description && (
                                            <MobileCardRow>
                                                <MobileCardValue className="text-xs text-muted-foreground line-clamp-2">
                                                    {promo.description}
                                                </MobileCardValue>
                                            </MobileCardRow>
                                        )}
                                        <MobileCardRow>
                                            <MobileCardLabel>Tipo:</MobileCardLabel>
                                            <MobileCardValue>{PROMOTION_TYPE_LABELS[promo.type]}</MobileCardValue>
                                        </MobileCardRow>
                                        <MobileCardRow>
                                            <MobileCardLabel>Descuento:</MobileCardLabel>
                                            <MobileCardValue className="font-medium">
                                                {promo.type === 'PERCENTAGE'
                                                    ? `${promo.value}%`
                                                    : promo.type === 'FIXED_AMOUNT'
                                                    ? `$${promo.value}`
                                                    : `${promo.buyQuantity ?? 0}x${promo.getQuantity ?? 1}`}
                                            </MobileCardValue>
                                        </MobileCardRow>
                                        <MobileCardRow>
                                            <MobileCardLabel>Usos:</MobileCardLabel>
                                            <MobileCardValue>
                                                {promo.usageCount}
                                                {promo.maxUsages ? ` / ${promo.maxUsages}` : ''}
                                            </MobileCardValue>
                                        </MobileCardRow>
                                        <MobileCardActions>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => openEdit(promo)}
                                            >
                                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                                Editar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleToggle(promo)}
                                                disabled={togglePromotion.isPending && selectedId === promo.id}
                                            >
                                                {togglePromotion.isPending && selectedId === promo.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : promo.isActive ? (
                                                    'Desactivar'
                                                ) : (
                                                    'Activar'
                                                )}
                                            </Button>
                                        </MobileCardActions>
                                    </MobileCardContent>
                                </MobileCard>
                            ))}
                        </div>
                    ) : (
                        <ScrollableTable maxHeight="max-h-[560px]" minWidth="min-w-[720px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Descuento</TableHead>
                                    <TableHead>Usos</TableHead>
                                    <TableHead>Vigencia</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {promotions.map((promo) => (
                                    <TableRow key={promo.id}>
                                        <TableCell>
                                            <p className="font-medium">{promo.name}</p>
                                            {promo.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-1">{promo.description}</p>
                                            )}
                                        </TableCell>
                                        <TableCell>{PROMOTION_TYPE_LABELS[promo.type]}</TableCell>
                                        <TableCell className="font-medium">
                                            {promo.type === 'PERCENTAGE'
                                                ? `${promo.value}%`
                                                : promo.type === 'FIXED_AMOUNT'
                                                ? `$${promo.value}`
                                                : `${promo.buyQuantity ?? 0}x${promo.getQuantity ?? 1}`}
                                        </TableCell>
                                        <TableCell>
                                            <span className="tabular-nums">
                                                {promo.usageCount}
                                                {promo.maxUsages ? ` / ${promo.maxUsages}` : ''}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {promo.startDate
                                                ? format(new Date(promo.startDate), 'dd/MM/yy')
                                                : '—'}{' '}
                                            →{' '}
                                            {promo.endDate
                                                ? format(new Date(promo.endDate), 'dd/MM/yy')
                                                : '∞'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={promo.isActive ? 'confirmed' : 'cancelled'}>
                                                {promo.isActive ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    title="Editar promoción"
                                                    onClick={() => openEdit(promo)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    title={promo.isActive ? 'Desactivar promoción' : 'Activar promoción'}
                                                    onClick={() => handleToggle(promo)}
                                                    disabled={togglePromotion.isPending && selectedId === promo.id}
                                                >
                                                    {togglePromotion.isPending && selectedId === promo.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : promo.isActive ? (
                                                        'Desactivar'
                                                    ) : (
                                                        'Activar'
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    title="Eliminar promoción"
                                                    onClick={() => setDeleteTarget(promo)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </ScrollableTable>
                    )}
                </CardContent>
            </Card>

            {/* Create / Edit Modal */}
            <PromotionModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setEditTarget(null);
                }}
                defaultValues={editTarget ?? undefined}
                loading={createPromotion.isPending || updatePromotion.isPending}
                onSubmit={handleSubmit}
            />

            {/* Delete confirmation */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar promoción</DialogTitle>
                        <DialogDescription>
                            ¿Eliminar <strong>{deleteTarget?.name}</strong>? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} title="Cancelar eliminación">
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deletePromotion.isPending}
                            title="Confirmar eliminación"
                        >
                            {deletePromotion.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, highlight }: { label: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
    return (
        <Card className={highlight ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10' : ''}>
            <CardContent className="flex items-center justify-between p-4">
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                {icon}
            </CardContent>
        </Card>
    );
}

// ─── PromotionModal ───────────────────────────────────────────────────────────

function PromotionModal({
    open,
    onOpenChange,
    defaultValues,
    loading,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultValues?: Partial<Promotion>;
    loading: boolean;
    onSubmit: (values: PromotionForm) => Promise<void>;
}) {
    const form = useForm<PromotionForm>({
        resolver: zodResolver(promotionSchema),
        values: {
            name: defaultValues?.name ?? '',
            description: defaultValues?.description ?? '',
            type: (defaultValues?.type as PromotionType) ?? 'PERCENTAGE',
            value: defaultValues?.value ?? 0,
            buyQuantity: defaultValues?.buyQuantity,
            getQuantity: defaultValues?.getQuantity,
            minPurchaseAmount: defaultValues?.minPurchaseAmount,
            maxUsages: defaultValues?.maxUsages,
            startDate: defaultValues?.startDate?.slice(0, 10) ?? '',
            endDate: defaultValues?.endDate?.slice(0, 10) ?? '',
        },
    });

    const type = useWatch({ control: form.control, name: 'type' });
    const isEdit = Boolean(defaultValues?.id);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar promoción' : 'Nueva promoción'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Modifica los datos de la promoción.' : 'Configura el descuento o beneficio.'}
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Nombre *" error={form.formState.errors.name?.message} className="col-span-2">
                            <input
                                className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                placeholder="Ej. Descuento Black Friday"
                                {...form.register('name')}
                            />
                        </Field>
                        <Field label="Tipo *" error={form.formState.errors.type?.message}>
                            <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('type')}>
                                {Object.entries(PROMOTION_TYPE_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </Field>

                        {type !== 'BUY_X_GET_Y' && (
                            <Field
                                label={type === 'PERCENTAGE' ? 'Porcentaje (%) *' : 'Monto fijo ($) *'}
                                error={form.formState.errors.value?.message}
                            >
                                <input
                                    type="number"
                                    min={0}
                                    step={type === 'PERCENTAGE' ? 1 : 0.01}
                                    className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                    {...form.register('value')}
                                />
                            </Field>
                        )}

                        {type === 'BUY_X_GET_Y' && (
                            <>
                                <Field label="Compra X unidades">
                                    <input
                                        type="number"
                                        min={1}
                                        className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                        {...form.register('buyQuantity')}
                                    />
                                </Field>
                                <Field label="Lleva Y gratis">
                                    <input
                                        type="number"
                                        min={1}
                                        className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                        {...form.register('getQuantity')}
                                    />
                                </Field>
                            </>
                        )}

                        <Field label="Monto mínimo de compra ($)">
                            <input
                                type="number"
                                min={0}
                                step={0.01}
                                className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                placeholder="Sin mínimo"
                                {...form.register('minPurchaseAmount')}
                            />
                        </Field>
                        <Field label="Máx. usos">
                            <input
                                type="number"
                                min={1}
                                className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                placeholder="Sin límite"
                                {...form.register('maxUsages')}
                            />
                        </Field>
                        <Field label="Fecha inicio">
                            <input
                                type="date"
                                className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                {...form.register('startDate')}
                            />
                        </Field>
                        <Field label="Fecha fin">
                            <input
                                type="date"
                                className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                {...form.register('endDate')}
                            />
                        </Field>
                        <Field label="Descripción" className="col-span-2">
                            <textarea
                                rows={2}
                                className="w-full rounded-md border border-input px-3 py-2 text-sm"
                                placeholder="Descripción interna (opcional)"
                                {...form.register('description')}
                            />
                        </Field>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} title="Cancelar sin guardar">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} title="Guardar promoción">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isEdit ? 'Guardar cambios' : 'Crear promoción'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
    return (
        <label className={`block space-y-1 ${className ?? ''}`}>
            <span className="text-sm font-medium">{label}</span>
            {children}
            {error && <span className="text-xs text-destructive">{error}</span>}
        </label>
    );
}
