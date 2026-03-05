import { doRangesOverlap } from '@/features/appointments/lib/agenda-utils';

export interface AppointmentRange {
    id: string;
    scheduledAt: string;
    durationMinutes?: number;
}

export function findConflictingAppointment(
    scheduledAtIso: string,
    durationMinutes: number,
    appointments: AppointmentRange[],
): AppointmentRange | null {
    const start = new Date(scheduledAtIso);
    const end = new Date(start.getTime() + durationMinutes * 60_000);

    for (const appointment of appointments) {
        const appointmentStart = new Date(appointment.scheduledAt);
        const appointmentEnd = new Date(
            appointmentStart.getTime() + (appointment.durationMinutes ?? 30) * 60_000,
        );

        if (doRangesOverlap(start, end, appointmentStart, appointmentEnd)) {
            return appointment;
        }
    }

    return null;
}

