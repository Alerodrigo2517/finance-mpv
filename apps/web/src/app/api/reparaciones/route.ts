import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    const { data: reparacion, error } = await supabase
      .from('reparaciones_vehiculos')
      .insert({
        vehiculo_id: data.vehiculoId,
        fecha: data.fecha,
        descripcion: data.descripcion,
        costo: parseFloat(data.costo),
        taller: data.taller,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(reparacion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
