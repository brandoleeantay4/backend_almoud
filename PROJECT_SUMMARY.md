# ALMOUD - SISTEMA MULTI-TENANT SAAS
## Sistema de Gestión de Costos para Restaurantes

### 🚀 ESTADO ACTUAL: SISTEMA 100% FUNCIONAL EN BACKEND

---

## 🏗️ ARQUITECTURA TÉCNICA

### **Stack Tecnológico**
- **Backend**: Node.js + TypeScript + Express.js + Prisma ORM + MongoDB
- **Frontend**: Next.js 14 + shadcn/ui + TypeScript + Tailwind CSS
- **Autenticación**: JWT + bcryptjs
- **File Upload**: Multer + Sharp + Cloudinary
- **Middleware**: RBAC personalizado + Multi-tenancy

### **Puertos y URLs**
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000  
- **Health Check**: http://localhost:3001/api/health

---

## 📁 ESTRUCTURA DEL BACKEND

backend/
├── node_modules/                    # Dependencias instaladas
├── prisma/
│   └── schema.prisma               # ✅ Esquema de base de datos
├── src/
│   ├── @types/                     # Tipos personalizados de TypeScript
│   │   └── express/                #    - Carpeta de tipos Express
│   │       └── index.d.ts          #    - Definiciones de tipos Express
│   ├── config/
│   │   └── cloudinary.ts           # Configuración de Cloudinary
│   ├── controllers/                # ✅ Controladores principales
│   │   ├── authController.ts       #    - Autenticación multi-tenant
│   │   ├── roleController.ts       #    - Gestión de roles RBAC
│   │   ├── tenantController.ts     #    - Gestión de restaurantes
│   │   └── userManagementController.ts # - Gestión de usuarios
│   ├── middleware/                 # ✅ Middlewares personalizados
│   │   ├── auth.ts                 #    - Autenticación JWT
│   │   ├── rbac.ts                 #    - Control de permisos
│   │   └── tenantResolver.ts       #    - Resolución multi-tenant
│   ├── routes/                     # ✅ Rutas de la API
│   │   ├── auth.ts                 #    - Rutas de autenticación
│   │   ├── ingredients.ts          #    - Rutas de ingredientes
│   │   ├── recipes.ts              #    - Rutas de recetas
│   │   ├── roles.ts                #    - Rutas de roles
│   │   ├── tenants.ts              #    - Rutas de tenants
│   │   └── userManagement.ts       #    - Rutas de usuarios
│   ├── scripts/
│   │   └── seedData.ts             # Scripts de población de datos
│   ├── types/
│   │   └── express.d.ts            # Definiciones de tipos adicionales
│   ├── utils/                      # Utilidades generales
│   ├── app.ts                      # ✅ Configuración principal de Express
│   └── server.ts                   # ✅ Servidor HTTP
├── .env                            # Variables de entorno
├── .gitignore                      # Archivos ignorados por Git
├── ENDPOINTS_TESTING.md            # ✅ Documentación de pruebas
├── package-lock.json               # Lock de dependencias
├── package.json                    # ✅ Configuración del proyecto
├── PROJECT_SUMMARY.md              # ✅ Resumen técnico completo
└── tsconfig.json                   # Configuración de TypeScript


---

## 🗄️ BASE DE DATOS - PRISMA SCHEMA
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// Modelo Tenant (Restaurante)
model Tenant {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  subdomain   String   @unique // "latrattoria" para latrattoria@almoud.pe
  name        String   // "La Trattoria Restaurant"
  logo        String?
  plan        String   @default("basic") // basic, premium, enterprise
  status      String   @default("active") // active, suspended, cancelled
  
  settings    Json     @default("{\"currency\":\"PEN\",\"timezone\":\"America/Lima\",\"language\":\"es\"}")
  
  subscription Json    @default("{\"startDate\":null,\"endDate\":null,\"billing\":\"monthly\"}")
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  users       User[]
  roles       Role[]
  
  @@map("tenants")
}

// Modelo User mejorado
model User {
  id           String    @id @default(auto()) @map("_id") @db.ObjectId
  email        String    @unique
  name         String
  lastname     String    // NUEVO CAMPO
  password     String
  profileImage String?   // NUEVO CAMPO - URL de la imagen
  role         String    @default("user")
  
  // Multi-tenancy
  tenantId     String?   @db.ObjectId
  tenant       Tenant?   @relation(fields: [tenantId], references: [id])
  
  // RBAC
  roleId       String?   @db.ObjectId
  assignedRole Role?     @relation(fields: [roleId], references: [id])
  permissions  String[]  @default([]) // Permisos adicionales específicos
  
  // Metadata
  createdBy    String?   @db.ObjectId
  isActive     Boolean   @default(true)
  lastLogin    DateTime?
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  @@map("users")
}

// Modelo Role para RBAC
model Role {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String   // "Cajero", "Cocinero", "Administrador"
  description String?
  
  // Multi-tenancy
  tenantId    String   @db.ObjectId
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  // Permisos estructurados
  permissions Json     @default("{}")
  
  // Metadata
  createdBy   String   @db.ObjectId
  isCustom    Boolean  @default(true) // false para roles del sistema
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  users       User[]
  
  @@unique([name, tenantId]) // Nombres únicos por tenant
  @@map("roles")
}

