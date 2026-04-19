import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchExternalInvoiceStatus,
    fetchTicketInvoiceStatus,
    issuePosTicketInvoice,
    fetchInvoices,
} from '../services/billing-service';

export type BuyerIdType = '04' | '05' | '06' | '07' | '08';

export interface InvoiceBuyerInput {
    legalName: string;
    taxId: string;
    idType?: BuyerIdType;
    email?: string;
    phone?: string;
    address?: string;
}

export interface IssuePosTicketInvoiceInput {
    buyer?: InvoiceBuyerInput;
    establishmentCode?: string;
    emissionPointCode?: string;
    asyncEmission?: boolean;
}

export interface IssuedInvoice {
    providerInvoiceId: string;
    providerStatus: string;
    documentNumber?: string;
    accessKey?: string;
    authorizationCode?: string;
    authorizedAt?: string;
    pdfUrl?: string;
    xmlUrl?: string;
    raw?: unknown;
}

export interface IssuePosTicketInvoiceResult {
    ticketId: string;
    invoice: IssuedInvoice;
}

export interface ElectronicInvoiceStatus {
    providerInvoiceId: string;
    providerStatus: string;
    documentNumber?: string;
    accessKey?: string;
    authorizedAt?: string;
    rejectedReason?: string;
    pdfUrl?: string;
    xmlUrl?: string;
    raw?: unknown;
}

export interface TicketInvoiceStatus {
    ticketId: string;
    providerInvoiceId: string;
    persisted?: {
        status?: string;
        documentNumber?: string;
        accessKey?: string;
        issuedAt?: string;
        authorizedAt?: string;
    };
    external: ElectronicInvoiceStatus;
}

export interface InvoiceListItem {
    id: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    ticketStatus: string;
    invoiceStatus: string;
    invoiceNumber?: string;
    providerInvoiceId: string;
    accessKey?: string;
    issuedAt?: string;
    authorizedAt?: string;
    createdAt: string;
    notes?: string;
    client?: {
        name: string;
        identification?: string;
        email?: string;
    } | null;
    paymentMethod: string;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
}

export interface InvoiceListParams {
    page?: number;
    limit?: number;
    invoiceStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}

export function useInvoices(params: InvoiceListParams = {}, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['billing-invoices', params],
        queryFn: () => fetchInvoices(params),
        enabled: options.enabled ?? true,
        staleTime: 30_000,
    });
}

export function useIssuePosTicketInvoice(ticketId: string | null) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: IssuePosTicketInvoiceInput) => issuePosTicketInvoice(ticketId!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['billing-invoices'] });
        },
    });
}

const INVOICE_POLL_INTERVAL = 15_000;

function isPendingStatus(status?: string | null): boolean {
    if (!status) return false;
    const s = status.trim().toUpperCase();
    return s === 'PENDING' || s === 'PROCESSING' || s === 'IN_PROGRESS';
}

export function useExternalInvoiceStatus(
    providerInvoiceId: string | null,
    options: { enabled?: boolean; pollWhilePending?: boolean } = {},
) {
    const poll = options.pollWhilePending ?? false;
    const query = useQuery({
        queryKey: ['billing-external-status', providerInvoiceId],
        queryFn: () => fetchExternalInvoiceStatus(providerInvoiceId!),
        enabled: (options.enabled ?? true) && !!providerInvoiceId,
        refetchInterval: (query) =>
            poll && isPendingStatus(query.state.data?.providerStatus)
                ? INVOICE_POLL_INTERVAL
                : false,
    });
    return query;
}

export function useTicketInvoiceStatus(
    ticketId: string | null,
    options: { enabled?: boolean; pollWhilePending?: boolean } = {},
) {
    const poll = options.pollWhilePending ?? false;
    const query = useQuery({
        queryKey: ['billing-ticket-status', ticketId],
        queryFn: () => fetchTicketInvoiceStatus(ticketId!),
        enabled: (options.enabled ?? true) && !!ticketId,
        refetchInterval: (query) =>
            poll && isPendingStatus(query.state.data?.external?.providerStatus)
                ? INVOICE_POLL_INTERVAL
                : false,
    });
    return query;
}
