import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    ApiConsentStatus,
    Consent,
    GrantConsentRequest,
    ListConsentsQuery,
} from '@nuvet/types';
import {
    grantConsent,
    listMyConsents,
    revokeConsent,
    type ConsentStatus,
} from '../services/consent-service';

export type { Consent, ConsentStatus };

export interface ConsentFilters extends ListConsentsQuery {
    // Extiende la query compartida con overrides futuros si los hay.
}

export function useMyConsents(filters: ConsentFilters = {}) {
    return useQuery({
        queryKey: ['consent', 'mine', filters],
        queryFn: () => listMyConsents(filters),
    });
}

export function useGrantConsent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: GrantConsentRequest) => grantConsent(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consent', 'mine'] });
        },
    });
}

export function useRevokeConsent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            reason,
        }: {
            id: string;
            reason?: string;
        }) => revokeConsent(id, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consent', 'mine'] });
        },
    });
}

// Re-export del nombre del enum original para código que aún lo importaba.
export type { ApiConsentStatus };
