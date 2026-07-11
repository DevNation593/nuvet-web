'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

/**
 * Visually hides content while keeping it accessible to screen readers.
 *
 * Use inside `DialogContent` when you need a `DialogTitle` (or other
 * label) for accessibility but do not want it rendered visually.
 * Mirrors Radix UI's `VisuallyHidden` primitive.
 */
export function VisuallyHidden({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement {
    return (
        <span
            className={cn(
                'absolute h-px w-px overflow-hidden whitespace-nowrap p-0 [clip:rect(0,0,0,0)]',
                className,
            )}
            {...props}
        />
    );
}
