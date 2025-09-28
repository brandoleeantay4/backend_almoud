import { Router } from 'express';
import {
  getTenantUsers,
  createTenantUser,
  assignRoleToUser,
  toggleUserStatus
} from '../controllers/userManagementController';
import { authenticateToken } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenantResolver';
import { checkPermission } from '../middleware/rbac';

const router = Router();

router.use(authenticateToken);
router.use(tenantResolver);

// Rutas de gestión de usuarios
router.get('/', checkPermission('users', 'view'), getTenantUsers);
router.post('/', checkPermission('users', 'create'), createTenantUser);
router.put('/:userId/role', checkPermission('users', 'assign_roles'), assignRoleToUser);
router.put('/:userId/status', checkPermission('users', 'edit'), toggleUserStatus);

export default router;
