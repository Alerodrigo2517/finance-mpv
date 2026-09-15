import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const { data: servicios, error } = await supabase
      .from('servicios')
      .select('*, facturas:factura_servicios(*)')
      .order('id', { ascending: false });

    if (error) throw error;
    return NextResponse.json(servicios);
  } catch (error) {
    console.error('Error in GET /api/servicios:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    // Check for duplicates
    const { data: existing, error: searchError } = await supabase
      .from('servicios')
      .select('id')
      .eq('usuario_id', user.id)
      .ilike('nombre_proveedor', data.nombre)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: `Ya tienes registrado el servicio de ${data.nombre}.` }, { status: 400 });
    }

    const { data: nuevoServicio, error: servicioError } = await supabase
      .from('servicios')
      .insert({
        tipo: data.tipo || 'GENERAL',
        nombre_proveedor: data.nombre,
        nro_cuenta: data.nroCuenta || null,
        nro_medidor: data.nroMedidor || null,
        usuario_id: user.id,
      })
      .select()
      .single();

    if (servicioError) throw servicioError;

    if (data.monto && data.vencimiento && nuevoServicio) {
      const { error: facturaError } = await supabase
        .from('factura_servicios')
        .insert({
          servicio_id: nuevoServicio.id,
          monto: parseFloat(data.monto),
          fecha_vencimiento: new Date(data.vencimiento).toISOString(),
          periodo_desde: new Date().toISOString(),
          periodo_hasta: new Date().toISOString(),
          estado: 'PENDIENTE',
        });
        
      if (facturaError) throw facturaError;
    }

    // Fetch the updated service with its facturas
    const { data: servicioCompleto, error: fetchError } = await supabase
      .from('servicios')
      .select('*, facturas:factura_servicios(*)')
      .eq('id', nuevoServicio.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(servicioCompleto, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear servicio' }, { status: 500 });
  }
}
