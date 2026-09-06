import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { actualizarEstadoFactura } from '@/lib/services/facturas.service';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();
    const resolvedParams = await params;
    const facturaId = resolvedParams.id;

    if (!data.estado) {
      return NextResponse.json({ error: 'El estado es requerido' }, { status: 400 });
    }

    const facturaActualizada = await actualizarEstadoFactura(
      facturaId,
      data.estado,
      (session.user as any).id
    );

    return NextResponse.json(facturaActualizada);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al actualizar factura' }, { status: 500 });
  }
}
