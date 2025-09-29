import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../app';

// Obtener usuarios del tenant
// Obtener usuarios del tenant - CORREGIDO
export const getTenantUsers = async (req: any, res: Response): Promise<void> => {
  try {
    let whereClause = {};
    
    // SUPER ADMIN: obtiene TODOS los usuarios
    if (req.isSuperAdmin) {
      whereClause = {}; // Sin filtros = todos los usuarios
    } else {
      // ADMIN/USER: solo usuarios de su tenant
      whereClause = { tenantId: req.tenantId };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        assignedRole: {
          select: { id: true, name: true, permissions: true }
        },
        tenant: {
          select: { id: true, name: true, subdomain: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // MAPEO COMPLETO con todos los campos necesarios
    const filteredUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      role: user.role,
      profileImage: user.profileImage,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt, // ✅ FALTABA
      tenantId: user.tenantId,    // ✅ FALTABA
      roleId: user.roleId,        // ✅ FALTABA
      assignedRole: user.assignedRole,
      tenant: user.tenant         // ✅ INFORMACIÓN DEL TENANT
    }));

    res.json({ 
      users: filteredUsers,
      total: filteredUsers.length,
      context: req.isSuperAdmin ? 'global' : 'tenant'
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


// Crear usuario en el tenant
// Crear usuario en el tenant - CORREGIDO
export const createTenantUser = async (req: any, res: Response): Promise<void> => {
  try {
    const { email, password, name, lastname, roleId } = req.body;

    if (!email || !password || !name || !lastname) {
      res.status(400).json({ message: 'Todos los campos son requeridos' });
      return;
    }

    // Verificar que el email tenga el subdominio correcto
    const domain = email.split('@')[1];
    if (!domain.endsWith('.almoud.pe') || domain === 'almoud.pe') {
      res.status(400).json({
        message: 'Email debe usar el dominio de tu restaurante'
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ message: 'Ya existe un usuario con ese email' });
      return;
    }

    // Verificar que el rol pertenezca al tenant
    if (roleId) {
      const role = await prisma.role.findFirst({
        where: { id: roleId, tenantId: req.tenantId }
      });

      if (!role) {
        res.status(400).json({ message: 'Rol no válido' });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // CREAR USUARIO SIN SELECT + INCLUDE
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        lastname,
        roleId,
        tenantId: req.tenantId,
        createdBy: req.user.userId
      }
    });

    // OBTENER ROL POR SEPARADO SI ES NECESARIO
    let assignedRole = null;
    if (user.roleId) {
      assignedRole = await prisma.role.findUnique({
        where: { id: user.roleId },
        select: { id: true, name: true, permissions: true }
      });
    }

    // Preparar respuesta sin password
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      role: user.role,
      profileImage: user.profileImage,
      isActive: user.isActive,
      createdAt: user.createdAt,
      assignedRole
    };

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


// Asignar rol a usuario
// Asignar rol a usuario - CORREGIDO
export const assignRoleToUser = async (req: any, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId: req.tenantId }
    });

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    if (roleId) {
      const role = await prisma.role.findFirst({
        where: { id: roleId, tenantId: req.tenantId }
      });

      if (!role) {
        res.status(400).json({ message: 'Rol no válido' });
        return;
      }
    }

    // ACTUALIZAR USUARIO
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId }
    });

    // OBTENER ROL POR SEPARADO
    let assignedRole = null;
    if (updatedUser.roleId) {
      assignedRole = await prisma.role.findUnique({
        where: { id: updatedUser.roleId },
        select: { id: true, name: true, permissions: true }
      });
    }

    res.json({
      message: 'Rol asignado exitosamente',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        assignedRole
      }
    });
  } catch (error) {
    console.error('Error asignando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


// Activar/Desactivar usuario
export const toggleUserStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId: req.tenantId }
    });

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive }
    });

    res.json({
      message: `Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'} exitosamente`,
      user: {
        id: updatedUser.id,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    console.error('Error cambiando estado del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
