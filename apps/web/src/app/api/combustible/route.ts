import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    const { data: combustible, error } = await supabase
      .from('combustible_vehiculos')
      .insert({
        vehiculo_id: data.vehiculoId,
        fecha: data.fecha,
        litros: parseFloat(data.litros),
        costo_total: parseFloat(data.costoTotal),
        precio_litro: data.precioLitro ? parseFloat(data.precioLitro) : null,
        kilometraje_momento: data.kilometrajeMomento ? parseInt(data.kilometrajeMomento) : null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(combustible, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
