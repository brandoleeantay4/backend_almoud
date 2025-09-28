import { Response, NextFunction } from 'express';
import { prisma } from '../app';

export const tenantResolver = async (
  req: any, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const email = req.user?.email;
    if (!email) {
      return next();
    }

    const domain = email.split('@')[1];
    const subdomain = domain.split('.')[0];

    // Super Admin check
    if (domain === 'almoud.pe') {
      req.isSuperAdmin = true;
      req.tenantId = req.query.tenantId || req.body.tenantId;
      return next();
    }

    // Tenant user check
    if (domain.endsWith('.almoud.pe')) {
      const tenant = await prisma.tenant.findUnique({
        where: { subdomain }
      });

      if (!tenant) {
        res.status(404).json({ 
          error: 'Restaurante no encontrado' 
        });
        return;
      }

      if (tenant.status !== 'active') {
        res.status(403).json({ 
          error: 'Restaurante suspendido' 
        });
        return;
      }

      req.tenantId = tenant.id;
      req.tenantSubdomain = subdomain;
    }

    next();
  } catch (error) {
    console.error('Error en tenantResolver:', error);
    res.status(500).json({ error: 'Error resolviendo tenant' });
  }
};
