import { Router } from 'express';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissionMatrix
} from '../controllers/roleController';
import { authenticateToken } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenantResolver';
import { checkPermission } from '../middleware/rbac';

const router = Router();

// Aplicar middlewares a todas las rutas
router.use(authenticateToken);
router.use(tenantResolver);

// Rutas de roles
router.get('/', checkPermission('users', 'view'), getRoles);
router.post('/', checkPermission('users', 'create'), createRole);
router.put('/:roleId', checkPermission('users', 'edit'), updateRole);
router.delete('/:roleId', checkPermission('users', 'delete'), deleteRole);

// Obtener matriz de permisos
router.get('/permissions', getPermissionMatrix);

export default router;
