# Testing Guidelines - Nuvet Web

## Descripción

Guía para escribir y ejecutar tests en el proyecto Nuvet usando Vitest.

## Estructura de Tests

### Ubicación
- **Unit tests:** Junto al archivo a testear con sufijo `.test.ts` o `.test.tsx`
- **Ejemplo:** `features/appointments/lib/agenda-utils.test.ts` para `agenda-utils.ts`

### Patrón Básico

```typescript
import { describe, it, expect } from 'vitest';

describe('FunctionName', () => {
    it('should return expected value when given input X', () => {
        const result = functionUnderTest(input);
        expect(result).toBe(expected);
    });

    describe('nested context', () => {
        it('should handle edge case', () => {
            // ...
        });
    });
});
```

## Ejemplos por Tipo

### 1. Testing Funciones Utilidad (Lib Functions)

```typescript
// features/appointments/lib/agenda-utils.test.ts
import { describe, it, expect } from 'vitest';
import { getSlotsForDay, doRangesOverlap } from './agenda-utils';

describe('agenda-utils', () => {
    describe('getSlotsForDay', () => {
        it('returns 30-min slots between 9 and 17 by default', () => {
            const date = new Date(2026, 0, 1);
            const slots = getSlotsForDay(date);
            
            expect(slots.length).toBe(16);
            expect(slots[0].start.getHours()).toBe(9);
            expect(slots[slots.length - 1].end.getHours()).toBe(17);
        });

        it('respects custom start and end hours', () => {
            const slots = getSlotsForDay(new Date(2026, 0, 1), 8, 12);
            expect(slots.length).toBe(8);
        });
    });

    describe('doRangesOverlap', () => {
        it('returns true when ranges overlap', () => {
            const result = doRangesOverlap(
                new Date(2026, 0, 1, 10, 0),
                new Date(2026, 0, 1, 11, 0),
                new Date(2026, 0, 1, 10, 30),
                new Date(2026, 0, 1, 11, 30)
            );
            expect(result).toBe(true);
        });

        it('returns false when ranges do not overlap', () => {
            const result = doRangesOverlap(
                new Date(2026, 0, 1, 10, 0),
                new Date(2026, 0, 1, 10, 30),
                new Date(2026, 0, 1, 10, 30),
                new Date(2026, 0, 1, 11, 0)
            );
            expect(result).toBe(false);
        });
    });
});
```

### 2. Testing Hooks (React Query)

```typescript
// features/appointments/hooks/use-appointments.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAppointments } from './use-appointments';
import * as appointmentsService from '../services/appointments-service';

vi.mock('../services/appointments-service');

describe('useAppointments', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch appointments successfully', async () => {
        const mockData = [
            { id: '1', title: 'Appointment 1', time: '10:00' }
        ];
        vi.spyOn(appointmentsService, 'fetchAppointments')
            .mockResolvedValue(mockData);

        const { result } = renderHook(() => useAppointments());

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockData);
    });

    it('should handle errors gracefully', async () => {
        const error = new Error('API Error');
        vi.spyOn(appointmentsService, 'fetchAppointments')
            .mockRejectedValue(error);

        const { result } = renderHook(() => useAppointments());

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(error);
    });
});
```

### 3. Testing Componentes

```typescript
// features/appointments/components/AppointmentCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppointmentCard } from './AppointmentCard';

describe('AppointmentCard', () => {
    const mockAppointment = {
        id: '1',
        title: 'Cita Veterinaria',
        time: '10:00',
        clientName: 'Juan Pérez',
    };

    it('should render appointment details', () => {
        render(<AppointmentCard appointment={mockAppointment} />);
        
        expect(screen.getByText('Cita Veterinaria')).toBeInTheDocument();
        expect(screen.getByText('10:00')).toBeInTheDocument();
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    it('should handle click events', async () => {
        const handleClick = vi.fn();
        const { user } = render(
            <AppointmentCard appointment={mockAppointment} onClick={handleClick} />
        );
        
        await user.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledWith(mockAppointment.id);
    });
});
```

## Comandos

```bash
# Ejecutar tests una sola vez
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage

# Tests de un archivo específico
npm run test -- features/appointments/lib/agenda-utils.test.ts

# Tests con patrón de nombre
npm run test -- --grep "useAppointments"
```

## Fixtures y Mocks Comunes

### Mock de API Service

```typescript
import { vi } from 'vitest';
import * as appointmentsService from '../services/appointments-service';

// Mock de función
vi.spyOn(appointmentsService, 'fetchAppointments')
    .mockResolvedValue([/* datos */]);

// Limpiar después
vi.clearAllMocks();
```

### Mock de Zustand Store

```typescript
import { create } from 'zustand';
import { vi } from 'vitest';

// Crear store mock
const useTestStore = create((set) => ({
    value: 0,
    setValue: (v) => set({ value: v }),
}));

vi.mock('@/features/store/appointments.store', () => ({
    useAppointmentsStore: useTestStore,
}));
```

### Mock de React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
}

export function TestWrapper({ children }: { children: ReactNode }) {
    const testQueryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={testQueryClient}>
            {children}
        </QueryClientProvider>
    );
}

// Uso
const { result } = renderHook(() => useAppointments(), {
    wrapper: TestWrapper,
});
```

## Aserciones Comunes

```typescript
// Valores básicos
expect(value).toBe(expected);
expect(value).toEqual(expected);  // Para objetos
expect(value).toStrictEqual(expected);

// Strings
expect(text).toContain('substring');
expect(text).toMatch(/regex/);

// Arrays
expect(arr).toHaveLength(3);
expect(arr).toContain(item);

// Objetos
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('key', 'value');

// Booleans
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Nullish
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg1, arg2);
expect(fn).toHaveBeenCalledTimes(2);

// React Testing Library
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
```

## Buenas Prácticas

1. **Nombres descriptivos:** Describe qué test hace en términos de comportamiento
   ```typescript
   ✅ it('should return slots when getSlotsForDay is called with a date')
   ❌ it('test getSlotsForDay')
   ```

2. **AAA Pattern (Arrange, Act, Assert):**
   ```typescript
   it('should work', () => {
       // Arrange - preparar datos
       const input = createTestData();
       
       // Act - ejecutar función
       const result = functionUnderTest(input);
       
       // Assert - verificar resultado
       expect(result).toBe(expected);
   });
   ```

3. **Un concepto por test:** Cada test debe validar un único comportamiento

4. **No compartir estado entre tests:** Usar `beforeEach` para limpiar

5. **Tests independientes:** No depender del orden de ejecución

## Integración Continua

Los tests se ejecutan automáticamente en el pipeline CI/CD. Considera:
- Mantener los tests rápidos (< 1s por test idealmente)
- Usar mocks para dependencias externas
- Evitar tests flaky (que a veces pasan y a veces fallan)

