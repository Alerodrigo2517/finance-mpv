import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { actualizarEstadoFactura } from '@/lib/services/facturas.service';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();
    const resolvedParams = await params;
    const facturaId = resolvedParams.id;

    if (!data.estado) {
      return NextResponse.json({ error: 'El estado es requerido' }, { status: 400 });
    }

    const facturaActualizada = await actualizarEstadoFactura(
      facturaId,
      data.estado,
      user.id
    );

    return NextResponse.json(facturaActualizada);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Error al actualizar factura' }, { status: 500 });
  }
}
