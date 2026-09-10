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
      session.user.id
    );

    return NextResponse.json(facturaActualizada);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Error al actualizar factura' }, { status: 500 });
  }
}
