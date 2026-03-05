import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground',
                secondary: 'bg-secondary text-secondary-foreground',
                destructive: 'bg-destructive text-destructive-foreground',
                outline: 'border border-input bg-background',
                scheduled: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                completed: 'bg-muted text-muted-foreground',
                cancelled: 'bg-destructive/10 text-destructive',
                'no-show': 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
