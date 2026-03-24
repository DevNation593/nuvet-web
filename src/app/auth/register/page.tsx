'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { PawPrint, User, Mail, EyeOff, Eye, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// Función temporal para evitar errores
async function signUp(email: string, password: string, name: string) {
  return { error: null };
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error("Contraseña muy corta: debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, formData.name);
      if (error) {
        toast.error(`Error al registrarse: ${error.message}`);
      } else {
        toast.success("¡Cuenta creada exitosamente!");
        router.push("/mi-cuenta");
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    /* h-screen y overflow-hidden eliminan el scroll global */
    <div className="h-screen w-full flex bg-white overflow-hidden m-0 p-0 border-none">
      
      {/* SECCIÓN IZQUIERDA: BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F1FDF9] p-12 flex-col justify-between relative border-r border-emerald-50 h-full">
        
        <div className="absolute inset-0 z-0">
          <Image 
            src="/assets/perro-register.jpg" 
            alt="Fondo NuVet" 
            fill
            priority
            className="object-cover object-center opacity-85 mix-blend-multiply" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/60 to-[#1F5C52]/90" />
          <div className="absolute inset-0 bg-black backdrop-blur-[1px] opacity-15" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">NuVet</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Todo lo que tu <br />
            <span className="text-emerald-300 italic font-serif text-5xl">mejor amigo necesita.</span>
          </h1>
          <p className="text-white/90 text-lg leading-relaxed mb-8">
            Crea una cuenta gratuita para llevar el control de vacunas, citas médicas y el bienestar diario de tus mascotas en un solo lugar.
          </p>
          
          <div className="space-y-4">
            {["Agenda citas en segundos", "Historial médico digital", "Recordatorios automáticos"].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-200/20 backdrop-blur-sm flex items-center justify-center border border-emerald-200/30">
                  <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-emerald-50 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-emerald-200/40 text-xs flex justify-between items-center w-full">
          <p>© 2026 NuVet. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacidad</span>
            <span className="hover:text-white cursor-pointer transition-colors">Términos</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 h-full bg-white relative">
        <div className="w-full max-w-md space-y-7">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-emerald-950 tracking-tight">Únete a NuVet</h2>
            <p className="text-emerald-800/60 font-medium tracking-tight leading-snug text-sm sm:text-base">
              Sé parte de las familias que ya gestionan la salud de sus peluditos de forma inteligente.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-4">
              {/* NOMBRE */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-emerald-900 font-medium text-sm ml-1">Nombre Completo</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 transition-colors group-hover:text-emerald-600" />
                  <Input
                    id="name"
                    placeholder="Tu nombre y apellido"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="pl-10 h-11 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-emerald-900 font-medium text-sm ml-1">Correo Electrónico</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 transition-colors group-hover:text-emerald-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="pl-10 h-11 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-emerald-900 font-medium text-sm ml-1">Contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 transition-colors group-hover:text-emerald-600" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className="pl-10 pr-10 h-11 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl text-sm"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all active:scale-[0.98] group" 
              disabled={isLoading}
            >
              {isLoading ? "Creando cuenta..." : (
                <span className="flex items-center justify-center">
                  Crear Cuenta Gratis
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-emerald-800/60 font-medium">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline underline-offset-4">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}