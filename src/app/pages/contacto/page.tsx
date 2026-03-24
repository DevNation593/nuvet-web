'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Send,
  PawPrint,
  Menu,
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
} from 'lucide-react';

const subjects = [
  { value: 'demo', label: 'Solicitar demo' },
  { value: 'pricing', label: 'Precios y planes' },
  { value: 'onboarding', label: 'Implementacion y onboarding' },
  { value: 'support', label: 'Soporte tecnico' },
  { value: 'partnerships', label: 'Alianzas' },
  { value: 'other', label: 'Otro' },
];

const teamSizes = [
  { value: '1-3', label: '1 a 3 personas' },
  { value: '4-10', label: '4 a 10 personas' },
  { value: '11-25', label: '11 a 25 personas' },
  { value: '26-50', label: '26 a 50 personas' },
  { value: '50+', label: 'Mas de 50' },
];

const countryCodes = [
  { value: 'bo', label: 'BO +591' },
  { value: 'br', label: 'BR +55' },
  { value: 'ca', label: 'CA +1' },
  { value: 'cr', label: 'CR +506' },
  { value: 'do', label: 'DO +1' },
  { value: 'ec', label: 'EC +593' },
  { value: 'gt', label: 'GT +502' },
  { value: 'hn', label: 'HN +504' },
  { value: 'ni', label: 'NI +505' },
  { value: 'pa', label: 'PA +507' },
  { value: 'co', label: 'CO +57' },
  { value: 'pe', label: 'PE +51' },
  { value: 'mx', label: 'MX +52' },
  { value: 'cl', label: 'CL +56' },
  { value: 'ar', label: 'AR +54' },
  { value: 'us', label: 'US +1' },
  { value: 'es', label: 'ES +34' },
  { value: 'uy', label: 'UY +598' },
  { value: 'py', label: 'PY +595' },
  { value: 'sv', label: 'SV +503' },
  { value: 've', label: 'VE +58' },
];

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    clinic: '',
    email: '',
    phone: '',
    subject: '',
    teamSize: '',
    message: '',
  });
  const [callPhone, setCallPhone] = useState('');
  const [callCountry, setCallCountry] = useState('ec');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success('Hemos recibido tu mensaje. Te responderemos a la brevedad.');
    setFormData({
      name: '',
      clinic: '',
      email: '',
      phone: '',
      subject: '',
      teamSize: '',
      message: '',
    });
  };

  const handleScheduleCall = () => {
    if (!callPhone.trim()) {
      toast.error('Ingresa un numero para coordinar la llamada.');
      return;
    }
    toast.success('Llamada agendada. Te contactaremos pronto.');
    setCallPhone('');
  };

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

      <section className="relative overflow-hidden py-10 pt-20">
        <div className="absolute inset-0">
          <Image
            src="/assets/fondo.webp"
            alt=""
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-white to-emerald-200/40" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-950 mb-3">Contáctanos</h1>
          <p className="text-base md:text-lg text-emerald-900/70 max-w-2xl mx-auto">
            Hablemos de como NuVet impulsa tu veterinaria.
          </p>
        </div>
      </section>

      <section className="py-7">
        <div className="container mx-auto px-4">
        
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-stretch">
            <Card className="border-emerald-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-emerald-950">Escríbenos y te respondemos hoy</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Nombre completo *</Label>
                      <Input
                        id="contactName"
                        value={formData.name}
                        onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                        className="h-12 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactClinic">Veterinaria *</Label>
                      <Input
                        id="contactClinic"
                        value={formData.clinic}
                        onChange={(event) => setFormData({ ...formData, clinic: event.target.value })}
                        placeholder="Nombre de la veterinaria"
                        className="h-12 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.email}
                        onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                        className="h-12 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Teléfono</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                        className="h-12 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactSubject">Asunto *</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      >
                        <SelectTrigger className="h-12 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl">
                          <SelectValue placeholder="Selecciona un asunto" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactTeam">Tamaño de equipo</Label>
                      <Select
                        value={formData.teamSize}
                        onValueChange={(value) => setFormData({ ...formData, teamSize: value })}
                      >
                        <SelectTrigger
                          id="contactTeam"
                          className="h-12 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl"
                        >
                          <SelectValue placeholder="Selecciona un rango" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamSizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactMessage">Mensaje *</Label>
                    <Textarea
                      id="contactMessage"
                      value={formData.message}
                      onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                      placeholder="Escribe tu mensaje aqui..."
                      className="bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl outline-none"
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div className="flex h-full flex-col gap-6">
              <Card className="border-emerald-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-emerald-950">¿Prefieres una llamada rápida?</h3>
                  <p className="text-sm text-emerald-900/60 mb-4">
                    Coordinamos una demo de 20 minutos para mostrarte como NuVet se adapta a tu flujo.
                  </p>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="callPhone">Numero de contacto</Label>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Select value={callCountry} onValueChange={setCallCountry}>
                          <SelectTrigger className="h-12 w-full sm:w-36 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl">
                            <SelectValue placeholder="Codigo" />
                          </SelectTrigger>
                          <SelectContent>
                            {countryCodes.map((country) => (
                              <SelectItem key={country.value} value={country.value}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="callPhone"
                          type="tel"
                          value={callPhone}
                          onChange={(event) => setCallPhone(event.target.value)}
                          placeholder="Ej. 999 999 999"
                          className="h-12 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl outline-none"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={handleScheduleCall}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Agendar demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <div className="flex-1 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
                <div className="relative h-full min-h-[260px] w-full">
                  <Image
                    src="/assets/contacto.webp"
                    alt="Equipo veterinario con mascotas"
                    fill
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-emerald-900/35 to-emerald-200/30" />
                </div>
              </div>
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
