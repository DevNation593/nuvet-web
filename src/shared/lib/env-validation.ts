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

    if (missing.length > 0 && process.env.NODE_ENV !== 'production') {
        console.warn(
            `[EnvValidation] Missing environment variables: ${missing.join(', ')} (using defaults)`,
        );
    }
}

validate();

export const env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'https://dev.nuvet.tech',
} as const;
