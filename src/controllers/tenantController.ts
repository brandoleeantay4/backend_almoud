import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../app';

// Obtener todos los tenants (Solo Super Admin)
export const getAllTenants = async (req: any, res: Response): Promise<void> => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        users: {
          select: { 
            id: true, 
            name: true, 
            lastname: true, 
            email: true, 
            role: true, 
            isActive: true,
            lastLogin: true
          }
        },
        roles: {
          select: { id: true, name: true, isCustom: true }
        },
        _count: {
          select: { users: true, roles: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Obtenidos ${tenants.length} tenants`);

    res.json({ 
      tenants,
      total: tenants.length 
    });
  } catch (error) {
    console.error('Error obteniendo tenants:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear nuevo tenant (Solo Super Admin)
export const createTenant = async (req: any, res: Response): Promise<void> => {
  try {
    const { 
      subdomain, 
      name, 
      plan = 'basic', 
      adminEmail, 
      adminPassword, 
      adminName, 
      adminLastname 
    } = req.body;

    console.log('🏢 Iniciando creación de tenant:', { subdomain, name, adminEmail });

    // Validaciones
    if (!subdomain || !name || !adminEmail || !adminPassword || !adminName || !adminLastname) {
      res.status(400).json({ 
        message: 'Todos los campos son requeridos',
        required: ['subdomain', 'name', 'adminEmail', 'adminPassword', 'adminName', 'adminLastname']
      });
      return;
    }

    // Validar subdomain (solo letras, números, guiones)
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      res.status(400).json({
        message: 'El subdominio solo puede contener letras minúsculas, números y guiones'
      });
      return;
    }

    // Validar que subdomain no sea palabra reservada
    const reservedWords = ['admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'almoud'];
    if (reservedWords.includes(subdomain)) {
      res.status(400).json({
        message: 'El subdominio no está disponible (palabra reservada)'
      });
      return;
    }

    // Verificar que el subdomain no exista
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain }
    });

    if (existingTenant) {
      res.status(400).json({
        message: `Ya existe un restaurante con el subdominio "${subdomain}"`
      });
      return;
    }

    // Verificar que el email del admin no exista
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      res.status(400).json({
        message: 'Ya existe un usuario con ese email'
      });
      return;
    }

    // Validar formato de email
    if (!adminEmail.endsWith('.almoud.pe')) {
      res.status(400).json({
        message: 'El email del administrador debe usar el formato: admin@[subdominio].almoud.pe'
      });
      return;
    }

    console.log('✅ Validaciones pasadas, creando tenant...');

    // Crear tenant
    const tenant = await prisma.tenant.create({
      data: {
        subdomain,
        name,
        plan,
        status: 'active',
        settings: {
          currency: 'PEN',
          timezone: 'America/Lima',
          language: 'es',
          businessType: 'restaurant',
          features: {
            inventory: true,
            recipes: true,
            reports: true,
            multiUser: plan !== 'basic'
          }
        },
        subscription: {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
          billing: 'monthly',
          status: 'active'
        }
      }
    });

    console.log(`✅ Tenant creado: ${tenant.name} (ID: ${tenant.id})`);

    // Crear usuario admin del tenant
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        lastname: adminLastname,
        role: 'admin',
        tenantId: tenant.id,
        createdBy: req.user.userId,
        isActive: true
      }
    });

    console.log(`✅ Admin creado: ${adminUser.email} (ID: ${adminUser.id})`);

    // Crear roles básicos para el tenant
    const basicRoles = [
      {
        name: 'Cajero',
        description: 'Empleado con acceso a caja y ventas',
        permissions: {
          dashboard: { view: true },
          orders: { view: true, create: true, edit: true },
          inventory: { view: true },
          reports: { view: true }
        }
      },
      {
        name: 'Cocinero',
        description: 'Empleado con acceso a cocina y preparación',
        permissions: {
          dashboard: { view: true },
          orders: { view: true, edit: true },
          recipes: { view: true, create: true },
          inventory: { view: true, edit: true }
        }
      },
      {
        name: 'Mesero',
        description: 'Empleado con atención al cliente',
        permissions: {
          dashboard: { view: true },
          orders: { view: true, create: true },
          customers: { view: true, create: true }
        }
      },
      {
        name: 'Supervisor',
        description: 'Supervisor de área con permisos extendidos',
        permissions: {
          dashboard: { view: true },
          orders: { view: true, create: true, edit: true, delete: true },
          inventory: { view: true, edit: true },
          reports: { view: true, export: true },
          users: { view: true }
        }
      }
    ];

    const createdRoles = [];
    for (const roleData of basicRoles) {
      const role = await prisma.role.create({
        data: {
          ...roleData,
          tenantId: tenant.id,
          createdBy: adminUser.id,
          isCustom: false, // Roles del sistema
          isActive: true
        }
      });
      createdRoles.push(role);
    }

    console.log(`✅ ${createdRoles.length} roles básicos creados`);

    // Crear configuraciones iniciales adicionales
    const initialData = {
      categories: ['Entradas', 'Platos principales', 'Postres', 'Bebidas'],
      paymentMethods: ['Efectivo', 'Tarjeta', 'Yape', 'Plin'],
      tables: Array.from({ length: 10 }, (_, i) => `Mesa ${i + 1}`)
    };

    console.log('🎉 Tenant creado completamente:', {
      tenant: tenant.name,
      subdomain: tenant.subdomain,
      admin: adminUser.email,
      roles: createdRoles.length
    });

    res.status(201).json({
      message: 'Tenant creado exitosamente',
      tenant: {
        id: tenant.id,
        subdomain: tenant.subdomain,
        name: tenant.name,
        plan: tenant.plan,
        status: tenant.status,
        createdAt: tenant.createdAt
      },
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        lastname: adminUser.lastname,
        role: adminUser.role
      },
      initialData: {
        rolesCreated: createdRoles.length,
        roleNames: createdRoles.map(r => r.name),
        features: tenant.settings
      },
      accessInfo: {
        loginUrl: `http://localhost:3000/login`,
        adminCredentials: {
          email: adminEmail,
          password: '***HIDDEN***',
          note: 'Contraseña enviada por separado al administrador'
        },
        dashboardUrl: `http://localhost:3000/dashboard`
      }
    });

  } catch (error) {
    console.error('❌ Error creando tenant:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'INTERNAL_ERROR'
    });
  }
};

