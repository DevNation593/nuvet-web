'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import {
    MobileCard,
    MobileCardHeader,
    MobileCardTitle,
    MobileCardContent,
    MobileCardRow,
    MobileCardLabel,
    MobileCardValue,
    MobileCardActions,
} from '@/shared/components/ui/mobile-card';
import { cn } from '@/shared/lib/utils';
import { useIsMobile } from '@/shared/hooks/use-media-query';

export interface ResponsiveColumn<T> {
    key: string;
    header: string;
    cell: (item: T) => React.ReactNode;
    mobileLabel?: string;
    hideOnMobile?: boolean;
    headerClassName?: string;
    cellClassName?: string;
}

export interface ResponsiveDataTableProps<T> {
    data: T[];
    columns: ResponsiveColumn<T>[];
    getRowKey: (item: T) => string;
    maxHeight?: string;
    minWidth?: string;
    onRowClick?: (item: T) => void;
    getMobileTitle?: (item: T) => React.ReactNode;
    getMobileBadge?: (item: T) => React.ReactNode;
    getMobileActions?: (item: T) => React.ReactNode;
    emptyState?: React.ReactNode;
}

function DefaultEmptyState() {
    return (
        <div className="py-8 text-center text-sm text-muted-foreground">
            No hay datos para mostrar.
        </div>
    );
}

export function ResponsiveDataTable<T>(props: ResponsiveDataTableProps<T>): React.ReactElement {
    const {
        data,
        columns,
        getRowKey,
        maxHeight = 'max-h-[600px]',
        minWidth = 'min-w-[760px]',
        onRowClick,
        getMobileTitle,
        getMobileBadge,
        getMobileActions,
        emptyState,
    } = props;

    const isMobile = useIsMobile();

    if (data.length === 0) {
        return <>{emptyState ?? <DefaultEmptyState />}</>;
    }

    if (isMobile) {
        return (
            <MobileView
                data={data}
                columns={columns}
                getRowKey={getRowKey}
                onRowClick={onRowClick}
                getMobileTitle={getMobileTitle}
                getMobileBadge={getMobileBadge}
                getMobileActions={getMobileActions}
            />
        );
    }

    return (
        <DesktopView
            data={data}
            columns={columns}
            getRowKey={getRowKey}
            maxHeight={maxHeight}
            minWidth={minWidth}
            onRowClick={onRowClick}
        />
    );
}

function DesktopView<T>({
    data,
    columns,
    getRowKey,
    maxHeight,
    minWidth,
    onRowClick,
}: Required<Pick<ResponsiveDataTableProps<T>, 'data' | 'columns' | 'getRowKey' | 'maxHeight' | 'minWidth'>> & {
    onRowClick?: (item: T) => void;
}): React.ReactElement {
    return (
        <div className={cn('relative w-full overflow-x-auto overflow-y-auto rounded-md border', maxHeight)}>
            <Table className={cn('w-full caption-bottom text-sm', minWidth)}>
                <TableHeader sticky>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col.key} className={cn(col.headerClassName)}>
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow
                            key={getRowKey(item)}
                            clickable={Boolean(onRowClick)}
                            onClick={onRowClick ? () => onRowClick(item) : undefined}
                        >
                            {columns.map((col) => (
                                <TableCell key={col.key} className={cn(col.cellClassName)}>
                                    {col.cell(item)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function MobileView<T>({
    data,
    columns,
    getRowKey,
    onRowClick,
    getMobileTitle,
    getMobileBadge,
    getMobileActions,
}: Pick<
    ResponsiveDataTableProps<T>,
    'data' | 'columns' | 'getRowKey' | 'onRowClick' | 'getMobileTitle' | 'getMobileBadge' | 'getMobileActions'
>): React.ReactElement {
    const visibleColumns = columns.filter((c) => !c.hideOnMobile);
    const actionsColumn = columns.find((c) => c.hideOnMobile && c.key === 'actions');
    const showActionsInRow = Boolean(getMobileActions) || Boolean(actionsColumn);

    return (
        <div className="space-y-3">
            {data.map((item) => {
                const title = getMobileTitle ? getMobileTitle(item) : null;
                const badge = getMobileBadge ? getMobileBadge(item) : null;
                const onCardClick = onRowClick ? () => onRowClick(item) : undefined;
                return (
                    <MobileCard
                        key={getRowKey(item)}
                        onClick={onCardClick}
                        className={cn(onCardClick && 'cursor-pointer')}
                    >
                        {(title || badge) && (
                            <MobileCardHeader>
                                {title ? (
                                    <MobileCardTitle>{title}</MobileCardTitle>
                                ) : (
                                    <span />
                                )}
                                {badge}
                            </MobileCardHeader>
                        )}
                        <MobileCardContent>
                            {visibleColumns.map((col) => (
                                <MobileCardRow key={col.key}>
                                    <MobileCardLabel>
                                        {col.mobileLabel ?? col.header}
                                    </MobileCardLabel>
                                    <MobileCardValue>
                                        {col.cell(item)}
                                    </MobileCardValue>
                                </MobileCardRow>
                            ))}
                        </MobileCardContent>
                        {showActionsInRow && (
                            <MobileCardActions>
                                {getMobileActions
                                    ? getMobileActions(item)
                                    : actionsColumn
                                      ? actionsColumn.cell(item)
                                      : null}
                            </MobileCardActions>
                        )}
                    </MobileCard>
                );
            })}
        </div>
    );
}