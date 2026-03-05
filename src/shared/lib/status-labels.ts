const STATUS_LABELS: Record<string, string> = {
    SCHEDULED: 'Programada',
    CONFIRMED: 'Confirmada',
    IN_PROGRESS: 'En curso',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No asistió',
    PENDING: 'Pendiente',
    ADMINISTERED: 'Aplicada',
    OVERDUE: 'Vencida',
    AVAILABLE: 'Disponible',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
    ADOPTED: 'Adoptada',
    PROCESSING: 'En proceso',
    REFUNDED: 'Reembolsada',
    PAID: 'Pagada',
    UNPAID: 'Sin pago',
    OPEN: 'Abierta',
    CLOSED: 'Cerrada',
};

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
    CONSULTATION: 'Consulta',
    VACCINATION: 'Vacunación',
    AESTHETICS: 'Estética',
    SURGERY: 'Cirugía',
    CHECKUP: 'Chequeo',
};

function fallbackLabel(value: string): string {
    return value
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function getStatusLabel(status: string | null | undefined): string {
    if (!status) return 'Sin estado';
    return STATUS_LABELS[status] ?? fallbackLabel(status);
}

export function getAppointmentTypeLabel(type: string | null | undefined): string {
    if (!type) return 'Sin tipo';
    return APPOINTMENT_TYPE_LABELS[type] ?? fallbackLabel(type);
}
