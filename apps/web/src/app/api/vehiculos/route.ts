import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const { data: vehiculos, error } = await supabase
      .from('vehiculos')
      .select('*, componentes:componente_vehiculos(*)')
      .order('id', { ascending: false });

    if (error) throw error;
    return NextResponse.json(vehiculos);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    const { data: vehiculo, error } = await supabase
      .from('vehiculos')
      .insert({
        marca: data.marca,
        modelo: data.modelo,
        anio: parseInt(data.anio),
        kilometraje_actual: parseInt(data.kilometrajeActual),
        usuario_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(vehiculo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
