import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const vehiculos = await prisma.vehiculo.findMany({ 
      where: { usuarioId: session.user.id },
      include: { componentes: true }
    });
    return NextResponse.json(vehiculos);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    const vehiculo = await prisma.vehiculo.create({
      data: {
        marca: data.marca,
        modelo: data.modelo,
        anio: parseInt(data.anio),
        kilometrajeActual: parseInt(data.kilometrajeActual),
        usuarioId: session.user.id,
      },
    });
    return NextResponse.json(vehiculo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
