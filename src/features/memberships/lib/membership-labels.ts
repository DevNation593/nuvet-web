import type { ApiMembershipBillingPeriod, ApiMembershipSubscriptionStatus } from '@nuvet/types';

/**
 * Etiquetas legibles en español para los estados de una suscripción de
 * membresía. Reutilizado por el portal del propietario y por la página
 * admin de la clínica.
 */

const SUBSCRIPTION_STATUS_LABELS: Record<ApiMembershipSubscriptionStatus, string> = {
    PENDING: 'Pendiente de pago',
    ACTIVE: 'Activa',
    PAUSED: 'Pausada',
    CANCELLED: 'Cancelada',
    EXPIRED: 'Vencida',
    PAST_DUE: 'Pago pendiente',
};

const SUBSCRIPTION_STATUS_BADGE_VARIANT: Record<
    ApiMembershipSubscriptionStatus,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    PENDING: 'outline',
    ACTIVE: 'default',
    PAUSED: 'secondary',
    CANCELLED: 'outline',
    EXPIRED: 'destructive',
    PAST_DUE: 'destructive',
};

const BILLING_PERIOD_LABELS: Record<ApiMembershipBillingPeriod, string> = {
    MONTHLY: 'Mensual',
    ANNUAL: 'Anual',
};

export function getSubscriptionStatusLabel(
    status: ApiMembershipSubscriptionStatus | string | null | undefined,
): string {
    if (!status) return 'Sin estado';
    return (
        SUBSCRIPTION_STATUS_LABELS[status as ApiMembershipSubscriptionStatus] ??
        status
            .toLowerCase()
            .split('_')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')
    );
}

export function getSubscriptionStatusBadgeVariant(
    status: ApiMembershipSubscriptionStatus | string | null | undefined,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (!status) return 'outline';
    return (
        SUBSCRIPTION_STATUS_BADGE_VARIANT[status as ApiMembershipSubscriptionStatus] ??
        'outline'
    );
}

export function getBillingPeriodLabel(
    period: ApiMembershipBillingPeriod | string | null | undefined,
): string {
    if (!period) return 'Sin período';
    return (
        BILLING_PERIOD_LABELS[period as ApiMembershipBillingPeriod] ??
        String(period).toLowerCase()
    );
}

/**
 * Formatea un precio en centavos como moneda (por defecto USD).
 * Se evita la dependencia de `Intl.NumberFormat` porque no hay locale
 * explícito y queremos un formato estable en entornos sin BCP-47.
 */
export function formatMembershipPriceCents(
    cents: number,
    currency = 'USD',
): string {
    const sign = cents < 0 ? '-' : '';
    const abs = Math.abs(cents);
    const dollars = (abs / 100).toFixed(2);
    return `${sign}$${dollars} ${currency}`;
}
