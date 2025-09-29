DOCUMENTACIÓN COMPLETA DE ENDPOINTS - BASADA EN CÓDIGO REAL
📊 RESUMEN EJECUTIVO
Total de endpoints implementados: 16 endpoints funcionales
Puerto: 3001
Base URL: http://localhost:3001/api
Arquitectura: Multi-tenant con RBAC

🔐 ENDPOINTS DE AUTENTICACIÓN (/api/auth)
1. POST /auth/register
Propósito: Registro de usuarios en tenant basado en dominio del email
Acceso: Público
Controller: authController.register

Request Body:

json
{
  "email": "juan@latrattoria.almoud.pe",
  "password": "password123",
  "name": "Juan Carlos",
  "lastname": "Rodriguez"
}
Response Success (201):

json
{
  "message": "Usuario creado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "671a2b1c8d9e4f2a1b3c5678",
    "email": "juan@latrattoria.almoud.pe",
    "name": "Juan Carlos",
    "lastname": "Rodriguez",
    "role": "user",
    "profileImage": null,
    "tenantId": "671a2b1c8d9e4f2a1b3c1234"
  }
}
2. POST /auth/login
Propósito: Autenticación y generación de JWT
Acceso: Público
Controller: authController.login

Request Body:

json
{
  "email": "admin@latrattoria.almoud.pe",
  "password": "latrattoria123"
}
Response Success (200):

json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "671a2b1c8d9e4f2a1b3c5679",
    "email": "admin@latrattoria.almoud.pe",
    "name": "Admin",
    "lastname": "La Trattoria",
    "role": "admin",
    "profileImage": null,
    "tenantId": "671a2b1c8d9e4f2a1b3c1234",
    "tenant": {
      "id": "671a2b1c8d9e4f2a1b3c1234",
      "subdomain": "latrattoria",
      "name": "La Trattoria Restaurant",
      "plan": "premium",
      "status": "active"
    },
    "assignedRole": {
      "id": "671a2b1c8d9e4f2a1b3c9999",
      "name": "Administrador",
      "permissions": {}
    }
  },
  "dashboardType": "tenant"
}
3. GET /auth/profile
Propósito: Obtener perfil del usuario autenticado
Acceso: JWT requerido
Controller: authController.getProfile
Middlewares: authenticateToken, tenantResolver

Response Success (200):

json
{
  "user": {
    "id": "671a2b1c8d9e4f2a1b3c5679",
    "email": "admin@latrattoria.almoud.pe",
    "name": "Admin",
    "lastname": "La Trattoria",
    "role": "admin",
    "profileImage": null,
    "tenantId": "671a2b1c8d9e4f2a1b3c1234",
    "isActive": true,
    "lastLogin": "2025-09-29T07:30:00.000Z",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "tenant": {
      "id": "671a2b1c8d9e4f2a1b3c1234",
      "subdomain": "latrattoria",
      "name": "La Trattoria Restaurant",
      "plan": "premium"
    },
    "assignedRole": {
      "id": "671a2b1c8d9e4f2a1b3c9999",
      "name": "Administrador", 
      "permissions": {}
    }
  }
}
4. POST /auth/upload-profile-image
Propósito: Upload imagen de perfil con procesamiento Sharp + Cloudinary
Acceso: JWT requerido
Controller: authController.uploadProfileImage
Middlewares: authenticateToken, tenantResolver, multer.single('image')
Content-Type: multipart/form-data

Request: FormData con campo image (máx 5MB, jpg/png/gif/webp)

Response Success (200):

json
{
  "message": "Imagen actualizada exitosamente",
  "profileImage": "https://res.cloudinary.com/dqaeopx1t/image/upload/v1727599200/food-cost/tenants/671a2b1c8d9e4f2a1b3c1234/profiles/671a2b1c8d9e4f2a1b3c5679-1727599200123.jpg",
  "user": {
    "id": "671a2b1c8d9e4f2a1b3c5679",
    "name": "Admin",
    "lastname": "La Trattoria",
    "profileImage": "https://res.cloudinary.com/dqaeopx1t/image/upload/v1727599200/food-cost/tenants/671a2b1c8d9e4f2a1b3c1234/profiles/671a2b1c8d9e4f2a1b3c5679-1727599200123.jpg"
  }
}
🏢 ENDPOINTS DE GESTIÓN DE TENANTS (/api/tenants - Solo Super Admin)
5. GET /tenants
Propósito: Listar todos los restaurantes
Acceso: Solo Super Admin (admin@almoud.pe)
Controller: tenantController.getAllTenants
Middlewares: authenticateToken, tenantResolver, requireSuperAdmin

