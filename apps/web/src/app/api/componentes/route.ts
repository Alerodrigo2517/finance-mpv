import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    const nuevoComponente = await prisma.componenteVehiculo.create({
      data: {
        vehiculoId: data.vehiculoId,
        tipoComponente: data.tipoComponente,
        kmVidaUtil: parseInt(data.kmVidaUtil),
        kmUltimoCambio: parseInt(data.kmUltimoCambio),
        fechaUltimoCambio: new Date(data.fechaUltimoCambio),
      },
    });

    return NextResponse.json(nuevoComponente, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar componente' }, { status: 500 });
  }
}
