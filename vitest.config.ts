import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Minimal Vitest configuration for the NuVet web app.
 *
 * Only the `@/*` path alias from `tsconfig.json` is mirrored here so that
 * test files inside `src/` can import the same modules the production
 * code does (UI primitives, shared utilities). Existing test files in
 * `src/features/**` use relative imports and continue to work without
 * this alias — adding the alias is purely additive.
 *
 * No new runtime dependencies are introduced: `vitest/config` and
 * `node:path` are part of the existing install.
 */
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
});
