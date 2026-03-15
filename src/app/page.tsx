'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { 
  PawPrint, Stethoscope, Scissors, Syringe, Heart, 
  Star, Clock, Shield, Users, ArrowRight, Menu,
  Facebook, Instagram, Twitter, Phone, Mail, MapPin
} from "lucide-react";

const services = [
  { icon: Stethoscope, title: "Consultas Médicas", description: "Diagnóstico y tratamiento profesional para tu mascota." },
  { icon: Syringe, title: "Vacunación", description: "Programa completo de vacunas para prevenir enfermedades." },
  { icon: Scissors, title: "Estética y Peluquería", description: "Baño, corte y cuidado del pelaje de tu mascota." },
  { icon: Heart, title: "Cirugías", description: "Procedimientos quirúrgicos con la mejor tecnología." },
];

const testimonials = [
  { name: "María García", pet: "Dueña de Max", rating: 5, comment: "Excelente atención, siempre muy profesionales y cariñosos con mi perrito." },
  { name: "Carlos López", pet: "Dueño de Luna", rating: 5, comment: "El mejor servicio de peluquería canina. Mi Luna queda hermosa siempre." },
  { name: "Ana Martínez", pet: "Dueña de Michi", rating: 5, comment: "Adopté a mi gato aquí y siempre me han dado el mejor seguimiento." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* HEADER / NAVBAR INTEGRADO */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-emerald-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-emerald-950 tracking-tight">NuVet</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#inicio" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Inicio</Link>
            <Link href="#servicios" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Servicios</Link>
      
            <Link href="#adopcion" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Adopción</Link>
            <Link href="#tienda" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Tienda</Link>
            <Link href="#contacto" className="text-sm text-emerald-900/70 hover:text-emerald-600 font-medium transition-colors">Contacto</Link>
            <div className="h-5 w-[1px] bg-emerald-100" />
            <Link href="/auth/login" className="text-sm text-emerald-900 font-bold hover:text-emerald-600 transition-colors">
              Iniciar Sesión
            </Link>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-5 text-sm">
              <Link href="/auth/register">Registrarse</Link>
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden text-emerald-900 h-9 w-9">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-30 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src="/assets/hero-vet.jpg" 
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
              <span className="text-sm font-bold">Clínica Veterinaria de Confianza</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-emerald-950 leading-tight">
              Cuidamos de quienes más te quieren con <br />
              <span className="text-emerald-600 italic font-serif">amor y profesionalismo</span>
            </h1>
            <p className="text-lg text-emerald-800/70 mb-8 max-w-xl font-medium">
              Ofrecemos servicios veterinarios completos, desde consultas médicas hasta estética canina. 
              También puedes adoptar una mascota o comprar productos para su cuidado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 gap-2 h-14 px-8 text-lg rounded-xl shadow-x1 shadow-emerald-200">
                <Link href="/auth/register">
                  Empezar Ahora
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg rounded-xl border-emerald-200 hover:bg-emerald-50">
                <Link href="/servicios">Nuestros Servicios</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-24 bg-emerald-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-emerald-950 mb-4">Servicios Integrales</h2>
            <p className="text-emerald-800/60 max-w-2xl mx-auto font-medium">
              Todo lo que necesitas para que tu compañero peludo esté sano y feliz.
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

      {/* Sección de Beneficios y Estética */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 space-y-32">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-emerald-950 mb-4">¿Por qué elegirnos?</h2>
                <p className="text-emerald-800/60 font-medium max-w-lg">
                  En Nuvet nos dedicamos al cuidado integral de tus mascotas. Con años de experiencia y un equipo comprometido, garantizando la mejor atención para tu compañero peludo.
                </p>
              </div>
              <div className="space-y-6">
                {[
                  { icon: Clock, title: "Atención 24/7", desc: "Emergencias disponibles las 24 horas del día" },
                  { icon: Shield, title: "Profesionales Certificados", desc: "Equipo veterinario con años de experiencia" },
                  { icon: Users, title: "+1000 Familias", desc: "Confían en nosotros para el cuidado de sus mascotas" },
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
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 border-2 border-emerald-300 rounded-[4rem] rounded-tr-none translate-x-6 translate-y-6" />
              <div className="relative h-[400px] w-full rounded-[3rem] rounded-tr-none overflow-hidden border-1 border-white shadow-2xl">
                <Image src="/assets/pets-together.jpg" alt="Cuidado de mascotas" fill className="object-cover" />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-emerald-950 mb-4">Servicio Premium de Estética</h2>
                <p className="text-emerald-800/60 font-medium max-w-lg">
                  Nuestro spa canino cuenta con profesionales certificados y productos de la más alta calidad. Tu mascota merece verse y sentirse increíble.
                </p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Baño con productos hipoalergénicos", "Corte personalizado", "Limpieza de oídos y uñas", "Tratamientos especiales"].map((check, i) => (
                  <li key={i} className="flex items-center gap-3 text-emerald-900 font-medium">
                    <div className="bg-emerald-100 rounded-full p-1"><PawPrint className="w-3 h-3 text-emerald-600" /></div>
                    {check}
                  </li>
                ))}
              </ul>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12">
                Agendar cita de estética
              </Button>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 border-2 border-emerald-200 rounded-[4rem] rounded-bl-none -translate-x-4 translate-y-4" />
              <div className="relative h-[400px] w-full rounded-[4rem] rounded-bl-none overflow-hidden border-4 border-white shadow-2xl">
                <Image src="/assets/grooming.jpg" alt="Peluquería canina" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Sección Adopción */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-emerald-900 rounded-[3rem] p-8 md:p-16 overflow-hidden relative">
            <div className="relative z-10 max-w-xl">
              <Heart className="h-12 w-12 text-emerald-400 mb-6" />
              <h2 className="text-4xl font-bold text-white mb-6">¿Buscas un nuevo integrante para la familia?</h2>
              <p className="text-emerald-100/80 text-lg mb-8">
                Tenemos muchos amigos esperando un hogar lleno de amor. Conoce a nuestras mascotas en adopción.
              </p>
              <Button size="lg" variant="secondary" className="bg-white text-emerald-900 hover:bg-emerald-50 h-12 px-8 font-bold rounded-xl" asChild>
                <Link href="/adopcion">Ver Mascotas</Link>
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 hidden lg:block w-1/2 h-full">
               <Image src="/assets/pets-together.jpg" alt="Mascotas" fill className="object-cover opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-emerald-950 mb-16">Lo que dicen las familias NuVet</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-white border border-emerald-200 rounded-2xl p-2 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-emerald-900 font-medium italic mb-6 leading-relaxed">"{t.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">{t.name[0]}</div>
                    <div>
                      <p className="font-bold text-emerald-950 text-sm">{t.name}</p>
                      <p className="text-emerald-600 text-xs font-semibold">{t.pet}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a4731] text-white/90 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <PawPrint className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="font-bold text-2xl text-white tracking-tight">NuVet</span>
              </Link>
              <p className="text-sm text-emerald-100/70 leading-relaxed">
                Tu clínica veterinaria de confianza. Cuidamos a tus mascotas con amor y profesionalismo.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="hover:text-emerald-400 transition-colors"><Facebook className="w-5 h-5" /></Link>
                <Link href="#" className="hover:text-emerald-400 transition-colors"><Instagram className="w-5 h-5" /></Link>
                <Link href="#" className="hover:text-emerald-400 transition-colors"><Twitter className="w-5 h-5" /></Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Enlaces Rápidos</h4>
              <ul className="space-y-4 text-sm text-emerald-100/70">
                <li><Link href="#servicios" className="hover:text-emerald-400 transition-colors">Servicios</Link></li>
                <li><Link href="/adopcion" className="hover:text-emerald-400 transition-colors">Adopción</Link></li>
                <li><Link href="/tienda" className="hover:text-emerald-400 transition-colors">Tienda</Link></li>
                <li><Link href="/contacto" className="hover:text-emerald-400 transition-colors">Contacto</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Servicios</h4>
              <ul className="space-y-4 text-sm text-emerald-100/70">
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Consultas Médicas</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Vacunación</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Cirugías</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Estética y Peluquería</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Contacto</h4>
              <ul className="space-y-4 text-sm text-emerald-100/70">
                <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-emerald-400" /> +593 9999999999</li>
                <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-emerald-400" /> contacto@nuvet.com</li>
                <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" /> Av. Occidental, Quito, Ecuador</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-emerald-800/50 text-center">
            <p className="text-xs text-emerald-100/40">© 2026 Nuvet. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}