Response Success (200):

json
{
  "tenants": [
    {
      "id": "671a2b1c8d9e4f2a1b3c1234",
      "subdomain": "latrattoria",
      "name": "La Trattoria Restaurant",
      "logo": null,
      "plan": "premium",
      "status": "active",
      "settings": {
        "currency": "PEN",
        "timezone": "America/Lima",
        "language": "es"
      },
      "subscription": {
        "startDate": "2025-01-01",
        "endDate": "2025-12-31",
        "billing": "monthly"
      },
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-09-29T07:30:00.000Z",
      "users": [
        {
          "id": "671a2b1c8d9e4f2a1b3c5679",
          "name": "Admin",
          "lastname": "La Trattoria",
          "email": "admin@latrattoria.almoud.pe",
          "role": "admin",
          "isActive": true,
          "lastLogin": "2025-09-29T07:30:00.000Z"
        }
      ],
      "roles": [
        {
          "id": "671a2b1c8d9e4f2a1b3c9999",
          "name": "Cajero",
          "isCustom": false
        }
      ],
      "_count": {
        "users": 3,
        "roles": 4
      }
    }
  ],
  "total": 1
}
6. POST /tenants
Propósito: Crear nuevo restaurante con admin y roles básicos
Acceso: Solo Super Admin
Controller: tenantController.createTenant

Request Body:

json
{
  "subdomain": "pizzaloca",
  "name": "Pizza Loca Restaurant",
  "plan": "basic",
  "adminEmail": "admin@pizzaloca.almoud.pe",
  "adminPassword": "pizzaloca123",
  "adminName": "Carlos",
  "adminLastname": "Mendoza"
}
Response Success (201):

json
{
  "message": "Tenant creado exitosamente",
  "tenant": {
    "id": "671a2b1c8d9e4f2a1b3c5555",
    "subdomain": "pizzaloca",
    "name": "Pizza Loca Restaurant",
    "plan": "basic",
    "status": "active",
    "createdAt": "2025-09-29T07:30:00.000Z"
  },
  "admin": {
    "id": "671a2b1c8d9e4f2a1b3c6666",
    "email": "admin@pizzaloca.almoud.pe",
    "name": "Carlos",
    "lastname": "Mendoza",
    "role": "admin"
  },
  "initialData": {
    "rolesCreated": 4,
    "roleNames": ["Cajero", "Cocinero", "Mesero", "Supervisor"]
  },
  "accessInfo": {
    "loginUrl": "http://localhost:3000/login",
    "adminCredentials": {
      "email": "admin@pizzaloca.almoud.pe",
      "password": "***HIDDEN***"
    },
    "dashboardUrl": "http://localhost:3000/dashboard"
  }
}
7. GET /tenants/:tenantId/stats
Propósito: Estadísticas detalladas del tenant
Acceso: Solo Super Admin
Controller: tenantController.getTenantStats

Response Success (200):

json
{
  "tenant": {
    "id": "671a2b1c8d9e4f2a1b3c1234",
    "subdomain": "latrattoria",
    "name": "La Trattoria Restaurant",
    "plan": "premium",
    "status": "active",
    "createdAt": "2025-01-15T10:00:00.000Z"
  },
  "stats": {
    "users": {
      "total": 5,
      "active": 5,
      "inactive": 0,
      "admins": 1
    },
    "roles": {
      "total": 4,
      "custom": 0,
      "system": 4
    },
    "activity": {
      "recentLogins": [
        {
          "name": "Admin",
          "lastname": "La Trattoria",
          "email": "admin@latrattoria.almoud.pe",
          "lastLogin": "2025-09-29T07:30:00.000Z"
        }
      ]
    }
  },
  "settings": {
    "currency": "PEN",
    "timezone": "America/Lima",
    "language": "es"
  },
  "subscription": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "billing": "monthly"
  }
}
8. PUT /tenants/:tenantId
Propósito: Actualizar configuración del tenant
Acceso: Solo Super Admin
Controller: tenantController.updateTenant

Request Body:

