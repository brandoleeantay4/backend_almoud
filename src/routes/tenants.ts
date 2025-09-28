import { Router } from 'express';
import {
  getAllTenants,
  createTenant,
  getTenantStats,
  updateTenant,
  toggleTenantStatus,
  deleteTenant
} from '../controllers/tenantController';
import { authenticateToken } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenantResolver';

const router = Router();

// Middleware: Solo Super Admin puede acceder a estas rutas
const requireSuperAdmin = (req: any, res: any, next: any) => {
  console.log('🔐 Verificando acceso Super Admin:', {
    email: req.user?.email,
    isSuperAdmin: req.isSuperAdmin
  });

  if (!req.isSuperAdmin) {
    return res.status(403).json({ 
      error: 'Solo Super Admin puede gestionar tenants',
      requiredRole: 'super_admin'
    });
  }
  next();
};

// Aplicar middlewares a todas las rutas
router.use(authenticateToken);
router.use(tenantResolver);
router.use(requireSuperAdmin);

// Rutas de gestión de tenants
router.get('/', getAllTenants);                    // Ver todos los tenants
router.post('/', createTenant);                    // Crear nuevo tenant
router.get('/:tenantId/stats', getTenantStats);    // Estadísticas de tenant
router.put('/:tenantId', updateTenant);            // Actualizar tenant
router.patch('/:tenantId/status', toggleTenantStatus); // Activar/Suspender
router.delete('/:tenantId', deleteTenant);         // Eliminar tenant (PELIGROSO)

export default router;
