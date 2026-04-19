/**
 * Lightweight error reporting abstraction.
 *
 * When `NEXT_PUBLIC_SENTRY_DSN` is configured, replace the body of
 * `reportError` with `Sentry.captureException(error, { extra: context })`.
 *
 * This keeps the codebase ready for Sentry without adding the dependency
 * until a DSN is provisioned.
 */

interface ErrorContext {
    componentStack?: string;
    digest?: string;
    tags?: Record<string, string>;
    [key: string]: unknown;
}

export function reportError(error: unknown, context?: ErrorContext): void {
    if (process.env.NODE_ENV === 'development') {
        console.error('[ErrorReport]', error, context);
        return;
    }

    // Production: log structured JSON so it can be captured by log aggregators
    try {
        const payload = {
            level: 'error',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            digest: context?.digest,
            tags: context?.tags,
            timestamp: new Date().toISOString(),
        };
        console.error(JSON.stringify(payload));
    } catch {
        console.error(error);
    }
}