json
{
  "name": "La Trattoria Premium Restaurant",
  "plan": "enterprise",
  "status": "active",
  "settings": {
    "currency": "USD",
    "timezone": "America/Lima",
    "language": "es"
  }
}
9. PATCH /tenants/:tenantId/status
Propósito: Cambiar estado del tenant (activar/suspender/desactivar)
Acceso: Solo Super Admin
Controller: tenantController.toggleTenantStatus

Request Body:

json
{
  "action": "suspend"
}
Response Success (200):

json
{
  "message": "Tenant suspendido exitosamente",
  "tenant": {
    "id": "671a2b1c8d9e4f2a1b3c1234",
    "name": "La Trattoria Restaurant",
    "subdomain": "latrattoria",
    "status": "suspended",
    "previousStatus": "active"
  },
  "usersAffected": 5,
  "action": "suspend",
  "timestamp": "2025-09-29T07:30:00.000Z"
}
10. DELETE /tenants/:tenantId
Propósito: Eliminar tenant completamente (destructivo)
Acceso: Solo Super Admin
Controller: tenantController.deleteTenant

Request Body:

json
{
  "confirmDelete": true
}
Response Success (200):

json
{
  "message": "Tenant eliminado exitosamente",
  "deleted": {
    "tenant": "La Trattoria Restaurant",
    "users": 5,
    "roles": 4
  }
}
👥 ENDPOINTS DE GESTIÓN DE USUARIOS (/api/users)
11. GET /users
Propósito: Listar usuarios (filtrado automático por tenant)
Acceso: JWT + Permiso users.view
Controller: userManagementController.getTenantUsers
Middlewares: authenticateToken, tenantResolver, checkPermission('users', 'view')

Response Success (200):

json
{
  "users": [
    {
      "id": "671a2b1c8d9e4f2a1b3c5679",
      "email": "admin@latrattoria.almoud.pe",
      "name": "Admin",
      "lastname": "La Trattoria",
      "role": "admin",
      "profileImage": null,
      "isActive": true,
      "lastLogin": "2025-09-29T07:30:00.000Z",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-09-29T07:30:00.000Z",
      "tenantId": "671a2b1c8d9e4f2a1b3c1234",
      "roleId": "671a2b1c8d9e4f2a1b3c9999",
      "assignedRole": {
        "id": "671a2b1c8d9e4f2a1b3c9999",
        "name": "Administrador",
        "permissions": {}
      },
      "tenant": {
        "id": "671a2b1c8d9e4f2a1b3c1234",
        "name": "La Trattoria Restaurant",
        "subdomain": "latrattoria"
      }
    }
  ],
  "total": 5,
  "context": "tenant"
}
12. POST /users
Propósito: Crear usuario en el tenant actual
Acceso: JWT + Permiso users.create
Controller: userManagementController.createTenantUser

Request Body:

json
{
  "email": "maria@latrattoria.almoud.pe",
  "password": "maria123",
  "name": "Maria",
  "lastname": "Garcia",
  "roleId": "671a2b1c8d9e4f2a1b3c7777"
}
Response Success (201):

json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": "671a2b1c8d9e4f2a1b3c8888",
    "email": "maria@latrattoria.almoud.pe",
    "name": "Maria",
    "lastname": "Garcia",
    "role": "user",
    "profileImage": null,
    "isActive": true,
    "createdAt": "2025-09-29T07:30:00.000Z",
    "assignedRole": {
      "id": "671a2b1c8d9e4f2a1b3c7777",
      "name": "Cajero",
      "permissions": {}
    }
  }
}
13. PUT /users/:userId/role
Propósito: Asignar/cambiar rol del usuario
Acceso: JWT + Permiso users.assign_roles
Controller: userManagementController.assignRoleToUser

Request Body:

json
{
  "roleId": "671a2b1c8d9e4f2a1b3c7777"
}
Response Success (200):

json
{
  "message": "Rol asignado exitosamente",
  "user": {
    "id": "671a2b1c8d9e4f2a1b3c8888",
    "name": "Maria",
    "lastname": "Garcia",
    "email": "maria@latrattoria.almoud.pe",
    "assignedRole": {
      "id": "671a2b1c8d9e4f2a1b3c7777",
      "name": "Cajero",
      "permissions": {}
    }
  }
}
14. PUT /users/:userId/status
Propósito: Activar/desactivar usuario
Acceso: JWT + Permiso users.edit
Controller: userManagementController.toggleUserStatus

Response Success (200):

