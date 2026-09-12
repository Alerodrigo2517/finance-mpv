import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { crearFactura } from '@/lib/services/facturas.service';
import { obtenerFacturasPorUsuario } from '@/lib/selectors/facturas.selector';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const facturas = await obtenerFacturasPorUsuario(user.id);
    
    return NextResponse.json(facturas);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener facturas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    if (!data.servicioId || !data.monto || !data.fechaVencimiento || !data.periodoDesde || !data.periodoHasta) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const nuevaFactura = await crearFactura({
      servicioId: data.servicioId,
      periodoDesde: new Date(data.periodoDesde),
      periodoHasta: new Date(data.periodoHasta),
      fechaVencimiento: new Date(data.fechaVencimiento),
      monto: parseFloat(data.monto),
    }, user.id);

    return NextResponse.json(nuevaFactura, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Error al registrar factura' }, { status: 500 });
  }
}
