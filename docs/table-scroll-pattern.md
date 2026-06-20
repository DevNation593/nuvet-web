# Patrón de Scroll para Tablas

## Descripción

Las tablas en Nuvet deben tener scroll interno para mantener la armonía de la interfaz y evitar que la barra de navegación se expanda sin control.

## Implementación

### Estructura Básica

```tsx
<div className="overflow-x-auto max-h-[600px]">
    <table className="w-full min-w-[760px] text-sm">
        <thead className="border-y bg-muted/30 text-muted-foreground sticky top-0 z-10 bg-white dark:bg-gray-800">
            <tr>
                <th className="px-4 py-3 text-left font-medium">Columna 1</th>
                <th className="px-4 py-3 text-left font-medium">Columna 2</th>
                {/* ... más columnas */}
            </tr>
        </thead>
        <tbody>
            {/* Filas de datos */}
        </tbody>
    </table>
</div>
```

## Clases Clave

### Contenedor de Tabla
- `overflow-x-auto`: Permite scroll horizontal para tablas anchas
- `max-h-[600px]`: Limita la altura máxima (ajustar según necesidad)

### Header de Tabla (thead)
- `sticky top-0`: Fija el header al hacer scroll vertical
- `z-10`: Asegura que el header esté sobre las filas
- `bg-white dark:bg-gray-800`: **Background sólido OBLIGATORIO** para evitar que el contenido se sobreponga al hacer scroll
- Combinar con `bg-muted/30` para el estilo: `bg-muted/30 sticky top-0 z-10 bg-white dark:bg-gray-800`

### Tabla
- `w-full`: Ancho completo del contenedor
- `min-w-[760px]`: Ancho mínimo para scroll horizontal (ajustar según columnas)
- `text-sm`: Tamaño de texto consistente

## Alturas Recomendadas

- **Dashboard tables**: `max-h-[600px]`
- **Modal/Dialog tables**: `max-h-[400px]`
- **Sidebar tables**: `max-h-[480px]`
- **Full screen tables**: `max-h-[calc(100vh-200px)]`

## Beneficios

1. **Navegación fija**: La barra de navegación mantiene su posición
2. **Headers visibles**: Los encabezados permanecen visibles al hacer scroll
3. **Mejor UX**: Evita scrolls infinitos de página
4. **Responsive**: Se adapta a diferentes tamaños de pantalla

## Ejemplo Completo

```tsx
export function ProductsTable() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useProducts({ page, limit: 10 });
    
    if (isLoading) return <Loader />;
    
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Productos</h2>
                <Button>Agregar</Button>
            </div>
            
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead className="border-y bg-muted/30 text-muted-foreground sticky top-0 z-10 bg-white dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Producto</th>
                                    <th className="px-4 py-3 text-left font-medium">SKU</th>
                                    <th className="px-4 py-3 text-left font-medium">Precio</th>
                                    <th className="px-4 py-3 text-left font-medium">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.data.map((product) => (
                                    <tr key={product.id} className="border-b hover:bg-muted/50">
                                        <td className="px-4 py-3">{product.name}</td>
                                        <td className="px-4 py-3">{product.sku}</td>
                                        <td className="px-4 py-3">${product.price}</td>
                                        <td className="px-4 py-3">{product.stock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Paginación */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Mostrando {data?.data.length} de {data?.meta.total} productos
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        Anterior
                    </Button>
                    <span className="text-sm">
                        Página {page} de {data?.meta.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= data?.meta.totalPages}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
    );
}
```

## Notas Importantes

- **CRÍTICO**: Siempre incluir `sticky top-0 z-10 bg-white dark:bg-gray-800` en el `<thead>` para evitar que el contenido se sobreponga
- El `bg-white dark:bg-gray-800` es **OBLIGATORIO** para que el sticky funcione correctamente y el contenido no se vea a través del header
- Combinar con `bg-muted/30` para el estilo visual
- Ajustar `max-h-[]` según el contexto (dashboard, modal, etc.)
- Usar `min-w-[]` apropiado según el número de columnas
- El contenedor padre debe tener `rounded-md border` para el borde visual
- **SIEMPRE usar paginación** para tablas con datos del servidor (no cargar todo con `limit: 100`)

## Paginación

Las tablas que consumen datos del servidor deben implementar paginación:

```tsx
const [page, setPage] = useState(1);
const { data } = useData({ page, limit: 10 }); // Usar límite de 10 items por página

// Controles de paginación
<div className="flex items-center justify-between">
    <p className="text-sm text-muted-foreground">
        Mostrando {data?.data.length} de {data?.meta.total} elementos
    </p>
    <div className="flex items-center gap-2">
        <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
        >
            Anterior
        </Button>
        <span className="text-sm">Página {page} de {data?.meta.totalPages}</span>
        <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= data?.meta.totalPages}
        >
            Siguiente
        </Button>
    </div>
</div>
```

## Aplicado en

- ✅ `features/appointments/components/clinic/appointments-dashboard-table.tsx` (con paginación)
- ✅ `features/pets/components/clinic/pets-dashboard-table.tsx` (con paginación)
- ✅ `features/store/components/clinic/store-dashboard-table.tsx` (con paginación)
- ✅ `features/clients/components/clinic/clients-management.tsx` (con paginación)
- ✅ `features/vaccinations/components/clinic/vaccinations-management.tsx`
- ✅ `features/surgeries/components/clinic/surgeries-management.tsx`
- ✅ `features/pets/components/clinic/pets-management.tsx`
- ✅ `features/aesthetics/components/clinic/aesthetics-management.tsx`
- ✅ `features/billing/components/clinic/billing-management.tsx`
- ✅ `features/adoptions/components/clinic/adoptions-management.tsx` (2 tablas)
