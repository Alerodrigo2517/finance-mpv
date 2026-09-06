import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const servicios = await prisma.servicio.findMany({ 
      where: { usuarioId: (session.user as any).id },
      include: { facturas: true } 
    });
    return NextResponse.json(servicios);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    const nuevoServicio = await prisma.servicio.create({
      data: {
        tipo: 'GENERAL',
        nombreProveedor: data.nombre,
        usuarioId: (session.user as any).id,
      },
    });

    return NextResponse.json(nuevoServicio, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear servicio' }, { status: 500 });
  }
}
