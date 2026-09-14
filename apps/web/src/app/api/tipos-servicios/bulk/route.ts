import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { nombres } = await request.json();

    if (!nombres || !Array.isArray(nombres)) {
      return NextResponse.json({ error: 'Lista de nombres inválida' }, { status: 400 });
    }

    const records = nombres.map(nombre => ({
      nombre,
      usuario_id: user.id
    }));

    const { error } = await supabase
      .from('tipos_servicios')
      .insert(records);

    if (error) throw error;
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tipos-servicios/bulk:', error);
    return NextResponse.json({ error: 'Error al cargar servicios por defecto' }, { status: 500 });
  }
}
