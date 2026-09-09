import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = (session.user as any).id;

    const categoriaId = params.id;

    // Verificar que la categoría pertenece al usuario
    const categoria = await prisma.categoriaUsuario.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria || categoria.usuarioId !== usuarioId) {
      return NextResponse.json({ error: 'No autorizado o no encontrada' }, { status: 403 });
    }

    await prisma.categoriaUsuario.delete({
      where: { id: categoriaId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting categoria:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = (session.user as any).id;
    const categoriaId = params.id;

    const body = await request.json();
    const { nombre } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const categoria = await prisma.categoriaUsuario.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria || categoria.usuarioId !== usuarioId) {
      return NextResponse.json({ error: 'No autorizado o no encontrada' }, { status: 403 });
    }

    const categoriaActualizada = await prisma.categoriaUsuario.update({
      where: { id: categoriaId },
      data: { nombre },
    });

    return NextResponse.json(categoriaActualizada);
  } catch (error) {
    console.error('Error updating categoria:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
