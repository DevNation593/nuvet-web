import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
    VaccinationCampaign,
    VaccinationRegistration,
} from '@nuvet/types';
import {
    listVaccinationCampaigns,
    getVaccinationCampaign,
    createVaccinationCampaign,
    updateVaccinationCampaign,
    openVaccinationCampaign,
    closeVaccinationCampaign,
    completeVaccinationCampaign,
    cancelVaccinationCampaign,
    deleteVaccinationCampaign,
    listCampaignRegistrations,
    registerPetToCampaign,
    markAttended,
    markNoShow,
    cancelRegistration,
} from './vaccination-campaigns-service';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
    VaccinationCampaign,
    VaccinationRegistration,
} from '@nuvet/types';

vi.mock('@/shared/lib/api-client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

import {
    listVaccinationCampaigns,
    getVaccinationCampaign,
    createVaccinationCampaign,
    updateVaccinationCampaign,
    openVaccinationCampaign,
    closeVaccinationCampaign,
    completeVaccinationCampaign,
    cancelVaccinationCampaign,
    deleteVaccinationCampaign,
    listCampaignRegistrations,
    registerPetToCampaign,
    markAttended,
    markNoShow,
    cancelRegistration,
} from './vaccination-campaigns-service';
import api from '@/shared/lib/api-client';

const mockedApi = api as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
};

const makeCampaign = (overrides: Partial<VaccinationCampaign> = {}): VaccinationCampaign => ({
    id: 'c-1',
    tenantId: 't-1',
    name: 'Jornada antirrábica',
    description: null,
    vaccineName: 'Antirrábica',
    startsAt: '2026-08-01T14:00:00.000Z',
    endsAt: '2026-08-01T18:00:00.000Z',
    location: 'Parque La Carolina',
    capacity: 200,
    priceCents: 0,
    currency: 'USD',
    status: 'DRAFT',
    notes: null,
    createdById: 'user-1',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
});

const makeRegistration = (
    overrides: Partial<VaccinationRegistration> = {},
): VaccinationRegistration => ({
    id: 'r-1',
    tenantId: 't-1',
    campaignId: 'c-1',
    petId: 'p-1',
    ownerId: 'o-1',
    status: 'REGISTERED',
    attendedAt: null,
    notes: null,
    createdAt: '2026-07-02T00:00:00.000Z',
    updatedAt: '2026-07-02T00:00:00.000Z',
    ...overrides,
});

const envelopeOf = <T>(data: T) => ({ data: { data, meta: { page: 1, totalPages: 1, total: 1 } } });

beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedApi.patch.mockReset();
    mockedApi.put.mockReset();
    mockedApi.delete.mockReset();
});

