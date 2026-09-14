import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const { data: tipos, error } = await supabase
      .from('tipos_servicios')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return NextResponse.json(tipos);
  } catch (error) {
    console.error('Error in GET /api/tipos-servicios:', error);
    return NextResponse.json({ error: 'Error al obtener tipos de servicios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    if (!data.nombre || data.nombre.trim() === '') {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const { data: nuevoTipo, error } = await supabase
      .from('tipos_servicios')
      .insert({
        nombre: data.nombre.trim(),
        usuario_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(nuevoTipo, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tipos-servicios:', error);
    return NextResponse.json({ error: 'Error al crear tipo de servicio' }, { status: 500 });
  }
}
