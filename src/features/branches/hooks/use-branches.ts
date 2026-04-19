import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchBranches,
    fetchBranch,
    createBranch,
    updateBranch,
    deleteBranch,
    transferBranchUsers,
    type CreateBranchInput,
    type UpdateBranchInput,
} from '../services/branches-service';

const BRANCHES_KEY = ['branches'];
const STALE_TIME = 5 * 60 * 1000;

export function useBranches(onlyActive = false) {
    return useQuery({
        queryKey: [...BRANCHES_KEY, { onlyActive }],
        queryFn: () => fetchBranches(onlyActive),
        staleTime: STALE_TIME,
    });
}

export function useBranch(id: string | null) {
    return useQuery({
        queryKey: [...BRANCHES_KEY, id],
        queryFn: () => fetchBranch(id!),
        enabled: !!id,
        staleTime: STALE_TIME,
    });
}

export function useCreateBranch() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateBranchInput) => createBranch(input),
        onSuccess: () => qc.invalidateQueries({ queryKey: BRANCHES_KEY }),
    });
}

export function useUpdateBranch(id: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateBranchInput) => updateBranch(id!, input),
        onSuccess: () => qc.invalidateQueries({ queryKey: BRANCHES_KEY }),
    });
}

export function useDeleteBranch() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteBranch(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: BRANCHES_KEY }),
    });
}

export function useTransferBranchUsers() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ fromId, toId }: { fromId: string; toId: string }) =>
            transferBranchUsers(fromId, toId),
        onSuccess: () => qc.invalidateQueries({ queryKey: BRANCHES_KEY }),
    });
}
