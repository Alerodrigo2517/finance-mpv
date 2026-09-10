import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = session.user.id;

    let categorias = await prisma.categoriaUsuario.findMany({
      where: { usuarioId },
      orderBy: { nombre: 'asc' },
    });

    // Seed defaults if user has no categories
    if (categorias.length === 0) {
      const defaultCategories = [
        { nombre: 'Supermercado', tipo: 'EGRESO', usuarioId },
        { nombre: 'Servicios', tipo: 'EGRESO', usuarioId },
        { nombre: 'Transporte', tipo: 'EGRESO', usuarioId },
        { nombre: 'Entretenimiento', tipo: 'EGRESO', usuarioId },
        { nombre: 'Sueldo', tipo: 'INGRESO', usuarioId },
        { nombre: 'Transferencias', tipo: 'INGRESO', usuarioId },
      ];
      
      await prisma.categoriaUsuario.createMany({ data: defaultCategories });
      
      categorias = await prisma.categoriaUsuario.findMany({
        where: { usuarioId },
        orderBy: { nombre: 'asc' },
      });
    }

    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Error fetching categorias:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = session.user.id;

    const body = await request.json();
    const { nombre, tipo } = body;

    if (!nombre || !tipo) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }

    const nuevaCategoria = await prisma.categoriaUsuario.create({
      data: {
        nombre,
        tipo,
        usuarioId,
      },
    });

    return NextResponse.json(nuevaCategoria);
  } catch (error) {
    console.error('Error creating categoria:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
