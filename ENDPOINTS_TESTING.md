# APIs FUNCIONANDO 100% - Ejemplos de Testing

## ✅ SUPER ADMIN - GESTIÓN GLOBAL

### 1. Login Super Admin
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
"email": "admin@almoud.pe",
"password": "superadmin123"
}


**Respuesta esperada:**
{
"message": "Login exitoso",
"token": "eyJhbGciOiJIUzI1NiIs...",
"user": {
"id": "...",
"email": "admin@almoud.pe",
"name": "Super",
"lastname": "Admin",
"role": "super_admin"
},
"dashboardType": "super-admin"
}


### 2. Ver Todos los Tenants
GET http://localhost:3001/api/tenants
Authorization: Bearer SUPER_ADMIN_TOKEN


### 3. Crear Nuevo Restaurante
POST http://localhost:3001/api/tenants
Authorization: Bearer SUPER_ADMIN_TOKEN
Content-Type: application/json

{
"subdomain": "burgerking",
"name": "Burger King Express",
"plan": "premium",
"adminEmail": "admin@burgerking.almoud.pe",
"adminPassword": "burger123",
"adminName": "Carlos",
"adminLastname": "Manager"
}


### 4. Suspender Restaurante
PATCH http://localhost:3001/api/tenants/TENANT_ID/status
Authorization: Bearer SUPER_ADMIN_TOKEN
Content-Type: application/json

{
"action": "suspend"
}


### 5. Reactivar Restaurante
PATCH http://localhost:3001/api/tenants/TENANT_ID/status
Authorization: Bearer SUPER_ADMIN_TOKEN
Content-Type: application/json

{
"action": "activate"
}


### 6. Ver Estadísticas del Restaurante
GET http://localhost:3001/api/tenants/TENANT_ID/stats
Authorization: Bearer SUPER_ADMIN_TOKEN


---

## ✅ TENANT ADMIN - GESTIÓN DE SU RESTAURANTE

### 1. Login Administrador del Restaurante
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
"email": "admin@latrattoria.almoud.pe",
"password": "latrattoria123"
}


**Respuesta esperada:**
{
"message": "Login exitoso",
"token": "eyJhbGciOiJIUzI1NiIs...",
"user": {
"id": "...",
"email": "admin@latrattoria.almoud.pe",
"name": "Tenant",
"lastname": "Admin",
"role": "admin",
"tenantId": "...",
"tenant": {
"name": "La Trattoria Restaurant",
"subdomain": "latrattoria"
}
},
"dashboardType": "tenant"
}


### 2. Ver Roles de su Restaurante
GET http://localhost:3001/api/roles
Authorization: Bearer TENANT_ADMIN_TOKEN


### 3. Crear Rol Personalizado
POST http://localhost:3001/api/roles
Authorization: Bearer TENANT_ADMIN_TOKEN
Content-Type: application/json

{
"name": "Cajero Nocturno",
"description": "Cajero con permisos especiales para turno nocturno",
"permissions": {
"dashboard": { "view": true },
"orders": { "view": true, "create": true, "edit": true },
"inventory": { "view": true },
"reports": { "view": true, "export": true }
}
}


### 4. Ver Usuarios de su Restaurante  
GET http://localhost:3001/api/users
Authorization: Bearer TENANT_ADMIN_TOKEN


### 5. Crear Usuario con Rol
POST http://localhost:3001/api/users
Authorization: Bearer TENANT_ADMIN_TOKEN
Content-Type: application/json

{
"email": "maria.cajera@latrattoria.almoud.pe",
"password": "maria123",
"name": "María",
"lastname": "González",
"roleId": "ID_DEL_ROL_CREADO"
}


### 6. Asignar Rol a Usuario
PUT http://localhost:3001/api/users/USER_ID/role
Authorization: Bearer TENANT_ADMIN_TOKEN
Content-Type: application/json

{
"roleId": "NUEVO_ROL_ID"
}


---

## ✅ USUARIO REGULAR - ACCESO LIMITADO

### 1. Login Usuario Regular
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
"email": "maria.cajera@latrattoria.almoud.pe",
"password": "maria123"
}


### 2. Ver su Perfil
GET http://localhost:3001/api/auth/profile
Authorization: Bearer USER_TOKEN


### 3. Subir Imagen de Perfil
POST http://localhost:3001/api/auth/upload-profile-image
Authorization: Bearer USER_TOKEN
Content-Type: multipart/form-data

Adjuntar archivo en campo "image"

---

## ✅ MATRIZ DE PERMISOS DISPONIBLES

### Ver Permisos del Sistema
GET http://localhost:3001/api/roles/permissions
Authorization: Bearer TOKEN


**Respuesta:**
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


---

## 🔧 HEALTH CHECK

### Verificar Estado del Servidor
GET http://localhost:3001/api/health

**Respuesta:**
{
"status": "ok",
"timestamp": "2025-09-27T22:00:00.000Z",
"uptime": 3600,
"database": "MongoDB",
"environment": "development"
}


---

## 🎯 NOTAS IMPORTANTES

### Tipos de Token por Usuario:
- **SUPER_ADMIN_TOKEN**: Acceso a `/api/tenants` (gestión global)
- **TENANT_ADMIN_TOKEN**: Acceso a `/api/roles`, `/api/users` (su restaurante)
- **USER_TOKEN**: Acceso limitado según rol asignado

### Estructura de Email:
- **Super Admin**: `admin@almoud.pe`
- **Tenant Admin**: `admin@[restaurante].almoud.pe`
- **Usuario Regular**: `[nombre]@[restaurante].almoud.pe`

### Estados de Tenant:
- **active**: Funcionando normal
- **suspended**: Temporalmente bloqueado
- **inactive**: Desactivado permanente

---

*Todas las APIs probadas y funcionando al 100%*
*Testing realizado con Thunder Client*
*Fecha: 27 de septiembre, 2025*
