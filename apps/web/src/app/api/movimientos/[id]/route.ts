import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const resolvedParams = await params;
    const movId = resolvedParams.id;

    const mov = await prisma.movimiento.findUnique({ where: { id: movId } });
    if (!mov || mov.usuarioId !== (session.user as any).id) {
       return NextResponse.json({ error: 'No autorizado o no encontrado' }, { status: 403 });
    }

    const data = await request.json();
    const { tipo, monto, categoria, descripcion, fecha } = data;

    const actualizado = await prisma.movimiento.update({
      where: { id: movId },
      data: {
        tipo,
        monto: monto !== undefined ? parseFloat(monto) : undefined,
        categoria,
        descripcion,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar movimiento:', error);
    return NextResponse.json({ error: 'Error al actualizar movimiento' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const resolvedParams = await params;
    const movId = resolvedParams.id;

    const mov = await prisma.movimiento.findUnique({ where: { id: movId } });
    if (!mov || mov.usuarioId !== (session.user as any).id) {
       return NextResponse.json({ error: 'No autorizado o no encontrado' }, { status: 403 });
    }

    await prisma.movimiento.delete({
      where: { id: movId },
    });

    return NextResponse.json({ message: 'Movimiento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar movimiento:', error);
    return NextResponse.json({ error: 'Error al eliminar movimiento' }, { status: 500 });
  }
}
