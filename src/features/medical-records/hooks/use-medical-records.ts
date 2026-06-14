import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    CreateMedicalRecordRequest,
    UpdateMedicalRecordRequest,
} from '@nuvet/types';
import {
    fetchMedicalRecords,
    fetchMedicalRecord,
    createMedicalRecord,
    updateMedicalRecord,
    uploadMedicalRecordAttachment,
} from '../services/medical-records-service';

export interface MedicalRecord {
    id: string;
    tenantId: string;
    petId: string;
    vetId: string;
    appointmentId?: string;
    chiefComplaint: string;
    diagnosis: string;
    treatment: string;
    prescriptions?: string;
    notes?: string;
    weight?: number;
    temperature?: number;
    heartRate?: number;
    createdAt: string;
    pet?: { id: string; name: string; species?: string };
    vet?: { id: string; firstName: string; lastName: string };
    fileAttachments?: MedicalRecordAttachment[];
}

export interface MedicalRecordAttachment {
    id: string;
    key: string;
    filename: string;
    contentType: string;
    size: number;
    createdAt: string;
}

export type CreateMedicalRecordInput = CreateMedicalRecordRequest;

export function useMedicalRecords(petId: string | null, params: { page?: number; limit?: number } = {}) {
    return useQuery({
        queryKey: ['medical-records', petId, params],
        queryFn: () => fetchMedicalRecords({ ...params, petId }),
    });
}

export function useMedicalRecord(id: string | null) {
    return useQuery({
        queryKey: ['medical-record', id],
        queryFn: () => fetchMedicalRecord(id!),
        enabled: !!id,
    });
}

export function useCreateMedicalRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateMedicalRecordInput) => createMedicalRecord(input),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['medical-records', variables.petId] });
            queryClient.invalidateQueries({ queryKey: ['medical-records'] });
        },
    });
}

export function useUpdateMedicalRecord(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateMedicalRecordRequest) => updateMedicalRecord(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medical-records'] });
            if (id) queryClient.invalidateQueries({ queryKey: ['medical-record', id] });
        },
    });
}

export function useUploadMedicalRecordAttachment(recordId: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (file: File) => uploadMedicalRecordAttachment(recordId!, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medical-records'] });
            if (recordId) queryClient.invalidateQueries({ queryKey: ['medical-record', recordId] });
        },
    });
}
