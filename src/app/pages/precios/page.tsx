'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  PawPrint,
  Menu,
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
  Check,
  X,
  ArrowRight,
  Zap,
  Star,
  Building2,
} from 'lucide-react';
import { useState } from 'react';

const plans = [
  {
    id: 'starter',
    name: 'STARTER',
    price: '$29',
    period: '/mes',
    description: 'Para clínicas pequeñas que quieren digitalizar su operación.',
    icon: Zap,
    color: 'emerald',
    highlight: false,
    features: [
      { label: 'Agenda de citas', included: true },
      { label: 'Historial clínico básico', included: true },
      { label: 'Punto de venta (POS)', included: true },
      { label: 'Hasta 3 usuarios', included: true },
      { label: 'Módulo de mascotas y clientes', included: true },
      { label: 'Inventario básico', included: true },
      { label: 'Soporte por email', included: true },
      { label: 'Facturación electrónica', included: false },
      { label: 'Reportes avanzados', included: false },
      { label: 'Estética y grooming', included: false },
      { label: 'Cirugías', included: false },
      { label: 'Módulo de adopciones', included: false },
      { label: 'Multi-sede', included: false },
      { label: 'SLA y soporte prioritario', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '$69',
    period: '/mes',
    description: 'Para clínicas medianas con procesos completos y facturación.',
    icon: Star,
    color: 'emerald',
    highlight: true,
    features: [
      { label: 'Agenda de citas', included: true },
      { label: 'Historial clínico completo', included: true },
      { label: 'Punto de venta (POS)', included: true },
      { label: 'Hasta 15 usuarios', included: true },
      { label: 'Módulo de mascotas y clientes', included: true },
      { label: 'Inventario conectado', included: true },
      { label: 'Soporte por email y chat', included: true },
      { label: 'Facturación electrónica', included: true },
      { label: 'Reportes avanzados', included: true },
      { label: 'Estética y grooming', included: true },
      { label: 'Cirugías', included: true },
      { label: 'Módulo de adopciones', included: true },
      { label: 'Multi-sede', included: false },
      { label: 'SLA y soporte prioritario', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: '$179',
    period: '/mes',
    description: 'Para redes de clínicas con múltiples sedes y soporte prioritario.',
    icon: Building2,
    color: 'emerald',
    highlight: false,
    features: [
      { label: 'Agenda de citas', included: true },
      { label: 'Historial clínico completo', included: true },
      { label: 'Punto de venta (POS)', included: true },
      { label: 'Usuarios ilimitados', included: true },
      { label: 'Módulo de mascotas y clientes', included: true },
      { label: 'Inventario conectado', included: true },
      { label: 'Soporte prioritario 24/7', included: true },
      { label: 'Facturación electrónica', included: true },
      { label: 'Reportes avanzados', included: true },
      { label: 'Estética y grooming', included: true },
      { label: 'Cirugías', included: true },
      { label: 'Módulo de adopciones', included: true },
      { label: 'Multi-sede', included: true },
      { label: 'SLA y soporte prioritario', included: true },
    ],
  },
];

export default function PreciosPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-emerald-200">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between relative">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-emerald-950 tracking-tight">NuVet Tech</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Inicio</Link>
            <Link href="/pages/services" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Servicios</Link>
            <Link href="/pages/precios" className="text-sm text-emerald-600 font-semibold transition-colors">Precios</Link>
            <Link href="/pages/nosotros" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Nosotros</Link>
            <Link href="/pages/contacto" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Contacto</Link>
          </div>

          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-5 text-sm hidden md:inline-flex">
            <Link href="/auth/login">Iniciar sesión</Link>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden text-emerald-900 h-9 w-9" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-emerald-100 px-4 py-4 flex flex-col gap-3">
            <Link href="/" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
            <Link href="/pages/services" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Servicios</Link>
            <Link href="/pages/precios" className="text-sm text-emerald-600 font-semibold py-1" onClick={() => setMobileMenuOpen(false)}>Precios</Link>
            <Link href="/pages/nosotros" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Nosotros</Link>
            <Link href="/pages/contacto" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Contacto</Link>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-5 text-sm w-full mt-2">
              <Link href="/auth/login">Iniciar sesión</Link>
            </Button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-12 bg-emerald-50/40">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-6">
            <PawPrint className="h-4 w-4" />
            <span className="text-sm font-bold">Planes y precios</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-4">Escoge el plan ideal para tu veterinaria</h1>
          <p className="text-emerald-900/60 text-lg">
            Sin planes gratuitos, sin sorpresas. Precios claros para que te enfoques en lo importante: tus pacientes.
          </p>
          <p className="mt-3 text-sm text-emerald-700 font-medium">✓ Prueba gratuita de 14 días en todos los planes</p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative border-2 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col ${
                  plan.highlight
                    ? 'border-emerald-500 shadow-2xl shadow-emerald-100 scale-[1.02]'
                    : 'border-emerald-200 shadow-sm hover:shadow-lg hover:border-emerald-400'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                )}
                {plan.highlight && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">Más popular</span>
                  </div>
                )}
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                      <plan.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-950 mb-1">{plan.name}</h3>
                    <p className="text-sm text-emerald-900/60 mb-4">{plan.description}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-emerald-950">{plan.price}</span>
                      <span className="text-emerald-900/50 text-sm mb-1">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.label} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-emerald-200 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-emerald-900/80' : 'text-emerald-900/30'}>
                          {feature.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full rounded-xl h-11 font-semibold ${
                      plan.highlight
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <Link href="/pages/contacto">
                      Solicitar demo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / CTA */}
      <section className="py-12 bg-emerald-50/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-emerald-950 text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {[
              {
                q: '¿Hay período de prueba?',
                a: 'Sí. Todos los planes incluyen 14 días de prueba gratuita con todas las funcionalidades del plan activadas.',
              },
              {
                q: '¿Puedo cambiar de plan en cualquier momento?',
                a: 'Sí. Puedes actualizar o reducir tu plan desde la configuración de la cuenta. Los cambios aplican al inicio del siguiente período de facturación.',
              },
              {
                q: '¿Qué pasa con mis datos si cancelo?',
                a: 'Conservamos tus datos durante 30 días después de la cancelación para que puedas exportarlos. Pasado ese período, los eliminamos de forma segura.',
              },
              {
                q: '¿La facturación electrónica tiene costo adicional?',
                a: 'No. En los planes PRO y ENTERPRISE la facturación electrónica está incluida sin costo extra por comprobante.',
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-white border border-emerald-200 rounded-xl p-5">
                <p className="font-semibold text-emerald-950 mb-2">{faq.q}</p>
                <p className="text-sm text-emerald-900/60">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-emerald-900/60 mb-4">¿Tienes preguntas o necesitas un plan personalizado?</p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-8">
              <Link href="/pages/contacto">Habla con nosotros</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a4731] text-white/90 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <PawPrint className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="font-bold text-2xl text-white tracking-tight">NuVet Tech</span>
              </Link>
              <p className="text-sm text-emerald-100/70 leading-relaxed">
                Plataforma digital para gestionar tu veterinaria: agenda, historiales, cobros y reportes en un solo lugar.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="hover:text-emerald-400 transition-colors"><Facebook className="w-5 h-5" /></Link>
                <Link href="#" className="hover:text-emerald-400 transition-colors"><Instagram className="w-5 h-5" /></Link>
                <Link href="#" className="hover:text-emerald-400 transition-colors"><Twitter className="w-5 h-5" /></Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Enlaces rápidos</h4>
              <ul className="space-y-3 text-sm text-emerald-100/70">
                <li><Link href="/" className="hover:text-emerald-400 transition-colors">Inicio</Link></li>
                <li><Link href="/pages/services" className="hover:text-emerald-400 transition-colors">Servicios</Link></li>
                <li><Link href="/pages/precios" className="hover:text-emerald-400 transition-colors">Precios</Link></li>
                <li><Link href="/pages/nosotros" className="hover:text-emerald-400 transition-colors">Nosotros</Link></li>
                <li><Link href="/pages/contacto" className="hover:text-emerald-400 transition-colors">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-emerald-100/70">
                <li><Link href="/pages/privacidad" className="hover:text-emerald-400 transition-colors">Política de privacidad</Link></li>
                <li><Link href="/pages/terminos" className="hover:text-emerald-400 transition-colors">Términos y condiciones</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Contacto</h4>
              <ul className="space-y-3 text-sm text-emerald-100/70">
                <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-emerald-400" /> +593 9999999999</li>
                <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-emerald-400" /> contacto@nuvet.com</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-emerald-100/40">© 2026 NuVet Tech. Todos los derechos reservados.</p>
            <div className="flex gap-4 text-xs text-emerald-100/40">
              <Link href="/pages/privacidad" className="hover:text-emerald-400 transition-colors">Privacidad</Link>
              <Link href="/pages/terminos" className="hover:text-emerald-400 transition-colors">Términos</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
