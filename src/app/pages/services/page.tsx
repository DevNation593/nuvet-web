'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  PawPrint,
  CalendarCheck,
  ClipboardList,
  Bell,
  CreditCard,
  BarChart3,
  Boxes,
  ArrowRight,
  ShieldCheck,
  Menu,
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
} from 'lucide-react';

interface FeatureItem {
  id: string;
  name: string;
  description: string;
  details: string[];
  icon: typeof PawPrint;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'agenda',
    name: 'Agenda inteligente',
    description: 'Turnos organizados, recordatorios automaticos y menos ausencias.',
    details: ['Calendario por profesionales', 'Confirmaciones en un clic', 'Control de disponibilidad'],
    icon: CalendarCheck,
  },
  {
    id: 'records',
    name: 'Historial clinico digital',
    description: 'Todo el seguimiento medico de cada paciente en un solo lugar.',
    details: ['Evoluciones y tratamientos', 'Archivos y resultados', 'Acceso rapido en consulta'],
    icon: ClipboardList,
  },
  {
    id: 'reminders',
    name: 'Recordatorios automaticos',
    description: 'Comunica vacunas, controles y post-operatorios sin esfuerzo.',
    details: ['Campanas segmentadas', 'Mensajes programados', 'Historial de contactos'],
    icon: Bell,
  },
  {
    id: 'billing',
    name: 'Cobros y facturacion',
    description: 'Caja diaria, comprobantes y control de pagos claros.',
    details: ['Metodos de pago', 'Estados de cuenta', 'Reportes de ingresos'],
    icon: CreditCard,
  },
  {
    id: 'analytics',
    name: 'Reportes de gestion',
    description: 'Indicadores clave para tomar decisiones con datos reales.',
    details: ['Servicios mas frecuentes', 'Rendimiento del equipo', 'Tendencias mensuales'],
    icon: BarChart3,
  },
  {
    id: 'inventory',
    name: 'Inventario conectado',
    description: 'Controla stock, movimientos y ventas de productos.',
    details: ['Alertas de minimo', 'Entradas y salidas', 'Catalogo actualizado'],
    icon: Boxes,
  },
];

const trustPoints = [
  {
    title: 'Implementacion guiada',
    description: 'Acompanamos la migracion de datos y la configuracion inicial.',
  },
  {
    title: 'Seguridad y respaldo',
    description: 'Protegemos la informacion clinica con buenas practicas modernas.',
  },
  {
    title: 'Soporte cercano',
    description: 'Resolvemos dudas en tiempo real con un equipo dedicado.',
  },
];

export default function ServiciosPage() {

  return (
    <main className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-emerald-200">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between relative">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-emerald-950 tracking-tight">NuVet</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Inicio</Link>
            <Link href="/pages/services" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Servicios</Link>
            <Link href="/pages/nosotros" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Nosotros</Link>
            <Link href="/pages/contacto" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Contacto</Link>
          </div>

          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-5 text-sm hidden md:inline-flex">
            <Link href="/auth/login">Iniciar Sesion</Link>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden text-emerald-900 h-9 w-9">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 pt-28">
        <div className="absolute inset-0">
          <Image
            src="/assets/fondo.webp"
            alt=""
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/60 via-white to-emerald-100/40" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-4xl font-bold text-emerald-950 mb-4">Servicios tecnológicos para veterinarias</h1>
          <p className="text-lg text-emerald-900/70 max-w-2xl mx-auto">
            Centraliza tu operacion clínica con herramientas digitales que ordenan agenda, historial, cobros y reportes.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6">
              <Link href="/pages/contacto">
                Solicitar demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-11 px-6 border-emerald-200 hover:bg-emerald-50">
              <Link href="/pages/nosotros">Conocer al equipo</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-emerald-50/60">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <Card
                key={feature.id}
                className="group border border-emerald-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col"
              >
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                      <feature.icon className="h-6 w-6 text-emerald-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-950">{feature.name}</h3>
                      <p className="text-sm text-emerald-900/60">Servicio digital</p>
                    </div>
                  </div>
                  <p className="text-emerald-900/70 mb-4">{feature.description}</p>
                  <ul className="space-y-2 mt-auto">
                    {feature.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2 text-sm text-emerald-900/80">
                        <PawPrint className="h-4 w-4 text-emerald-600 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-emerald-50/60">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-emerald-950">Un servicio confiable para tu equipo</h2>
            <p className="text-emerald-900/60 mt-2">Acompañamos la adopcion con soporte, seguridad y crecimiento.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustPoints.map((point) => (
              <Card
                key={point.title}
                className="border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all duration-300 transform hover:scale-[1.10]"
              >
                <CardContent className="p-6">
                  <ShieldCheck className="h-6 w-6 text-emerald-600 mb-3" />
                  <h3 className="text-lg font-semibold text-emerald-950">{point.title}</h3>
                  <p className="text-sm text-emerald-900/70">{point.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6">
              <Link href="/pages/contacto">Hablemos de tu veterinaria</Link>
            </Button>
            <Button variant="outline" asChild className="h-11 px-6 border-emerald-200 hover:bg-emerald-50">
              <Link href="/pages/nosotros">Conocer la plataforma</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a4731] text-white/90 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <PawPrint className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="font-bold text-2xl text-white tracking-tight">NuVet</span>
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
              <h4 className="font-bold text-white mb-4">Enlaces Rapidos</h4>
              <ul className="space-y-3 text-sm text-emerald-100/70">
                <li><Link href="/" className="hover:text-emerald-400 transition-colors">Inicio</Link></li>
                <li><Link href="/pages/services" className="hover:text-emerald-400 transition-colors">Servicios</Link></li>
                <li><Link href="/pages/nosotros" className="hover:text-emerald-400 transition-colors">Nosotros</Link></li>
                <li><Link href="/pages/contacto" className="hover:text-emerald-400 transition-colors">Contacto</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Servicios</h4>
              <ul className="space-y-3 text-sm text-emerald-100/70">
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Agenda inteligente</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Historial clinico digital</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Recordatorios automaticos</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Cobros y facturacion</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Reportes de gestion</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Inventario conectado</Link></li>
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
          <div className="pt-6 border-t border-emerald-800/50 text-center">
            <p className="text-xs text-emerald-100/40">© 2026 Nuvet. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      
    </main>
  );
}
