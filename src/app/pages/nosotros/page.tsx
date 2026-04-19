'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { PawPrint, HeartHandshake, ShieldCheck, Sparkles, Users, Target, Menu, Facebook, Instagram, Twitter, Phone, Mail } from 'lucide-react';

const values = [
  {
    title: 'Cuidado cercano',
    description: 'Acompañamos a cada veterinaria con soporte humano y respuestas claras.',
    icon: HeartHandshake,
  },
  {
    title: 'Operación segura',
    description: 'Tus datos y los historiales clínicos se resguardan con estándares modernos.',
    icon: ShieldCheck,
  },
  {
    title: 'Innovación útil',
    description: 'Creamos automatizaciones simples para que tu equipo gane tiempo cada día.',
    icon: Sparkles,
  },
];

const teamHighlights = [
  {
    title: 'Equipo veterinario',
    description: 'Trabajamos con clínicas aliadas para validar cada flujo clínico.',
  },
  {
    title: 'Producto digital',
    description: 'Diseño centrado en procesos reales, no en módulos genéricos.',
  },
  {
    title: 'Éxito del cliente',
    description: 'Onboarding guiado y acompañamiento constante para cada cuenta.',
  },
];

export default function NosotrosPage() {
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
            <Link href="/pages/nosotros" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Nosotros</Link>
            <Link href="/pages/contacto" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Contacto</Link>
          </div>

          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-5 text-sm hidden md:inline-flex">
            <Link href="/auth/login">Iniciar sesión</Link>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden text-emerald-900 h-9 w-9">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      <section className="relative overflow-hidden pt-24 pb-12">
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
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-6">
              <Users className="h-4 w-4" />
              <span className="text-sm font-bold">Somos aliados de tu veterinaria</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-4">Nuestra historia en NuVet Tech</h1>
            <p className="text-lg text-emerald-900/70 max-w-2xl">
              Construimos una plataforma que conecta agenda, historiales clínicos y ventas para que las veterinarias se enfoquen en lo más importante.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6">
                <Link href="/pages/contacto">Hablar con el equipo</Link>
              </Button>
              <Button variant="outline" asChild className="h-11 px-6 border-emerald-200 hover:bg-emerald-50">
                <Link href="/pages/services">Ver servicios</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[320px] sm:h-[380px] w-full overflow-hidden rounded-3xl ">
            <Image src="/assets/about-us.webp" alt="Equipo NuVet Tech" fill className="object-cover" priority />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all duration-300">
            <CardContent className="p-6">
              <Target className="h-6 w-6 text-emerald-600 mb-3" />
              <h3 className="text-lg font-semibold text-emerald-950">Misión</h3>
              <p className="text-sm text-emerald-900/70">
                Ayudar a las veterinarias a crecer con herramientas digitales simples, seguras y accionables.
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all duration-300">
            <CardContent className="p-6">
              <PawPrint className="h-6 w-6 text-emerald-600 mb-3" />
              <h3 className="text-lg font-semibold text-emerald-950">Visión</h3>
              <p className="text-sm text-emerald-900/70">
                Ser el sistema de confianza que conecta cada proceso clínico en Latinoamérica.
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all duration-300">
            <CardContent className="p-6">
              <Users className="h-6 w-6 text-emerald-600 mb-3" />
              <h3 className="text-lg font-semibold text-emerald-950">Comunidad</h3>
              <p className="text-sm text-emerald-900/70">
                Crecemos junto a veterinarias, equipos y familias que cuidan con empatía.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-emerald-50/60">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-emerald-950">Nuestros valores</h2>
            <p className="text-emerald-900/60 mt-2">Lo que guía cada decisión en NuVet Tech.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all duration-300">
                <CardContent className="p-6">
                  <value.icon className="h-6 w-6 text-emerald-600 mb-3" />
                  <h3 className="text-lg font-semibold text-emerald-950">{value.title}</h3>
                  <p className="text-sm text-emerald-900/70">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-emerald-950">Un equipo construido para veterinarias</h2>
            <p className="text-emerald-900/70">
              NuVet Tech está formado por especialistas en producto, tecnología y operación clínica. Cada decisión prioriza la experiencia del staff y de las familias.
            </p>
            <div className="space-y-4">
              {teamHighlights.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <PawPrint className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-950">{item.title}</h4>
                    <p className="text-sm text-emerald-900/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Veterinarias activas', value: '+500' },
              { label: 'Consultas registradas', value: '+120k' },
              { label: 'Recordatorios enviados', value: '+300k' },
              { label: 'Horas ahorradas', value: '+40k' },
            ].map((metric) => (
              <Card key={metric.label} className="border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all duration-300">
                <CardContent className="p-5">
                  <p className="text-2xl font-bold text-emerald-600">{metric.value}</p>
                  <p className="text-xs text-emerald-900/60">{metric.label}</p>
                </CardContent>
              </Card>
            ))}
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
              <h4 className="font-bold text-white mb-4">Enlaces Rápidos</h4>
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
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Historial clínico digital</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Recordatorios automáticos</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Cobros y facturación</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Reportes de gestión</Link></li>
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
