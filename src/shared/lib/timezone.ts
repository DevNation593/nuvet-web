/**
 * Converts a local date + time string to a proper ISO 8601 string
 * that correctly represents the intended instant in the user's timezone.
 *
 * The user picks "2026-04-15" and "10:00" meaning 10:00 in their local timezone.
 * This function produces the correct UTC instant rather than naively appending "Z".
 *
 * @param date  Date string in YYYY-MM-DD format
 * @param time  Time string in HH:mm format
 * @returns ISO 8601 UTC string (e.g. "2026-04-15T15:00:00.000Z" for UTC-5)
 */
export function localDateTimeToUTC(date: string, time: string): string {
    const localDate = new Date(`${date}T${time}:00`);

    if (Number.isNaN(localDate.getTime())) {
        throw new Error(`Invalid date/time: ${date} ${time}`);
    }

    return localDate.toISOString();
}

/**
 * Formats a UTC ISO string to a local time display string.
 */
export function utcToLocalDisplay(isoString: string, locale = 'es-EC'): string {
    return new Date(isoString).toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}