// Obtener estadísticas de un tenant específico
export const getTenantStats = async (req: any, res: Response): Promise<void> => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            users: true,
            roles: true
          }
        }
      }
    });

    if (!tenant) {
      res.status(404).json({ message: 'Tenant no encontrado' });
      return;
    }

    // Estadísticas detalladas
    const [activeUsers, inactiveUsers, customRoles, systemRoles, adminUsers] = await Promise.all([
      prisma.user.count({ where: { tenantId, isActive: true } }),
      prisma.user.count({ where: { tenantId, isActive: false } }),
      prisma.role.count({ where: { tenantId, isCustom: true } }),
      prisma.role.count({ where: { tenantId, isCustom: false } }),
      prisma.user.count({ where: { tenantId, role: 'admin' } })
    ]);

    // Último login de usuarios
    const recentActivity = await prisma.user.findMany({
      where: { tenantId, lastLogin: { not: null } },
      select: { name: true, lastname: true, email: true, lastLogin: true },
      orderBy: { lastLogin: 'desc' },
      take: 5
    });

    res.json({
      tenant: {
        id: tenant.id,
        subdomain: tenant.subdomain,
        name: tenant.name,
        plan: tenant.plan,
        status: tenant.status,
        createdAt: tenant.createdAt
      },
      stats: {
        users: {
          total: tenant._count.users,
          active: activeUsers,
          inactive: inactiveUsers,
          admins: adminUsers
        },
        roles: {
          total: tenant._count.roles,
          custom: customRoles,
          system: systemRoles
        },
        activity: {
          recentLogins: recentActivity
        }
      },
      settings: tenant.settings,
      subscription: tenant.subscription
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas del tenant:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar tenant (Solo Super Admin)
export const updateTenant = async (req: any, res: Response): Promise<void> => {
  try {
    const { tenantId } = req.params;
    const { name, plan, status, settings } = req.body;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      res.status(404).json({ message: 'Tenant no encontrado' });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (plan) updateData.plan = plan;
    if (status) updateData.status = status;
    if (settings) {
        updateData.settings = Object.assign(
            tenant.settings || {}, 
            settings
        );
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData
    });

    console.log(`✅ Tenant actualizado: ${updatedTenant.name}`);

    res.json({
      message: 'Tenant actualizado exitosamente',
      tenant: updatedTenant
    });

  } catch (error) {
    console.error('Error actualizando tenant:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Cambiar estado del tenant (Solo Super Admin)
export const toggleTenantStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { tenantId } = req.params;
    const { action } = req.body; // 'activate', 'suspend', 'deactivate'

    console.log(`🔄 Cambiando estado de tenant ${tenantId} - Acción: ${action}`);

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { users: true }
    });

    if (!tenant) {
      res.status(404).json({ message: 'Tenant no encontrado' });
      return;
    }

    let newStatus: string;
    let usersActive: boolean;
    let actionMessage: string;

    switch (action) {
      case 'activate':
        newStatus = 'active';
        usersActive = true;
        actionMessage = 'activado';
        console.log('✅ Activando tenant...');
        break;
        
      case 'suspend':
        newStatus = 'suspended';
        usersActive = false;
        actionMessage = 'suspendido';
        console.log('⚠️ Suspendiendo tenant...');
        break;
        
      case 'deactivate':
        newStatus = 'inactive';
        usersActive = false;
        actionMessage = 'desactivado';
        console.log('🔴 Desactivando tenant...');
        break;
        
      default:
        console.log('❌ Acción no válida:', action);
        res.status(400).json({ 
          message: 'Acción no válida',
          validActions: ['activate', 'suspend', 'deactivate'],
          receivedAction: action
        });
        return;
    }

    // Actualizar tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: newStatus }
    });

    // Actualizar usuarios del tenant
    const updatedUsers = await prisma.user.updateMany({
      where: { tenantId },
      data: { isActive: usersActive }
    });

    console.log(`✅ Tenant ${tenant.name} ${actionMessage} - ${tenant.users.length} usuarios afectados`);

    res.json({
      message: `Tenant ${actionMessage} exitosamente`,
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        subdomain: updatedTenant.subdomain,
        status: newStatus,
        previousStatus: tenant.status
      },
      usersAffected: tenant.users.length,
      action: action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error cambiando estado del tenant:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar tenant (Solo Super Admin) - CUIDADO: Acción destructiva
export const deleteTenant = async (req: any, res: Response): Promise<void> => {
  try {
    const { tenantId } = req.params;
    const { confirmDelete } = req.body;

    if (!confirmDelete) {
      res.status(400).json({
        message: 'Debes confirmar la eliminación enviando confirmDelete: true',
        warning: 'Esta acción es irreversible y eliminará todos los datos del tenant'
      });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { users: true, roles: true }
    });

    if (!tenant) {
      res.status(404).json({ message: 'Tenant no encontrado' });
      return;
    }

    console.log(`⚠️ ELIMINANDO TENANT: ${tenant.name} - ${tenant.users.length} usuarios, ${tenant.roles.length} roles`);

    // Eliminar en orden (por las foreign keys)
    await prisma.user.deleteMany({ where: { tenantId } });
    await prisma.role.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });

    console.log(`🗑️ Tenant ${tenant.name} eliminado completamente`);

    res.json({
      message: 'Tenant eliminado exitosamente',
      deleted: {
        tenant: tenant.name,
        users: tenant.users.length,
        roles: tenant.roles.length
      }
    });

  } catch (error) {
    console.error('Error eliminando tenant:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
