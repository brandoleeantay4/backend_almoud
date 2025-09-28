# 🍽️ Food Cost Backend - Sistema Multi-Tenant SaaS

![Node.js](https://img.shields.io/badge/node-%3E%3D20-green)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![Express](https://img.shields.io/badge/express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/mongodb-latest-green)
![Prisma](https://img.shields.io/badge/prisma-5.1-orange)
![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)

Sistema backend modular construido con **Express + TypeScript** para la gestión de costos en restaurantes. 
Implementa una arquitectura multi-tenant con sistema RBAC (Role-Based Access Control) avanzado, autenticación JWT, y gestión de archivos con Cloudinary.

---

## 🚀 Tecnologías principales

- [Node.js 20+](https://nodejs.org/) - Entorno de ejecución JavaScript
- [Express](https://expressjs.com/) - Framework web para Node.js
- [TypeScript](https://www.typescriptlang.org/) - Lenguaje tipado para JavaScript
- [Prisma](https://www.prisma.io/) - ORM moderno con soporte para MongoDB
- [MongoDB](https://www.mongodb.com/) - Base de datos NoSQL
- [JWT](https://jwt.io/) - Autenticación basada en tokens
- [Cloudinary](https://cloudinary.com/) - CDN y gestión de imágenes
- [Helmet](https://helmetjs.github.io/) - Seguridad para Express
- [Joi](https://joi.dev/) - Validación de datos
- [Sharp](https://sharp.pixelplumbing.com/) - Procesamiento de imágenes
- [Morgan](https://github.com/expressjs/morgan) - HTTP request logger
- [Express Rate Limit](https://github.com/nfriedly/express-rate-limit) - Protección contra DDoS

---

## 📂 Estructura del proyecto

```bash
backend/
├── prisma/                      # Configuración de base de datos
│   └── schema.prisma           # Modelos y relaciones (MongoDB)
├── src/
│   ├── @types/                 # Tipos personalizados
│   │   └── express/           # Extensiones de tipos Express
│   │       └── index.d.ts     # Definiciones de tipos
│   ├── config/                 # Configuraciones
│   │   └── cloudinary.ts      # Config de Cloudinary
│   ├── controllers/            # Controladores
│   │   ├── authController.ts   # Autenticación y usuarios
│   │   ├── roleController.ts   # Gestión de roles
│   │   ├── tenantController.ts # Gestión de tenants
│   │   └── userManagement.ts   # Gestión de usuarios
│   ├── middleware/             # Middlewares
│   │   ├── auth.ts            # Autenticación JWT
│   │   ├── rbac.ts            # Control de acceso RBAC
│   │   └── tenantResolver.ts  # Resolución de tenant
│   ├── routes/                # Rutas API
│   │   ├── auth.ts           # Endpoints de autenticación
│   │   ├── ingredients.ts    # Endpoints de ingredientes
│   │   ├── recipes.ts        # Endpoints de recetas
│   │   ├── roles.ts          # Endpoints de roles
│   │   ├── tenants.ts        # Endpoints de tenants
│   │   └── userManagement.ts # Endpoints de usuarios
│   ├── scripts/              # Scripts utilitarios
│   │   └── seedData.ts       # Datos iniciales
│   ├── types/               # Tipos adicionales
│   │   └── express.d.ts     # Tipos Express extendidos
│   ├── utils/               # Utilidades generales
│   ├── app.ts              # Configuración de Express
│   └── server.ts           # Punto de entrada
├── .env                    # Variables de entorno
├── package.json           # Dependencias y scripts
├── tsconfig.json         # Configuración TypeScript
└── ENDPOINTS_TESTING.md  # Documentación de API
```

## 🌟 Características principales

### Multi-Tenancy
- Segregación completa de datos por restaurante
- Subdominio único por tenant (ej: restaurante.almoud.pe)
- Detección automática de tenant por dominio de email
- Planes personalizados (basic, premium, enterprise)
- Estado de tenants (active, suspended, cancelled)
- Configuraciones personalizadas por tenant (moneda, zona horaria, idioma)

### Sistema RBAC Avanzado
- Roles del sistema predefinidos (super_admin, admin, user)
- Roles personalizables por tenant (cajero, cocinero, mesero, supervisor)
- Permisos granulares por módulo:
  - Dashboard: view
  - Ingredients: view, create, edit, delete, export
  - Recipes: view, create, edit, delete, publish
  - Inventory: view, create, edit, delete, adjust
  - Orders: view, create, edit, delete, process
  - Reports: view, create, export, schedule
  - Users: view, create, edit, delete, assign_roles
  - Settings: view, edit, billing, integrations
  - Financial: view_costs, edit_prices, view_profits

### Gestión de Usuarios
- Autenticación JWT segura
- Gestión de perfiles con imágenes
- Control de acceso basado en roles
- Seguimiento de última conexión
- Estado de usuario (activo/inactivo)
- Asignación dinámica de roles
- Permisos adicionales específicos

### Seguridad
- Rate limiting por IP (100 requests/15min)
- Headers de seguridad con Helmet
- Validación de datos con Joi
- Sanitización de entradas
- Manejo seguro de contraseñas con bcrypt
- CORS configurado
- Manejo de errores centralizado

### Gestión de Archivos
- Upload de imágenes con Multer
- Procesamiento con Sharp
  - Redimensionamiento automático
  - Optimización de calidad
  - Conversión de formato
- Almacenamiento en Cloudinary
  - CDN global
  - Transformaciones on-the-fly
  - URLs seguras

## 🛠️ Instalación

### Prerequisitos
- Node.js 20 o superior
- MongoDB instalado o cluster en MongoDB Atlas
- Cuenta en Cloudinary para gestión de imágenes

### Pasos de instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repositorio>
   cd food-cost-backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crear archivo `.env` con:
   ```env
   # MongoDB Database
   DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/foodcost"

   # JWT Configuration
   JWT_SECRET="tu_jwt_secret_super_seguro"

   # Server
   PORT=3001
   NODE_ENV=development

   # CORS
   FRONTEND_URL="http://localhost:3000"

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME="tu-cloud-name"
   CLOUDINARY_API_KEY="tu-api-key"
   CLOUDINARY_API_SECRET="tu-api-secret"

   # MongoDB específico (opcional)
   MONGO_INITDB_ROOT_USERNAME=admin
   MONGO_INITDB_ROOT_PASSWORD=password
   MONGO_INITDB_DATABASE=foodcost
   ```

4. **Generar cliente Prisma:**
   ```bash
   npm run db:generate
   ```

5. **Inicializar la base de datos:**
   ```bash
   # Generar esquemas
   npm run db:migrate

   # Crear datos iniciales
   ts-node src/scripts/seedData.ts
   ```

## 🚀 Uso y desarrollo

### Iniciar servidor de desarrollo
```bash
npm run dev

# El servidor iniciará en:
# 🚀 Food Cost Server running on http://localhost:3001
# 📊 Health check: http://localhost:3001/api/health
# 🗄️ Database: MongoDB
# ⚡ Environment: development
```

### Scripts disponibles
- `npm run dev` - Modo desarrollo con hot-reload (nodemon)
- `npm run build` - Compilar TypeScript a JavaScript
- `npm start` - Iniciar servidor en producción
- `npm run db:generate` - Generar cliente Prisma
- `npm run db:migrate` - Ejecutar migraciones de base de datos
- `npm run db:studio` - Abrir Prisma Studio (GUI para base de datos)

### Flujo de desarrollo
1. Modificar esquemas en `prisma/schema.prisma`
2. Generar cliente Prisma: `npm run db:generate`
3. Aplicar cambios a DB: `npm run db:migrate`
4. Desarrollar nuevas funcionalidades
5. Probar con Postman o Thunder Client
6. Documentar en `ENDPOINTS_TESTING.md`

## � API Endpoints

### Autenticación (`/api/auth`)
- `POST /register` - Registro de usuarios con validación de dominio
- `POST /login` - Login con detección de tipo de usuario
- `GET /profile` - Obtener perfil completo del usuario
- `POST /upload-profile-image` - Actualizar foto de perfil (procesada con Sharp)

### Tenants (`/api/tenants`) - Solo Super Admin
- `GET /` - Listar todos los tenants con estadísticas
- `POST /` - Crear nuevo tenant con configuración completa
  - Creación de admin
  - Roles predefinidos
  - Configuraciones iniciales
- `GET /:id/stats` - Estadísticas detalladas del tenant
- `PATCH /:id/status` - Cambiar estado (active/suspended/cancelled)
- `PUT /:id` - Actualizar configuraciones del tenant
- `DELETE /:id` - Eliminar tenant y datos asociados

### Roles (`/api/roles`) - Admin/Super Admin
- `GET /` - Listar roles del tenant actual
- `POST /` - Crear rol personalizado con permisos
- `PUT /:id` - Actualizar permisos del rol
- `DELETE /:id` - Eliminar rol (si no tiene usuarios)
- `GET /permissions` - Obtener matriz de permisos disponibles

### Usuarios (`/api/users`) - Admin
- `GET /` - Listar usuarios del tenant actual
- `POST /` - Crear usuario con rol asignado
- `PUT /:id/role` - Cambiar rol del usuario
- `PUT /:id/status` - Activar/desactivar usuario

### Health Check
- `GET /api/health` - Estado del servidor y base de datos

## � Credenciales de prueba

### Super Admin (Gestión Global)
```
Email: admin@almoud.pe
Password: superadmin123
Acceso: Gestión completa de todos los tenants
```

### Tenant Admin (La Trattoria)
```
Email: admin@latrattoria.almoud.pe
Password: latrattoria123
Acceso: Gestión completa de su restaurante
```

### Usuarios de prueba (La Trattoria)
```
# Cajero
Email: cajero@latrattoria.almoud.pe
Password: user123

# Cocinero
Email: cocinero@latrattoria.almoud.pe
Password: cocinero123

# Usuario adicional
Email: maria@latrattoria.almoud.pe
Password: maria123
```

## 🔒 Consideraciones de seguridad

### Autenticación y Autorización
- JWT con expiración de 24 horas
- Sistema RBAC granular
- Validación de subdominios
- Verificación de pertenencia a tenant

### Protección contra ataques
- Rate limiting: 100 requests por IP cada 15 minutos
- Headers de seguridad con Helmet
- Sanitización de entradas con Joi
- CORS configurado para frontend

### Manejo de archivos
- Validación de tipos MIME
- Límite de tamaño: 5MB
- Procesamiento seguro con Sharp
- URLs firmadas de Cloudinary

### Buenas prácticas
- Variables de entorno para configuraciones sensibles
- Hashing de contraseñas con bcrypt
- Logging de requests con Morgan
- Manejo centralizado de errores

## � Licencia

Este proyecto está bajo la licencia ISC. Ver el archivo `LICENSE` para más detalles.

---

Desarrollado con brandoleeantay4 para la gestión eficiente de restaurantes 🍽️