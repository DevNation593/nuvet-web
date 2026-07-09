import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    CancelMembershipSubscriptionRequest,
    CreateMembershipPlanRequest,
    MembershipPlan,
    MembershipSubscription,
    SubscribeToPlanRequest,
    UpdateMembershipPlanRequest,
} from '@nuvet/types';
import {
    cancelSubscription,
    createPlan,
    listMySubscriptions,
    listPublicPlans,
    listTenantPlans,
    pauseSubscription,
    resumeSubscription,
    subscribeToPlan,
    updatePlan,
} from '../services/memberships-service';

export function usePublicPlans(tenantId: string | undefined, onlyActive = true) {
    return useQuery<MembershipPlan[]>({
        queryKey: ['membership-plans', 'public', tenantId, onlyActive],
        queryFn: () => listPublicPlans(tenantId!, onlyActive),
        enabled: !!tenantId,
    });
}

export function useTenantPlans() {
    return useQuery<MembershipPlan[]>({
        queryKey: ['membership-plans', 'tenant'],
        queryFn: () => listTenantPlans(),
    });
}

export function useMySubscriptions() {
    return useQuery<MembershipSubscription[]>({
        queryKey: ['membership-subscriptions', 'mine'],
        queryFn: () => listMySubscriptions(),
    });
}

export function useSubscribeToPlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: SubscribeToPlanRequest) => subscribeToPlan(input),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['membership-subscriptions', 'mine'] });
        },
    });
}

export function useCancelSubscription() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: { id: string; payload?: CancelMembershipSubscriptionRequest }) =>
            cancelSubscription(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['membership-subscriptions', 'mine'] });
        },
    });
}

export function usePauseSubscription() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pauseSubscription(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['membership-subscriptions', 'mine'] });
        },
    });
}

export function useResumeSubscription() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => resumeSubscription(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['membership-subscriptions', 'mine'] });
        },
    });
}

export function useCreateMembershipPlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateMembershipPlanRequest) => createPlan(input),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['membership-plans'] });
        },
    });
}

export function useUpdateMembershipPlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            input,
        }: { id: string; input: UpdateMembershipPlanRequest }) =>
            updatePlan(id, input),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['membership-plans'] });
        },
    });
}
