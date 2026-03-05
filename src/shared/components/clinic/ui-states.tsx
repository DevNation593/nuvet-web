import { Card, CardContent } from '@/shared/components/ui/card';

export function ClinicStateCard({
    message,
    tone = 'muted',
    action,
}: {
    message: string;
    tone?: 'muted' | 'error';
    action?: React.ReactNode;
}) {
    return (
        <Card>
            <CardContent
                className={`py-6 text-center text-sm ${
                    tone === 'error' ? 'text-destructive' : 'text-muted-foreground'
                }`}
            >
                <p>{message}</p>
                {action ? <div className="mt-3">{action}</div> : null}
            </CardContent>
        </Card>
    );
}

export function ClinicRowsSkeleton({ rows = 6, compact = false }: { rows?: number; compact?: boolean }) {
    const length = compact ? Math.min(rows, 3) : rows;
    return (
        <div className="space-y-2 p-3">
            {Array.from({ length }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded bg-muted" />
            ))}
        </div>
    );
}

export function ClinicScheduleSkeleton({ rows = 10 }: { rows?: number }) {
    return (
        <div className="space-y-2 p-4">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="grid grid-cols-[72px_1fr] gap-2">
                    <div className="h-8 animate-pulse rounded bg-muted" />
                    <div className="h-8 animate-pulse rounded bg-muted" />
                </div>
            ))}
        </div>
    );
}
