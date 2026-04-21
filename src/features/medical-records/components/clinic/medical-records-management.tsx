'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { usePets } from '@/features/pets/hooks/use-pets';
import {
    MedicalRecord,
    useCreateMedicalRecord,
    useMedicalRecord,
    useMedicalRecords,
    useUploadMedicalRecordAttachment,
} from '@/features/medical-records/hooks/use-medical-records';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { FileUp, Loader2, Plus, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

const medicalRecordSchema = z.object({
    petId: z.string().min(1, 'Selecciona una mascota'),
    appointmentId: z.string().optional(),
    chiefComplaint: z.string().min(3, 'Motivo requerido'),
    diagnosis: z.string().min(3, 'Diagnóstico requerido'),
    treatment: z.string().min(3, 'Tratamiento requerido'),
    prescriptions: z.string().optional(),
    notes: z.string().optional(),
    weight: z.preprocess(
        (value) => (value === '' || value == null ? undefined : value),
        z.coerce.number().positive().optional(),
    ),
    temperature: z.preprocess(
        (value) => (value === '' || value == null ? undefined : value),
        z.coerce.number().positive().optional(),
    ),
    heartRate: z.preprocess(
        (value) => (value === '' || value == null ? undefined : value),
        z.coerce.number().int().positive().optional(),
    ),
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;

export function MedicalRecordsManagement() {
    const [selectedPetId, setSelectedPetId] = useState('');
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const petIdFromUrl = params.get('petId') ?? '';
        const recordIdFromUrl = params.get('recordId');

        if (petIdFromUrl) {
            setSelectedPetId(petIdFromUrl);
        }
        if (recordIdFromUrl) {
            setSelectedRecordId(recordIdFromUrl);
        }
    }, []);

    const petsQuery = usePets({ limit: 100 });
    const recordsQuery = useMedicalRecords(selectedPetId || null, { limit: 50 });
    const recordQuery = useMedicalRecord(selectedRecordId);
    const createRecord = useCreateMedicalRecord();
    const uploadAttachment = useUploadMedicalRecordAttachment(selectedRecordId);

    const pets = useMemo(
        () =>
            ((petsQuery.data?.data ?? []) as Array<{
                id: string;
                name: string;
                owner?: { firstName?: string; lastName?: string };
            }>),
        [petsQuery.data?.data],
    );
    const records = recordsQuery.data?.data ?? [];
    const selectedRecord = recordQuery.data as MedicalRecord | undefined;

    const petLabel = useMemo(() => {
        if (!selectedPetId) return 'Selecciona un paciente';
        const pet = pets.find((item) => item.id === selectedPetId);
        if (!pet) return 'Paciente';
        const ownerName = `${pet.owner?.firstName ?? ''} ${pet.owner?.lastName ?? ''}`.trim();
        return ownerName ? `${pet.name} · ${ownerName}` : pet.name;
    }, [pets, selectedPetId]);

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Consulta</h2>
                    <p className="text-sm text-muted-foreground">Historial médico y evolución clínica</p>
                </div>
                <Button onClick={() => setModalOpen(true)} disabled={!selectedPetId} title="Crear nuevo registro médico">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Consulta
                </Button>
            </header>

            <Card>
                <CardHeader className="pb-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_260px]">
                        <select
                            aria-label="Seleccionar paciente"
                            title="Seleccionar paciente"
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={selectedPetId}
                            onChange={(event) => {
                                setSelectedPetId(event.target.value);
                                setSelectedRecordId(null);
                            }}
                        >
                            <option value="">Selecciona paciente</option>
                            {pets.map((pet) => (
                                <option key={pet.id} value={pet.id}>
                                    {pet.name}
                                </option>
                            ))}
                        </select>
                        <div className="h-10 rounded-md border border-input bg-muted/20 px-3 text-sm leading-10 text-muted-foreground">
                            {petLabel}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Consultas registradas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!selectedPetId ? (
                            <ClinicStateCard message="Selecciona un paciente para ver consultas." />
                        ) : recordsQuery.isLoading ? (
                            <ClinicRowsSkeleton rows={6} />
                        ) : recordsQuery.isError ? (
                            <ClinicStateCard
                                message="No se pudieron cargar las consultas."
                                tone="error"
                                action={
                                    <Button variant="outline" onClick={() => recordsQuery.refetch()} title="Actualizar datos">
                                        Reintentar
                                    </Button>
                                }
                            />
                        ) : records.length === 0 ? (
                            <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 p-6 text-center">
                                <Stethoscope className="h-6 w-6 text-muted-foreground" />
                                <p className="text-sm font-medium">Sin consultas registradas</p>
                                <p className="text-xs text-muted-foreground">
                                    Crea la primera consulta médica para este paciente.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {records.map((record) => (
                                    <button
                                        key={record.id}
                                        type="button"
                                        onClick={() => setSelectedRecordId(record.id)}
                                        className={`w-full px-4 py-3 text-left transition hover:bg-muted/20 ${
                                            selectedRecordId === record.id ? 'bg-muted/30' : ''
                                        }`}
                                    >
                                        <p className="text-sm font-semibold">
                                            {format(new Date(record.createdAt), "d MMM yyyy · HH:mm", {
                                                locale: es,
                                            })}
                                        </p>
                                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                            Motivo: {record.chiefComplaint}
                                        </p>
                                        <p className="line-clamp-1 text-xs text-muted-foreground">
                                            Diagnóstico: {record.diagnosis}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-base">Detalle de consulta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 text-sm">
                        {recordQuery.isLoading && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Cargando consulta...
                            </div>
                        )}
                        {!recordQuery.isLoading && !selectedRecord && (
                            <p className="text-muted-foreground">Selecciona una consulta para ver el detalle.</p>
                        )}
                        {!recordQuery.isLoading && selectedRecord && (
                            <>
                                <DetailItem label="Motivo" value={selectedRecord.chiefComplaint} />
                                <DetailItem label="Diagnóstico" value={selectedRecord.diagnosis} />
                                <DetailItem label="Tratamiento" value={selectedRecord.treatment} />
                                <DetailItem label="Prescripción" value={selectedRecord.prescriptions ?? '—'} />
                                <DetailItem label="Notas" value={selectedRecord.notes ?? '—'} />

                                <div className="rounded-md border p-3">
                                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Adjuntos
                                    </p>
                                    {selectedRecord.fileAttachments && selectedRecord.fileAttachments.length > 0 ? (
                                        <ul className="space-y-2">
                                            {selectedRecord.fileAttachments.map((attachment) => (
                                                <li key={attachment.id} className="rounded border bg-muted/20 px-2 py-1 text-xs">
                                                    <p className="font-medium">{attachment.filename}</p>
                                                    <p className="text-muted-foreground">
                                                        {(attachment.size / 1024).toFixed(1)} KB · {attachment.contentType}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">No hay adjuntos.</p>
                                    )}

                                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted">
                                        <FileUp className="h-4 w-4" />
                                        Subir adjunto
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={async (event) => {
                                                const file = event.target.files?.[0];
                                                if (!file) return;
                                                try {
                                                    await uploadAttachment.mutateAsync(file);
                                                    toast.success('Adjunto cargado');
                                                } catch {
                                                    toast.error('No se pudo cargar el adjunto');
                                                } finally {
                                                    event.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <MedicalRecordModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                pets={pets}
                defaultPetId={selectedPetId}
                loading={createRecord.isPending}
                onSubmit={async (values) => {
                    try {
                        const created = await createRecord.mutateAsync(values);
                        setSelectedRecordId(created.id);
                        setModalOpen(false);
                        toast.success('Consulta creada');
                    } catch (error: unknown) {
                        const message =
                            error && typeof error === 'object' && 'response' in error
                                ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                                : undefined;
                        toast.error(message ?? 'No se pudo crear la consulta');
                    }
                }}
            />
        </div>
    );
}

function MedicalRecordModal({
    open,
    onOpenChange,
    pets,
    defaultPetId,
    onSubmit,
    loading,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pets: Array<{ id: string; name: string }>;
    defaultPetId: string;
    onSubmit: (values: MedicalRecordFormValues) => Promise<void>;
    loading: boolean;
}) {
    const form = useForm<MedicalRecordFormValues>({
        resolver: zodResolver(medicalRecordSchema),
        values: {
            petId: defaultPetId,
            appointmentId: '',
            chiefComplaint: '',
            diagnosis: '',
            treatment: '',
            prescriptions: '',
            notes: '',
            weight: undefined,
            temperature: undefined,
            heartRate: undefined,
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Nueva consulta</DialogTitle>
                    <DialogDescription>Registra diagnóstico, tratamiento y observaciones.</DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-3"
                    onSubmit={form.handleSubmit(async (values) => {
                        await onSubmit(values);
                    })}
                >
                    <InputField label="Paciente" error={form.formState.errors.petId?.message}>
                        <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('petId')}>
                            <option value="">Seleccionar paciente</option>
                            {pets.map((pet) => (
                                <option key={pet.id} value={pet.id}>
                                    {pet.name}
                                </option>
                            ))}
                        </select>
                    </InputField>

                    <InputField label="Motivo de consulta" error={form.formState.errors.chiefComplaint?.message}>
                        <textarea rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('chiefComplaint')} />
                    </InputField>
                    <InputField label="Diagnóstico" error={form.formState.errors.diagnosis?.message}>
                        <textarea rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('diagnosis')} />
                    </InputField>
                    <InputField label="Tratamiento" error={form.formState.errors.treatment?.message}>
                        <textarea rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('treatment')} />
                    </InputField>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <InputField label="Peso (kg)" error={form.formState.errors.weight?.message}>
                            <input type="number" step="0.1" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('weight')} />
                        </InputField>
                        <InputField label="Temperatura (°C)" error={form.formState.errors.temperature?.message}>
                            <input type="number" step="0.1" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('temperature')} />
                        </InputField>
                        <InputField label="Frecuencia cardíaca" error={form.formState.errors.heartRate?.message}>
                            <input type="number" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('heartRate')} />
                        </InputField>
                    </div>

                    <InputField label="Prescripción" error={form.formState.errors.prescriptions?.message}>
                        <textarea rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('prescriptions')} />
                    </InputField>
                    <InputField label="Notas adicionales" error={form.formState.errors.notes?.message}>
                        <textarea rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('notes')} />
                    </InputField>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} title="Cancelar sin guardar">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} title="Guardar registro">
                            {loading ? 'Guardando...' : 'Guardar consulta'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function InputField({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-medium">{label}</span>
            {children}
            {error && <span className="text-xs text-destructive">{error}</span>}
        </label>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    );
}
