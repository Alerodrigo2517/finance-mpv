import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const movimientos = await prisma.movimiento.findMany({
      where: { usuarioId: session.user.id },
      orderBy: { fecha: 'desc' },
      take: 50,
    });
    return NextResponse.json(movimientos);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener movimientos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();
    
    const nuevoMovimiento = await prisma.movimiento.create({
      data: {
        tipo: data.tipo,
        monto: parseFloat(data.monto),
        categoria: data.categoria,
        descripcion: data.descripcion,
        origen: data.origen || 'MANUAL',
        usuarioId: session.user.id,
      },
    });

    return NextResponse.json(nuevoMovimiento, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear movimiento' }, { status: 500 });
  }
}
