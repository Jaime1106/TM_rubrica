import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // usuarios de prueba
  const users = [
    { email: 'jaimedelacruz106@gmail.com', password: await bcrypt.hash('123456', 10), name: 'Jaime De la cruz' },
    { email: 'jdelacru38@cuc.edu.co', password: await bcrypt.hash('123456', 10), name: 'Jaime D' },
  ];

  console.log('📝 Creando usuarios...');
  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
  }
  console.log('✅ Usuarios creados');

  // activos ejemplo - usando 'as any' para evitar el error del enum
  const assets = [
    { 
      name: 'Laptop Dell XPS 15', 
      type: 'computador', 
      brand: 'Dell', 
      model: 'XPS 15', 
      serial: 'SN-DELL-001', 
      purchaseDate: new Date('2023-01-15'), 
      status: 'ACTIVE' as any, // ✅ Forzar el tipo
      location: 'Oficina Principal' 
    },
    { 
      name: 'iPhone 14', 
      type: 'celular', 
      brand: 'Apple', 
      model: 'iPhone 14', 
      serial: 'SN-APPLE-002', 
      purchaseDate: new Date('2023-03-20'), 
      status: 'ACTIVE' as any, 
      location: 'Ventas' 
    },
    { 
      name: 'Impresora HP LaserJet', 
      type: 'impresora', 
      brand: 'HP', 
      model: 'LaserJet Pro', 
      serial: 'SN-HP-003', 
      purchaseDate: new Date('2022-11-10'), 
      status: 'IN_MAINTENANCE' as any, 
      location: 'Recepción' 
    },
    { 
      name: 'Switch Cisco 2960', 
      type: 'red', 
      brand: 'Cisco', 
      model: '2960', 
      serial: 'SN-CISCO-004', 
      purchaseDate: new Date('2023-06-05'), 
      status: 'ACTIVE' as any, 
      location: 'Sala de Servidores' 
    },
  ];

  console.log('📝 Creando activos...');
  for (const assetData of assets) {
    await prisma.asset.create({ data: assetData });
  }
  console.log('✅ Activos creados');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('📝 Credenciales de prueba:');
  console.log('   jaimedelacruz106@gmail.com / 123456');
  console.log('   jdelacru38@cuc.edu.co / 123456');
}

main()
  .catch(e => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });