# Guía para Agentes de IA - Nuvet Web

## Descripción General

**Nuvet** es una plataforma SaaS para gestión de clínicas veterinarias construida con Next.js. Proporciona funcionalidades de agenda, historial médico, facturación, POS, reportes y más.

**Stack:** Next.js 16 + React 19 + TypeScript + Radix UI + TailwindCSS + React Query + Zustand

---

## Estructura del Proyecto

### Carpeta `src/`

```
src/
├── app/              # Next.js App Router
│   ├── auth/        # Páginas de autenticación
│   ├── clinic/      # Dashboard y páginas de clínica
│   ├── pages/       # Páginas públicas (marketing)
│   └── *.tsx        # Layouts y páginas principales
├── features/        # Módulos por dominio (PATRÓN PRINCIPAL)
│   ├── {feature}/
│   │   ├── components/    # Componentes específicos del feature
│   │   ├── hooks/         # Custom hooks (React Query, state)
│   │   ├── services/      # Funciones de API
│   │   ├── store/         # Zustand stores
│   │   └── lib/           # Utilidades del feature
│   ├── appointments/
│   ├── medical-records/
│   ├── billing/
│   ├── pos/
│   └── ... (25+ features)
├── shared/          # Código compartido
│   ├── components/  # Componentes UI reutilizables
│   ├── hooks/       # Hooks compartidos
│   └── lib/         # Utilidades globales (api-client, api-helpers, etc.)
└── middleware.ts    # Middleware de Next.js
```

### Carpeta `types/`

Paquete TypeScript separado (`@nuvet/types`) con tipos compartidos:
```
types/
├── src/
│   ├── index.ts           # Exporta tipos principales
│   └── api-contract.ts    # Contratos de API
└── package.json
```

---

## Patrones de Desarrollo

### 1. Features-Based Organization (Patrón Principal)

Cada feature es autónomo y sigue esta estructura:

```
features/appointments/
├── components/
│   ├── appointment-form.tsx
│   ├── appointment-list.tsx
│   └── clinic/                    # Componentes específicos del contexto
│       └── appointments-screen.tsx
├── hooks/
│   └── use-appointments.ts        # React Query hooks
├── services/
│   └── appointments-service.ts    # Funciones de API
├── store/
│   └── appointments.store.ts      # Estado con Zustand
└── lib/
    └── appointment-utils.ts       # Utilidades
```

### 2. Patrón de Hooks (React Query)

Todos los hooks de React Query están centralizados en `features/{feature}/hooks/use-{feature}.ts`:

```typescript
// Sintaxis típica
export function useAppointments(params = {}) {
    return useQuery({
        queryKey: ['appointments', params],
        queryFn: () => fetchAppointments(params),
    });
}

export function useCreateAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input) => createAppointment(input),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
    });
}
```

**Convención:** Query keys = `[featureName, params]`

### 3. Servicios de API

Los servicios usan `api-client` de `@/shared/lib/api-client`:

```typescript
import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';

export async function fetchAppointments(params = {}) {
    const response = await api.get('/appointments', { params });
    return unwrapPaginatedResponse(response.data);
}
```

**Nota:** Las respuestas usan patrón de envoltura (envelope pattern).

### 4. Validación de Formularios

Se usa **React Hook Form** + **Zod** para validación:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(1, 'Required'),
    email: z.string().email(),
});

export function AppointmentForm() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });
    // ...
}
```

### 5. Componentes UI

Componentes base de Radix UI en `shared/components/ui/`:
- Button, Card, Dialog, Form, Input, Select, Table, etc.

**Estilo:** TailwindCSS con `cn()` helper (de `clsx`).

### 6. Estado Global (Zustand)

Stores de Zustand en `features/{feature}/store/{feature}.store.ts`:

```typescript
import { create } from 'zustand';

interface BranchState {
    selectedBranchId: string | null;
    setSelectedBranchId: (id: string) => void;
}

export const useBranchesStore = create<BranchState>((set) => ({
    selectedBranchId: null,
    setSelectedBranchId: (id) => set({ selectedBranchId: id }),
}));
```

---

## Comandos de Desarrollo

```bash
# Desarrollo
npm run dev              # Inicia servidor en puerto 4200

# Build & Deploy
npm run build            # Construye para producción
npm start                # Ejecuta servidor de producción (puerto 4200)

# Calidad de código
npm run lint             # ESLint check
npm run test             # Vitest (una sola ejecución)
npm run test:watch       # Vitest en modo watch
npm run test:coverage    # Reporte de cobertura
```

---

## Configuración TypeScript

- **Strict mode:** Activado (`"strict": true`)
- **Path aliases:** `@/*` → `./src/*`
- **Target:** ES2017
- **Module:** esnext (con bundler module resolution)

---

## Variables de Entorno

Archivo `.env.local` (no incluido en repo):

```
NEXT_PUBLIC_APP_URL=https://nuvet.app
# Agregar según necesidad
```

---

## Convenciones de Código

### Nombres de archivos
- **Componentes:** PascalCase, sufijo `.tsx` (e.g., `AppointmentForm.tsx`)
- **Hooks:** `use-` prefix en kebab-case (e.g., `use-appointments.ts`)
- **Servicios:** kebab-case con sufijo `-service.ts` (e.g., `appointments-service.ts`)
- **Stores:** kebab-case con sufijo `.store.ts` (e.g., `appointments.store.ts`)

### Estructura de carpetas por tipo
- **Componentes context-specific:** `components/{context}/` (e.g., `components/clinic/pos-screen.tsx`)
- **Componentes compartidos:** `shared/components/ui/` (componentes base) o `shared/components/` (componentes funcionales)

### Imports
```typescript
// Preferir path aliases
import { Button } from '@/shared/components/ui/button';
import { useAppointments } from '@/features/appointments/hooks';

// Evitar relative imports en features diferentes
// ❌ import { Button } from '../../../shared/components/ui/button';
// ✅ import { Button } from '@/shared/components/ui/button';
```

### TypeScript
- Usar interfaces explícitas para tipos complejos
- Exportar tipos desde `hooks/` cuando se usen en múltiples lugares
- Importar tipos del paquete `@nuvet/types` para contratos de API

---

## Patrones Comunes

### Agregar una nueva funcionalidad

1. **Crear estructura de carpeta:**
   ```
   src/features/{nueva-feature}/{components,hooks,services,store,lib}
   ```

2. **Crear hook con React Query:**
   ```typescript
   // features/{feature}/hooks/use-{feature}.ts
   export function use{Feature}(params = {}) { /* ... */ }
   ```

3. **Crear servicio de API:**
   ```typescript
   // features/{feature}/services/{feature}-service.ts
   export async function fetch{Features}(params = {}) { /* ... */ }
   ```

4. **Crear componente:**
   ```typescript
   // features/{feature}/components/{Component}.tsx
   import { use{Feature} } from '../hooks';
   ```

### Modificar tipos

1. Actualizar archivo correspondiente en `types/src/api-contract.ts`
2. Ejecutar `npm run build` en carpeta `types/`
3. Los cambios se sincronizan automáticamente en `src/features/`

---

## Documentación Existente

- [Billing & POS E2E Checklist](./docs/billing-pos-e2e-checklist.md)

---

## Información de Debugging

- **API Client:** `@/shared/lib/api-client` (Axios wrapper)
- **Helpers de API:** `@/shared/lib/api-helpers` (unwrapResponse, unwrapPaginatedResponse)
- **Permissions:** `@/shared/lib/permissions` (resolveUserPermissions)
- **Toast notifications:** `sonner` (ver imports de `toast`)

---

## Características Principales

| Feature | Ubicación | Descripción |
|---------|-----------|-------------|
| Appointments | `features/appointments/` | Agenda veterinaria |
| Medical Records | `features/medical-records/` | Historial clínico |
| Billing | `features/billing/` | Facturación electrónica |
| POS | `features/pos/` | Punto de venta |
| Branches | `features/branches/` | Multi-sucursal |
| Clients | `features/clients/` | Gestión de clientes |
| Pets | `features/pets/` | Registro de mascotas |
| Surgeries | `features/surgeries/` | Seguimiento quirúrgico |
| Aesthetics | `features/aesthetics/` | Grooming/Estética |
| Reports | `features/reports/` | Analytics e insights |
| Settings | `features/settings/` | Configuración de tenant |
| Promotions | `features/promotions/` | Descuentos |

---

## Acciones Rápidas para Agentes

**Crear un nuevo hook:**
```bash
# 1. Crear archivo en features/{feature}/hooks/use-{name}.ts
# 2. Importar useQuery/useMutation de @tanstack/react-query
# 3. Importar función de servicio de ../services/
# 4. Exportar hook con patrón: use{Feature}()
```

**Crear un nuevo endpoint:**
```bash
# 1. Crear función en features/{feature}/services/{feature}-service.ts
# 2. Usar api.get/post/put/delete con @/shared/lib/api-client
# 3. Usar unwrapResponse() para parsear respuestas
# 4. Exportar función para uso en hooks
```

**Agregar un componente:**
```bash
# 1. Crear archivo en features/{feature}/components/{Component}.tsx
# 2. Importar hooks si necesita datos
# 3. Usar componentes UI de @/shared/components/ui/
# 4. Aplicar estilos con TailwindCSS
```

