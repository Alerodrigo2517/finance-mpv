import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { actualizarEstadoFactura, editarFactura } from '@/lib/services/facturas.service';

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
      user.id,
      data.metodo_pago
    );

    return NextResponse.json(facturaActualizada);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Error al actualizar factura' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();
    const resolvedParams = await params;
    const facturaId = resolvedParams.id;

    const payload: any = {};
    if (data.monto) payload.monto = Number(data.monto);
    if (data.kwConsumidos) payload.kwConsumidos = Number(data.kwConsumidos);
    if (data.periodoDesde) payload.periodoDesde = new Date(data.periodoDesde);
    if (data.periodoHasta) payload.periodoHasta = new Date(data.periodoHasta);
    if (data.fechaVencimiento) payload.fechaVencimiento = new Date(data.fechaVencimiento);

    const facturaActualizada = await editarFactura(
      facturaId,
      payload,
      user.id
    );

    return NextResponse.json(facturaActualizada);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Error al editar factura' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const resolvedParams = await params;
    const facturaId = resolvedParams.id;

    // Optional: check if factura belongs to user
    const { data: factura } = await supabase
      .from('factura_servicios')
      .select('*, servicios(usuario_id)')
      .eq('id', facturaId)
      .single();

    if (!factura || factura.servicios?.usuario_id !== user.id) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    const { error } = await supabase
      .from('factura_servicios')
      .delete()
      .eq('id', facturaId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Error al eliminar factura' }, { status: 500 });
  }
}
