import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find a user
  const user = await prisma.usuario.findFirst();
  if (!user) {
    console.log("No users found");
    return;
  }

  const now = new Date();
  
  // Last month
  const lastMonth = new Date();
  lastMonth.setMonth(now.getMonth() - 1);
  lastMonth.setDate(15); // middle of the month

  // Two months ago
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  twoMonthsAgo.setDate(10);

  // Insert movements
  await prisma.movimiento.create({
    data: {
      tipo: 'INGRESO',
      monto: 50000,
      categoria: 'Sueldo',
      fecha: lastMonth,
      origen: 'TEST',
      usuarioId: user.id
    }
  });

  await prisma.movimiento.create({
    data: {
      tipo: 'EGRESO',
      monto: 15000,
      categoria: 'Supermercado',
      fecha: lastMonth,
      origen: 'TEST',
      usuarioId: user.id
    }
  });

  await prisma.movimiento.create({
    data: {
      tipo: 'INGRESO',
      monto: 40000,
      categoria: 'Sueldo',
      fecha: twoMonthsAgo,
      origen: 'TEST',
      usuarioId: user.id
    }
  });

  await prisma.movimiento.create({
    data: {
      tipo: 'EGRESO',
      monto: 20000,
      categoria: 'Alquiler',
      fecha: twoMonthsAgo,
      origen: 'TEST',
      usuarioId: user.id
    }
  });

  console.log("Seed complete for user:", user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
