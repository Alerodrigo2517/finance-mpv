import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { data: movimientos, error } = await supabase
      .from('movimientos')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(50);

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
