import {
    AppPermission,
    PermissionAction,
    PermissionModule,
    UserRole,
    TenantPlan,
    PLAN_MODULES,
    getEffectivePermissions,
    hasAnyPermission,
} from '@nuvet/types';

// --- User type ----------------------------------------------------------------

export type AuthUserWithPermissions = {
    role: UserRole;
    tenantPlan?: TenantPlan;
    permissions?: AppPermission[];
    /** Modulos activos configurados por el tenant (sobrescribe PLAN_MODULES) */
    activeModules?: PermissionModule[];
} | null;

// --- Role-based permissions (para CRUD dentro del modulo) ---------------------

export function resolveUserPermissions(user: AuthUserWithPermissions): AppPermission[] {
    if (!user) return [];
    if (Array.isArray(user.permissions) && user.permissions.length > 0) {
        return user.permissions;
    }
    if (user.tenantPlan) {
        return getEffectivePermissions(user.role, user.tenantPlan);
    }
    return [];
}

// --- Tenant module activation -------------------------------------------------

/**
 * Devuelve los modulos activos del tenant.
 * Prioridad: activeModules explicitos -> PLAN_MODULES del plan -> lista vacia.
 */
export function resolveActiveModules(user: AuthUserWithPermissions): PermissionModule[] {
    if (!user) return [];
    if (Array.isArray(user.activeModules) && user.activeModules.length > 0) {
        return user.activeModules;
    }
    if (user.tenantPlan) {
        return PLAN_MODULES[user.tenantPlan] ?? [];
    }
    return [];
}

export function isTenantModuleActive(
    module: PermissionModule,
    activeModules: PermissionModule[],
): boolean {
    return activeModules.includes(module);
}

// --- UI display modules -------------------------------------------------------

export const DISPLAYABLE_MODULES: Array<{ module: PermissionModule; label: string; description: string }> = [
    { module: PermissionModule.APPOINTMENTS,    label: 'Agenda / Citas',          description: 'Gestion de citas y agenda del personal' },
    { module: PermissionModule.PETS,            label: 'Pacientes',               description: 'Registro y seguimiento de mascotas' },
    { module: PermissionModule.CLIENTS,         label: 'Clientes',                description: 'Base de datos de clientes / duenos' },
    { module: PermissionModule.MEDICAL_RECORDS, label: 'Expedientes medicos',     description: 'Consultas, diagnostico y tratamientos' },
    { module: PermissionModule.VACCINATIONS,    label: 'Vacunacion',              description: 'Control y recordatorios de vacunas' },
    { module: PermissionModule.AESTHETICS,      label: 'Estetica / Grooming',     description: 'Servicios de bano, corte y estetica' },
    { module: PermissionModule.SURGERIES,       label: 'Cirugias',                description: 'Programacion y seguimiento de cirugias' },
    { module: PermissionModule.STORE,           label: 'Tienda e inventario',     description: 'Productos, stock y ordenes de venta' },
    { module: PermissionModule.POS,             label: 'Punto de venta (POS)',    description: 'Caja rapida con carrito e impresion de recibos' },
    { module: PermissionModule.PROMOTIONS,      label: 'Promociones',             description: 'Descuentos, codigos y ofertas especiales' },
    { module: PermissionModule.ADOPTIONS,       label: 'Adopciones',              description: 'Publicaciones y gestion de solicitudes' },
    { module: PermissionModule.NOTIFICATIONS,   label: 'Notificaciones',          description: 'Plantillas y envio de mensajes automatizados' },
    { module: PermissionModule.USERS,           label: 'Usuarios y roles',        description: 'Alta y gestion del personal de la clinica' },
];

/** Modulos que no se pueden desactivar (siempre activos) */
export const REQUIRED_MODULES: PermissionModule[] = [
    PermissionModule.TENANT_SETTINGS,
];

// --- Route -> Module map ------------------------------------------------------

export const clinicRouteModules: Array<{ prefix: string; module: PermissionModule }> = [
    { prefix: '/clinic/appointments',    module: PermissionModule.APPOINTMENTS },
    { prefix: '/clinic/clients',         module: PermissionModule.CLIENTS },
    { prefix: '/clinic/pets',            module: PermissionModule.PETS },
    { prefix: '/clinic/medical-records', module: PermissionModule.MEDICAL_RECORDS },
    { prefix: '/clinic/vaccinations',    module: PermissionModule.VACCINATIONS },
    { prefix: '/clinic/aesthetics',      module: PermissionModule.AESTHETICS },
    { prefix: '/clinic/surgeries',       module: PermissionModule.SURGERIES },
    { prefix: '/clinic/store',           module: PermissionModule.STORE },
    { prefix: '/clinic/pos',             module: PermissionModule.POS },
    { prefix: '/clinic/promotions',      module: PermissionModule.PROMOTIONS },
    { prefix: '/clinic/adoptions',       module: PermissionModule.ADOPTIONS },
    { prefix: '/clinic/settings',        module: PermissionModule.TENANT_SETTINGS },
];

/**
 * Verifica si el pathname es accesible dado el conjunto de modulos activos del tenant.
 */
export function canAccessClinicPath(pathname: string, activeModules: PermissionModule[]): boolean {
    if (pathname === '/clinic' || pathname === '/clinic/') return true;
    const match = clinicRouteModules.find((entry) => pathname.startsWith(entry.prefix));
    if (!match) return true;
    return activeModules.includes(match.module);
}

// --- Re-export for convenience ------------------------------------------------
export { hasAnyPermission, PermissionModule, PermissionAction };
