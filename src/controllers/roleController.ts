import { Response } from 'express';
import { prisma } from '../app';

// Matriz de permisos disponibles
const PERMISSION_MODULES = {
  dashboard: ['view'],
  ingredients: ['view', 'create', 'edit', 'delete', 'export'],
  recipes: ['view', 'create', 'edit', 'delete', 'publish'],
  inventory: ['view', 'create', 'edit', 'delete', 'adjust'],
  orders: ['view', 'create', 'edit', 'delete', 'process'],
  reports: ['view', 'create', 'export', 'schedule'],
  users: ['view', 'create', 'edit', 'delete', 'assign_roles'],
  settings: ['view', 'edit', 'billing', 'integrations'],
  financial: ['view_costs', 'edit_prices', 'view_profits']
};

// Obtener todos los roles del tenant
export const getRoles = async (req: any, res: Response): Promise<void> => {
  try {
    const roles = await prisma.role.findMany({
      where: { tenantId: req.tenantId },
      include: {
        users: {
          select: { id: true, name: true, lastname: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ roles });
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear nuevo rol
export const createRole = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, description, permissions } = req.body;

    if (!name || !permissions) {
      res.status(400).json({ message: 'Nombre y permisos son requeridos' });
      return;
    }

    // Verificar que el rol no exista
    const existingRole = await prisma.role.findFirst({
      where: { 
        name, 
        tenantId: req.tenantId 
      }
    });

    if (existingRole) {
      res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
      return;
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions,
        tenantId: req.tenantId,
        createdBy: req.user.userId
      }
    });

    res.status(201).json({ 
      message: 'Rol creado exitosamente',
      role 
    });
  } catch (error) {
    console.error('Error creando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar rol
export const updateRole = async (req: any, res: Response): Promise<void> => {
  try {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    const role = await prisma.role.findFirst({
      where: { 
        id: roleId, 
        tenantId: req.tenantId 
      }
    });

    if (!role) {
      res.status(404).json({ message: 'Rol no encontrado' });
      return;
    }

    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: { name, description, permissions }
    });

    res.json({ 
      message: 'Rol actualizado exitosamente',
      role: updatedRole 
    });
  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar rol
export const deleteRole = async (req: any, res: Response): Promise<void> => {
  try {
    const { roleId } = req.params;

    const role = await prisma.role.findFirst({
      where: { 
        id: roleId, 
        tenantId: req.tenantId 
      },
      include: { users: true }
    });

    if (!role) {
      res.status(404).json({ message: 'Rol no encontrado' });
      return;
    }

    if (role.users.length > 0) {
      res.status(400).json({ 
        message: 'No se puede eliminar un rol que tiene usuarios asignados',
        usersCount: role.users.length 
      });
      return;
    }

    await prisma.role.delete({
      where: { id: roleId }
    });

    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener matriz de permisos disponibles
export const getPermissionMatrix = async (req: any, res: Response): Promise<void> => {
  res.json({ permissions: PERMISSION_MODULES });
};
