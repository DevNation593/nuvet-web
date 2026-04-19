export function isInvoicePendingStatus(status?: string | null): boolean {
    if (!status) return false;
    const normalized = status.trim().toUpperCase();
    return normalized === 'PENDING' || normalized === 'SUBMITTED' || normalized === 'PROCESSING' || normalized === 'IN_PROGRESS';
}