describe('vaccination-campaigns-service', () => {
    describe('listVaccinationCampaigns', () => {
        it('hits /vaccinations/campaigns with query params and unwraps paginated response', async () => {
            const campaigns = [makeCampaign()];
            mockedApi.get.mockResolvedValueOnce(envelopeOf(campaigns));
            const result = await listVaccinationCampaigns({ status: 'OPEN', page: 2 });
            expect(mockedApi.get).toHaveBeenCalledWith('/vaccinations/campaigns', {
                params: { status: 'OPEN', page: 2 },
            });
            expect(result.data).toEqual(campaigns);
            expect(result.total).toBe(1);
        });

        it('returns empty array and total=0 when response is empty', async () => {
            mockedApi.get.mockResolvedValueOnce({
                data: { data: [], meta: { page: 1, totalPages: 0, total: 0 } },
            });
            const result = await listVaccinationCampaigns();
            expect(result.data).toEqual([]);
            expect(result.total).toBe(0);
        });
    });

    describe('getVaccinationCampaign', () => {
        it('hits /vaccinations/campaigns/:id and unwraps single-item response', async () => {
            const campaign = makeCampaign({ id: 'c-42' });
            mockedApi.get.mockResolvedValueOnce({ data: { data: campaign } });
            const result = await getVaccinationCampaign('c-42');
            expect(mockedApi.get).toHaveBeenCalledWith('/vaccinations/campaigns/c-42');
            expect(result).toEqual(campaign);
        });
    });

    describe('createVaccinationCampaign', () => {
        it('posts the input and unwraps the response', async () => {
            const created = makeCampaign({ id: 'c-new', status: 'DRAFT' });
            mockedApi.post.mockResolvedValueOnce({ data: { data: created } });
            const result = await createVaccinationCampaign({
                name: 'Nueva',
                vaccineName: 'Rabia',
                startsAt: '2026-08-01T14:00:00.000Z',
                endsAt: '2026-08-01T18:00:00.000Z',
            });
            expect(mockedApi.post).toHaveBeenCalledWith(
                '/vaccinations/campaigns',
                expect.objectContaining({ name: 'Nueva', vaccineName: 'Rabia' }),
            );
            expect(result.id).toBe('c-new');
        });
    });

    describe('updateVaccinationCampaign', () => {
        it('patches the input at /vaccinations/campaigns/:id', async () => {
            const updated = makeCampaign({ name: 'Renombrada' });
            mockedApi.patch.mockResolvedValueOnce({ data: { data: updated } });
            const result = await updateVaccinationCampaign('c-1', { name: 'Renombrada' });
            expect(mockedApi.patch).toHaveBeenCalledWith(
                '/vaccinations/campaigns/c-1',
                expect.objectContaining({ name: 'Renombrada' }),
            );
            expect(result.name).toBe('Renombrada');
        });
    });

    describe('transitions', () => {
        it('open posts to /open', async () => {
            const campaign = makeCampaign({ status: 'OPEN' });
            mockedApi.patch.mockResolvedValueOnce({ data: { data: campaign } });
            const result = await openVaccinationCampaign('c-1');
            expect(mockedApi.patch).toHaveBeenCalledWith(
                '/vaccinations/campaigns/c-1',
                expect.objectContaining({ status: 'OPEN' }),
            );
            expect(result).toEqual(campaign);
        });

        it('close posts to ... with status CLOSED', async () => {
            const campaign = makeCampaign({ status: 'CLOSED' });
            mockedApi.patch.mockResolvedValueOnce({ data: { data: campaign } });
            const result = await closeVaccinationCampaign('c-1');
            expect(mockedApi.patch).toHaveBeenCalledWith(
                '/vaccinations/campaigns/c-1',
                expect.objectContaining({ status: 'CLOSED' }),
            );
            expect(result).toEqual(campaign);
        });

        it('complete posts with status COMPLETED', async () => {
            const campaign = makeCampaign({ status: 'COMPLETED' });
            mockedApi.patch.mockResolvedValueOnce({ data: { data: campaign } });
            const result = await completeVaccinationCampaign('c-1');
            expect(mockedApi.patch).toHaveBeenCalledWith(
                '/vaccinations/campaigns/c-1',
                expect.objectContaining({ status: 'COMPLETED' }),
            );
            expect(result).toEqual(campaign);
        });

        it('cancel posts with status CANCELLED', async () => {
            const campaign = makeCampaign({ status: 'CANCELLED' });
            mockedApi.patch.mockResolvedValueOnce({ data: { data: campaign } });
            const result = await cancelVaccinationCampaign('c-1');
            expect(mockedApi.patch).toHaveBeenCalledWith(
                '/vaccinations/campaigns/c-1',
                expect.objectContaining({ status: 'CANCELLED' }),
            );
            expect(result).toEqual(campaign);
        });
    });

    describe('deleteVaccinationCampaign', () => {
        it('deletes /vaccinations/campaigns/:id', async () => {
            mockedApi.delete.mockResolvedValueOnce({});
            await deleteVaccinationCampaign('c-1');
            expect(mockedApi.delete).toHaveBeenCalledWith('/vaccinations/campaigns/c-1');
        });
    });

    describe('listCampaignRegistrations', () => {
        it('returns { data, total } for /vaccinations/campaigns/:id/registrations', async () => {
            const regs = [makeRegistration(), makeRegistration({ id: 'r-2' })];
            mockedApi.get.mockResolvedValueOnce({
                data: { data: regs, meta: { page: 1, totalPages: 1, total: 2 } },
            });
            const result = await listCampaignRegistrations('c-1');
            expect(mockedApi.get).toHaveBeenCalledWith(
                '/vaccinations/campaigns/c-1/registrations',
                { params: { page: 1, pageSize: 50 } },
            );
            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
        });
    });

    describe('registerPetToCampaign', () => {
        it('posts to /vaccinations/campaigns/:id/registrations', async () => {
            const reg = makeRegistration();
            mockedApi.post.mockResolvedValueOnce({ data: { data: reg } });
            const result = await registerPetToCampaign('c-1', { petId: 'p-1' });
            expect(mockedApi.post).toHaveBeenCalledWith(
                '/vaccinations/campaigns/c-1/registrations',
                { petId: 'p-1' },
            );
            expect(result).toEqual(reg);
        });
    });

    describe('markAttended / markNoShow / cancelRegistration', () => {
        it('markAttended patches /attend with empty body by default', async () => {
            const reg = makeRegistration({ status: 'ATTENDED' });
            mockedApi.patch.mockResolvedValueOnce({ data: { data: reg } });
            const result = await markAttended('r-1');
            expect(mockedApi.patch).toHaveBeenCalledWith(
                '/vaccinations/campaigns/registrations/r-1/attend',
                {},
            );
            expect(result.status).toBe('ATTENDED');
        });

        it('markAttended forwards optional fields', async () => {
            const reg = makeRegistration({ status: 'ATTENDED' });
            mockedApi.patch.mockResolvedValueOnce({ data: { data: reg } });
            await markAttended('r-1', { notes: 'listo' });
            expect(mockedApi.patch).toHaveBeenCalledWith(
                '/vaccinations/campaigns/registrations/r-1/attend',
                { notes: 'listo' },
            );
        });

        it('markNoShow patches /no-show', async () => {
            const reg = makeRegistration({ status: 'NO_SHOW' });
            mockedApi.patch.mockResolvedValueOnce({ data: { data: reg } });
            const result = await markNoShow('r-1');
            expect(mockedApi.patch).toHaveBeenCalledWith(
                '/vaccinations/campaigns/registrations/r-1/no-show',
            );
            expect(result.status).toBe('NO_SHOW');
        });

        it('cancelRegistration deletes /cancel', async () => {
            mockedApi.delete.mockResolvedValueOnce({});
            await cancelRegistration('r-1');
            expect(mockedApi.delete).toHaveBeenCalledWith(
                '/vaccinations/campaigns/registrations/r-1',
            );
        });
    });
});
