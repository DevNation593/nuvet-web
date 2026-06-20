import * as React from 'react';
import { cn } from '@/shared/lib/utils';

/**
 * Componente Card optimizado para vistas móviles de tablas
 */
const MobileCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'rounded-lg border bg-card text-card-foreground shadow-sm',
            className
        )}
        {...props}
    />
));
MobileCard.displayName = 'MobileCard';

const MobileCardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex items-center justify-between p-3 pb-2', className)}
        {...props}
    />
));
MobileCardHeader.displayName = 'MobileCardHeader';

const MobileCardTitle = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('font-medium text-sm', className)}
        {...props}
    />
));
MobileCardTitle.displayName = 'MobileCardTitle';

const MobileCardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-3 pt-0 space-y-2', className)} {...props} />
));
MobileCardContent.displayName = 'MobileCardContent';

const MobileCardRow = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex justify-between items-center text-xs', className)}
        {...props}
    />
));
MobileCardRow.displayName = 'MobileCardRow';

const MobileCardLabel = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        className={cn('text-muted-foreground', className)}
        {...props}
    />
));
MobileCardLabel.displayName = 'MobileCardLabel';

const MobileCardValue = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
    <span ref={ref} className={cn('font-medium', className)} {...props} />
));
MobileCardValue.displayName = 'MobileCardValue';

const MobileCardActions = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex items-center gap-1 border-t p-2 mt-2', className)}
        {...props}
    />
));
MobileCardActions.displayName = 'MobileCardActions';

export {
    MobileCard,
    MobileCardHeader,
    MobileCardTitle,
    MobileCardContent,
    MobileCardRow,
    MobileCardLabel,
    MobileCardValue,
    MobileCardActions,
};
