import { Card, CardContent } from '@/shared/components/ui/card';

export function ClientStateCard({
    message,
    tone = 'muted',
}: {
    message: string;
    tone?: 'muted' | 'error';
}) {
    return (
        <Card>
            <CardContent
                className={`py-10 text-center text-sm ${
                    tone === 'error' ? 'text-destructive' : 'text-muted-foreground'
                }`}
            >
                {message}
            </CardContent>
        </Card>
    );
}

export function ClientRowsSkeleton({ rows = 4, height = 'h-20' }: { rows?: number; height?: string }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className={`${height} animate-pulse rounded-md border bg-muted/40`} />
            ))}
        </div>
    );
}

export function ClientGridSkeleton({
    items = 6,
    itemClassName = 'h-40',
    columnsClassName = 'sm:grid-cols-2 xl:grid-cols-3',
}: {
    items?: number;
    itemClassName?: string;
    columnsClassName?: string;
}) {
    return (
        <div className={`grid gap-4 ${columnsClassName}`}>
            {Array.from({ length: items }).map((_, index) => (
                <div key={index} className={`${itemClassName} animate-pulse rounded-xl border bg-muted/40`} />
            ))}
        </div>
    );
}
