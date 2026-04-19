/**
 * Validates that required environment variables are present.
 * Runs once on module import. In production, missing vars log errors.
 */

const requiredPublicVars = ['NEXT_PUBLIC_API_URL'] as const;

function validate() {
    const missing: string[] = [];

    for (const key of requiredPublicVars) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        const message = `[EnvValidation] Missing required environment variables: ${missing.join(', ')}`;
        if (process.env.NODE_ENV === 'production') {
            console.error(message);
        } else {
            console.warn(message + ' (using defaults in development)');
        }
    }
}

validate();

export const env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'https://dev.nuvet.tech',
} as const;
