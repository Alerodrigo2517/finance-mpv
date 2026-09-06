import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const productos = await prisma.producto.findMany({ 
      where: { usuarioId: (session.user as any).id },
      include: { stocks: true }
    });
    return NextResponse.json(productos);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    const producto = await prisma.producto.create({
      data: {
        nombre: data.nombre,
        codigoBarra: data.codigoBarras,
        categoria: data.categoria || 'General',
        usuarioId: (session.user as any).id,
        stocks: {
          create: {
            cantidad: parseFloat(data.cantidad || '1'),
            estado: 'DISPONIBLE',
            usuarioId: (session.user as any).id,
          }
        }
      },
    });
    return NextResponse.json(producto, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
