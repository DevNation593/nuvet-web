'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { 
  PawPrint, CalendarCheck, ClipboardList, CreditCard, BarChart3, Heart,
  Clock, Shield, Users, ArrowRight, Menu,
  Facebook, Instagram, Twitter, Phone, Mail
} from "lucide-react";

const services = [
  { icon: CalendarCheck, title: "Agenda inteligente", description: "Turnos organizados y recordatorios automáticos para reducir ausencias." },
  { icon: ClipboardList, title: "Historial clínico", description: "Todo el seguimiento médico de cada paciente en un solo lugar." },
  { icon: CreditCard, title: "Cobros y facturación", description: "Caja diaria, comprobantes y control de pagos claros." },
  { icon: BarChart3, title: "Reportes de gestión", description: "Indicadores clave para tomar decisiones con datos reales." },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <main className="min-h-screen bg-white">
      {/* HEADER / NAVBAR INTEGRADO */}
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
            <Link href="/pages/precios" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Precios</Link>
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
            <Link href="/pages/precios" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Precios</Link>
            <Link href="/pages/nosotros" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Nosotros</Link>
            <Link href="/pages/contacto" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium py-1" onClick={() => setMobileMenuOpen(false)}>Contacto</Link>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-5 text-sm w-full mt-2">
              <Link href="/auth/login">Iniciar sesión</Link>
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-60 lg:pb-32 overflow-hidden min-h-[400px]">
        <div className="absolute inset-0">
          <Image 
            src="/assets/hero-vet.webp" 
            alt="Clínica veterinaria" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-6">
              <PawPrint className="h-4 w-4" />
              <span className="text-sm font-bold">Tecnología para veterinarias</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-emerald-950 leading-tight">
              Ordena tu clínica con <br />
              <span className="text-emerald-600 italic font-serif">procesos y datos claros</span>
            </h1>
            <p className="text-lg text-emerald-800/70 mb-8 max-w-xl font-medium">
              Agenda, historiales, cobros y reportes en una sola plataforma. Tu equipo trabaja más rápido y tus clientes reciben mejor atención.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 gap-2 h-14 px-8 text-lg rounded-xl shadow-xl shadow-emerald-200">
                <Link href="/pages/contacto">
                  Solicitar demo
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg rounded-xl border-emerald-200 hover:bg-emerald-50">
                <Link href="/pages/services">Ver servicios</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-24 bg-emerald-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-emerald-950 mb-4">Servicios tecnológicos clave</h2>
            <p className="text-emerald-800/60 max-w-2xl mx-auto font-medium">
              Herramientas digitales para ordenar la operación, mejorar la atención y ganar tiempo.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Card 
                key={service.title} 
                className="group border border-emerald-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 rounded-3xl overflow-hidden"
              >
                <CardContent className="p-8 text-center bg-white">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <service.icon className="h-8 w-8 text-emerald-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-3">{service.title}</h3>
                  <p className="text-emerald-800/60 leading-relaxed text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seccion de Beneficios y Plataforma */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 space-y-32">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-emerald-950 mb-4">¿Por qué elegirnos?</h2>
                <p className="text-emerald-800/60 font-medium max-w-lg">
                  NuVet Tech simplifica la gestión diaria con procesos claros y soporte cercano para cada equipo.
                </p>
              </div>
              <div className="space-y-6">
                {[
                  { icon: Clock, title: "Implementación rápida", desc: "Arranca en días con migración guiada y acompañamiento" },
                  { icon: Shield, title: "Datos protegidos", desc: "Seguridad y respaldos continuos para tu información" },
                  { icon: Users, title: "Equipo alineado", desc: "Cada área trabaja con la misma información en tiempo real" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-950">{item.title}</h4>
                      <p className="text-sm text-emerald-800/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative w-full">
              <div className="absolute -inset-4 border-2 border-emerald-300 rounded-[4rem] rounded-tr-none translate-x-6 translate-y-6 hidden lg:block" />
              <div className="relative h-[280px] sm:h-[340px] lg:h-[400px] w-full rounded-[3rem] rounded-tr-none overflow-hidden border-1 border-white shadow-2xl">
                <Image src="/assets/vet2.webp" alt="Equipo NuVet Tech" fill className="object-cover" />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-emerald-950 mb-4">Todo tu flujo en un solo lugar</h2>
                <p className="text-emerald-800/60 font-medium max-w-lg">
                  Centraliza agenda, pacientes, cobros y reportes para que tu equipo se enfoque en la atención.
                </p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Agenda por profesionales", "Historial clínico centralizado", "Cobros y facturación", "Reportes en tiempo real"].map((check, i) => (
                  <li key={i} className="flex items-center gap-3 text-emerald-900 font-medium">
                    <div className="bg-emerald-100 rounded-full p-1"><PawPrint className="w-3 h-3 text-emerald-600" /></div>
                    {check}
                  </li>
                ))}
              </ul>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12">
                <Link href="/pages/contacto">Solicitar demo</Link>
              </Button>
            </div>
            <div className="lg:w-1/2 relative w-full">
              <div className="absolute -inset-4 border-2 border-emerald-300 rounded-[4rem] rounded-bl-none -translate-x-6 -translate-y-6 hidden lg:block" />
              <div className="relative h-[280px] sm:h-[340px] lg:h-[400px] w-full rounded-[3rem] rounded-bl-none overflow-hidden border-1 border-white shadow-2xl">
                <Image src="/assets/gato3.webp" alt="Gestión veterinaria" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Seccion Demo */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-emerald-900 rounded-[3rem] p-8 md:p-16 overflow-hidden relative">
            <div className="relative z-10 max-w-xl">
              <Heart className="h-12 w-12 text-emerald-400 mb-6" />
              <h2 className="text-4xl font-bold text-white mb-6">¿Listo para ordenar tu operación?</h2>
              <p className="text-emerald-100/80 text-lg mb-8">
                Agenda una demo y mira cómo NuVet Tech unifica agenda, pacientes, cobros y reportes en un solo flujo.
              </p>
              <Button size="lg" variant="secondary" className="bg-white text-emerald-900 hover:bg-emerald-50 h-12 px-8 font-bold rounded-xl" asChild>
                <Link href="/pages/contacto">Solicitar demo</Link>
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 hidden lg:block w-1/2 h-full overflow-hidden">
               <Image src="/assets/gato2.webp" alt="Equipo NuVet Tech" fill className="object-cover opacity-50" />
            </div>
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