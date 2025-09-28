import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando/verificando datos iniciales...');

  try {
    // 1. Verificar/Crear tenant
    let tenant = await prisma.tenant.findUnique({
      where: { subdomain: 'latrattoria' }
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          subdomain: 'latrattoria',
          name: 'La Trattoria Restaurant',
          plan: 'premium',
          status: 'active',
          settings: {
            currency: 'PEN',
            timezone: 'America/Lima',
            language: 'es'
          },
          subscription: {
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            billing: 'monthly'
          }
        }
      });
      console.log('✅ Tenant creado:', tenant.name);
    } else {
      console.log('ℹ️  Tenant ya existe:', tenant.name);
    }

    // 2. Verificar/Crear Super Admin
    let superAdmin = await prisma.user.findUnique({
      where: { email: 'admin@almoud.pe' }
    });

    if (!superAdmin) {
      const superAdminPassword = await bcrypt.hash('superadmin123', 12);
      superAdmin = await prisma.user.create({
        data: {
          email: 'admin@almoud.pe',
          password: superAdminPassword,
          name: 'Super',
          lastname: 'Administrador',
          role: 'super_admin' // Explícito
        }
      });
      console.log('✅ Super Admin creado:', superAdmin.email);
    } else {
      console.log('ℹ️  Super Admin ya existe:', superAdmin.email);
    }

    // 3. Verificar/Crear Admin del Tenant
    let tenantAdmin = await prisma.user.findUnique({
      where: { email: 'admin@latrattoria.almoud.pe' }
    });

    if (!tenantAdmin) {
      const tenantAdminPassword = await bcrypt.hash('latrattoria123', 12);
      tenantAdmin = await prisma.user.create({
        data: {
          email: 'admin@latrattoria.almoud.pe',
          password: tenantAdminPassword,
          name: 'Admin',
          lastname: 'La Trattoria',
          role: 'admin',
          tenantId: tenant.id
        }
      });
      console.log('✅ Tenant Admin creado:', tenantAdmin.email);
    } else {
      console.log('ℹ️  Tenant Admin ya existe:', tenantAdmin.email);
    }

    // 4. Verificar/Crear Usuario Regular
    let regularUser = await prisma.user.findUnique({
      where: { email: 'cajero@latrattoria.almoud.pe' }
    });

    if (!regularUser) {
      const userPassword = await bcrypt.hash('user123', 12);
      regularUser = await prisma.user.create({
        data: {
          email: 'cajero@latrattoria.almoud.pe',
          password: userPassword,
          name: 'Juan',
          lastname: 'Pérez',
          role: 'user',
          tenantId: tenant.id
        }
      });
      console.log('✅ Usuario Regular creado:', regularUser.email);
    } else {
      console.log('ℹ️  Usuario Regular ya existe:', regularUser.email);
    }

    // 5. Crear usuarios adicionales para testing
    const additionalUsers = [
      {
        email: 'maria@latrattoria.almoud.pe',
        password: 'maria123',
        name: 'María',
        lastname: 'González',
        role: 'user'
      },
      {
        email: 'cocinero@latrattoria.almoud.pe', 
        password: 'cocinero123',
        name: 'Carlos',
        lastname: 'Ramírez',
        role: 'user'
      }
    ];

    for (const userData of additionalUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const newUser = await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword,
            tenantId: tenant.id
          }
        });
        console.log('✅ Usuario adicional creado:', newUser.email);
      } else {
        console.log('ℹ️  Usuario ya existe:', userData.email);
      }
    }

    console.log('\n🎉 Todos los datos verificados/creados exitosamente!\n');

    // Mostrar credenciales actualizadas
    console.log('📋 CREDENCIALES DISPONIBLES:');
    console.log('══════════════════════════════════════');
    console.log('🔧 SUPER ADMIN:');
    console.log('   Email: admin@almoud.pe');
    console.log('   Password: superadmin123');
    console.log('   Nota: Acceso global a todos los tenants');
    console.log('');
    console.log('🏢 TENANT ADMIN (La Trattoria):');
    console.log('   Email: admin@latrattoria.almoud.pe');
    console.log('   Password: latrattoria123');
    console.log('   Nota: Acceso total al restaurante La Trattoria');
    console.log('');
    console.log('👤 USUARIOS REGULARES (La Trattoria):');
    console.log('   Email: cajero@latrattoria.almoud.pe');
    console.log('   Password: user123');
    console.log('   ');
    console.log('   Email: maria@latrattoria.almoud.pe');
    console.log('   Password: maria123');
    console.log('   ');
    console.log('   Email: cocinero@latrattoria.almoud.pe');
    console.log('   Password: cocinero123');
    console.log('══════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error procesando datos:', error);
    console.error('💡 Sugerencia: Verifica que el servidor esté ejecutándose');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
