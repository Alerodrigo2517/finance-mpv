import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    const { data: nuevoComponente, error } = await supabase
      .from('componente_vehiculos')
      .insert({
        vehiculo_id: data.vehiculoId,
        tipo_componente: data.tipoComponente,
        km_vida_util: parseInt(data.kmVidaUtil),
        km_ultimo_cambio: parseInt(data.kmUltimoCambio),
        fecha_ultimo_cambio: new Date(data.fechaUltimoCambio).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(nuevoComponente, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar componente' }, { status: 500 });
  }
}