json
{
  "message": "Usuario activado exitosamente",
  "user": {
    "id": "671a2b1c8d9e4f2a1b3c8888",
    "isActive": true
  }
}
🔒 ENDPOINTS DE GESTIÓN DE ROLES (/api/roles)
15. GET /roles
Propósito: Listar roles del tenant con usuarios asignados
Acceso: JWT + Permiso users.view
Controller: roleController.getRoles
Middlewares: authenticateToken, tenantResolver, checkPermission('users', 'view')

Response Success (200):

json
{
  "roles": [
    {
      "id": "671a2b1c8d9e4f2a1b3c9999",
      "name": "Cajero",
      "description": "Empleado con acceso a caja y ventas",
      "tenantId": "671a2b1c8d9e4f2a1b3c1234",
      "permissions": {
        "dashboard": {"view": true},
        "orders": {"view": true, "create": true, "edit": true},
        "inventory": {"view": true},
        "reports": {"view": true}
      },
      "createdBy": "671a2b1c8d9e4f2a1b3c5679",
      "isCustom": false,
      "isActive": true,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "users": [
        {
          "id": "671a2b1c8d9e4f2a1b3c8888",
          "name": "Maria",
          "lastname": "Garcia",
          "email": "maria@latrattoria.almoud.pe"
        }
      ]
    }
  ]
}
16. POST /roles
Propósito: Crear rol personalizado para el tenant
Acceso: JWT + Permiso users.create
Controller: roleController.createRole

Request Body:

json
{
  "name": "Supervisor de Turno",
  "description": "Supervisa operaciones durante su turno",
  "permissions": {
    "dashboard": {"view": true},
    "orders": {"view": true, "create": true, "edit": true},
    "inventory": {"view": true, "adjust": true},
    "reports": {"view": true, "export": true}
  }
}
Response Success (201):

json
{
  "message": "Rol creado exitosamente",
  "role": {
    "id": "671a2b1c8d9e4f2a1b3c6666",
    "name": "Supervisor de Turno",
    "description": "Supervisa operaciones durante su turno",
    "permissions": {
      "dashboard": {"view": true},
      "orders": {"view": true, "create": true, "edit": true},
      "inventory": {"view": true, "adjust": true},
      "reports": {"view": true, "export": true}
    },
    "tenantId": "671a2b1c8d9e4f2a1b3c1234",
    "createdBy": "671a2b1c8d9e4f2a1b3c5679",
    "isCustom": true,
    "isActive": true,
    "createdAt": "2025-09-29T07:30:00.000Z",
    "updatedAt": "2025-09-29T07:30:00.000Z"
  }
}
17. PUT /roles/:roleId
Propósito: Actualizar rol existente
Acceso: JWT + Permiso users.edit
Controller: roleController.updateRole

18. DELETE /roles/:roleId
Propósito: Eliminar rol (solo si no tiene usuarios)
Acceso: JWT + Permiso users.delete
Controller: roleController.deleteRole

19. GET /roles/permissions
Propósito: Obtener matriz de permisos disponibles
Acceso: JWT
Controller: roleController.getPermissionMatrix

Response Success (200):

json
{
  "permissions": {
    "dashboard": ["view"],
    "ingredients": ["view", "create", "edit", "delete", "export"],
    "recipes": ["view", "create", "edit", "delete", "publish"],
    "inventory": ["view", "create", "edit", "delete", "adjust"],
    "orders": ["view", "create", "edit", "delete", "process"],
    "reports": ["view", "create", "export", "schedule"],
    "users": ["view", "create", "edit", "delete", "assign_roles"],
    "settings": ["view", "edit", "billing", "integrations"],
    "financial": ["view_costs", "edit_prices", "view_profits"]
  }
}
⚕️ ENDPOINT DE SISTEMA
20. GET /health
Propósito: Health check del servidor
Acceso: Público
Controller: Implementado en app.ts

Response Success (200):

json
{
  "status": "ok",
  "timestamp": "2025-09-29T07:30:00.000Z",
  "uptime": 3600.45,
  "database": "MongoDB",
  "environment": "development"
}
🚧 ENDPOINTS PRÓXIMAMENTE
21. GET/POST /ingredients
Estado: Routes definidas, controllers pendientes
Mensaje actual: {"message": "Ingredients endpoint - Coming soon"}

22. GET/POST /recipes
Estado: Routes definidas, controllers pendientes
Mensaje actual: {"message": "Recipes endpoint - Coming soon"}