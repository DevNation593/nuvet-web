import api from '@/shared/lib/api-client';
import type { ApiEnvelope } from '@nuvet/types';
import type {
    ElectronicInvoiceStatus,
    IssuePosTicketInvoiceInput,
    IssuePosTicketInvoiceResult,
} from '../hooks/use-billing';

export async function issuePosTicketInvoice(ticketId: string, input: IssuePosTicketInvoiceInput) {
    const { data } = await api.post<ApiEnvelope<IssuePosTicketInvoiceResult>>(
        `/billing/pos-tickets/${ticketId}/issue`,
        input,
    );
    return (data?.data ?? data) as IssuePosTicketInvoiceResult;
}

export async function fetchExternalInvoiceStatus(providerInvoiceId: string) {
    const { data } = await api.get<ApiEnvelope<ElectronicInvoiceStatus>>(
        `/billing/external/${providerInvoiceId}/status`,
    );
    return (data?.data ?? data) as ElectronicInvoiceStatus;
}
