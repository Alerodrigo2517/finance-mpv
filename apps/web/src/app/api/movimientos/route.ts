import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio');

    let query = supabase.from('movimientos').select('*').order('fecha', { ascending: false });

    if (mes && anio) {
      const targetMes = parseInt(mes);
      const targetAnio = parseInt(anio);
      const startOfMonth = new Date(targetAnio, targetMes - 1, 1).toISOString();
      const endOfMonth = new Date(targetAnio, targetMes, 0, 23, 59, 59).toISOString();
      query = query.gte('fecha', startOfMonth).lte('fecha', endOfMonth);
    } else {
      query = query.limit(50);
    }

    const { data: movimientos, error } = await query;

    if (error) throw error;
    
    return NextResponse.json(movimientos);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener movimientos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();
    
    const { data: nuevoMovimiento, error } = await supabase
      .from('movimientos')
      .insert({
        tipo: data.tipo,
        monto: parseFloat(data.monto),
        categoria: data.categoria,
        descripcion: data.descripcion,
        fecha: data.fecha 
          ? (data.fecha.includes('T') ? new Date(data.fecha).toISOString() : new Date(`${data.fecha}T12:00:00Z`).toISOString())
          : new Date().toISOString(),
        origen: data.origen || 'MANUAL',
        usuario_id: user.id, // Supabase schema uses usuario_id instead of usuarioId
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(nuevoMovimiento, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear movimiento' }, { status: 500 });
  }
}
