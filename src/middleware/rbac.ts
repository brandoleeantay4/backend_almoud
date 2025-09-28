import { Response, NextFunction } from 'express';
import { prisma } from '../app';

export const checkPermission = (module: string, action: string) => {
  return async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🔍 Verificando permisos:', { 
        module, 
        action, 
        userEmail: req.user?.email,
        isSuperAdmin: req.isSuperAdmin,
        tenantId: req.tenantId 
      });

      // 1. Super admin bypasses all permissions
      if (req.isSuperAdmin) {
        console.log('✅ Super Admin - acceso completo');
        return next();
      }

      if (!req.user?.id) {
        console.log('❌ No hay usuario autenticado');
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      // 2. Obtener usuario con información completa
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { assignedRole: true }
      });

      if (!user || !user.isActive) {
        console.log('❌ Usuario no encontrado o inactivo');
        res.status(403).json({ error: 'Usuario inactivo' });
        return;
      }

      console.log('👤 Usuario encontrado:', {
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        hasAssignedRole: !!user.assignedRole
      });

      // 3. CRUCIAL: Si es admin del tenant, dar acceso total
      if (user.role === 'admin' && user.tenantId === req.tenantId) {
        console.log('✅ Tenant Admin - acceso completo al tenant');
        return next();
      }

      // 4. Si es super_admin en rol, también dar acceso total
      if (user.role === 'super_admin') {
        console.log('✅ Super Admin por rol - acceso completo');
        return next();
      }

      // 5. Verificar permisos del rol asignado
      const rolePermissions = user.assignedRole?.permissions as any;
      const hasRolePermission = rolePermissions?.[module]?.[action];

      // 6. Verificar permisos directos del usuario
      const hasDirectPermission = user.permissions.includes(`${module}:${action}`);

      console.log('🔐 Verificando permisos específicos:', {
        hasRolePermission,
        hasDirectPermission,
        rolePermissions: rolePermissions?.[module],
        userPermissions: user.permissions
      });

      if (!hasRolePermission && !hasDirectPermission) {
        console.log('❌ Sin permisos suficientes');
        res.status(403).json({ 
          error: `Sin permisos para ${action} en ${module}`,
          debug: {
            userRole: user.role,
            userTenant: user.tenantId,
            requestTenant: req.tenantId,
            hasAssignedRole: !!user.assignedRole,
            module,
            action
          }
        });
        return;
      }

      console.log('✅ Permisos verificados - acceso permitido');
      next();

    } catch (error) {
      console.error('❌ Error verificando permisos:', error);
      res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
};
