import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type {
    ApiEnvelope,
    CancelMembershipSubscriptionRequest,
    CreateMembershipPlanRequest,
    MembershipPlan,
    MembershipSubscription,
    SubscribeToPlanRequest,
    UpdateMembershipPlanRequest,
} from '@nuvet/types';

export interface ListMembershipPlansParams {
    tenantId?: string;
    onlyActive?: boolean;
}

export async function listPublicPlans(
    tenantId: string,
    onlyActive = true,
): Promise<MembershipPlan[]> {
    const { data } = await api.get<ApiEnvelope<MembershipPlan[]>>(
        '/memberships/plans',
        { params: { tenantId, onlyActive: String(onlyActive) } },
    );
    return unwrapResponse<MembershipPlan[]>(data) ?? [];
}

export async function listTenantPlans(): Promise<MembershipPlan[]> {
    const { data } = await api.get<ApiEnvelope<MembershipPlan[]>>('/memberships/plans/me');
    return unwrapResponse<MembershipPlan[]>(data) ?? [];
}

export async function listMySubscriptions(): Promise<MembershipSubscription[]> {
    const { data } = await api.get<ApiEnvelope<MembershipSubscription[]>>(
        '/memberships/subscriptions/mine',
    );
    return unwrapResponse<MembershipSubscription[]>(data) ?? [];
}

export async function subscribeToPlan(
    input: SubscribeToPlanRequest,
): Promise<MembershipSubscription> {
    const { data } = await api.post<ApiEnvelope<MembershipSubscription>>(
        '/memberships/subscriptions',
        input,
    );
    return unwrapResponse<MembershipSubscription>(data);
}

export async function cancelSubscription(
    id: string,
    payload: CancelMembershipSubscriptionRequest = {},
): Promise<MembershipSubscription> {
    const { data } = await api.patch<ApiEnvelope<MembershipSubscription>>(
        `/memberships/subscriptions/${id}/cancel`,
        payload,
    );
    return unwrapResponse<MembershipSubscription>(data);
}

export async function pauseSubscription(id: string): Promise<MembershipSubscription> {
    const { data } = await api.patch<ApiEnvelope<MembershipSubscription>>(
        `/memberships/subscriptions/${id}/pause`,
    );
    return unwrapResponse<MembershipSubscription>(data);
}

export async function resumeSubscription(id: string): Promise<MembershipSubscription> {
    const { data } = await api.patch<ApiEnvelope<MembershipSubscription>>(
        `/memberships/subscriptions/${id}/resume`,
    );
    return unwrapResponse<MembershipSubscription>(data);
}

export async function createPlan(
    input: CreateMembershipPlanRequest,
): Promise<MembershipPlan> {
    const { data } = await api.post<ApiEnvelope<MembershipPlan>>(
        '/memberships/plans',
        input,
    );
    return unwrapResponse<MembershipPlan>(data);
}

export async function updatePlan(
    id: string,
    input: UpdateMembershipPlanRequest,
): Promise<MembershipPlan> {
    const { data } = await api.patch<ApiEnvelope<MembershipPlan>>(
        `/memberships/plans/${id}`,
        input,
    );
    return unwrapResponse<MembershipPlan>(data);
}
