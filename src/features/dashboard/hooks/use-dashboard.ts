import { useQuery } from '@tanstack/react-query';
import { fetchHomeSummary, type HomeSummaryParams } from '../services/dashboard-service';

export function useHomeSummary(params: HomeSummaryParams, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['home-summary', params],
        queryFn: () => fetchHomeSummary(params),
        enabled: options.enabled ?? true,
        staleTime: 30000,
    });
}
