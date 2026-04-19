# Billing + POS E2E Checklist

Fecha: 2026-04-09
Scope: API + Web (Facturacion, POS, documentos PDF/XML, polling de estados)

## Precondiciones

1. API levantada y autenticacion funcional.
2. Web levantado con usuario con permisos:
- billing:create
- billing:read
- pos:create
- pos:read
3. Existe al menos un ticket POS COMPLETED sin factura y uno con factura (si es posible).
4. Variables de facturacion configuradas (Faktur) para ambiente de prueba.

## Matriz E2E

### Caso 1: Emision desde Facturacion

1. Ir a /clinic/billing.
2. Ingresar Ticket ID de ticket COMPLETED.
3. Click en Emitir factura.

Resultado esperado:
- Muestra toast de exito con providerInvoiceId.
- Se muestra bloque de Ultima factura emitida.
- Botones visibles: Imprimir, Ver PDF, Descargar XML.

### Caso 2: Consulta de estado por providerInvoiceId

1. En Consultar estado externo, pegar providerInvoiceId.
2. Click en Consultar estado.

Resultado esperado:
- Se renderiza Estado, Comprobante, Clave de acceso, Autorizado en y Observacion.
- Botones visibles: Imprimir factura, Ver PDF, Descargar XML.

### Caso 3: Polling automatico para estado pendiente

1. Emitir con modo asincrono activado (si aplica en proveedor).
2. Verificar que estado inicial sea pending/processing.

Resultado esperado:
- Se muestra mensaje de actualizacion automatica cada 10s.
- El estado se refresca automaticamente.
- Si no cambia tras varios intentos, aparece mensaje informativo.

### Caso 4: Impresion desde Facturacion

1. Con factura consultada, click en Imprimir factura.

Resultado esperado:
- Si existe PDF en proveedor: abre documento para imprimir.
- Si no existe PDF: abre vista imprimible fallback con datos de factura.

### Caso 5: Ver PDF desde Facturacion

1. Click en Ver PDF.

Resultado esperado:
- Si existe URL en API: abre PDF.
- Si no existe: muestra aviso de no disponibilidad.

### Caso 6: Descargar XML desde Facturacion

1. Click en Descargar XML.

Resultado esperado:
- Si existe URL en API: abre XML.
- Si no existe: muestra aviso de no disponibilidad.

### Caso 7: Flujo desde POS Historial

1. Ir a /clinic/pos, tab Historial.
2. En una fila con factura, ejecutar:
- Imprimir
- Ver PDF
- Descargar XML

Resultado esperado:
- Acciones funcionan por fila con indicador de carga.
- Si no existe providerInvoiceId local, intenta resolver por estado de ticket.
- Si no existe factura, muestra mensaje de advertencia.

### Caso 8: Polling automatico en POS

1. Tener al menos una transaccion con invoice.status pendiente.
2. Mantener abierta la vista Historial.

Resultado esperado:
- Refetch automatico cada 15s mientras existan pendientes.

## Verificacion de API

### Endpoint estado por ticket

GET /api/v1/billing/pos-tickets/:ticketId/status

Resultado esperado:
- Retorna ticketId, providerInvoiceId, persisted y external.

### Endpoints proxy documentos

1. GET /api/v1/billing/external/:providerInvoiceId/pdf
2. GET /api/v1/billing/external/:providerInvoiceId/xml

Resultado esperado:
- Retorna providerInvoiceId, format, url.
- Si no existe documento, retorna 404 controlado.

## Verificacion de observabilidad

Buscar en logs eventos:

1. billing.issue.request
2. billing.issue.success
3. billing.status.success
4. billing.document.url
5. billing.provider.issue.success
6. billing.provider.status.success
7. billing.provider.http.error (si aplica)
8. billing.provider.timeout (si aplica)

Resultado esperado:
- Cada evento incluye contexto util: tenantId, ticketId/providerInvoiceId, durationMs cuando aplica.

## Pruebas automatizadas ejecutadas

1. API: src/billing/application/billing.service.spec.ts
- Estado: PASS (3/3)

## Criterio de aceptacion final

Se considera aprobado cuando:

1. Se puede emitir factura desde ticket POS COMPLETED.
2. Se puede consultar estado por providerInvoiceId y por ticket.
3. Se puede Imprimir, Ver PDF y Descargar XML desde Facturacion y POS.
4. Estados pending se actualizan automaticamente.
5. Logs estructurados de facturacion quedan trazables.
