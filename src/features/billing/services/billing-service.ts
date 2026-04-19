import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type { ApiEnvelope } from '@nuvet/types';
import type {
    ElectronicInvoiceStatus,
    InvoiceListItem,
    InvoiceListParams,
    IssuePosTicketInvoiceInput,
    IssuePosTicketInvoiceResult,
    TicketInvoiceStatus,
} from '../hooks/use-billing';

export async function fetchInvoices(params: InvoiceListParams = {}) {
    const { data } = await api.get<ApiEnvelope<InvoiceListItem[]>>('/billing/invoices', { params });
    return unwrapPaginatedResponse<InvoiceListItem>(data);
}

export async function issuePosTicketInvoice(ticketId: string, input: IssuePosTicketInvoiceInput) {
    const { data } = await api.post<ApiEnvelope<IssuePosTicketInvoiceResult>>(
        `/billing/pos-tickets/${ticketId}/issue`,
        input,
    );
    return unwrapResponse<IssuePosTicketInvoiceResult>(data);
}

export async function fetchExternalInvoiceStatus(providerInvoiceId: string) {
    const { data } = await api.get<ApiEnvelope<ElectronicInvoiceStatus>>(
        `/billing/external/${providerInvoiceId}/status`,
    );
    return unwrapResponse<ElectronicInvoiceStatus>(data);
}

export async function fetchTicketInvoiceStatus(ticketId: string) {
    const { data } = await api.get<ApiEnvelope<TicketInvoiceStatus>>(
        `/billing/pos-tickets/${ticketId}/status`,
    );
    return unwrapResponse<TicketInvoiceStatus>(data);
}

export async function fetchExternalInvoiceDocumentUrl(
    providerInvoiceId: string,
    format: 'pdf' | 'xml',
) {
    const { data } = await api.get<
        ApiEnvelope<{ providerInvoiceId: string; format: 'pdf' | 'xml'; url: string }>
    >(`/billing/external/${providerInvoiceId}/${format}`);
    return unwrapResponse<{ providerInvoiceId: string; format: 'pdf' | 'xml'; url: string }>(data);
}
