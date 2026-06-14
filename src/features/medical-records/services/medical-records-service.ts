import axios from 'axios';
import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type {
    ApiEnvelope,
    CreateMedicalRecordRequest,
    PresignUploadRequest,
    PresignUploadResponse,
    RegisterMedicalRecordAttachmentRequest,
    UpdateMedicalRecordRequest,
} from '@nuvet/types';
import type { MedicalRecord, MedicalRecordAttachment } from '../hooks/use-medical-records';

export interface FetchMedicalRecordsParams {
    page?: number;
    limit?: number;
    petId?: string | null;
}

export async function fetchMedicalRecords(params: FetchMedicalRecordsParams = {}) {
    const { petId, ...rest } = params;
    const queryParams: Record<string, unknown> = { ...rest };
    if (petId) queryParams.petId = petId;
    const { data } = await api.get<ApiEnvelope<MedicalRecord[]>>('/medical-records', { params: queryParams });
    return unwrapPaginatedResponse<MedicalRecord>(data);
}

export async function fetchMedicalRecord(id: string) {
    const { data } = await api.get<ApiEnvelope<MedicalRecord>>(`/medical-records/${id}`);
    return unwrapResponse<MedicalRecord>(data);
}

export async function createMedicalRecord(input: CreateMedicalRecordRequest) {
    const { data } = await api.post<ApiEnvelope<MedicalRecord>>('/medical-records', input);
    return unwrapResponse<MedicalRecord>(data);
}

export async function updateMedicalRecord(id: string, input: UpdateMedicalRecordRequest) {
    const { data } = await api.patch<ApiEnvelope<MedicalRecord>>(`/medical-records/${id}`, input);
    return unwrapResponse<MedicalRecord>(data);
}

export async function uploadMedicalRecordAttachment(recordId: string, file: File) {
    const presignPayload: PresignUploadRequest = {
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        folder: 'medical-records',
    };
    const presignRes = await api.post<ApiEnvelope<PresignUploadResponse>>('/files/presign', presignPayload);
    const presign = unwrapResponse<PresignUploadResponse>(presignRes.data);

    await axios.put(presign.url, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
    });

    const registerPayload: RegisterMedicalRecordAttachmentRequest = {
        key: presign.key,
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
    };
    const registerRes = await api.post<ApiEnvelope<MedicalRecordAttachment>>(
        `/medical-records/${recordId}/attachments`,
        registerPayload,
    );
    return unwrapResponse<MedicalRecordAttachment>(registerRes.data);
}
