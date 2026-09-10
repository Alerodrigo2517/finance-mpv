import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const servicios = await prisma.servicio.findMany({ 
      where: { usuarioId: session.user.id },
      include: { facturas: true } 
    });
    return NextResponse.json(servicios);
  } catch (error) {
    console.error('Error in GET /api/servicios:', error);
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
        tipo: data.tipo || 'GENERAL',
        nombreProveedor: data.nombre,
        nroCuenta: data.nroCuenta || null,
        nroMedidor: data.nroMedidor || null,
        usuarioId: session.user.id,
        ...(data.monto && data.vencimiento ? {
          facturas: {
            create: {
              monto: parseFloat(data.monto),
              fechaVencimiento: new Date(data.vencimiento),
              periodoDesde: new Date(),
              periodoHasta: new Date(),
              estado: 'PENDIENTE'
            }
          }
        } : {})
      },
      include: { facturas: true }
    });

    return NextResponse.json(nuevoServicio, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear servicio' }, { status: 500 });
  }
}

