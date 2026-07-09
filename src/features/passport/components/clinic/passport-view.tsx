'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { usePetPassport } from '../../hooks/use-passport';
import type {
    PassportPet,
    PassportVaccine,
    PassportMedicalRecord,
    PassportSurgery,
    PassportWeightEntry,
} from '@nuvet/types';
import { Calendar, FileText, Pill, Scissors, AlertCircle } from 'lucide-react';

interface PassportViewProps {
    petId: string;
}

export function PassportView({ petId }: PassportViewProps) {
    const { data: passport, isLoading, error } = usePetPassport(petId);

    if (isLoading) {
        return <PassportSkeleton />;
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p className="font-medium">No se pudo cargar el pasaporte</p>
                    <p className="text-xs mt-1">
                        {error instanceof Error ? error.message : 'Error desconocido'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (!passport) return null;

    return (
        <div className="space-y-6" data-testid="passport-view">
            <PassportHeader passport={passport} />
            <PassportTabs passport={passport} />
        </div>
    );
}

function PassportHeader({ passport }: { passport: PassportPet }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted overflow-hidden flex items-center justify-center text-2xl">
                            {passport.photoUrl ? (
                                <img
                                    src={passport.photoUrl}
                                    alt={passport.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span>🐾</span>
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{passport.name}</CardTitle>
                            <CardDescription className="flex flex-wrap gap-2 mt-1">
                                <Badge variant="secondary">{passport.species}</Badge>
                                {passport.breed && <Badge variant="outline">{passport.breed}</Badge>}
                                <Badge variant="outline">{passport.sex}</Badge>
                                {passport.isNeutered && <Badge variant="outline">Esterilizado/a</Badge>}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Emitido por</p>
                        <p className="font-medium">{passport.issuedBy.tenantName}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Generado: {new Date(passport.generatedAt).toLocaleString('es-EC')}
                        </p>
                    </div>
                </div>
            </CardHeader>
            {(passport.allergies || passport.microchip) && (
                <CardContent className="space-y-2 text-sm">
                    {passport.microchip && (
                        <p>
                            <span className="text-muted-foreground">Microchip:</span>{' '}
                            <span className="font-mono">{passport.microchip}</span>
                        </p>
                    )}
                    {passport.allergies && (
                        <p>
                            <span className="text-muted-foreground">Alergias:</span>{' '}
                            <span className="text-red-600 dark:text-red-400">{passport.allergies}</span>
                        </p>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

function PassportTabs({ passport }: { passport: PassportPet }) {
    return (
        <Tabs defaultValue="vaccines">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="vaccines">
                    <Pill className="h-4 w-4 mr-1" />
                    Vacunas ({passport.vaccines.length})
                </TabsTrigger>
                <TabsTrigger value="records">
                    <FileText className="h-4 w-4 mr-1" />
                    Historial ({passport.medicalRecords.length})
                </TabsTrigger>
                <TabsTrigger value="surgeries">
                    <Scissors className="h-4 w-4 mr-1" />
                    Cirugías ({passport.surgeries.length})
                </TabsTrigger>
                <TabsTrigger value="weight">
                    <Calendar className="h-4 w-4 mr-1" />
                    Peso
                </TabsTrigger>
            </TabsList>

            <TabsContent value="vaccines">
                <VaccinesPanel vaccines={passport.vaccines} />
            </TabsContent>
            <TabsContent value="records">
                <RecordsPanel records={passport.medicalRecords} />
            </TabsContent>
            <TabsContent value="surgeries">
                <SurgeriesPanel surgeries={passport.surgeries} />
            </TabsContent>
            <TabsContent value="weight">
                <WeightPanel history={passport.weightHistory} current={passport.weight} />
            </TabsContent>
        </Tabs>
    );
}

function VaccinesPanel({ vaccines }: { vaccines: PassportVaccine[] }) {
    if (vaccines.length === 0) {
        return <EmptyState message="Sin vacunas registradas" />;
    }
    return (
        <Card>
            <CardContent className="pt-6">
                <ul className="space-y-3">
                    {vaccines.map((v) => (
                        <li key={v.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                            <div>
                                <p className="font-medium">{v.vaccineName}</p>
                                {(v.manufacturer || v.batchNumber) && (
                                    <p className="text-xs text-muted-foreground">
                                        {v.manufacturer}
                                        {v.manufacturer && v.batchNumber ? ' · Lote ' : ''}
                                        {v.batchNumber}
                                    </p>
                                )}
                            </div>
                            <div className="text-right text-xs">
                                <p>{new Date(v.administeredAt).toLocaleDateString('es-EC')}</p>
                                {v.nextDueAt && (
                                    <p className="text-muted-foreground">
                                        Próx: {new Date(v.nextDueAt).toLocaleDateString('es-EC')}
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

function RecordsPanel({ records }: { records: PassportMedicalRecord[] }) {
    if (records.length === 0) return <EmptyState message="Sin historial clínico" />;
    return (
        <Card>
            <CardContent className="pt-6">
                <ul className="space-y-4">
                    {records.map((r) => (
                        <li key={r.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium">
                                    {new Date(r.date).toLocaleDateString('es-EC')}
                                </p>
                                {r.vetName && (
                                    <Badge variant="outline">{r.vetName}</Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">Motivo:</span> {r.chiefComplaint}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">Diagnóstico:</span> {r.diagnosis}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">Tratamiento:</span> {r.treatment}
                            </p>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

function SurgeriesPanel({ surgeries }: { surgeries: PassportSurgery[] }) {
    if (surgeries.length === 0) return <EmptyState message="Sin cirugías registradas" />;
    return (
        <Card>
            <CardContent className="pt-6">
                <ul className="space-y-3">
                    {surgeries.map((s) => (
                        <li key={s.id} className="border-b pb-3 last:border-0 flex justify-between">
                            <div>
                                <p className="font-medium">{s.type}</p>
                                {s.postInstructions && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {s.postInstructions}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <Badge variant="outline">{s.status}</Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(s.scheduledAt).toLocaleDateString('es-EC')}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

function WeightPanel({
    history,
    current,
}: {
    history: PassportWeightEntry[];
    current: number | null;
}) {
    const chart = useMemo(() => history.slice(-12), [history]);
    if (chart.length === 0 && current == null) {
        return <EmptyState message="Sin registros de peso" />;
    }
    const max = Math.max(...chart.map((w: PassportWeightEntry) => w.weight), current ?? 0);
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Peso (kg)</CardTitle>
                {current != null && (
                    <CardDescription>Actual: {current.toFixed(2)} kg</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex items-end gap-2 h-32">
                    {chart.map((w: PassportWeightEntry, i: number) => (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                            <div
                                className="w-full bg-primary rounded-t"
                                style={{
                                    height: `${(w.weight / max) * 100}%`,
                                    minHeight: '4px',
                                }}
                                title={`${w.weight} kg · ${new Date(w.date).toLocaleDateString('es-EC')}`}
                            />
                            <span className="text-[10px] text-muted-foreground">
                                {new Date(w.date).toLocaleDateString('es-EC', {
                                    month: '2-digit',
                                    year: '2-digit',
                                })}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
                {message}
            </CardContent>
        </Card>
    );
}

function PassportSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-6 w-32 mt-2" />
                </CardHeader>
            </Card>
            <Skeleton className="h-48 w-full" />
        </div>
    );
}
