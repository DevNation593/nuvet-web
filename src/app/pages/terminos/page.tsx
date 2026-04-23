'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { PawPrint, Menu, Facebook, Instagram, Twitter, Phone, Mail, FileText } from 'lucide-react';
import { useState } from 'react';

export default function TerminosPage() {
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

      <section className="pt-24 pb-12 bg-emerald-50/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-6">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-bold">Términos y Condiciones</span>
          </div>
          <h1 className="text-4xl font-bold text-emerald-950 mb-3">Términos y Condiciones de Uso</h1>
          <p className="text-emerald-900/60 text-sm">Última actualización: abril de 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-8 text-emerald-900/80 leading-relaxed">

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">1. Aceptación de los términos</h2>
              <p className="text-sm">
                Al registrarse o utilizar la plataforma NuVet Tech, usted (en adelante, «el Cliente») acepta quedar vinculado por los presentes Términos y Condiciones. Si no está de acuerdo con alguna de las condiciones aquí establecidas, no debe utilizar el servicio.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">2. Descripción del servicio</h2>
              <p className="text-sm">
                NuVet Tech es una plataforma SaaS (Software como Servicio) diseñada para la gestión integral de clínicas veterinarias. Incluye módulos de agenda de citas, historial clínico digital, punto de venta, facturación electrónica, inventario, recordatorios automáticos, reportes de gestión, estética, cirugías y adopciones, según el plan contratado.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">3. Registro y cuenta de usuario</h2>
              <p className="text-sm mb-3">El Cliente se compromete a:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Proporcionar información veraz, completa y actualizada durante el registro.</li>
                <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
                <li>Notificar de inmediato a NuVet Tech ante cualquier uso no autorizado de su cuenta.</li>
                <li>Ser responsable de todas las actividades realizadas desde su cuenta.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">4. Planes y pagos</h2>
              <p className="text-sm mb-3">
                NuVet Tech ofrece planes de suscripción mensual (STARTER, PRO y ENTERPRISE). Los precios vigentes se detallan en la página de <Link href="/pages/precios" className="text-emerald-600 underline">Precios</Link>. El pago se realiza por adelantado. La falta de pago en el plazo establecido puede derivar en la suspensión temporal o definitiva del servicio.
              </p>
              <p className="text-sm">
                NuVet Tech se reserva el derecho de modificar los precios con un preaviso mínimo de 30 días. El Cliente podrá cancelar su suscripción antes de que entre en vigor el nuevo precio.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">5. Uso aceptable</h2>
              <p className="text-sm mb-3">El Cliente se compromete a no:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Utilizar la plataforma para actividades ilegales o fraudulentas.</li>
                <li>Intentar acceder a datos de otros tenants o vulnerar la seguridad del sistema.</li>
                <li>Reproducir, distribuir o comercializar el software sin autorización escrita.</li>
                <li>Introducir código malicioso (virus, malware, etc.) en la plataforma.</li>
                <li>Sobrecargar los servidores con solicitudes automatizadas no autorizadas.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">6. Propiedad intelectual</h2>
              <p className="text-sm">
                Todo el código fuente, diseño, marcas, logotipos y contenidos de NuVet Tech son propiedad exclusiva de NuVet Tech o sus licenciantes. La suscripción otorga al Cliente una licencia de uso limitada, no exclusiva e intransferible para acceder a la plataforma durante la vigencia del contrato.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">7. Datos del Cliente</h2>
              <p className="text-sm">
                Los datos clínicos, de clientes y de mascotas introducidos por el Cliente son de su propiedad. NuVet Tech los almacena en su nombre y no los cede a terceros, salvo en los casos previstos en la <Link href="/pages/privacidad" className="text-emerald-600 underline">Política de Privacidad</Link>. El Cliente es responsable de la exactitud y licitud de los datos que introduce.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">8. Disponibilidad y SLA</h2>
              <p className="text-sm">
                NuVet Tech se esfuerza por mantener una disponibilidad del servicio del 99 % mensual. No obstante, pueden producirse interrupciones por mantenimiento programado (notificado con 48 horas de antelación) o causas de fuerza mayor. Los planes ENTERPRISE incluyen un SLA con compensaciones específicas detalladas en el contrato individual.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">9. Limitación de responsabilidad</h2>
              <p className="text-sm">
                NuVet Tech no será responsable de pérdidas de negocio, lucro cesante o daños indirectos derivados del uso o imposibilidad de uso de la plataforma. La responsabilidad total de NuVet Tech quedará limitada al importe pagado por el Cliente en los 3 meses anteriores al evento que dio lugar al daño.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">10. Cancelación y terminación</h2>
              <p className="text-sm">
                El Cliente puede cancelar su suscripción en cualquier momento desde la configuración de la cuenta. La cancelación será efectiva al final del período de facturación en curso. NuVet Tech puede suspender o cancelar el acceso ante incumplimientos graves de estos Términos. Tras la cancelación, los datos se conservarán 30 días para su exportación y luego serán eliminados.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">11. Modificaciones</h2>
              <p className="text-sm">
                NuVet Tech puede actualizar estos Términos y Condiciones. Los cambios significativos se comunicarán con al menos 15 días de antelación por correo electrónico. El uso continuado del servicio tras la notificación implica la aceptación de las nuevas condiciones.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">12. Ley aplicable y jurisdicción</h2>
              <p className="text-sm">
                Estos Términos se rigen por la legislación de la República del Ecuador. Las partes se someten a los tribunales competentes de la ciudad de Quito para la resolución de cualquier controversia, sin perjuicio de los mecanismos alternativos de resolución de disputas que puedan acordarse.
              </p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <p className="text-sm text-emerald-900/70">
                Para cualquier consulta sobre estos Términos y Condiciones, contacte con nosotros en <a href="mailto:legal@nuvet.com" className="text-emerald-600 underline">legal@nuvet.com</a> o a través de nuestra página de <Link href="/pages/contacto" className="text-emerald-600 underline">contacto</Link>.
              </p>
            </div>

          </div>
        </div>
      </section>

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
