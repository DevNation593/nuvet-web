'use client';

import { useEffect } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { useBranches } from '@/features/branches/hooks/use-branches';
import { useBranchesStore } from '@/features/branches/store/branches.store';

export function BranchSelector() {
    const branchesQ = useBranches(true);
    const branches = branchesQ.data ?? [];
    const { activeBranchId, setActiveBranch } = useBranchesStore();

    useEffect(() => {
        if (branches.length === 0) return;

        const current = branches.find((b) => b.id === activeBranchId);
        if (!current) {
            const main = branches.find((b) => b.isMain) ?? branches[0];
            setActiveBranch(main.id);
        }
    }, [activeBranchId, branches, setActiveBranch]);

    if (branches.length <= 1) return null;

    const selected = branches.find((b) => b.id === activeBranchId);

    return (
        <div className="relative">
            <select
                value={activeBranchId ?? ''}
                onChange={(e) => setActiveBranch(e.target.value)}
                className="h-8 appearance-none rounded-md border border-input bg-background pl-7 pr-7 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Seleccionar sucursal"
            >
                {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                        {branch.name}
                    </option>
                ))}
            </select>
            <Building2 className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        </div>
    );
}
