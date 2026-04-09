import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchExternalInvoiceStatus, issuePosTicketInvoice } from '../services/billing-service';

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
    raw?: unknown;
}

export function useIssuePosTicketInvoice(ticketId: string | null) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: IssuePosTicketInvoiceInput) => issuePosTicketInvoice(ticketId!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-transactions'] });
        },
    });
}

export function useExternalInvoiceStatus(providerInvoiceId: string | null, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['billing-external-status', providerInvoiceId],
        queryFn: () => fetchExternalInvoiceStatus(providerInvoiceId!),
        enabled: (options.enabled ?? true) && !!providerInvoiceId,
    });
}
