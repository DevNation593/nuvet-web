'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { PawPrint, Menu, Facebook, Instagram, Twitter, Phone, Mail, Shield } from 'lucide-react';
import { useState } from 'react';

export default function PrivacidadPage() {
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
            <Shield className="h-4 w-4" />
            <span className="text-sm font-bold">Política de Privacidad</span>
          </div>
          <h1 className="text-4xl font-bold text-emerald-950 mb-3">Política de Privacidad</h1>
          <p className="text-emerald-900/60 text-sm">Última actualización: abril de 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl prose prose-emerald">
          <div className="space-y-8 text-emerald-900/80 leading-relaxed">

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">1. Responsable del tratamiento</h2>
              <p className="text-sm">
                NuVet Tech (en adelante, «la Plataforma» o «nosotros») es responsable del tratamiento de los datos personales recabados a través de nuestro sitio web y aplicación SaaS para clínicas veterinarias. Para cualquier consulta relacionada con privacidad, puede contactarnos en <a href="mailto:privacidad@nuvet.com" className="text-emerald-600 underline">privacidad@nuvet.com</a>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">2. Datos que recopilamos</h2>
              <p className="text-sm mb-3">Recopilamos los siguientes tipos de información:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Datos de cuenta:</strong> nombre, correo electrónico, teléfono y contraseña de los usuarios registrados.</li>
                <li><strong>Datos de la clínica:</strong> nombre, dirección, RUC y demás información de perfil de la veterinaria.</li>
                <li><strong>Datos clínicos:</strong> historiales de mascotas, citas, diagnósticos y tratamientos introducidos por los profesionales de la clínica.</li>
                <li><strong>Datos de uso:</strong> registros de acceso, acciones dentro de la plataforma e información del dispositivo.</li>
                <li><strong>Datos de facturación:</strong> información necesaria para la emisión de comprobantes electrónicos según la normativa del SRI.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">3. Finalidad del tratamiento</h2>
              <p className="text-sm mb-3">Utilizamos sus datos para:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Prestar y mejorar los servicios de gestión veterinaria de la Plataforma.</li>
                <li>Gestionar la relación contractual y facturar los servicios contratados.</li>
                <li>Enviar recordatorios clínicos, notificaciones de citas y comunicaciones de servicio.</li>
                <li>Cumplir con obligaciones legales y reglamentarias aplicables en Ecuador.</li>
                <li>Analizar el uso de la Plataforma para mejorar la experiencia del usuario.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">4. Base legal del tratamiento</h2>
              <p className="text-sm">
                El tratamiento de sus datos se basa en la ejecución del contrato de suscripción aceptado al registrarse, el cumplimiento de obligaciones legales y, en su caso, el interés legítimo de NuVet Tech para mejorar sus servicios. Para envíos de comunicaciones de marketing, solicitamos su consentimiento expreso.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">5. Conservación de datos</h2>
              <p className="text-sm">
                Los datos se conservan durante la vigencia del contrato de suscripción y, una vez finalizado, durante el plazo legalmente exigido (mínimo 7 años para datos de facturación). Los datos clínicos se eliminan a petición del administrador de la cuenta, salvo obligación legal contraria.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">6. Compartición de datos</h2>
              <p className="text-sm mb-3">No vendemos ni cedemos sus datos a terceros con fines comerciales. Podemos compartir información con:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Proveedores de infraestructura:</strong> servicios de alojamiento, base de datos y almacenamiento en la nube bajo acuerdos de confidencialidad.</li>
                <li><strong>Proveedores de facturación electrónica:</strong> Faktur u otros autorizados por el SRI.</li>
                <li><strong>Autoridades competentes:</strong> cuando exista obligación legal.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">7. Seguridad</h2>
              <p className="text-sm">
                Aplicamos medidas técnicas y organizativas adecuadas para proteger sus datos frente a accesos no autorizados, pérdida o destrucción, incluyendo cifrado en tránsito (HTTPS/TLS), autenticación con tokens JWT de vida corta, control de acceso por roles y copias de seguridad periódicas.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">8. Sus derechos</h2>
              <p className="text-sm mb-3">De conformidad con la Ley Orgánica de Protección de Datos Personales de Ecuador, tiene derecho a:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Acceder a sus datos personales.</li>
                <li>Rectificar datos inexactos o incompletos.</li>
                <li>Solicitar la supresión de sus datos cuando no sean necesarios.</li>
                <li>Oponerse al tratamiento o solicitar su limitación.</li>
                <li>Portabilidad de sus datos en formato estructurado.</li>
              </ul>
              <p className="text-sm mt-3">Para ejercer estos derechos, envíe un correo a <a href="mailto:privacidad@nuvet.com" className="text-emerald-600 underline">privacidad@nuvet.com</a>.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">9. Cookies</h2>
              <p className="text-sm">
                Utilizamos cookies propias y de terceros para mantener su sesión activa, recordar preferencias y analizar el uso de la Plataforma. Puede gestionar sus preferencias en el banner de cookies que aparece en su primera visita. Para más información, consulte nuestra política de cookies integrada en el banner.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-950 mb-3">10. Cambios en esta política</h2>
              <p className="text-sm">
                NuVet Tech se reserva el derecho de actualizar esta Política de Privacidad. Le notificaremos los cambios significativos por correo electrónico o mediante un aviso destacado en la Plataforma. El uso continuado de los servicios tras la notificación implica la aceptación de la nueva versión.
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
