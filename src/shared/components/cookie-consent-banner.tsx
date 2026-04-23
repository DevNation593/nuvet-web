'use client';

import { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const CONSENT_KEY = 'nuvet-cookie-consent';
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 año en segundos

type ConsentValue = 'accepted' | 'rejected';

function getStoredConsent(): ConsentValue | null {
    if (typeof window === 'undefined') return null;
    return (localStorage.getItem(CONSENT_KEY) as ConsentValue) ?? null;
}

function saveConsent(value: ConsentValue) {
    localStorage.setItem(CONSENT_KEY, value);
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${CONSENT_KEY}=${value}; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`;
}

export function CookieConsentBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!getStoredConsent()) {
            setVisible(true);
        }
    }, []);

    function handleAccept() {
        saveConsent('accepted');
        setVisible(false);
    }

    function handleReject() {
        saveConsent('rejected');
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
            <div className="mx-auto max-w-4xl bg-white border border-emerald-200 rounded-2xl shadow-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Cookie className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-emerald-950 text-sm mb-1">Usamos cookies</p>
                        <p className="text-xs text-emerald-800/60 leading-relaxed">
                            Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y recordar tu sesión. 
                            Puedes aceptar todas o rechazarlas. Consulta nuestra{' '}
                            <a href="#" className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700">
                                política de privacidad
                            </a>
                            .
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReject}
                        className="flex-1 md:flex-none border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg h-9"
                    >
                        Rechazar
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAccept}
                        className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9"
                    >
                        Aceptar todas
                    </Button>
                    <button
                        onClick={handleReject}
                        aria-label="Cerrar"
                        className="text-emerald-400 hover:text-emerald-600 transition-colors hidden md:block"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
