import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const deudas = await prisma.deuda.findMany({ 
      where: { usuarioId: session.user.id },
      include: { cuotas: true } 
    });
    return NextResponse.json(deudas);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    const montoTotal = parseFloat(data.montoTotal);
    const cantidadCuotas = parseInt(data.cantidadCuotas) || 1;
    const montoCuota = montoTotal / cantidadCuotas;
    const fechaInicio = new Date(data.fechaInicio);

    const cuotasArray = [];
    for (let i = 0; i < cantidadCuotas; i++) {
      const fechaVencimiento = new Date(fechaInicio);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
      
      cuotasArray.push({
        numeroCuota: i + 1,
        monto: montoCuota,
        fechaVencimiento,
        estado: 'PENDIENTE'
      });
    }

    const nuevaDeuda = await prisma.deuda.create({
      data: {
        nombre: data.entidad || 'Deuda',
        montoTotal: montoTotal,
        montoCuota: montoCuota,
        cantidadCuotas: cantidadCuotas,
        fechaInicio: fechaInicio,
        usuarioId: session.user.id,
        cuotas: {
          create: cuotasArray
        }
      },
    });

    return NextResponse.json(nuevaDeuda, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear deuda' }, { status: 500 });
  }
}