// Modelo Ingredient con multi-tenancy
model Ingredient {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  category    String
  unit        String   // kg, gr, lt, ml, etc.
  costPerUnit Float
  supplier    String?
  
  // Multi-tenancy
  tenantId    String   @db.ObjectId
  
  // Metadata
  createdBy   String   @db.ObjectId
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([name, tenantId])
  @@map("ingredients")
}

// Modelo Recipe con multi-tenancy
model Recipe {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String?
  category    String
  servings    Int      @default(1)
  
  // Costos
  totalCost   Float    @default(0)
  costPerServing Float @default(0)
  sellingPrice Float?
  
  // Multi-tenancy
  tenantId    String   @db.ObjectId
  
  // Metadata
  createdBy   String   @db.ObjectId
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([name, tenantId])
  @@map("recipes")
}



---

## 📡 API ENDPOINTS IMPLEMENTADOS (18 TOTAL)

### **🔐 AUTENTICACIÓN** (`/api/auth`)
| Endpoint | Método | Descripción | Estado |
|----------|--------|-------------|--------|
| `/register` | POST | Registro multi-tenant automático | ✅ 100% |
| `/login` | POST | Login con detección de tipo | ✅ 100% |
| `/profile` | GET | Perfil completo del usuario | ✅ 100% |
| `/upload-profile-image` | POST | Upload imagen procesada | ✅ 100% |

### **🏢 GESTIÓN DE TENANTS** (`/api/tenants`) - Solo Super Admin
| Endpoint | Método | Descripción | Estado |
|----------|--------|-------------|--------|
| `/` | GET | Lista todos los restaurantes | ✅ 100% |
| `/` | POST | Crear restaurante completo | ✅ 100% |
| `/:id/stats` | GET | Estadísticas detalladas | ✅ 100% |
| `/:id/status` | PATCH | Activar/Suspender/Desactivar | ✅ 100% |
| `/:id` | PUT | Actualizar configuraciones | ✅ 100% |
| `/:id` | DELETE | Eliminar restaurante | ✅ 100% |

### **👥 GESTIÓN DE ROLES** (`/api/roles`) - Admin/SuperAdmin  
| Endpoint | Método | Descripción | Estado |
|----------|--------|-------------|--------|
| `/` | GET | Roles del tenant actual | ✅ 100% |
| `/` | POST | Crear rol personalizado | ✅ 100% |
| `/:roleId` | PUT | Actualizar rol | ✅ 100% |
| `/:roleId` | DELETE | Eliminar rol | ✅ 100% |
| `/permissions` | GET | Matriz de permisos | ✅ 100% |

### **👤 GESTIÓN DE USUARIOS** (`/api/users`) - Admin/SuperAdmin
| Endpoint | Método | Descripción | Estado |
|----------|--------|-------------|--------|
| `/` | GET | Usuarios del tenant | ✅ 100% |
| `/` | POST | Crear usuario con rol | ✅ 100% |
| `/:userId/role` | PUT | Asignar/cambiar rol | ✅ 100% |
| `/:userId/status` | PUT | Activar/desactivar | ✅ 100% |

---

## 🛡️ FUNCIONALIDADES CLAVE

### **✅ Multi-Tenancy Completo**
- Segregación total de datos por restaurante
- Detección automática de tenant por email domain
- Super Admin acceso global vs Tenant Admin acceso local

### **✅ Sistema RBAC Avanzado**
- Permisos granulares por módulo (dashboard, orders, inventory, reports, etc.)
- Acciones específicas (view, create, edit, delete, export)
- Roles personalizables por restaurante

### **✅ Gestión Automática de Tenants**
- Creación automática de admin + 4 roles básicos
- Configuraciones iniciales inteligentes
- Estados de tenant (active, suspended, inactive)

### **✅ Upload de Archivos**
- Procesamiento con Sharp (resize 400x400)
- Cloudinary integration ready
- Validaciones de formato y tamaño

---

## 🧪 CREDENCIALES DE PRUEBA

### **Super Admin**
Email: admin@almoud.pe
Password: superadmin123
Acceso: Todos los tenants


### **Tenant Admin - La Trattoria**
Email: admin@latrattoria.almoud.pe
Password: latrattoria123
Acceso: Solo su restaurante


### **Tenant Creado - Pizza Maria**
Email: admin@pizzamaria.almoud.pe
Password: pizzamaria123
Subdomain: pizzamaria


---

## ⚙️ CONFIGURACIÓN

### **Variables de Entorno** (`backend/.env`)
# MongoDB Database
DATABASE_URL=mongodb+srv://foodcost_admin:torresarteaga@cluster0.x18yuh8.mongodb.net/foodcost?retryWrites=true&w=majority&appName=Cluster0

# JWT
JWT_SECRET="tu_jwt_secret_super_seguro_aqui_cambiar_en_produccion"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:3000"

# MongoDB específico
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_INITDB_DATABASE=foodcost

# Cloudinary (registrarte en cloudinary.com)
CLOUDINARY_CLOUD_NAME="dqaeopx1t"
CLOUDINARY_API_KEY="429266292976536"
CLOUDINARY_API_SECRET="TfUd0_CyVipSZkYEgDRVc7YPZS8"


### **Comandos**
Backend
cd backend && npm run dev