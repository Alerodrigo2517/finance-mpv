import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();
    const resolvedParams = await params;
    const cuotaId = resolvedParams.id;

    // TODO: Verify if the cuota belongs to a deuda owned by the user

    const cuotaActualizada = await prisma.cuota.update({
      where: { id: cuotaId },
      data: {
        estado: data.estado,
        fechaPago: data.estado === 'PAGADA' ? new Date() : null,
      },
    });

    return NextResponse.json(cuotaActualizada);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar cuota' }, { status: 500 });
  }
}
