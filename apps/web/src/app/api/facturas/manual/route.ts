import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = user.id;

    const data = await request.json();
    const { servicioId, monto, fechaVencimiento, periodoDesde, periodoHasta, kwConsumidos } = data;

    if (!servicioId || !monto || !fechaVencimiento) {
      return NextResponse.json({ error: 'Faltan datos obligatorios (servicioId, monto, fechaVencimiento)' }, { status: 400 });
    }

    const { data: servicio } = await supabase
      .from('servicios')
      .select('id, nombre_proveedor, usuario_id')
      .eq('id', servicioId)
      .eq('usuario_id', usuarioId)
      .single();

    if (!servicio) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }

    const { data: factura, error: facturaError } = await supabase
      .from('factura_servicios')
      .insert({
        servicio_id: servicioId,
        monto: parseFloat(monto),
        fecha_vencimiento: new Date(fechaVencimiento).toISOString(),
        periodo_desde: periodoDesde ? new Date(periodoDesde).toISOString() : new Date().toISOString(),
        periodo_hasta: periodoHasta ? new Date(periodoHasta).toISOString() : new Date().toISOString(),
        kw_consumidos: kwConsumidos ? parseFloat(kwConsumidos) : null,
        estado: 'PENDIENTE',
      })
      .select()
      .single();
      
    if (facturaError) throw facturaError;

    // Create Alerta (5 días antes del vencimiento)
    const fechaVenc = new Date(fechaVencimiento);
    const fechaAlerta = new Date(fechaVenc);
    fechaAlerta.setDate(fechaAlerta.getDate() - 5);
    
    await supabase.from('alertas').insert({
      tipo_alerta: 'VENCIMIENTO_FACTURA',
      descripcion: `Tu factura de ${servicio.nombre_proveedor} por $${monto} vence el ${fechaVenc.toLocaleDateString()}`,
      fecha: fechaAlerta.toISOString(),
      estado: 'NO_LEIDA',
      referencia_id: factura.id,
      usuario_id: usuarioId
    });

    return NextResponse.json({ success: true, factura });
  } catch (error: unknown) {
    console.error('Error creando factura manual:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Error interno' }, { status: 500 });
  }
}
